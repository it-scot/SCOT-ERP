// ============================================================
// SCoT ERP — Leave Routes (Full Implementation)
// ============================================================
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { leaveRequestRepo, leaveBalanceRepo, employeeRepo } from '../repositories/index.js';
import { leaveService } from '../services/leaveService.js';
import { createLeaveRequestSchema, respondLeaveRequestSchema, paginationSchema } from '@scot-erp/shared';

export const leaveRouter = Router();
leaveRouter.use(authenticate);

// GET /api/leave/my — My leave requests
leaveRouter.get('/my', async (req, res, next) => {
  try {
    const requests = await leaveRequestRepo.findByEmployee(req.user!.id);
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});

// GET /api/leave/balance — My leave balance
leaveRouter.get('/balance', async (req, res, next) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const balance = await leaveBalanceRepo.findByEmployeeAndYear(req.user!.id, year);
    res.json({ success: true, data: balance });
  } catch (err) {
    next(err);
  }
});

// POST /api/leave — Create a leave request
leaveRouter.post('/', async (req, res, next) => {
  try {
    const data = createLeaveRequestSchema.parse(req.body);
    const request = await leaveService.createRequest(req.user!, data);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

// GET /api/leave/pending — Pending requests for supervisor
leaveRouter.get('/pending', async (req, res, next) => {
  try {
    const pending = await leaveService.getPendingForSupervisor(req.user!.id);

    // Enrich with employee names
    const enriched = await Promise.all(
      pending.map(async (req) => {
        const emp = await employeeRepo.findById(req.employeeId);
        return {
          ...req,
          employeeName: emp?.preferredName || 'Unknown',
          employeeStaffId: emp?.staffId || '',
          employeeDepartment: emp?.departmentCode || '',
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
});

// PUT /api/leave/:id/respond — Approve or decline a leave request
leaveRouter.put('/:id/respond', async (req, res, next) => {
  try {
    const data = respondLeaveRequestSchema.parse(req.body);
    const updated = await leaveService.respond(req.params.id, req.user!, data);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// PUT /api/leave/:id/cancel — Cancel a pending leave request
leaveRouter.put('/:id/cancel', async (req, res, next) => {
  try {
    const updated = await leaveService.cancel(req.params.id, req.user!);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// GET /api/leave/all — All leave requests (admin view)
leaveRouter.get('/all', requireRoles('HR', 'SystemAdmin', 'COO'), async (req, res, next) => {
  try {
    const { page, pageSize } = paginationSchema.parse(req.query);
    const { status, type, department } = req.query;

    const filters: Record<string, any> = {};
    if (status) filters.status = status;
    if (type) filters.type = type;

    // Filter by department: find employees in dept, then filter requests
    let result = await leaveService.getAll(page, pageSize, filters);

    if (department) {
      const deptEmployees = await employeeRepo.findByDepartment(department as string);
      const deptIds = new Set(deptEmployees.map((e) => e.id));
      result.data = result.data.filter((r) => deptIds.has(r.employeeId));
      result.total = result.data.length;
    }

    // Enrich with employee names
    const enriched = await Promise.all(
      result.data.map(async (r) => {
        const emp = await employeeRepo.findById(r.employeeId);
        return {
          ...r,
          employeeName: emp?.preferredName || 'Unknown',
          employeeStaffId: emp?.staffId || '',
          employeeDepartment: emp?.departmentCode || '',
        };
      })
    );

    res.json({ success: true, data: enriched, total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages });
  } catch (err) {
    next(err);
  }
});

// GET /api/leave/balance/:employeeId — Employee leave balance (HR/supervisor)
leaveRouter.get('/balance/:employeeId', async (req, res, next) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const balance = await leaveBalanceRepo.findByEmployeeAndYear(req.params.employeeId, year);
    res.json({ success: true, data: balance });
  } catch (err) {
    next(err);
  }
});

// GET /api/leave/employee/:employeeId — Leave requests for a specific employee
leaveRouter.get('/employee/:employeeId', async (req, res, next) => {
  try {
    const requests = await leaveRequestRepo.findByEmployee(req.params.employeeId);
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});
