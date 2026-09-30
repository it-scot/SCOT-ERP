// ============================================================
// SCoT ERP — Onboarding Service
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import { employeeRepo, departmentRepo } from '../repositories/index.js';
import { onboardingCaseRepo, onboardingStepRepo } from '../repositories/index.js';
import { taskService } from './taskService.js';
import { notificationService } from './notificationService.js';
import { auditService } from './auditService.js';
import type { OnboardingCase, OnboardingStep, AuthUser } from '@scot-erp/shared';
import { DEFAULTS, ONBOARDING_STEPS } from '@scot-erp/shared';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import { settingsRepo } from '../repositories/index.js';
import { addDays } from 'date-fns';

export class OnboardingService {
  /**
   * Create an onboarding case for an upcoming joiner.
   */
  async createCase(
    user: AuthUser,
    data: {
      staffId: string;
      nameInFull: string;
      joinDate: string;
      designation: string;
      departmentCode: string;
    }
  ): Promise<OnboardingCase> {
    const dept = await departmentRepo.findByCode(data.departmentCode);
    if (!dept) throw new NotFoundError('Department');

    const caseId = uuidv4();
    const now = new Date().toISOString();

    const onboardingCase = await onboardingCaseRepo.create({
      id: caseId,
      employeeId: '', // Employee record will be created later
      employeeName: data.nameInFull,
      joinDate: data.joinDate,
      designation: data.designation,
      departmentCode: data.departmentCode,
      status: 'In Progress',
      steps: [],
    });

    // Create onboarding steps based on the defined flow
    const steps = await this.createSteps(caseId, data.departmentCode, data.joinDate, dept.hodStaffId);

    // Update case with steps
    await onboardingCaseRepo.update(caseId, { steps: steps });

    // Notify stakeholders
    const settings = await settingsRepo.get();
    for (const recipientEmail of settings.onboardingNotificationRecipients) {
      const emp = await employeeRepo.findByEmail(recipientEmail);
      if (emp) {
        await notificationService.send({
          recipientId: emp.id,
          recipientEmail: emp.email,
          title: `New Onboarding: ${data.nameInFull}`,
          body: `A new employee ${data.nameInFull} (${data.designation}) is joining ${dept.name} on ${data.joinDate}.`,
          deepLink: `/onboarding/${caseId}`,
          channel: 'both',
        });
      }
    }

    await auditService.log({
      userId: user.id,
      action: 'CREATE_ONBOARDING',
      entity: 'OnboardingCase',
      entityId: caseId,
      after: { staffId: data.staffId, joinDate: data.joinDate },
    });

    return onboardingCase;
  }

  /**
   * Create the standard onboarding steps for a case.
   */
  private async createSteps(
    caseId: string,
    departmentCode: string,
    joinDate: string,
    hodStaffId: string | null
  ): Promise<OnboardingStep[]> {
    const steps: OnboardingStep[] = [];
    const join = new Date(joinDate);

    // Step 1: HOD Asset Request
    const hodStep = await this.createStep(caseId, {
      type: 'HODAssetRequest',
      assigneeDepartment: departmentCode,
      assigneeUserId: hodStaffId ? (await employeeRepo.findByStaffId(hodStaffId))?.id || null : null,
      dueAt: addDays(new Date(), 2).toISOString(),
    });
    steps.push(hodStep);

    // Step 2: IT Admin Review
    const itAdminStep = await this.createStep(caseId, {
      type: 'ITAdminReview',
      assigneeDepartment: 'IT',
      dueAt: addDays(new Date(), 3).toISOString(),
    });
    steps.push(itAdminStep);

    // Step 3: IT Setup (day before join)
    const itSetupStep = await this.createStep(caseId, {
      type: 'ITSetup',
      assigneeDepartment: 'IT',
      dueAt: addDays(join, -1).toISOString(),
    });
    steps.push(itSetupStep);

    // Step 4: IT Handover to Employee (join day)
    const itHandoverStep = await this.createStep(caseId, {
      type: 'ITHandoverToEmployee',
      assigneeDepartment: 'IT',
      dueAt: joinDate,
    });
    steps.push(itHandoverStep);

    // Step 5: HR Profile Creation (join day)
    const hrStep = await this.createStep(caseId, {
      type: 'HRProfileCreation',
      assigneeDepartment: 'HR',
      dueAt: joinDate,
    });
    steps.push(hrStep);

    return steps;
  }

  /**
   * Create a single onboarding step.
   */
  private async createStep(
    caseId: string,
    data: {
      type: string;
      assigneeDepartment: string;
      assigneeUserId?: string | null;
      dueAt: string;
    }
  ): Promise<OnboardingStep> {
    const stepId = uuidv4();

    const step = await onboardingStepRepo.create({
      id: stepId,
      caseId,
      type: data.type as any,
      assigneeDepartment: data.assigneeDepartment,
      assigneeUserId: data.assigneeUserId || null,
      dueAt: data.dueAt,
      completedAt: null,
      monitoredBy: null,
      monitoredAt: null,
      status: 'Pending',
      notes: '',
      taskId: null,
    });

    // Create a task for this step
    const task = await taskService.createTask({
      type: 'OnboardingStep',
      refEntity: 'OnboardingStep',
      refId: stepId,
      assigneeDepartment: data.assigneeDepartment,
      assigneeUserId: data.assigneeUserId || undefined,
      slaMinutes: 480,
      title: `Onboarding: ${data.type}`,
      description: `Onboarding step: ${data.type} for case ${caseId}`,
      priority: 'medium',
    });

    await onboardingStepRepo.update(stepId, { taskId: task.id });

    return step;
  }

  /**
   * Complete an onboarding step.
   */
  async completeStep(stepId: string, user: AuthUser, notes?: string): Promise<OnboardingStep> {
    const step = await onboardingStepRepo.findById(stepId);
    if (!step) throw new NotFoundError('Onboarding step');

    const now = new Date().toISOString();
    const updated = await onboardingStepRepo.update(stepId, {
      status: 'Completed',
      completedAt: now,
      notes: notes || step.notes,
    });

    // Complete associated task
    if (step.taskId) {
      await taskService.complete(step.taskId);
    }

    // Check if all steps are done → complete the case
    const allSteps = await onboardingStepRepo.findByCase(step.caseId);
    const allDone = allSteps.every((s) => s.status === 'Completed' || s.id === stepId);
    if (allDone) {
      await onboardingCaseRepo.update(step.caseId, { status: 'Completed' });
    }

    return updated!;
  }

  /**
   * Get all active onboarding cases.
   */
  async getActiveCases(): Promise<OnboardingCase[]> {
    return onboardingCaseRepo.findActive();
  }

  /**
   * Get an onboarding case with its steps.
   */
  async getCaseWithSteps(caseId: string) {
    const onboardingCase = await onboardingCaseRepo.findById(caseId);
    if (!onboardingCase) throw new NotFoundError('Onboarding case');

    const steps = await onboardingStepRepo.findByCase(caseId);
    return { ...onboardingCase, steps };
  }

  /**
   * Get all cases (paginated).
   */
  async getAll(page = 1, pageSize = 20) {
    return onboardingCaseRepo.paginate(undefined, page, pageSize, 'createdAt', 'desc');
  }
}

export const onboardingService = new OnboardingService();
