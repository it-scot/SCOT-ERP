// ============================================================
// SCoT ERP — Calendar Event Routes
// ============================================================
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { calendarService } from '../services/calendarService.js';
import { NotFoundError } from '../middleware/errorHandler.js';

export const calendarRouter = Router();
calendarRouter.use(authenticate);

// GET /api/calendar/my — My events
calendarRouter.get('/my', async (req, res, next) => {
  try {
    const events = await calendarService.getMyEvents(req.user!.id);
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
});

// GET /api/calendar/upcoming — Upcoming events
calendarRouter.get('/upcoming', async (_req, res, next) => {
  try {
    const events = await calendarService.getUpcomingEvents();
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
});

// GET /api/calendar/range — Events by date range
calendarRouter.get('/range', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'startDate and endDate query params are required' });
    }
    const events = await calendarService.getEventsByDateRange(startDate as string, endDate as string);
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
});

// GET /api/calendar/:id — Get event by ID
calendarRouter.get('/:id', async (req, res, next) => {
  try {
    const event = await calendarService.getEventById(req.params.id);
    if (!event) throw new NotFoundError('Calendar event');
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
});

// POST /api/calendar — Create event
calendarRouter.post('/', async (req, res, next) => {
  try {
    const event = await calendarService.createEvent(req.body, req.user!.id);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
});

// PUT /api/calendar/:id — Update event
calendarRouter.put('/:id', async (req, res, next) => {
  try {
    const updated = await calendarService.updateEvent(req.params.id, req.body, req.user!.id);
    if (!updated) throw new NotFoundError('Calendar event');
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/calendar/:id — Delete event
calendarRouter.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await calendarService.deleteEvent(req.params.id, req.user!.id);
    if (!deleted) throw new NotFoundError('Calendar event');
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    next(err);
  }
});
