// ============================================================
// SCoT ERP — Attendance Service
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import {
  attendancePunchRepo,
  attendanceDayRepo,
  employeeRepo,
  publicHolidayRepo,
  settingsRepo,
} from '../repositories/index.js';
import type { AttendancePunch, AttendanceDay, Employee } from '@scot-erp/shared';
import { SHIFT_PATTERNS, TIME_SLOTS } from '@scot-erp/shared';
import { NotFoundError } from '../middleware/errorHandler.js';

export class AttendanceService {
  /**
   * Ingest a single biometric punch.
   */
  async ingestPunch(data: {
    deviceId: string;
    biometricId: string;
    timestamp: string;
    direction: 'in' | 'out' | null;
  }): Promise<AttendancePunch> {
    return attendancePunchRepo.create({
      id: uuidv4(),
      deviceId: data.deviceId,
      biometricId: data.biometricId,
      timestamp: data.timestamp,
      direction: data.direction,
    });
  }

  /**
   * Ingest a batch of biometric punches.
   */
  async ingestPunchBatch(
    punches: { deviceId: string; biometricId: string; timestamp: string; direction: 'in' | 'out' | null }[]
  ): Promise<{ ingested: number; errors: string[] }> {
    let ingested = 0;
    const errors: string[] = [];

    for (const punch of punches) {
      try {
        await this.ingestPunch(punch);
        ingested++;
      } catch (err: any) {
        errors.push(`${punch.biometricId}@${punch.timestamp}: ${err.message}`);
      }
    }

    return { ingested, errors };
  }

  /**
   * Process attendance for a specific date.
   * This reconciles punches with employee shifts to create/update AttendanceDay records.
   */
  async processDate(date: string): Promise<{ processed: number; skipped: number }> {
    const settings = await settingsRepo.get();
    const allEmployees = await employeeRepo.findAll();
    const activeEmployees = allEmployees.filter(
      (e) => ['Active', 'Probation', 'Notice Period'].includes(e.status)
    );

    let processed = 0;
    let skipped = 0;
    const dayOfWeek = new Date(date + 'T00:00:00').getDay();

    for (const employee of activeEmployees) {
      try {
        // Get shift pattern
        const pattern = SHIFT_PATTERNS.find((p) => p.id === employee.shiftPatternId);
        const timeSlot = TIME_SLOTS.find((t) => t.id === employee.timeSlotId);

        if (!pattern || !timeSlot) {
          skipped++;
          continue;
        }

        // Check if it's a working day for this employee
        const isWorkingDay = (pattern.days as readonly number[]).includes(dayOfWeek);

        // Check if it's a public holiday
        const isHoliday = await publicHolidayRepo.isHoliday(date);

        // Check existing record
        let existing = await attendanceDayRepo.findByEmployeeAndDate(employee.id, date);

        // Get punches for this employee on this date
        const punches = await attendancePunchRepo.findByBiometricIdAndDate(
          employee.biometricId,
          date
        );

        // Calculate attendance
        const attendanceData = this.calculateAttendance(
          employee,
          date,
          punches,
          timeSlot,
          isWorkingDay,
          isHoliday,
          settings.graceMinutes,
          settings.otThresholdMinutes
        );

        if (existing) {
          // Preserve leave/WFH flags set by approval flows
          await attendanceDayRepo.update(existing.id, {
            ...attendanceData,
            isLeave: existing.isLeave || attendanceData.isLeave,
            isWfh: existing.isWfh || attendanceData.isWfh,
            linkedLeaveRequestId: existing.linkedLeaveRequestId,
            linkedWfhRequestId: existing.linkedWfhRequestId,
            status: existing.isLeave
              ? 'Present - Approved Leave'
              : existing.isWfh
                ? 'Present - WFH'
                : attendanceData.status,
          });
        } else {
          await attendanceDayRepo.create({
            id: uuidv4(),
            ...attendanceData,
            linkedLeaveRequestId: null,
            linkedWfhRequestId: null,
            correctionRequestId: null,
            notes: '',
          });
        }
        processed++;
      } catch {
        skipped++;
      }
    }

    return { processed, skipped };
  }

