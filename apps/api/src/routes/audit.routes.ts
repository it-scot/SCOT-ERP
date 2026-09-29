// SCoT ERP — Audit Log Routes
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { auditService } from '../services/auditService.js';
export const auditRouter = Router();
auditRouter.use(authenticate, requireRoles('SystemAdmin'));

auditRouter.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const search = req.query.search as string;
    const result = await auditService.getAll(page, 50, search);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
});
