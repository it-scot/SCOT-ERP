// ============================================================
// SCoT ERP — Evaluation Service
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import {
  evaluationTemplateRepo,
  evaluationCycleRepo,
  evaluationAssignmentRepo,
  evaluationResponseRepo,
  evaluationResultRepo,
  employeeRepo,
  departmentRepo,
} from '../repositories/index.js';
import { taskService } from './taskService.js';
import { notificationService } from './notificationService.js';
import { auditService } from './auditService.js';
import type {
  EvaluationTemplate,
  EvaluationCycle,
  EvaluationAssignment,
  EvaluationResponse,
  EvaluationResult,
  EvaluationPillar,
} from '@scot-erp/shared';
import { DEFAULTS } from '@scot-erp/shared';

export class EvaluationService {
  // ---- Templates ----

  async createTemplate(data: any, userId: string): Promise<EvaluationTemplate> {
    const template = await evaluationTemplateRepo.create({
      id: uuidv4(),
      name: data.name,
      targetType: data.targetType,
      criteria: data.criteria.map((c: any) => ({
        id: uuidv4(),
        name: c.name,
        weight: c.weight,
        questions: c.questions.map((q: any) => ({
          id: uuidv4(),
          text: q.text,
          weight: q.weight,
          applicableTo: q.applicableTo,
          hasComment: q.hasComment || false,
        })),
      })),
      ratingScaleMin: data.ratingScaleMin || 1,
      ratingScaleMax: data.ratingScaleMax || 5,
      version: 1,
      isLocked: false,
    });

    await auditService.log({
      userId,
      action: 'EVALUATION_TEMPLATE_CREATED',
      entity: 'EvaluationTemplate',
      entityId: template.id,
      before: null,
      after: { name: template.name } as any,
    });

    return template;
  }

  async getAllTemplates(): Promise<EvaluationTemplate[]> {
    return evaluationTemplateRepo.findAll();
  }

  async getTemplateById(id: string): Promise<EvaluationTemplate | null> {
    return evaluationTemplateRepo.findById(id);
  }

  async updateTemplate(id: string, data: Partial<EvaluationTemplate>, userId: string): Promise<EvaluationTemplate | null> {
    const existing = await evaluationTemplateRepo.findById(id);
    if (!existing || existing.isLocked) return null;

    const updated = await evaluationTemplateRepo.update(id, data);

    if (updated) {
      await auditService.log({
        userId,
        action: 'EVALUATION_TEMPLATE_UPDATED',
        entity: 'EvaluationTemplate',
        entityId: id,
        before: { name: existing.name } as any,
        after: { name: updated.name } as any,
      });
    }

    return updated;
  }

  // ---- Cycles ----

  async createCycle(data: any, userId: string): Promise<EvaluationCycle> {
    const cycle = await evaluationCycleRepo.create({
      id: uuidv4(),
      name: data.name,
      type: data.type,
      templateId: data.templateId,
      hodTemplateId: data.hodTemplateId || null,
      startDate: data.startDate,
      deadline: data.deadline,
      status: 'Draft',
      pillarWeights: data.pillarWeights || DEFAULTS.evaluationPillarWeights,
      targetEmployeeIds: data.targetEmployeeIds || null,
    });

    await auditService.log({
      userId,
      action: 'EVALUATION_CYCLE_CREATED',
      entity: 'EvaluationCycle',
      entityId: cycle.id,
      before: null,
      after: { name: cycle.name, type: cycle.type } as any,
    });

    return cycle;
  }

  async getAllCycles(): Promise<EvaluationCycle[]> {
    return evaluationCycleRepo.findAll();
  }

  async getCycleById(id: string): Promise<EvaluationCycle | null> {
    return evaluationCycleRepo.findById(id);
  }

