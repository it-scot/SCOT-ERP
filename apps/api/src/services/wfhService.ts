// ============================================================
// SCoT ERP — WFH Service
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import { wfhRequestRepo, employeeRepo, attendanceDayRepo } from '../repositories/index.js';
import { taskService } from './taskService.js';
import { notificationService } from './notificationService.js';
import { auditService } from './auditService.js';
import type { WfhRequest, AuthUser } from '@scot-erp/shared';
import { DEFAULTS } from '@scot-erp/shared';
import { ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

export class WfhService {
  /**
   * Create a WFH request for the current user.
   */
  async createRequest(
    user: AuthUser,
    data: { dates: string[]; reason: string }
  ): Promise<WfhRequest> {
    const employee = await employeeRepo.findById(user.id);
    if (!employee) throw new NotFoundError('Employee');

    if (!employee.supervisorStaffId) {
      throw new ValidationError('No supervisor assigned. Contact HR to set your supervisor.');
    }

    const supervisor = await employeeRepo.findByStaffId(employee.supervisorStaffId);
    if (!supervisor) {
      throw new ValidationError('Supervisor not found in the system.');
    }

    const requestId = uuidv4();
    const request = await wfhRequestRepo.create({
      id: requestId,
      employeeId: user.id,
      dates: data.dates,
      reason: data.reason,
      status: 'Pending',
      supervisorId: supervisor.id,
      supervisorComment: null,
      respondedAt: null,
    });

    // Create task for supervisor
    await taskService.createTask({
      type: 'WfhApproval',
      refEntity: 'WfhRequest',
      refId: requestId,
      assigneeUserId: supervisor.id,
      slaMinutes: DEFAULTS.slaDefaults.leaveApprovalMinutes,
      title: `WFH Approval: ${employee.preferredName}`,
      description: `WFH request from ${employee.preferredName} for ${data.dates.length} day(s): ${data.dates.join(', ')}. Reason: ${data.reason}`,
      priority: 'medium',
    });

    // Notify supervisor
    await notificationService.send({
      recipientId: supervisor.id,
      recipientEmail: supervisor.email,
      title: `WFH Request: ${employee.preferredName}`,
      body: `${employee.preferredName} has requested to work from home on ${data.dates.join(', ')}. Reason: ${data.reason}`,
      deepLink: `/tasks`,
      channel: 'both',
    });

    return request;
  }

  /**
   * Respond to a WFH request (approve/decline).
   */
  async respond(
    requestId: string,
    user: AuthUser,
    data: { status: 'Approved' | 'Declined'; comment?: string }
  ): Promise<WfhRequest> {
    const request = await wfhRequestRepo.findById(requestId);
    if (!request) throw new NotFoundError('WFH request');

    if (request.status !== 'Pending') {
      throw new ValidationError(`This WFH request has already been ${request.status.toLowerCase()}.`);
    }

    const isSupervisor = request.supervisorId === user.id;
    const isPrivileged = user.roles.some((r) => ['HR', 'COO', 'SystemAdmin'].includes(r));
    if (!isSupervisor && !isPrivileged) {
      throw new ForbiddenError('You are not authorized to respond to this WFH request.');
    }

    const now = new Date().toISOString();
    const updated = await wfhRequestRepo.update(requestId, {
      status: data.status,
      supervisorComment: data.comment || null,
      respondedAt: now,
    });

    // If approved, mark attendance days as WFH
    if (data.status === 'Approved' && request.dates) {
      for (const date of request.dates) {
        const attendanceDay = await attendanceDayRepo.findByEmployeeAndDate(
          request.employeeId,
          date
        );
        if (attendanceDay) {
          await attendanceDayRepo.update(attendanceDay.id, {
            isWfh: true,
            linkedWfhRequestId: requestId,
            status: 'Present - WFH',
          });
        }
      }
    }

    // Complete the associated task
    const tasks = await taskService.getTasksByRef('WfhRequest', requestId);
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
        title: `WFH Request ${data.status} ${statusEmoji}`,
        body: `Your WFH request for ${request.dates.join(', ')} has been ${data.status.toLowerCase()}.${data.comment ? ` Comment: ${data.comment}` : ''}`,
        deepLink: `/wfh`,
        channel: 'both',
      });
    }

    // Audit log
    await auditService.log({
      userId: user.id,
      action: `WFH_${data.status.toUpperCase()}`,
      entity: 'WfhRequest',
      entityId: requestId,
      before: { status: 'Pending' },
      after: { status: data.status, comment: data.comment },
    });

    return updated!;
  }

  /**
   * Get pending WFH requests for a supervisor.
   */
  async getPendingForSupervisor(supervisorId: string): Promise<WfhRequest[]> {
    return wfhRequestRepo.findPendingBySupervisor(supervisorId);
  }

  /**
   * Get all WFH requests (admin view).
   */
  async getAll(page = 1, pageSize = 20, filters?: Record<string, any>) {
    return wfhRequestRepo.paginate(filters, page, pageSize, 'createdAt', 'desc');
  }
}

export const wfhService = new WfhService();
