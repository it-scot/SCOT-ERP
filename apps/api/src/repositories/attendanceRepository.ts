// ============================================================
// SCoT ERP — Attendance Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { AttendancePunch, AttendanceDay } from '@scot-erp/shared';

export class MockAttendancePunchRepository extends MockBaseRepository<AttendancePunch> {
  constructor() {
    super('attendancePunches');
  }

  async findByBiometricIdAndDate(biometricId: string, date: string): Promise<AttendancePunch[]> {
    const all = await this.findAll();
    return all.filter(
      (p) => p.biometricId === biometricId && p.timestamp.startsWith(date)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async findByDateRange(startDate: string, endDate: string): Promise<AttendancePunch[]> {
    const all = await this.findAll();
    return all.filter((p) => p.timestamp >= startDate && p.timestamp <= endDate);
  }
}

export class MockAttendanceDayRepository extends MockBaseRepository<AttendanceDay> {
  constructor() {
    super('attendanceDays');
  }

  async findByEmployeeAndDate(employeeId: string, date: string): Promise<AttendanceDay | null> {
    const all = await this.findAll();
    return all.find((a) => a.employeeId === employeeId && a.date === date) || null;
  }

  async findByEmployeeAndMonth(employeeId: string, yearMonth: string): Promise<AttendanceDay[]> {
    const all = await this.findAll();
    return all.filter(
      (a) => a.employeeId === employeeId && a.date.startsWith(yearMonth)
    ).sort((a, b) => a.date.localeCompare(b.date));
  }

  async findByDateRange(employeeId: string, start: string, end: string): Promise<AttendanceDay[]> {
    const all = await this.findAll();
    return all.filter(
      (a) => a.employeeId === employeeId && a.date >= start && a.date <= end
    );
  }

  async findByDate(date: string): Promise<AttendanceDay[]> {
    return this.findByField('date', date);
  }
}
