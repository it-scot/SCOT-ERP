// ============================================================
// SCoT ERP — Salary & Payslip Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { SalaryRecord, Payslip } from '@scot-erp/shared';

export class MockSalaryRecordRepository extends MockBaseRepository<SalaryRecord> {
  constructor() {
    super('salaryRecords');
  }

  async findByEmployee(employeeId: string): Promise<SalaryRecord[]> {
    const all = await this.findByField('employeeId', employeeId);
    return all.sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime());
  }

  async findCurrentByEmployee(employeeId: string): Promise<SalaryRecord | null> {
    const all = await this.findByEmployee(employeeId);
    const now = new Date().toISOString();
    return all.find((s) => s.effectiveFrom <= now && (!s.effectiveTo || s.effectiveTo > now)) || null;
  }
}

export class MockPayslipRepository extends MockBaseRepository<Payslip> {
  constructor() {
    super('payslips');
  }

  async findByEmployee(employeeId: string): Promise<Payslip[]> {
    const all = await this.findByField('employeeId', employeeId);
    return all.sort((a, b) => b.monthYear.localeCompare(a.monthYear));
  }

  async findByEmployeeAndMonth(employeeId: string, monthYear: string): Promise<Payslip | null> {
    const all = await this.findByEmployee(employeeId);
    return all.find((p) => p.monthYear === monthYear) || null;
  }
}
