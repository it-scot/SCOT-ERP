// ============================================================
// SCoT ERP — Email Outbox Routes
// ============================================================
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { emailService } from '../services/emailService.js';

export const emailRouter = Router();
emailRouter.use(authenticate, requireRoles('SystemAdmin', 'HR', 'IT'));

// GET /api/emails/outbox — View sent emails (admin view for debugging/audit)
emailRouter.get('/outbox', async (_req, res, next) => {
  try {
    const emails = await emailService.getOutbox();
    res.json({ success: true, data: emails });
  } catch (err) {
    next(err);
  }
});
