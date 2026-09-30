// ============================================================
// SCoT ERP — WFH Routes (Full Implementation)
// ============================================================
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { wfhRequestRepo, employeeRepo } from '../repositories/index.js';
import { wfhService } from '../services/wfhService.js';
import { createWfhRequestSchema, respondWfhRequestSchema, paginationSchema } from '@scot-erp/shared';

export const wfhRouter = Router();
wfhRouter.use(authenticate);

// GET /api/wfh/my — My WFH requests
wfhRouter.get('/my', async (req, res, next) => {
  try {
    const requests = await wfhRequestRepo.findByEmployee(req.user!.id);
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});

// POST /api/wfh — Create a WFH request
wfhRouter.post('/', async (req, res, next) => {
  try {
    const data = createWfhRequestSchema.parse(req.body);
    const request = await wfhService.createRequest(req.user!, data);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

// GET /api/wfh/pending — Pending WFH requests for supervisor
wfhRouter.get('/pending', async (req, res, next) => {
  try {
    const pending = await wfhService.getPendingForSupervisor(req.user!.id);

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

// PUT /api/wfh/:id/respond — Approve or decline a WFH request
wfhRouter.put('/:id/respond', async (req, res, next) => {
  try {
    const data = respondWfhRequestSchema.parse(req.body);
    const updated = await wfhService.respond(req.params.id, req.user!, data);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// GET /api/wfh/all — All WFH requests (admin view)
wfhRouter.get('/all', requireRoles('HR', 'SystemAdmin', 'COO'), async (req, res, next) => {
  try {
    const { page, pageSize } = paginationSchema.parse(req.query);
    const { status } = req.query;

    const filters: Record<string, any> = {};
    if (status) filters.status = status;

    const result = await wfhService.getAll(page, pageSize, filters);

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

    res.json({
      success: true,
      data: enriched,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/wfh/employee/:employeeId — WFH requests for a specific employee
wfhRouter.get('/employee/:employeeId', async (req, res, next) => {
  try {
    const requests = await wfhRequestRepo.findByEmployee(req.params.employeeId);
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});
