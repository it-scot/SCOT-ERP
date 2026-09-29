// SCoT ERP — WFH Routes (stub)
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { wfhRequestRepo } from '../repositories/index.js';
export const wfhRouter = Router();
wfhRouter.use(authenticate);

wfhRouter.get('/my', async (req, res, next) => {
  try {
    const requests = await wfhRequestRepo.findByEmployee(req.user!.id);
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
});
