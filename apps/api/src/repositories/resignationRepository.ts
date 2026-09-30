// ============================================================
// SCoT ERP — Resignation Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { ResignationCase, HandoverEvent, ExitEvaluation, ServiceLetterRequest } from '@scot-erp/shared';

export class MockResignationCaseRepository extends MockBaseRepository<ResignationCase> {
  constructor() {
    super('resignationCases');
  }

  async findByEmployee(employeeId: string): Promise<ResignationCase | null> {
    return this.findOneByField('employeeId', employeeId);
  }

  async findActive(): Promise<ResignationCase[]> {
    const all = await this.findAll();
    return all.filter((c) => ['Submitted', 'Accepted', 'In Progress'].includes(c.status));
  }
}

export class MockHandoverEventRepository extends MockBaseRepository<HandoverEvent> {
  constructor() {
    super('handoverEvents');
  }

  async findByCase(caseId: string): Promise<HandoverEvent[]> {
    return this.findByField('resignationCaseId', caseId);
  }
}

export class MockExitEvaluationRepository extends MockBaseRepository<ExitEvaluation> {
  constructor() {
    super('exitEvaluations');
  }

  async findByCase(caseId: string): Promise<ExitEvaluation | null> {
    return this.findOneByField('resignationCaseId', caseId);
  }
}

export class MockServiceLetterRequestRepository extends MockBaseRepository<ServiceLetterRequest> {
  constructor() {
    super('serviceLetterRequests');
  }

  async findByCase(caseId: string): Promise<ServiceLetterRequest | null> {
    return this.findOneByField('resignationCaseId', caseId);
  }

  async findByEmployee(employeeId: string): Promise<ServiceLetterRequest | null> {
    return this.findOneByField('employeeId', employeeId);
  }
}
