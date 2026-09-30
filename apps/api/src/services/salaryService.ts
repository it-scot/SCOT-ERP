// ============================================================
// SCoT ERP — Salary Service
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import { salaryRecordRepo, payslipRepo, employeeRepo } from '../repositories/index.js';
import { notificationService } from './notificationService.js';
import { auditService } from './auditService.js';
import type { SalaryRecord, Payslip, AuthUser } from '@scot-erp/shared';
import { NotFoundError } from '../middleware/errorHandler.js';

export class SalaryService {
  /**
   * Create a new salary record for an employee (HR only).
   */
  async createSalaryRecord(
    user: AuthUser,
    data: {
      employeeId: string;
      effectiveFrom: string;
      basicSalary: number;
      allowances: { label: string; amount: number }[];
      deductions: { label: string; amount: number }[];
      bankName: string;
      bankBranch: string;
      bankAccountNo: string;
      epfPercentage: number;
      etfPercentage: number;
    }
  ): Promise<SalaryRecord> {
    const employee = await employeeRepo.findById(data.employeeId);
    if (!employee) throw new NotFoundError('Employee');

    // Close existing record
    const current = await salaryRecordRepo.findCurrentByEmployee(data.employeeId);
    if (current) {
      await salaryRecordRepo.update(current.id, {
        effectiveTo: data.effectiveFrom,
      });
    }

    // Calculate gross and net
    const totalAllowances = data.allowances.reduce((sum, a) => sum + a.amount, 0);
    const totalDeductions = data.deductions.reduce((sum, d) => sum + d.amount, 0);
    const epfDeduction = data.basicSalary * (data.epfPercentage / 100);
    const grossSalary = data.basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions - epfDeduction;

    const recordId = uuidv4();
    const record = await salaryRecordRepo.create({
      id: recordId,
      employeeId: data.employeeId,
      effectiveFrom: data.effectiveFrom,
      effectiveTo: null,
      basicSalary: data.basicSalary,
      allowances: data.allowances,
      deductions: data.deductions,
      bankName: data.bankName,
      bankBranch: data.bankBranch,
      bankAccountNo: data.bankAccountNo,
      epfPercentage: data.epfPercentage,
      etfPercentage: data.etfPercentage,
      grossSalary,
      netSalary,
    });

    await auditService.log({
      userId: user.id,
      action: 'CREATE_SALARY',
      entity: 'SalaryRecord',
      entityId: recordId,
      after: record as any,
    });

    return record;
  }

  /**
   * Register a payslip upload (HR only).
   */
  async registerPayslip(
    user: AuthUser,
    data: {
      employeeId: string;
      monthYear: string;
      fileId: string;
      fileName: string;
    }
  ): Promise<Payslip> {
    const employee = await employeeRepo.findById(data.employeeId);
    if (!employee) throw new NotFoundError('Employee');

    const payslipId = uuidv4();
    const payslip = await payslipRepo.create({
      id: payslipId,
      employeeId: data.employeeId,
      monthYear: data.monthYear,
      fileId: data.fileId,
      fileName: data.fileName,
      uploadedBy: user.id,
      notifiedAt: null,
    });

    // Notify employee
    await notificationService.send({
      recipientId: data.employeeId,
      recipientEmail: employee.email,
      title: `Payslip Available: ${data.monthYear}`,
      body: `Your payslip for ${data.monthYear} is now available for download.`,
      deepLink: `/salary/payslips`,
      channel: 'both',
    });

    // Mark as notified
    await payslipRepo.update(payslipId, { notifiedAt: new Date().toISOString() });

    await auditService.log({
      userId: user.id,
      action: 'UPLOAD_PAYSLIP',
      entity: 'Payslip',
      entityId: payslipId,
      after: { employeeId: data.employeeId, monthYear: data.monthYear },
    });

    return payslip;
  }

  /**
   * Get all salary records with employee info (admin view).
   */
  async getAllCurrent() {
    const employees = await employeeRepo.findAll();
    const active = employees.filter(
      (e) => ['Active', 'Probation', 'Notice Period'].includes(e.status)
    );

    const records = await Promise.all(
      active.map(async (emp) => {
        const current = await salaryRecordRepo.findCurrentByEmployee(emp.id);
        return {
          employeeId: emp.id,
          staffId: emp.staffId,
          name: emp.preferredName,
          department: emp.departmentCode,
          designation: emp.designation,
          currentSalary: current,
        };
      })
    );

    return records;
  }
}

export const salaryService = new SalaryService();
