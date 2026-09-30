// ============================================================
// SCoT ERP — Leave Service
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import {
  leaveRequestRepo,
  leaveBalanceRepo,
  employeeRepo,
  attendanceDayRepo,
} from '../repositories/index.js';
import { taskService } from './taskService.js';
import { notificationService } from './notificationService.js';
import { auditService } from './auditService.js';
import type { LeaveRequest, LeaveBalance, AuthUser } from '@scot-erp/shared';
import { DEFAULTS } from '@scot-erp/shared';
import { ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

export class LeaveService {
  /**
   * Create a leave request for the current user.
   */
  async createRequest(
    user: AuthUser,
    data: {
      type: string;
      startDate: string;
      endDate: string;
      startTime: string | null;
      endTime: string | null;
      dates: string[];
      totalHours: number;
      reason: string;
    }
  ): Promise<LeaveRequest> {
    // Get the employee to find their supervisor
    const employee = await employeeRepo.findById(user.id);
    if (!employee) throw new NotFoundError('Employee');

    if (!employee.supervisorStaffId) {
      throw new ValidationError('No supervisor assigned. Contact HR to set your supervisor.');
    }

    // Find supervisor
    const supervisor = await employeeRepo.findByStaffId(employee.supervisorStaffId);
    if (!supervisor) {
      throw new ValidationError('Supervisor not found in the system.');
    }

    // Check leave balance for non-lieu types
    if (data.type !== 'Lieu') {
      const year = new Date().getFullYear();
      const balance = await leaveBalanceRepo.findByEmployeeAndYear(user.id, year);
      if (balance) {
        const available = balance.remainingHours;
        if (data.totalHours > available) {
          throw new ValidationError(
            `Insufficient leave balance. Available: ${available}h, Requested: ${data.totalHours}h`
          );
        }
      }
    }

    // Determine if backdated
    const today = new Date().toISOString().split('T')[0];
    const isBackdated = data.startDate < today;

    const requestId = uuidv4();
    const request = await leaveRequestRepo.create({
      id: requestId,
      employeeId: user.id,
      type: data.type as any,
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime,
      endTime: data.endTime,
      dates: data.dates,
      totalHours: data.totalHours,
      reason: data.reason,
      status: 'Pending',
      supervisorId: supervisor.id,
      supervisorComment: null,
      respondedAt: null,
      isBackdated,
      backdateReason: isBackdated ? data.reason : null,
    });

    // Update balance: add to pending
    const year = new Date(data.startDate).getFullYear();
    const balance = await leaveBalanceRepo.findByEmployeeAndYear(user.id, year);
    if (balance) {
      await leaveBalanceRepo.upsert({
        ...balance,
        pendingHours: balance.pendingHours + data.totalHours,
      });
    }

    // Determine SLA: same-day requests get shorter SLA
    const isSameDay = data.startDate === today;
    const slaMinutes = isSameDay
      ? DEFAULTS.slaDefaults.sameDayLeaveMinutes
      : DEFAULTS.slaDefaults.leaveApprovalMinutes;

    // Create task for supervisor
    await taskService.createTask({
      type: 'LeaveApproval',
      refEntity: 'LeaveRequest',
      refId: requestId,
      assigneeUserId: supervisor.id,
      slaMinutes,
      title: `Leave Approval: ${employee.preferredName}`,
      description: `${data.type} leave request from ${employee.preferredName} (${data.startDate} to ${data.endDate}). ${data.totalHours}h requested. Reason: ${data.reason}`,
      priority: isSameDay ? 'high' : 'medium',
    });

    // Notify supervisor
    await notificationService.send({
      recipientId: supervisor.id,
      recipientEmail: supervisor.email,
      title: `Leave Request: ${employee.preferredName}`,
      body: `${employee.preferredName} has requested ${data.type} leave from ${data.startDate} to ${data.endDate} (${data.totalHours}h). Reason: ${data.reason}`,
      deepLink: `/tasks`,
      channel: 'both',
    });

    return request;
  }

  /**
   * Respond to a leave request (approve/decline).
   */
  async respond(
    requestId: string,
    user: AuthUser,
    data: { status: 'Approved' | 'Declined'; comment?: string }
  ): Promise<LeaveRequest> {
    const request = await leaveRequestRepo.findById(requestId);
    if (!request) throw new NotFoundError('Leave request');

    if (request.status !== 'Pending') {
      throw new ValidationError(`This leave request has already been ${request.status.toLowerCase()}.`);
    }

    // Check authority: must be the assigned supervisor, HR, or COO
    const isSupervisor = request.supervisorId === user.id;
    const isPrivileged = user.roles.some((r) => ['HR', 'COO', 'SystemAdmin'].includes(r));
    if (!isSupervisor && !isPrivileged) {
      throw new ForbiddenError('You are not authorized to respond to this leave request.');
    }

    const now = new Date().toISOString();
    const updated = await leaveRequestRepo.update(requestId, {
      status: data.status,
      supervisorComment: data.comment || null,
      respondedAt: now,
    });

    // Update leave balance
    const year = new Date(request.startDate).getFullYear();
    const balance = await leaveBalanceRepo.findByEmployeeAndYear(request.employeeId, year);
    if (balance) {
      if (data.status === 'Approved') {
        await leaveBalanceRepo.upsert({
          ...balance,
          usedHours: balance.usedHours + request.totalHours,
          pendingHours: Math.max(0, balance.pendingHours - request.totalHours),
          remainingHours: balance.remainingHours - request.totalHours,
        });

        // Mark attendance days as leave
        if (request.dates && request.dates.length > 0) {
          for (const date of request.dates) {
            const attendanceDay = await attendanceDayRepo.findByEmployeeAndDate(
              request.employeeId,
              date
            );
            if (attendanceDay) {
              await attendanceDayRepo.update(attendanceDay.id, {
                isLeave: true,
                linkedLeaveRequestId: requestId,
                status: 'Present - Approved Leave',
              });
            }
          }
        }
      } else {
        // Declined: release pending hours
        await leaveBalanceRepo.upsert({
          ...balance,
          pendingHours: Math.max(0, balance.pendingHours - request.totalHours),
        });
      }
    }

    // Complete the associated task
    const tasks = await taskService.getTasksByRef('LeaveRequest', requestId);
    for (const task of tasks) {
      if (task.status === 'Open' || task.status === 'Overdue') {
        await taskService.complete(task.id);
      }
    }

    // Notify employee
    const employee = await employeeRepo.findById(request.employeeId);
    if (employee) {
      const statusEmoji = data.status === 'Approved' ? '✅' : '❌';
      await notificationService.send({
        recipientId: request.employeeId,
        recipientEmail: employee.email,
        title: `Leave ${data.status} ${statusEmoji}`,
        body: `Your ${request.type} leave request (${request.startDate} to ${request.endDate}) has been ${data.status.toLowerCase()}.${data.comment ? ` Comment: ${data.comment}` : ''}`,
        deepLink: `/leave`,
        channel: 'both',
      });
    }

    // Audit log
    await auditService.log({
      userId: user.id,
      action: `LEAVE_${data.status.toUpperCase()}`,
      entity: 'LeaveRequest',
      entityId: requestId,
      before: { status: 'Pending' },
      after: { status: data.status, comment: data.comment },
    });

    return updated!;
  }

  /**
   * Get pending leave requests for a supervisor.
   */
  async getPendingForSupervisor(supervisorId: string): Promise<LeaveRequest[]> {
    return leaveRequestRepo.findPendingBySupervisor(supervisorId);
  }

  /**
   * Get all leave requests (admin view).
   */
  async getAll(page = 1, pageSize = 20, filters?: Record<string, any>) {
    return leaveRequestRepo.paginate(
      filters,
      page,
      pageSize,
      'createdAt',
      'desc'
    );
  }

  /**
   * Cancel a pending leave request (by the employee).
   */
  async cancel(requestId: string, user: AuthUser): Promise<LeaveRequest> {
    const request = await leaveRequestRepo.findById(requestId);
    if (!request) throw new NotFoundError('Leave request');

    if (request.employeeId !== user.id) {
      throw new ForbiddenError('You can only cancel your own leave requests.');
    }

    if (request.status !== 'Pending') {
      throw new ValidationError('Only pending requests can be cancelled.');
    }

    const updated = await leaveRequestRepo.update(requestId, {
      status: 'Cancelled',
    });

    // Release pending hours
    const year = new Date(request.startDate).getFullYear();
    const balance = await leaveBalanceRepo.findByEmployeeAndYear(request.employeeId, year);
    if (balance) {
      await leaveBalanceRepo.upsert({
        ...balance,
        pendingHours: Math.max(0, balance.pendingHours - request.totalHours),
      });
    }

    // Cancel the associated task
    const tasks = await taskService.getTasksByRef('LeaveRequest', requestId);
    for (const task of tasks) {
      if (task.status === 'Open' || task.status === 'Overdue') {
        await taskService.cancel(task.id);
      }
    }

    return updated!;
  }
}

export const leaveService = new LeaveService();
