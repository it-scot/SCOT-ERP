// SCoT ERP — Leave Routes (stub for Phase 1)
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { leaveRequestRepo, leaveBalanceRepo } from '../repositories/index.js';
export const leaveRouter = Router();
leaveRouter.use(authenticate);

leaveRouter.get('/my', async (req, res, next) => {
  try {
    const requests = await leaveRequestRepo.findByEmployee(req.user!.id);
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
});

leaveRouter.get('/balance', async (req, res, next) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const balance = await leaveBalanceRepo.findByEmployeeAndYear(req.user!.id, year);
    res.json({ success: true, data: balance });
  } catch (err) { next(err); }
});
