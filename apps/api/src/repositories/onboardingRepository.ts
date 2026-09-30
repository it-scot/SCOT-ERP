// ============================================================
// SCoT ERP — Onboarding Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { OnboardingCase, OnboardingStep } from '@scot-erp/shared';

export class MockOnboardingCaseRepository extends MockBaseRepository<OnboardingCase> {
  constructor() {
    super('onboardingCases');
  }

  async findByEmployee(employeeId: string): Promise<OnboardingCase | null> {
    return this.findOneByField('employeeId', employeeId);
  }

  async findActive(): Promise<OnboardingCase[]> {
    const all = await this.findAll();
    return all.filter((c) => c.status === 'In Progress');
  }
}

export class MockOnboardingStepRepository extends MockBaseRepository<OnboardingStep> {
  constructor() {
    super('onboardingSteps');
  }

  async findByCase(caseId: string): Promise<OnboardingStep[]> {
    const all = await this.findByField('caseId', caseId);
    return all.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  async findPendingByDepartment(dept: string): Promise<OnboardingStep[]> {
    const all = await this.findByField('assigneeDepartment', dept);
    return all.filter((s) => s.status === 'Pending' || s.status === 'In Progress');
  }

  async findPendingByAssignee(userId: string): Promise<OnboardingStep[]> {
    const all = await this.findByField('assigneeUserId', userId);
    return all.filter((s) => s.status === 'Pending' || s.status === 'In Progress');
  }
}
