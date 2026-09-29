// SCoT ERP — Document Routes
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { documentRepo } from '../repositories/index.js';
export const documentRouter = Router();
documentRouter.use(authenticate);

documentRouter.get('/employee/:employeeId', async (req, res, next) => {
  try {
    const docs = await documentRepo.findByEmployee(req.params.employeeId);
    res.json({ success: true, data: docs });
  } catch (err) { next(err); }
});
