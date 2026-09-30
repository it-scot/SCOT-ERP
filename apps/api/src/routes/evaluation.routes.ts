// ============================================================
// SCoT ERP — Evaluation Routes
// ============================================================
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { evaluationService } from '../services/evaluationService.js';
import {
  createEvaluationTemplateSchema,
  createEvaluationCycleSchema,
  submitEvaluationResponseSchema,
} from '@scot-erp/shared';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

export const evaluationRouter = Router();
evaluationRouter.use(authenticate);

// ============ Templates ============

// GET /api/evaluations/templates — List all templates
evaluationRouter.get('/templates', requireRoles('HR', 'COO', 'SystemAdmin'), async (_req, res, next) => {
  try {
    const templates = await evaluationService.getAllTemplates();
    res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
});

// GET /api/evaluations/templates/:id — Get template by ID
evaluationRouter.get('/templates/:id', requireRoles('HR', 'COO', 'SystemAdmin'), async (req, res, next) => {
  try {
    const template = await evaluationService.getTemplateById(req.params.id);
    if (!template) throw new NotFoundError('Evaluation template');
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
});

// POST /api/evaluations/templates — Create template
evaluationRouter.post('/templates', requireRoles('HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    const data = createEvaluationTemplateSchema.parse(req.body);
    const template = await evaluationService.createTemplate(data, req.user!.id);
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
});

// PUT /api/evaluations/templates/:id — Update template
evaluationRouter.put('/templates/:id', requireRoles('HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    const updated = await evaluationService.updateTemplate(req.params.id, req.body, req.user!.id);
    if (!updated) throw new NotFoundError('Evaluation template (or locked)');
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// ============ Cycles ============

// GET /api/evaluations/cycles — List all cycles
evaluationRouter.get('/cycles', requireRoles('HR', 'COO', 'SystemAdmin'), async (_req, res, next) => {
  try {
    const cycles = await evaluationService.getAllCycles();
    res.json({ success: true, data: cycles });
  } catch (err) {
    next(err);
  }
});

// GET /api/evaluations/cycles/:id — Get cycle by ID
evaluationRouter.get('/cycles/:id', requireRoles('HR', 'COO', 'SystemAdmin'), async (req, res, next) => {
  try {
    const cycle = await evaluationService.getCycleById(req.params.id);
    if (!cycle) throw new NotFoundError('Evaluation cycle');
    res.json({ success: true, data: cycle });
  } catch (err) {
    next(err);
  }
});

// POST /api/evaluations/cycles — Create cycle
evaluationRouter.post('/cycles', requireRoles('HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    const data = createEvaluationCycleSchema.parse(req.body);
    const cycle = await evaluationService.createCycle(data, req.user!.id);
    res.status(201).json({ success: true, data: cycle });
  } catch (err) {
    next(err);
  }
});

// POST /api/evaluations/cycles/:id/publish — Publish cycle (generates assignments)
evaluationRouter.post('/cycles/:id/publish', requireRoles('HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    const cycle = await evaluationService.publishCycle(req.params.id, req.user!.id);
    if (!cycle) throw new NotFoundError('Evaluation cycle (must be Draft)');
    res.json({ success: true, data: cycle, message: 'Cycle published and assignments generated.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/evaluations/cycles/:id/close — Close cycle and calculate results
evaluationRouter.post('/cycles/:id/close', requireRoles('HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    const results = await evaluationService.closeCycle(req.params.id, req.user!.id);
    res.json({ success: true, data: results, message: `Cycle closed. ${results.length} results calculated.` });
  } catch (err) {
    next(err);
  }
});

// POST /api/evaluations/cycles/:id/release — Release results to employees
evaluationRouter.post('/cycles/:id/release', requireRoles('HR', 'COO', 'SystemAdmin'), async (req, res, next) => {
  try {
    await evaluationService.releaseResults(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Results released to employees.' });
  } catch (err) {
    next(err);
  }
});

// ============ Assignments ============

// GET /api/evaluations/assignments/my — My evaluation assignments
evaluationRouter.get('/assignments/my', async (req, res, next) => {
  try {
    const assignments = await evaluationService.getMyAssignments(req.user!.id);
    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
});

// GET /api/evaluations/assignments/my/pending — My pending evaluations
evaluationRouter.get('/assignments/my/pending', async (req, res, next) => {
  try {
    const assignments = await evaluationService.getPendingAssignments(req.user!.id);
    
    // Enrich with target employee names
    const { employeeRepo } = await import('../repositories/index.js');
    const enriched = await Promise.all(
      assignments.map(async (a) => {
        const emp = await employeeRepo.findById(a.targetId);
        return {
          ...a,
          targetName: emp?.preferredName || 'Unknown',
          targetDesignation: emp?.designation || '',
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
});

// GET /api/evaluations/assignments/:id — Get assignment by ID
evaluationRouter.get('/assignments/:id', async (req, res, next) => {
  try {
    const assignment = await evaluationService.getAssignmentById(req.params.id);
    if (!assignment) throw new NotFoundError('Evaluation assignment');
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
});

// GET /api/evaluations/cycles/:id/assignments — All assignments for a cycle (HR)
evaluationRouter.get('/cycles/:id/assignments', requireRoles('HR', 'COO', 'SystemAdmin'), async (req, res, next) => {
  try {
    const assignments = await evaluationService.getCycleAssignments(req.params.id);
    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
});

// ============ Responses ============

// POST /api/evaluations/responses — Submit an evaluation response
evaluationRouter.post('/responses', async (req, res, next) => {
  try {
    const data = submitEvaluationResponseSchema.parse(req.body);
    const response = await evaluationService.submitResponse(data, req.user!.id);
    res.status(201).json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
});

// ============ Results ============

// GET /api/evaluations/results/my — My evaluation results
evaluationRouter.get('/results/my', async (req, res, next) => {
  try {
    const results = await evaluationService.getMyResults(req.user!.id);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
});

// GET /api/evaluations/cycles/:id/results — Results for a cycle (HR/COO)
evaluationRouter.get('/cycles/:id/results', requireRoles('HR', 'COO', 'SystemAdmin'), async (req, res, next) => {
  try {
    const results = await evaluationService.getResultsByCycle(req.params.id);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
});