  /**
   * Publish a cycle: generate assignments for all target employees.
   * For each target, create Self, Peer, and Superior assignments.
   */
  async publishCycle(cycleId: string, userId: string): Promise<EvaluationCycle | null> {
    const cycle = await evaluationCycleRepo.findById(cycleId);
    if (!cycle || cycle.status !== 'Draft') return null;

    const template = await evaluationTemplateRepo.findById(cycle.templateId);
    if (!template) return null;

    // Lock the template
    await evaluationTemplateRepo.update(template.id, { isLocked: true });

    // Get target employees
    let employees = await employeeRepo.findAll();
    employees = employees.filter((e) => ['Active', 'Probation'].includes(e.status));

    if (cycle.targetEmployeeIds) {
      employees = employees.filter((e) => cycle.targetEmployeeIds!.includes(e.id));
    }

    for (const target of employees) {
      // Self evaluation
      await this.createAssignment(cycleId, target.id, target.id, 'Self', cycle.templateId, cycle.deadline);

      // Superior evaluation (supervisor evaluates target)
      if (target.supervisorStaffId) {
        const supervisor = await employeeRepo.findByStaffId(target.supervisorStaffId);
        if (supervisor) {
          await this.createAssignment(cycleId, supervisor.id, target.id, 'Superior', cycle.templateId, cycle.deadline);
        }
      }

      // Peer evaluations (colleagues in same department, excluding self and supervisor)
      const deptColleagues = await employeeRepo.findByDepartment(target.departmentCode);
      const peers = deptColleagues.filter(
        (c) =>
          c.id !== target.id &&
          c.staffId !== target.supervisorStaffId &&
          ['Active', 'Probation'].includes(c.status)
      );

      // Assign up to 3 random peers
      const selectedPeers = peers.sort(() => Math.random() - 0.5).slice(0, 3);
      for (const peer of selectedPeers) {
        await this.createAssignment(cycleId, peer.id, target.id, 'Peer', cycle.templateId, cycle.deadline);
      }
    }

    // Update cycle status
    const updated = await evaluationCycleRepo.update(cycleId, { status: 'Published' });

    await auditService.log({
      userId,
      action: 'EVALUATION_CYCLE_PUBLISHED',
      entity: 'EvaluationCycle',
      entityId: cycleId,
      before: { status: 'Draft' } as any,
      after: { status: 'Published' } as any,
    });

    return updated;
  }

  private async createAssignment(
    cycleId: string,
    evaluatorId: string,
    targetId: string,
    pillar: EvaluationPillar,
    templateId: string,
    dueAt: string
  ): Promise<EvaluationAssignment> {
    const assignment = await evaluationAssignmentRepo.create({
      id: uuidv4(),
      cycleId,
      evaluatorId,
      targetId,
      pillar,
      templateId,
      status: 'Pending',
      submittedAt: null,
      dueAt,
    });

    // Create task for evaluator
    const target = await employeeRepo.findById(targetId);
    await taskService.createTask({
      type: 'EvaluationSubmission',
      refEntity: 'EvaluationAssignment',
      refId: assignment.id,
      assigneeUserId: evaluatorId,
      slaMinutes: 7 * 24 * 60, // 1 week
      title: `Evaluation: ${pillar} review${target ? ` for ${target.preferredName}` : ''}`,
      description: `Complete your ${pillar.toLowerCase()} evaluation${target ? ` for ${target.preferredName}` : ''}.`,
      priority: 'medium',
    });

    // Notify evaluator
    const evaluator = await employeeRepo.findById(evaluatorId);
    if (evaluator) {
      await notificationService.send({
        recipientId: evaluatorId,
        recipientEmail: evaluator.email,
        title: `Evaluation Assignment`,
        body: `You have a new ${pillar.toLowerCase()} evaluation to complete${target ? ` for ${target.preferredName}` : ''}.`,
        deepLink: `/evaluations`,
        channel: 'both',
      });
    }

    return assignment;
  }

  // ---- Assignments ----

  async getMyAssignments(evaluatorId: string): Promise<EvaluationAssignment[]> {
    return evaluationAssignmentRepo.findByEvaluator(evaluatorId);
  }

  async getPendingAssignments(evaluatorId: string): Promise<EvaluationAssignment[]> {
    return evaluationAssignmentRepo.findPendingByEvaluator(evaluatorId);
  }

  async getAssignmentById(id: string): Promise<EvaluationAssignment | null> {
    return evaluationAssignmentRepo.findById(id);
  }

