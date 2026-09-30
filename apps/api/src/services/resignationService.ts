// ============================================================
// SCoT ERP — Resignation Service
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import { employeeRepo, departmentRepo } from '../repositories/index.js';
import {
  resignationCaseRepo,
  handoverEventRepo,
  exitEvaluationRepo,
  serviceLetterRequestRepo,
} from '../repositories/index.js';
import { taskService } from './taskService.js';
import { notificationService } from './notificationService.js';
import { auditService } from './auditService.js';
import type { ResignationCase, AuthUser } from '@scot-erp/shared';
import { NotFoundError, ValidationError, ForbiddenError } from '../middleware/errorHandler.js';

export class ResignationService {
  /**
   * Submit a resignation.
   */
  async submit(
    user: AuthUser,
    data: { proposedLastWorkingDate: string; reason: string }
  ): Promise<ResignationCase> {
    const employee = await employeeRepo.findById(user.id);
    if (!employee) throw new NotFoundError('Employee');

    // Check if already has an active resignation
    const existing = await resignationCaseRepo.findByEmployee(user.id);
    if (existing && ['Submitted', 'Accepted', 'In Progress'].includes(existing.status)) {
      throw new ValidationError('You already have an active resignation case.');
    }

    // Find HOD
    const dept = await departmentRepo.findByCode(employee.departmentCode);
    if (!dept || !dept.hodStaffId) {
      throw new ValidationError('Department HOD not assigned.');
    }

    const hod = await employeeRepo.findByStaffId(dept.hodStaffId);
    if (!hod) throw new NotFoundError('HOD');

    const caseId = uuidv4();
    const resignation = await resignationCaseRepo.create({
      id: caseId,
      employeeId: user.id,
      proposedLastWorkingDate: data.proposedLastWorkingDate,
      reason: data.reason,
      hodId: hod.id,
      hodStatus: 'Pending',
      hodComment: null,
      hodRespondedAt: null,
      handoverDate: null,
      calendarEventId: null,
      itHandoverCompleted: false,
      itHandoverAt: null,
      exitEvaluationSubmitted: false,
      exitEvaluationAt: null,
      serviceLetterRequested: false,
      serviceLetterRequestedAt: null,
      serviceLetterFileId: null,
      serviceLetterUploadedAt: null,
      serviceLetterAccepted: false,
      serviceLetterAcceptedAt: null,
      status: 'Submitted',
    });

    // Update employee status
    await employeeRepo.update(user.id, { status: 'Notice Period' });

    // Create task for HOD
    await taskService.createTask({
      type: 'ResignationApproval',
      refEntity: 'ResignationCase',
      refId: caseId,
      assigneeUserId: hod.id,
      slaMinutes: 960, // 2 working days
      title: `Resignation: ${employee.preferredName}`,
      description: `${employee.preferredName} has submitted their resignation. Proposed last working date: ${data.proposedLastWorkingDate}. Reason: ${data.reason}`,
      priority: 'high',
    });

    // Notify HOD and HR
    await notificationService.send({
      recipientId: hod.id,
      recipientEmail: hod.email,
      title: `Resignation Submitted: ${employee.preferredName}`,
      body: `${employee.preferredName} has submitted their resignation from ${dept.name}. Proposed last working date: ${data.proposedLastWorkingDate}.`,
      deepLink: `/resignation/${caseId}`,
      channel: 'both',
    });

    // Notify HR
    const hrEmployee = await employeeRepo.findByEmail('hr@scot.lk');
    if (hrEmployee) {
      await notificationService.send({
        recipientId: hrEmployee.id,
        recipientEmail: hrEmployee.email,
        title: `Resignation Notice: ${employee.preferredName}`,
        body: `${employee.preferredName} from ${dept.name} has submitted their resignation.`,
        deepLink: `/resignation/${caseId}`,
        channel: 'both',
      });
    }

    await auditService.log({
      userId: user.id,
      action: 'SUBMIT_RESIGNATION',
      entity: 'ResignationCase',
      entityId: caseId,
      after: { proposedLastWorkingDate: data.proposedLastWorkingDate, reason: data.reason },
    });

    return resignation;
  }

  /**
   * HOD responds to resignation (accept/decline).
   */
  async hodRespond(
    caseId: string,
    user: AuthUser,
    data: { status: 'Accepted' | 'Declined'; comment?: string }
  ): Promise<ResignationCase> {
    const resignation = await resignationCaseRepo.findById(caseId);
    if (!resignation) throw new NotFoundError('Resignation case');

    const isHod = resignation.hodId === user.id;
    const isPrivileged = user.roles.some((r) => ['HR', 'COO', 'SystemAdmin'].includes(r));
    if (!isHod && !isPrivileged) {
      throw new ForbiddenError('Only the HOD or HR can respond to this resignation.');
    }

    const now = new Date().toISOString();
    const newStatus = data.status === 'Accepted' ? 'Accepted' : 'Declined';

    // Map resignation response to RequestStatus: 'Accepted' → 'Approved'
    const hodStatus = data.status === 'Accepted' ? 'Approved' : 'Declined';

    const updated = await resignationCaseRepo.update(caseId, {
      hodStatus: hodStatus as any,
      hodComment: data.comment || null,
      hodRespondedAt: now,
      status: newStatus as any,
    });

    // Complete the task
    const tasks = await taskService.getTasksByRef('ResignationCase', caseId);
    for (const task of tasks) {
      if (task.status === 'Open' || task.status === 'Overdue') {
        await taskService.complete(task.id);
      }
    }

    // Notify employee
    const employee = await employeeRepo.findById(resignation.employeeId);
    if (employee) {
      await notificationService.send({
        recipientId: resignation.employeeId,
        recipientEmail: employee.email,
        title: `Resignation ${data.status}`,
        body: `Your resignation has been ${data.status.toLowerCase()} by your HOD.${data.comment ? ` Comment: ${data.comment}` : ''}`,
        deepLink: `/resignation/${caseId}`,
        channel: 'both',
      });

      // If declined, revert employee status
      if (data.status === 'Declined') {
        await employeeRepo.update(resignation.employeeId, { status: 'Active' });
      } else {
        // If accepted, create exit workflow tasks (IT handover, exit eval, etc.)
        await this.createExitWorkflowTasks(caseId, resignation, employee);
      }
    }

    await auditService.log({
      userId: user.id,
      action: `RESIGNATION_${data.status.toUpperCase()}`,
      entity: 'ResignationCase',
      entityId: caseId,
      before: { status: 'Submitted' },
      after: { status: newStatus, comment: data.comment },
    });

    return updated!;
  }

