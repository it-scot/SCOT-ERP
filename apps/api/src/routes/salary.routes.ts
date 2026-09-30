// ============================================================
// SCoT ERP — Salary Routes (Full Implementation)
// ============================================================
import { Router } from 'express';
import { authenticate, requireRoles, requireSalaryAccess } from '../middleware/auth.js';
import { salaryRecordRepo, payslipRepo } from '../repositories/index.js';
import { salaryService } from '../services/salaryService.js';
import { createSalaryRecordSchema } from '@scot-erp/shared';

export const salaryRouter = Router();
salaryRouter.use(authenticate);

// ---- Self-service endpoints ----

// GET /api/salary/my — My current salary and history
salaryRouter.get('/my', async (req, res, next) => {
  try {
    const current = await salaryRecordRepo.findCurrentByEmployee(req.user!.id);
    const history = await salaryRecordRepo.findByEmployee(req.user!.id);
    res.json({ success: true, data: { current, history } });
  } catch (err) {
    next(err);
  }
});

// GET /api/salary/my/payslips — My payslips
salaryRouter.get('/my/payslips', async (req, res, next) => {
  try {
    const payslips = await payslipRepo.findByEmployee(req.user!.id);
    res.json({ success: true, data: payslips });
  } catch (err) {
    next(err);
  }
});

// ---- Admin endpoints ----

// GET /api/salary/all — All current salary records (HR/COO only)
salaryRouter.get('/all', requireRoles('HR', 'COO', 'SystemAdmin'), async (req, res, next) => {
  try {
    const records = await salaryService.getAllCurrent();
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
});

// POST /api/salary — Create a salary record (HR only)
salaryRouter.post('/', requireRoles('HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    const data = createSalaryRecordSchema.parse(req.body);
    const record = await salaryService.createSalaryRecord(req.user!, data);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
});

// POST /api/salary/payslips — Register a payslip upload (HR only)
salaryRouter.post('/payslips', requireRoles('HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    const { employeeId, monthYear, fileId, fileName } = req.body;

    if (!employeeId || !monthYear || !fileId || !fileName) {
      res.status(400).json({
        success: false,
        error: 'employeeId, monthYear, fileId, and fileName are required.',
      });
      return;
    }

    const payslip = await salaryService.registerPayslip(req.user!, {
      employeeId,
      monthYear,
      fileId,
      fileName,
    });
    res.status(201).json({ success: true, data: payslip });
  } catch (err) {
    next(err);
  }
});

// ---- Per-employee endpoints (access-controlled) ----

// GET /api/salary/employee/:employeeId — Employee salary (HR/COO/self)
salaryRouter.get('/employee/:employeeId', requireSalaryAccess(), async (req, res, next) => {
  try {
    const current = await salaryRecordRepo.findCurrentByEmployee(req.params.employeeId);
    const history = await salaryRecordRepo.findByEmployee(req.params.employeeId);
    res.json({ success: true, data: { current, history } });
  } catch (err) {
    next(err);
  }
});

// GET /api/salary/employee/:employeeId/payslips — Employee payslips
salaryRouter.get('/employee/:employeeId/payslips', requireSalaryAccess(), async (req, res, next) => {
  try {
    const payslips = await payslipRepo.findByEmployee(req.params.employeeId);
    res.json({ success: true, data: payslips });
  } catch (err) {
    next(err);
  }
});
