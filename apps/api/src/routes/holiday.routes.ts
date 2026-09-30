// ============================================================
// SCoT ERP — Public Holiday Routes
// ============================================================
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { publicHolidayRepo } from '../repositories/index.js';
import { auditService } from '../services/auditService.js';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from '../middleware/errorHandler.js';
import { z } from 'zod';

export const holidayRouter = Router();
holidayRouter.use(authenticate);

const holidaySchema = z.object({
  date: z.string().min(1),
  name: z.string().min(1),
  isRecurring: z.boolean().default(false),
});

// GET /api/holidays — List all holidays (optionally filter by year)
holidayRouter.get('/', async (req, res, next) => {
  try {
    const year = parseInt(req.query.year as string);
    const holidays = year
      ? await publicHolidayRepo.findByYear(year)
      : await publicHolidayRepo.findAll();

    const sorted = holidays.sort((a, b) => a.date.localeCompare(b.date));
    res.json({ success: true, data: sorted });
  } catch (err) {
    next(err);
  }
});

// GET /api/holidays/check/:date — Check if a date is a holiday
holidayRouter.get('/check/:date', async (req, res, next) => {
  try {
    const isHoliday = await publicHolidayRepo.isHoliday(req.params.date);
    const holiday = await publicHolidayRepo.findByDate(req.params.date);
    res.json({ success: true, data: { isHoliday, holiday } });
  } catch (err) {
    next(err);
  }
});

// POST /api/holidays — Create a holiday (admin only)
holidayRouter.post('/', requireRoles('HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    const data = holidaySchema.parse(req.body);
    const holidayId = uuidv4();

    const holiday = await publicHolidayRepo.create({
      id: holidayId,
      date: data.date,
      name: data.name,
      isRecurring: data.isRecurring,
    });

    await auditService.log({
      userId: req.user!.id,
      action: 'CREATE_HOLIDAY',
      entity: 'PublicHoliday',
      entityId: holidayId,
      after: { date: data.date, name: data.name },
    });

    res.status(201).json({ success: true, data: holiday });
  } catch (err) {
    next(err);
  }
});

// PUT /api/holidays/:id — Update a holiday (admin only)
holidayRouter.put('/:id', requireRoles('HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    const existing = await publicHolidayRepo.findById(req.params.id);
    if (!existing) throw new NotFoundError('Public holiday');

    const data = holidaySchema.partial().parse(req.body);
    const updated = await publicHolidayRepo.update(req.params.id, data);

    await auditService.log({
      userId: req.user!.id,
      action: 'UPDATE_HOLIDAY',
      entity: 'PublicHoliday',
      entityId: req.params.id,
      before: existing as any,
      after: updated as any,
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/holidays/:id — Delete a holiday (admin only)
holidayRouter.delete('/:id', requireRoles('HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    const existing = await publicHolidayRepo.findById(req.params.id);
    if (!existing) throw new NotFoundError('Public holiday');

    await publicHolidayRepo.delete(req.params.id);

    await auditService.log({
      userId: req.user!.id,
      action: 'DELETE_HOLIDAY',
      entity: 'PublicHoliday',
      entityId: req.params.id,
      before: existing as any,
    });

    res.json({ success: true, message: 'Holiday deleted' });
  } catch (err) {
    next(err);
  }
});
