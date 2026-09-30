// ============================================================
// SCoT ERP — Resignation Routes
// ============================================================
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { resignationService } from '../services/resignationService.js';
import { createResignationSchema, respondResignationSchema, paginationSchema } from '@scot-erp/shared';

export const resignationRouter = Router();
resignationRouter.use(authenticate);

// GET /api/resignation — All resignation cases (admin)
resignationRouter.get(
  '/',
  requireRoles('HR', 'SystemAdmin', 'COO'),
  async (req, res, next) => {
    try {
      const { page, pageSize } = paginationSchema.parse(req.query);
      const result = await resignationService.getAll(page, pageSize);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/resignation/active — Active resignation cases
resignationRouter.get(
  '/active',
  requireRoles('HR', 'SystemAdmin', 'COO', 'IT'),
  async (_req, res, next) => {
    try {
      const cases = await resignationService.getActive();
      const { employeeRepo } = await import('../repositories/index.js');
      const enriched = await Promise.all(
        cases.map(async (c) => {
          const emp = await employeeRepo.findById(c.employeeId);
          return {
            ...c,
            employeeName: emp?.preferredName || 'Unknown',
            designation: emp?.designation || '',
            departmentCode: emp?.departmentCode || '',
          };
        })
      );
      res.json({ success: true, data: enriched });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/resignation/:id — Single case with details
resignationRouter.get('/:id', async (req, res, next) => {
  try {
    const details = await resignationService.getCaseDetails(req.params.id);
    res.json({ success: true, data: details });
  } catch (err) {
    next(err);
  }
});

// POST /api/resignation — Submit resignation
resignationRouter.post('/', async (req, res, next) => {
  try {
    const data = createResignationSchema.parse(req.body);
    const resignation = await resignationService.submit(req.user!, data);
    res.status(201).json({ success: true, data: resignation });
  } catch (err) {
    next(err);
  }
});

// PUT /api/resignation/:id/respond — HOD responds to resignation
resignationRouter.put('/:id/respond', async (req, res, next) => {
  try {
    const data = respondResignationSchema.parse(req.body);
    const updated = await resignationService.hodRespond(
      req.params.id,
      req.user!,
      data
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// POST /api/resignation/:id/exit-evaluation — Submit exit evaluation
resignationRouter.post('/:id/exit-evaluation', async (req, res, next) => {
  try {
    const { responses } = req.body;
    if (!responses || !Array.isArray(responses)) {
      res.status(400).json({ success: false, error: 'responses array is required' });
      return;
    }

    const result = await resignationService.submitExitEvaluation(
      req.params.id,
      req.user!,
      responses
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/resignation/:id/service-letter — Request a service letter
resignationRouter.post('/:id/service-letter', async (req, res, next) => {
  try {
    const result = await resignationService.requestServiceLetter(
      req.params.id,
      req.user!
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});
