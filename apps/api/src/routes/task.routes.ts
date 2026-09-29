// SCoT ERP — Task Routes
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { taskService } from '../services/taskService.js';
export const taskRouter = Router();
taskRouter.use(authenticate);

taskRouter.get('/', requireRoles('SystemAdmin', 'HR'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await taskService.getAll(page);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
});

taskRouter.get('/my', async (req, res, next) => {
  try {
    const tasks = await taskService.getOpenTasksForUser(req.user!.id);
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
});

taskRouter.put('/:id/view', async (req, res, next) => {
  try {
    const task = await taskService.markViewed(req.params.id);
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
});

taskRouter.put('/:id/complete', async (req, res, next) => {
  try {
    const task = await taskService.complete(req.params.id);
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
});
