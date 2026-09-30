// ============================================================
// SCoT ERP — Overtime & Lieu Leave Routes
// ============================================================
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import {
  overtimeRecordRepo,
  lieuLeaveRequestRepo,
  employeeRepo,
} from '../repositories/index.js';
import { taskService } from '../services/taskService.js';
import { notificationService } from '../services/notificationService.js';
import { auditService } from '../services/auditService.js';
import { createLieuLeaveRequestSchema } from '@scot-erp/shared';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, ValidationError, ForbiddenError } from '../middleware/errorHandler.js';
import { DEFAULTS } from '@scot-erp/shared';

export const overtimeRouter = Router();
overtimeRouter.use(authenticate);

// ---- Overtime Records ----

// GET /api/overtime/my — My OT records
overtimeRouter.get('/my', async (req, res, next) => {
  try {
    const records = await overtimeRecordRepo.findByEmployee(req.user!.id);
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
});

// GET /api/overtime/my/:monthYear — My OT records for a specific month
overtimeRouter.get('/my/:monthYear', async (req, res, next) => {
  try {
    const records = await overtimeRecordRepo.findByEmployeeAndMonth(
      req.user!.id,
      req.params.monthYear
    );
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
});

// GET /api/overtime/employee/:employeeId — Employee OT records (supervisor/HR)
overtimeRouter.get('/employee/:employeeId', async (req, res, next) => {
  try {
    const records = await overtimeRecordRepo.findByEmployee(req.params.employeeId);
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
});

// ---- Lieu Leave Requests ----

// GET /api/overtime/lieu/my — My lieu leave requests
overtimeRouter.get('/lieu/my', async (req, res, next) => {
  try {
    const requests = await lieuLeaveRequestRepo.findByEmployee(req.user!.id);
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});

// POST /api/overtime/lieu — Create a lieu leave request
overtimeRouter.post('/lieu', async (req, res, next) => {
  try {
    const data = createLieuLeaveRequestSchema.parse(req.body);

    const employee = await employeeRepo.findById(req.user!.id);
    if (!employee) throw new NotFoundError('Employee');

    if (!employee.supervisorStaffId) {
      throw new ValidationError('No supervisor assigned.');
    }

    const supervisor = await employeeRepo.findByStaffId(employee.supervisorStaffId);
    if (!supervisor) throw new ValidationError('Supervisor not found.');

    // Validate OT records
    for (const otId of data.otRecordIds) {
      const ot = await overtimeRecordRepo.findById(otId);
      if (!ot) throw new NotFoundError(`OT record ${otId}`);
      if (ot.employeeId !== req.user!.id) {
        throw new ForbiddenError('OT record does not belong to you.');
      }
      if (ot.convertedToLieu) {
        throw new ValidationError(`OT record ${otId} has already been converted to lieu leave.`);
      }
    }

    const requestId = uuidv4();
    const request = await lieuLeaveRequestRepo.create({
      id: requestId,
      employeeId: req.user!.id,
      otRecordIds: data.otRecordIds,
      requestedDate: data.requestedDate,
      totalHours: data.totalHours,
      status: 'Pending',
      supervisorId: supervisor.id,
      supervisorComment: null,
      respondedAt: null,
    });

    // Create task for supervisor
    await taskService.createTask({
      type: 'LieuLeaveApproval',
      refEntity: 'LieuLeaveRequest',
      refId: requestId,
      assigneeUserId: supervisor.id,
      slaMinutes: DEFAULTS.slaDefaults.leaveApprovalMinutes,
      title: `Lieu Leave Approval: ${employee.preferredName}`,
      description: `Lieu leave request from ${employee.preferredName} for ${data.requestedDate}. ${data.totalHours}h from ${data.otRecordIds.length} OT record(s).`,
      priority: 'medium',
    });

    // Notify supervisor
    await notificationService.send({
      recipientId: supervisor.id,
      recipientEmail: supervisor.email,
      title: `Lieu Leave Request: ${employee.preferredName}`,
      body: `${employee.preferredName} has requested lieu leave for ${data.requestedDate} (${data.totalHours}h from OT).`,
      deepLink: `/tasks`,
      channel: 'both',
    });

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

// PUT /api/overtime/lieu/:id/respond — Approve/decline lieu leave
overtimeRouter.put('/lieu/:id/respond', async (req, res, next) => {
  try {
    const { status, comment } = req.body;

    if (!['Approved', 'Declined'].includes(status)) {
      throw new ValidationError('Status must be Approved or Declined.');
    }

    const request = await lieuLeaveRequestRepo.findById(req.params.id);
    if (!request) throw new NotFoundError('Lieu leave request');

    if (request.status !== 'Pending') {
      throw new ValidationError(`This request has already been ${request.status.toLowerCase()}.`);
    }

    const now = new Date().toISOString();
    const updated = await lieuLeaveRequestRepo.update(req.params.id, {
      status,
      supervisorComment: comment || null,
      respondedAt: now,
    });

    // If approved, mark OT records as converted
    if (status === 'Approved') {
      for (const otId of request.otRecordIds) {
        await overtimeRecordRepo.update(otId, {
          convertedToLieu: true,
          lieuLeaveRequestId: req.params.id,
        });
      }
    }

    // Complete the task
    const tasks = await taskService.getTasksByRef('LieuLeaveRequest', req.params.id);
    for (const task of tasks) {
      if (task.status === 'Open' || task.status === 'Overdue') {
        await taskService.complete(task.id);
      }
    }

    // Notify employee
    const employee = await employeeRepo.findById(request.employeeId);
    if (employee) {
      await notificationService.send({
        recipientId: request.employeeId,
        recipientEmail: employee.email,
        title: `Lieu Leave ${status}`,
        body: `Your lieu leave request for ${request.requestedDate} has been ${status.toLowerCase()}.`,
        deepLink: `/overtime`,
        channel: 'both',
      });
    }

    await auditService.log({
      userId: req.user!.id,
      action: `LIEU_LEAVE_${status.toUpperCase()}`,
      entity: 'LieuLeaveRequest',
      entityId: req.params.id,
      before: { status: 'Pending' },
      after: { status },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});
