// SCoT ERP — Notification Routes
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { notificationService } from '../services/notificationService.js';
export const notificationRouter = Router();
notificationRouter.use(authenticate);

notificationRouter.get('/', async (req, res, next) => {
  try {
    const notifications = await notificationService.getForUser(req.user!.id);
    res.json({ success: true, data: notifications });
  } catch (err) { next(err); }
});

notificationRouter.get('/unread-count', async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.id);
    res.json({ success: true, data: { count } });
  } catch (err) { next(err); }
});

notificationRouter.put('/:id/read', async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    res.json({ success: true, data: notification });
  } catch (err) { next(err); }
});

notificationRouter.put('/read-all', async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
});