  async getCycleAssignments(cycleId: string): Promise<EvaluationAssignment[]> {
    return evaluationAssignmentRepo.findByCycle(cycleId);
  }

  // ---- Responses ----

  async submitResponse(data: any, evaluatorId: string): Promise<EvaluationResponse> {
    const assignment = await evaluationAssignmentRepo.findById(data.assignmentId);
    if (!assignment) throw new Error('Assignment not found');
    if (assignment.evaluatorId !== evaluatorId) throw new Error('Not your assignment');
    if (assignment.status === 'Submitted') throw new Error('Already submitted');

    const template = await evaluationTemplateRepo.findById(assignment.templateId);
    if (!template) throw new Error('Template not found');

    // Calculate scores
    const criterionScores = data.criterionScores.map((cs: any) => {
      const criterion = template.criteria.find((c) => c.id === cs.criterionId);
      const questionScores = cs.questionScores.map((qs: any) => ({
        questionId: qs.questionId,
        score: qs.score,
        comment: qs.comment || null,
      }));

      const avgScore = questionScores.reduce((sum: number, q: any) => sum + q.score, 0) / questionScores.length;
      const weightedScore = criterion ? avgScore * (criterion.weight / 100) : avgScore;

      return {
        criterionId: cs.criterionId,
        questionScores,
        averageScore: Math.round(avgScore * 100) / 100,
        weightedScore: Math.round(weightedScore * 100) / 100,
      };
    });

    const overallScore = criterionScores.reduce((sum: number, c: any) => sum + c.weightedScore, 0);

    const response = await evaluationResponseRepo.create({
      id: uuidv4(),
      assignmentId: data.assignmentId,
      cycleId: assignment.cycleId,
      evaluatorId,
      targetId: assignment.targetId,
      pillar: assignment.pillar,
      criterionScores,
      overallScore: Math.round(overallScore * 100) / 100,
    });

    // Mark assignment as submitted
    await evaluationAssignmentRepo.update(data.assignmentId, {
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
    });

    // Complete the task
    const tasks = await taskService.getTasksByRef('EvaluationAssignment', data.assignmentId);
    for (const task of tasks) {
      if (task.status === 'Open' || task.status === 'Overdue') {
        await taskService.complete(task.id);
      }
    }

    return response;
  }

  // ---- Results ----

