// ============================================================
// SCoT ERP — Onboarding Routes
// ============================================================
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { onboardingService } from '../services/onboardingService.js';
import { createUpcomingJoinerSchema, paginationSchema } from '@scot-erp/shared';
import { onboardingStepRepo } from '../repositories/index.js';

export const onboardingRouter = Router();
onboardingRouter.use(authenticate);

// GET /api/onboarding — All onboarding cases (admin)
onboardingRouter.get(
  '/',
  requireRoles('HR', 'SystemAdmin', 'COO'),
  async (req, res, next) => {
    try {
      const { page, pageSize } = paginationSchema.parse(req.query);
      const result = await onboardingService.getAll(page, pageSize);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/onboarding/active — Active onboarding cases
onboardingRouter.get(
  '/active',
  requireRoles('HR', 'SystemAdmin', 'COO', 'IT', 'Admin'),
  async (_req, res, next) => {
    try {
      const cases = await onboardingService.getActiveCases();
      res.json({ success: true, data: cases });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/onboarding/:id — Single case with steps
onboardingRouter.get('/:id', async (req, res, next) => {
  try {
    const caseWithSteps = await onboardingService.getCaseWithSteps(req.params.id);
    res.json({ success: true, data: caseWithSteps });
  } catch (err) {
    next(err);
  }
});

// POST /api/onboarding — Create onboarding case (HR only)
onboardingRouter.post(
  '/',
  requireRoles('HR', 'SystemAdmin'),
  async (req, res, next) => {
    try {
      const data = createUpcomingJoinerSchema.parse(req.body);
      const created = await onboardingService.createCase(req.user!, data);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/onboarding/steps/:stepId/complete — Complete an onboarding step
onboardingRouter.put('/steps/:stepId/complete', async (req, res, next) => {
  try {
    const { notes } = req.body;
    const updated = await onboardingService.completeStep(
      req.params.stepId,
      req.user!,
      notes
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// GET /api/onboarding/my-steps — My pending onboarding steps
onboardingRouter.get('/my-steps', async (req, res, next) => {
  try {
    const steps = await onboardingStepRepo.findPendingByAssignee(req.user!.id);
    res.json({ success: true, data: steps });
  } catch (err) {
    next(err);
  }
});

// GET /api/onboarding/department-steps/:dept — Pending steps for a department
onboardingRouter.get(
  '/department-steps/:dept',
  async (req, res, next) => {
    try {
      const steps = await onboardingStepRepo.findPendingByDepartment(req.params.dept);
      res.json({ success: true, data: steps });
    } catch (err) {
      next(err);
    }
  }
);
