// SCoT ERP — Attendance Routes (stub for Phase 1, expanded in Phase 3)
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { attendanceDayRepo } from '../repositories/index.js';
export const attendanceRouter = Router();
attendanceRouter.use(authenticate);

attendanceRouter.get('/my/:yearMonth', async (req, res, next) => {
  try {
    const days = await attendanceDayRepo.findByEmployeeAndMonth(req.user!.id, req.params.yearMonth);
    res.json({ success: true, data: days });
  } catch (err) { next(err); }
});

attendanceRouter.get('/employee/:employeeId/:yearMonth', async (req, res, next) => {
  try {
    const days = await attendanceDayRepo.findByEmployeeAndMonth(req.params.employeeId, req.params.yearMonth);
    res.json({ success: true, data: days });
  } catch (err) { next(err); }
});
