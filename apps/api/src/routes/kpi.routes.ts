// ============================================================
// SCoT ERP — KPI Routes
// ============================================================
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { kpiService } from '../services/kpiService.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

export const kpiRouter = Router();
kpiRouter.use(authenticate);

// GET /api/kpi/config — Get KPI configuration
kpiRouter.get('/config', requireRoles('HR', 'COO', 'SystemAdmin'), async (_req, res, next) => {
  try {
    const config = kpiService.getConfig();
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
});

// PUT /api/kpi/config — Update KPI configuration
kpiRouter.put('/config', requireRoles('HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    kpiService.saveConfig(req.body, req.user!.id);
    res.json({ success: true, message: 'KPI configuration updated.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/kpi/my — My KPI snapshots
kpiRouter.get('/my', async (req, res, next) => {
  try {
    const snapshots = await kpiService.getSnapshotsByEmployee(req.user!.id);
    res.json({ success: true, data: snapshots });
  } catch (err) {
    next(err);
  }
});

// GET /api/kpi/my/latest — My latest KPI
kpiRouter.get('/my/latest', async (req, res, next) => {
  try {
    const snapshot = await kpiService.getLatestSnapshot(req.user!.id);
    res.json({ success: true, data: snapshot });
  } catch (err) {
    next(err);
  }
});

// GET /api/kpi/employee/:employeeId — Employee KPI snapshots (HR/COO/Supervisor)
kpiRouter.get('/employee/:employeeId', requireRoles('HR', 'COO', 'SystemAdmin', 'Supervisor', 'HOD'), async (req, res, next) => {
  try {
    const snapshots = await kpiService.getSnapshotsByEmployee(req.params.employeeId);
    res.json({ success: true, data: snapshots });
  } catch (err) {
    next(err);
  }
});

// POST /api/kpi/calculate/:employeeId — Calculate KPI for a single employee
kpiRouter.post('/calculate/:employeeId', requireRoles('HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    const { period } = req.body;
    if (!period) throw new ValidationError('Period is required (e.g., 2026-09)');

    const snapshot = await kpiService.calculateKpi(req.params.employeeId, period, req.user!.id);
    res.status(201).json({ success: true, data: snapshot });
  } catch (err) {
    next(err);
  }
});

// POST /api/kpi/calculate-all — Bulk calculate KPI for all active employees
kpiRouter.post('/calculate-all', requireRoles('HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    const { period } = req.body;
    if (!period) throw new ValidationError('Period is required (e.g., 2026-09)');

    const snapshots = await kpiService.calculateAllKpis(period, req.user!.id);
    res.status(201).json({
      success: true,
      data: snapshots,
      message: `KPI calculated for ${snapshots.length} employees.`,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/kpi/leaderboard/:period — KPI leaderboard for a period
kpiRouter.get('/leaderboard/:period', requireRoles('HR', 'COO', 'SystemAdmin'), async (req, res, next) => {
  try {
    const leaderboard = await kpiService.getLeaderboard(req.params.period);
    res.json({ success: true, data: leaderboard });
  } catch (err) {
    next(err);
  }
});

// GET /api/kpi/period/:period — All snapshots for a period
kpiRouter.get('/period/:period', requireRoles('HR', 'COO', 'SystemAdmin'), async (req, res, next) => {
  try {
    const snapshots = await kpiService.getSnapshotsByPeriod(req.params.period);
    res.json({ success: true, data: snapshots });
  } catch (err) {
    next(err);
  }
});