  /**
   * Calculate attendance metrics from punches and shift data.
   */
  private calculateAttendance(
    employee: Employee,
    date: string,
    punches: AttendancePunch[],
    timeSlot: (typeof TIME_SLOTS)[number],
    isWorkingDay: boolean,
    isHoliday: boolean,
    graceMinutes: number,
    otThresholdMinutes: number
  ): Omit<
    AttendanceDay,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'linkedLeaveRequestId'
    | 'linkedWfhRequestId'
    | 'correctionRequestId'
    | 'notes'
  > {
    const expectedMinutes =
      (timeSlot.endHour * 60 + timeSlot.endMinute) -
      (timeSlot.startHour * 60 + timeSlot.startMinute);

    const base = {
      employeeId: employee.id,
      date,
      expectedShiftPatternId: employee.shiftPatternId,
      expectedTimeSlotId: employee.timeSlotId,
      firstPunchIn: null as string | null,
      lastPunchOut: null as string | null,
      workedMinutes: 0,
      expectedMinutes,
      isLate: false,
      lateMinutes: 0,
      isEarlyOut: false,
      earlyOutMinutes: 0,
      isAbsent: false,
      isWfh: false,
      isLeave: false,
      isHoliday,
      isOffDay: !isWorkingDay,
      otMinutes: 0,
    };

    // Non-working day or holiday
    if (!isWorkingDay) {
      return {
        ...base,
        status: 'Off Day' as any,
        expectedMinutes: 0,
      };
    }

    if (isHoliday) {
      return {
        ...base,
        status: 'Public Holiday' as any,
        expectedMinutes: 0,
      };
    }

    // No punches = absent
    if (punches.length === 0) {
      return {
        ...base,
        status: 'Absent' as any,
        isAbsent: true,
      };
    }

    // Find first IN and last OUT
    const inPunches = punches.filter((p) => p.direction === 'in' || p.direction === null);
    const outPunches = punches.filter((p) => p.direction === 'out');

    const firstIn = inPunches.length > 0 ? inPunches[0] : punches[0];
    const lastOut = outPunches.length > 0 ? outPunches[outPunches.length - 1] : null;

    base.firstPunchIn = firstIn.timestamp;
    base.lastPunchOut = lastOut?.timestamp || null;

    // Calculate worked minutes
    if (firstIn && lastOut) {
      const inTime = new Date(firstIn.timestamp).getTime();
      const outTime = new Date(lastOut.timestamp).getTime();
      base.workedMinutes = Math.round((outTime - inTime) / 60000);
    }

    // Check late arrival
    const punchInDate = new Date(firstIn.timestamp);
    const punchInMinutes = punchInDate.getHours() * 60 + punchInDate.getMinutes();
    const shiftStartMinutes = timeSlot.startHour * 60 + timeSlot.startMinute;
    const lateBy = punchInMinutes - shiftStartMinutes;

    if (lateBy > graceMinutes) {
      base.isLate = true;
      base.lateMinutes = lateBy;
    }

    // Check early out
    if (lastOut) {
      const punchOutDate = new Date(lastOut.timestamp);
      const punchOutMinutes = punchOutDate.getHours() * 60 + punchOutDate.getMinutes();
      const shiftEndMinutes = timeSlot.endHour * 60 + timeSlot.endMinute;
      const earlyBy = shiftEndMinutes - punchOutMinutes;

      if (earlyBy > graceMinutes) {
        base.isEarlyOut = true;
        base.earlyOutMinutes = earlyBy;
      }
    }

    // Only one punch = incomplete
    if (!lastOut) {
      return {
        ...base,
        status: 'Incomplete' as any,
      };
    }

    // Calculate OT (beyond expected + threshold)
    if (base.workedMinutes > expectedMinutes + otThresholdMinutes) {
      base.otMinutes = base.workedMinutes - expectedMinutes;
    }

    // Determine status
    let status: string = 'Present';
    if (base.isLate) status = 'Late';
    else if (base.isEarlyOut) status = 'Early Out';

    return {
      ...base,
      status: status as any,
    };
  }

  /**
   * Get attendance summary for a specific month (admin view).
   */
  async getMonthlySummary(yearMonth: string) {
    const allDays = await attendanceDayRepo.findAll();
    const monthDays = allDays.filter((d) => d.date.startsWith(yearMonth));

    const employees = await employeeRepo.findAll();
    const activeEmployees = employees.filter(
      (e) => ['Active', 'Probation', 'Notice Period'].includes(e.status)
    );

    const summary = activeEmployees.map((emp) => {
      const empDays = monthDays.filter((d) => d.employeeId === emp.id);
      const present = empDays.filter(
        (d) => d.status === 'Present' || d.status === 'Present - WFH' || d.status === 'Present - Approved Leave'
      ).length;
      const absent = empDays.filter((d) => d.isAbsent).length;
      const late = empDays.filter((d) => d.isLate).length;
      const wfh = empDays.filter((d) => d.isWfh).length;
      const leave = empDays.filter((d) => d.isLeave).length;
      const totalWorkedMinutes = empDays.reduce((sum, d) => sum + d.workedMinutes, 0);
      const totalOtMinutes = empDays.reduce((sum, d) => sum + d.otMinutes, 0);

      return {
        employeeId: emp.id,
        staffId: emp.staffId,
        name: emp.preferredName,
        department: emp.departmentCode,
        daysPresent: present,
        daysAbsent: absent,
        daysLate: late,
        daysWfh: wfh,
        daysLeave: leave,
        totalWorkedMinutes,
        totalOtMinutes,
        totalDaysRecorded: empDays.length,
      };
    });

    return {
      yearMonth,
      totalEmployees: activeEmployees.length,
      summary,
    };
  }

  /**
   * Get today's attendance overview (for dashboard).
   */
  async getTodayOverview() {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await attendanceDayRepo.findByDate(today);

    return {
      date: today,
      present: todayAttendance.filter(
        (a) => a.status === 'Present' || a.status === 'Present - WFH' || a.status === 'Present - Approved Leave'
      ).length,
      absent: todayAttendance.filter((a) => a.isAbsent).length,
      late: todayAttendance.filter((a) => a.isLate).length,
      wfh: todayAttendance.filter((a) => a.isWfh).length,
      onLeave: todayAttendance.filter((a) => a.isLeave).length,
      incomplete: todayAttendance.filter((a) => a.status === 'Incomplete').length,
      total: todayAttendance.length,
    };
  }
}

export const attendanceService = new AttendanceService();
