// ============================================================
// SCoT ERP — Attendance Routes (Full Implementation)
// ============================================================
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { attendanceDayRepo, attendancePunchRepo } from '../repositories/index.js';
import { attendanceService } from '../services/attendanceService.js';
import { attendancePunchSchema, attendancePunchBatchSchema } from '@scot-erp/shared';
import { config } from '../config.js';
import { ForbiddenError } from '../middleware/errorHandler.js';

export const attendanceRouter = Router();

// ---- Device Endpoint (API key auth, no JWT) ----

// POST /api/attendance/punch — Ingest a single biometric punch from device
attendanceRouter.post('/punch', async (req, res, next) => {
  try {
    // Authenticate via API key (for biometric devices)
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    if (apiKey !== config.deviceApiKey) {
      throw new ForbiddenError('Invalid device API key');
    }

    const data = attendancePunchSchema.parse(req.body);
    const punch = await attendanceService.ingestPunch(data);
    res.status(201).json({ success: true, data: punch });
  } catch (err) {
    next(err);
  }
});

// POST /api/attendance/punch/batch — Ingest a batch of biometric punches
attendanceRouter.post('/punch/batch', async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    if (apiKey !== config.deviceApiKey) {
      throw new ForbiddenError('Invalid device API key');
    }

    const punches = attendancePunchBatchSchema.parse(req.body);
    const result = await attendanceService.ingestPunchBatch(punches);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ---- Authenticated Endpoints ----
attendanceRouter.use(authenticate);

// GET /api/attendance/my/:yearMonth — My attendance for a month
attendanceRouter.get('/my/:yearMonth', async (req, res, next) => {
  try {
    const days = await attendanceDayRepo.findByEmployeeAndMonth(
      req.user!.id,
      req.params.yearMonth
    );
    res.json({ success: true, data: days });
  } catch (err) {
    next(err);
  }
});

// GET /api/attendance/my/today — My attendance for today
attendanceRouter.get('/my/today', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const day = await attendanceDayRepo.findByEmployeeAndDate(req.user!.id, today);
    res.json({ success: true, data: day });
  } catch (err) {
    next(err);
  }
});

// GET /api/attendance/employee/:employeeId/:yearMonth — Employee attendance
attendanceRouter.get('/employee/:employeeId/:yearMonth', async (req, res, next) => {
  try {
    const days = await attendanceDayRepo.findByEmployeeAndMonth(
      req.params.employeeId,
      req.params.yearMonth
    );
    res.json({ success: true, data: days });
  } catch (err) {
    next(err);
  }
});

// GET /api/attendance/date/:date — All attendance for a specific date (admin)
attendanceRouter.get(
  '/date/:date',
  requireRoles('HR', 'SystemAdmin', 'COO', 'HOD'),
  async (req, res, next) => {
    try {
      const days = await attendanceDayRepo.findByDate(req.params.date);
      res.json({ success: true, data: days });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/attendance/summary/:yearMonth — Monthly attendance summary (admin)
attendanceRouter.get(
  '/summary/:yearMonth',
  requireRoles('HR', 'SystemAdmin', 'COO'),
  async (req, res, next) => {
    try {
      const summary = await attendanceService.getMonthlySummary(req.params.yearMonth);
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/attendance/today-overview — Today's attendance overview (admin)
attendanceRouter.get(
  '/today-overview',
  requireRoles('HR', 'SystemAdmin', 'COO'),
  async (req, res, next) => {
    try {
      const overview = await attendanceService.getTodayOverview();
      res.json({ success: true, data: overview });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/attendance/process/:date — Process/reconcile attendance for a date (admin)
attendanceRouter.post(
  '/process/:date',
  requireRoles('HR', 'SystemAdmin'),
  async (req, res, next) => {
    try {
      const result = await attendanceService.processDate(req.params.date);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/attendance/punches/:biometricId/:date — Raw punches for debugging
attendanceRouter.get(
  '/punches/:biometricId/:date',
  requireRoles('HR', 'SystemAdmin', 'IT'),
  async (req, res, next) => {
    try {
      const punches = await attendancePunchRepo.findByBiometricIdAndDate(
        req.params.biometricId,
        req.params.date
      );
      res.json({ success: true, data: punches });
    } catch (err) {
      next(err);
    }
  }
);
