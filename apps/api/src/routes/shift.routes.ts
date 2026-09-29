// SCoT ERP — Shift Routes
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { SHIFT_PATTERNS, TIME_SLOTS } from '@scot-erp/shared';
export const shiftRouter = Router();
shiftRouter.use(authenticate);

shiftRouter.get('/patterns', async (_req, res) => {
  res.json({ success: true, data: SHIFT_PATTERNS });
});

shiftRouter.get('/time-slots', async (_req, res) => {
  res.json({ success: true, data: TIME_SLOTS });
});
