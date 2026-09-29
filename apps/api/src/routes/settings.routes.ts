// SCoT ERP — Settings Routes
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { settingsRepo } from '../repositories/index.js';
import { updateSettingsSchema } from '@scot-erp/shared';
import { auditService } from '../services/auditService.js';
export const settingsRouter = Router();
settingsRouter.use(authenticate);

settingsRouter.get('/', async (_req, res, next) => {
  try {
    const settings = await settingsRepo.get();
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
});

settingsRouter.put('/', requireRoles('SystemAdmin'), async (req, res, next) => {
  try {
    const data = updateSettingsSchema.parse(req.body);
    const before = await settingsRepo.get();
    const updated = await settingsRepo.update(data);
    await auditService.log({
      userId: req.user!.id,
      action: 'UPDATE_SETTINGS',
      entity: 'Settings',
      entityId: 'system',
      before: before as any,
      after: updated as any,
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});