  /**
   * Close a cycle and calculate final results for all target employees.
   */
  async closeCycle(cycleId: string, userId: string): Promise<EvaluationResult[]> {
    const cycle = await evaluationCycleRepo.findById(cycleId);
    if (!cycle || cycle.status !== 'Published') return [];

    const allAssignments = await evaluationAssignmentRepo.findByCycle(cycleId);
    const allResponses = await evaluationResponseRepo.findByCycle(cycleId);

    // Get unique target IDs
    const targetIds = [...new Set(allAssignments.map((a) => a.targetId))];

    const results: EvaluationResult[] = [];

    for (const targetId of targetIds) {
      const targetResponses = allResponses.filter((r) => r.targetId === targetId);
      const selfResponses = targetResponses.filter((r) => r.pillar === 'Self');
      const peerResponses = targetResponses.filter((r) => r.pillar === 'Peer');
      const superiorResponses = targetResponses.filter((r) => r.pillar === 'Superior');

      const selfScore = selfResponses.length > 0
        ? selfResponses.reduce((sum, r) => sum + r.overallScore, 0) / selfResponses.length
        : null;

      const peerScore = peerResponses.length > 0
        ? peerResponses.reduce((sum, r) => sum + r.overallScore, 0) / peerResponses.length
        : null;

      const superiorScore = superiorResponses.length > 0
        ? superiorResponses.reduce((sum, r) => sum + r.overallScore, 0) / superiorResponses.length
        : null;

      const isPeerNil = peerResponses.length === 0;

      // Adjust weights if peer is nil
      let weights = { ...cycle.pillarWeights };
      if (isPeerNil) {
        // Redistribute peer weight to superior
        weights = {
          self: weights.self,
          peer: 0,
          superior: weights.superior + weights.peer,
        };
      }

      // Calculate final score
      let finalScore = 0;
      if (selfScore !== null) finalScore += selfScore * (weights.self / 100);
      if (peerScore !== null) finalScore += peerScore * (weights.peer / 100);
      if (superiorScore !== null) finalScore += superiorScore * (weights.superior / 100);

      // Normalize to 0-100 scale (scores are on ratingScale, typically 1-5)
      const template = await evaluationTemplateRepo.findById(cycle.templateId);
      const scaleMax = template?.ratingScaleMax || 5;
      const normalizedScore = (finalScore / scaleMax) * 100;

      // Determine band
      const band = this.getBand(normalizedScore);

      // Build criterion breakdown
      const criterionBreakdown = template ? template.criteria.map((criterion) => {
        const selfCrit = selfResponses.flatMap((r) => r.criterionScores).find((cs) => cs.criterionId === criterion.id);
        const peerCrits = peerResponses.flatMap((r) => r.criterionScores).filter((cs) => cs.criterionId === criterion.id);
        const supCrit = superiorResponses.flatMap((r) => r.criterionScores).find((cs) => cs.criterionId === criterion.id);

        return {
          criterionId: criterion.id,
          criterionName: criterion.name,
          selfScore: selfCrit?.averageScore || null,
          peerScore: peerCrits.length > 0 ? peerCrits.reduce((s, c) => s + c.averageScore, 0) / peerCrits.length : null,
          superiorScore: supCrit?.averageScore || null,
          finalScore: Math.round(normalizedScore * 100) / 100,
        };
      }) : [];

      const result = await evaluationResultRepo.create({
        id: uuidv4(),
        cycleId,
        employeeId: targetId,
        selfScore: selfScore !== null ? Math.round(selfScore * 100) / 100 : null,
        peerScore: peerScore !== null ? Math.round(peerScore * 100) / 100 : null,
        peerCount: peerResponses.length,
        superiorScore: superiorScore !== null ? Math.round(superiorScore * 100) / 100 : null,
        superiorEvaluatorId: superiorResponses[0]?.evaluatorId || null,
        finalScore: Math.round(normalizedScore * 100) / 100,
        band,
        pillarWeights: weights,
        criterionBreakdown,
        isPeerNil,
      });

      results.push(result);
    }

    // Close cycle
    await evaluationCycleRepo.update(cycleId, { status: 'Closed' });

    await auditService.log({
      userId,
      action: 'EVALUATION_CYCLE_CLOSED',
      entity: 'EvaluationCycle',
      entityId: cycleId,
      before: { status: 'Published' } as any,
      after: { status: 'Closed', resultsCount: results.length } as any,
    });

    return results;
  }

  async releaseResults(cycleId: string, userId: string): Promise<void> {
    await evaluationCycleRepo.update(cycleId, { status: 'Results Released' });

    // Notify all employees with results
    const results = await evaluationResultRepo.findByCycle(cycleId);
    for (const result of results) {
      const employee = await employeeRepo.findById(result.employeeId);
      if (employee) {
        await notificationService.send({
          recipientId: employee.id,
          recipientEmail: employee.email,
          title: 'Evaluation Results Available',
          body: `Your evaluation results are now available. Your overall score: ${result.finalScore}% (${result.band}).`,
          deepLink: `/evaluations/results`,
          channel: 'both',
        });
      }
    }

    await auditService.log({
      userId,
      action: 'EVALUATION_RESULTS_RELEASED',
      entity: 'EvaluationCycle',
      entityId: cycleId,
      before: { status: 'Closed' } as any,
      after: { status: 'Results Released' } as any,
    });
  }

  async getResultsByCycle(cycleId: string): Promise<EvaluationResult[]> {
    return evaluationResultRepo.findByCycle(cycleId);
  }

  async getMyResults(employeeId: string): Promise<EvaluationResult[]> {
    return evaluationResultRepo.findByEmployee(employeeId);
  }

  private getBand(score: number): string {
    if (score >= 90) return 'Outstanding';
    if (score >= 80) return 'Exceeds Expectations';
    if (score >= 65) return 'Meets Expectations';
    if (score >= 50) return 'Needs Improvement';
    return 'Unsatisfactory';
  }
}

export const evaluationService = new EvaluationService();