  /**
   * Create exit workflow tasks after acceptance.
   */
  private async createExitWorkflowTasks(
    caseId: string,
    resignation: ResignationCase,
    employee: any
  ) {
    // IT Asset Handover task
    await taskService.createTask({
      type: 'ITHandover',
      refEntity: 'ResignationCase',
      refId: caseId,
      assigneeDepartment: 'IT',
      slaMinutes: 960,
      title: `IT Handover: ${employee.preferredName}`,
      description: `Collect IT assets from ${employee.preferredName}. Last working date: ${resignation.proposedLastWorkingDate}.`,
      priority: 'high',
    });

    // Exit Evaluation task (for the employee)
    await taskService.createTask({
      type: 'ExitStep',
      refEntity: 'ResignationCase',
      refId: caseId,
      assigneeUserId: resignation.employeeId,
      slaMinutes: 1440,
      title: 'Exit Evaluation',
      description: 'Please complete the exit evaluation form before your last working day.',
      priority: 'medium',
    });

    // Update case to In Progress
    await resignationCaseRepo.update(caseId, { status: 'In Progress' });
  }

  /**
   * Submit exit evaluation.
   */
  async submitExitEvaluation(
    caseId: string,
    user: AuthUser,
    responses: { question: string; answer: string }[]
  ) {
    const resignation = await resignationCaseRepo.findById(caseId);
    if (!resignation) throw new NotFoundError('Resignation case');

    if (resignation.employeeId !== user.id) {
      throw new ForbiddenError('Only the resigning employee can submit the exit evaluation.');
    }

    const evalId = uuidv4();
    const now = new Date().toISOString();

    await exitEvaluationRepo.create({
      id: evalId,
      resignationCaseId: caseId,
      employeeId: user.id,
      responses,
      submittedAt: now,
    });

    await resignationCaseRepo.update(caseId, {
      exitEvaluationSubmitted: true,
      exitEvaluationAt: now,
    });

    return { id: evalId, submittedAt: now };
  }

  /**
   * Request service letter.
   */
  async requestServiceLetter(caseId: string, user: AuthUser) {
    const resignation = await resignationCaseRepo.findById(caseId);
    if (!resignation) throw new NotFoundError('Resignation case');

    if (resignation.employeeId !== user.id) {
      throw new ForbiddenError('Only the resigning employee can request a service letter.');
    }

    const now = new Date().toISOString();
    const requestId = uuidv4();

    await serviceLetterRequestRepo.create({
      id: requestId,
      employeeId: user.id,
      resignationCaseId: caseId,
      status: 'Requested',
      fileId: null,
      requestedAt: now,
      uploadedAt: null,
      acceptedAt: null,
    });

    await resignationCaseRepo.update(caseId, {
      serviceLetterRequested: true,
      serviceLetterRequestedAt: now,
    });

    // Create task for HR
    await taskService.createTask({
      type: 'ServiceLetterUpload',
      refEntity: 'ServiceLetterRequest',
      refId: requestId,
      assigneeDepartment: 'HR',
      slaMinutes: 1440,
      title: `Service Letter: ${user.preferredName}`,
      description: `${user.preferredName} has requested a service letter.`,
      priority: 'medium',
    });

    return { id: requestId, requestedAt: now };
  }

  /**
   * Get a resignation case with full details.
   */
  async getCaseDetails(caseId: string) {
    const resignation = await resignationCaseRepo.findById(caseId);
    if (!resignation) throw new NotFoundError('Resignation case');

    const employee = await employeeRepo.findById(resignation.employeeId);
    const hod = await employeeRepo.findById(resignation.hodId);
    const exitEval = await exitEvaluationRepo.findByCase(caseId);
    const serviceLetter = await serviceLetterRequestRepo.findByCase(caseId);
    const handoverEvents = await handoverEventRepo.findByCase(caseId);

    return {
      ...resignation,
      employeeName: employee?.preferredName || 'Unknown',
      employeeDepartment: employee?.departmentCode || '',
      hodName: hod?.preferredName || 'Unknown',
      exitEvaluation: exitEval,
      serviceLetterRequest: serviceLetter,
      handoverEvents,
    };
  }

  /**
   * Get all resignation cases (admin view).
   */
  async getAll(page = 1, pageSize = 20) {
    return resignationCaseRepo.paginate(undefined, page, pageSize, 'createdAt', 'desc');
  }

  /**
   * Get active resignation cases.
   */
  async getActive(): Promise<ResignationCase[]> {
    return resignationCaseRepo.findActive();
  }
}

export const resignationService = new ResignationService();
