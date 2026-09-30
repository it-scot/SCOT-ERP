// ============================================================
// SCoT ERP — Evaluation Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type {
  EvaluationTemplate,
  EvaluationCycle,
  EvaluationAssignment,
  EvaluationResponse,
  EvaluationResult,
} from '@scot-erp/shared';

export class MockEvaluationTemplateRepository extends MockBaseRepository<EvaluationTemplate> {
  constructor() {
    super('evaluationTemplates');
  }

  async findByTargetType(targetType: 'Employee' | 'HOD'): Promise<EvaluationTemplate[]> {
    return this.findByField('targetType', targetType);
  }

  async findActive(): Promise<EvaluationTemplate[]> {
    const all = await this.findAll();
    return all.filter((t) => !t.isLocked);
  }
}

export class MockEvaluationCycleRepository extends MockBaseRepository<EvaluationCycle> {
  constructor() {
    super('evaluationCycles');
  }

  async findByStatus(status: string): Promise<EvaluationCycle[]> {
    return this.findByField('status', status);
  }

  async findPublished(): Promise<EvaluationCycle[]> {
    return this.findByStatus('Published');
  }

  async findByType(type: string): Promise<EvaluationCycle[]> {
    return this.findByField('type', type);
  }
}

export class MockEvaluationAssignmentRepository extends MockBaseRepository<EvaluationAssignment> {
  constructor() {
    super('evaluationAssignments');
  }

  async findByCycle(cycleId: string): Promise<EvaluationAssignment[]> {
    return this.findByField('cycleId', cycleId);
  }

  async findByEvaluator(evaluatorId: string): Promise<EvaluationAssignment[]> {
    return this.findByField('evaluatorId', evaluatorId);
  }

  async findByTarget(targetId: string): Promise<EvaluationAssignment[]> {
    return this.findByField('targetId', targetId);
  }

  async findPendingByEvaluator(evaluatorId: string): Promise<EvaluationAssignment[]> {
    const all = await this.findByEvaluator(evaluatorId);
    return all.filter((a) => a.status === 'Pending');
  }

  async findByCycleAndTarget(cycleId: string, targetId: string): Promise<EvaluationAssignment[]> {
    const byCycle = await this.findByCycle(cycleId);
    return byCycle.filter((a) => a.targetId === targetId);
  }

  async findByCycleAndEvaluator(cycleId: string, evaluatorId: string): Promise<EvaluationAssignment[]> {
    const byCycle = await this.findByCycle(cycleId);
    return byCycle.filter((a) => a.evaluatorId === evaluatorId);
  }
}

export class MockEvaluationResponseRepository extends MockBaseRepository<EvaluationResponse> {
  constructor() {
    super('evaluationResponses');
  }

  async findByAssignment(assignmentId: string): Promise<EvaluationResponse | null> {
    return this.findOneByField('assignmentId', assignmentId);
  }

  async findByCycle(cycleId: string): Promise<EvaluationResponse[]> {
    return this.findByField('cycleId', cycleId);
  }

  async findByTarget(targetId: string): Promise<EvaluationResponse[]> {
    return this.findByField('targetId', targetId);
  }

  async findByCycleAndTarget(cycleId: string, targetId: string): Promise<EvaluationResponse[]> {
    const byCycle = await this.findByCycle(cycleId);
    return byCycle.filter((r) => r.targetId === targetId);
  }
}

export class MockEvaluationResultRepository extends MockBaseRepository<EvaluationResult> {
  constructor() {
    super('evaluationResults');
  }

  async findByCycle(cycleId: string): Promise<EvaluationResult[]> {
    return this.findByField('cycleId', cycleId);
  }

  async findByEmployee(employeeId: string): Promise<EvaluationResult[]> {
    return this.findByField('employeeId', employeeId);
  }

  async findByCycleAndEmployee(cycleId: string, employeeId: string): Promise<EvaluationResult | null> {
    const byCycle = await this.findByCycle(cycleId);
    return byCycle.find((r) => r.employeeId === employeeId) || null;
  }
}
