// ============================================================
// SCoT ERP — Leave Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import { getStore, persistStore } from './dataStore.js';
import type { LeaveRequest, LeaveBalance, WfhRequest, OvertimeRecord, LieuLeaveRequest } from '@scot-erp/shared';

export class MockLeaveRequestRepository extends MockBaseRepository<LeaveRequest> {
  constructor() {
    super('leaveRequests');
  }

  async findByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    return this.findByField('employeeId', employeeId);
  }

  async findBySupervisor(supervisorId: string): Promise<LeaveRequest[]> {
    return this.findByField('supervisorId', supervisorId);
  }

  async findPendingBySupervisor(supervisorId: string): Promise<LeaveRequest[]> {
    const all = await this.findBySupervisor(supervisorId);
    return all.filter((r) => r.status === 'Pending')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
}

export class MockLeaveBalanceRepository {
  private getCollection() {
    return getStore().leaveBalances as Record<string, LeaveBalance>;
  }

  async findByEmployeeAndYear(employeeId: string, year: number): Promise<LeaveBalance | null> {
    const key = `${employeeId}_${year}`;
    return this.getCollection()[key] || null;
  }

  async upsert(balance: LeaveBalance): Promise<LeaveBalance> {
    const key = `${balance.employeeId}_${balance.year}`;
    this.getCollection()[key] = balance;
    persistStore();
    return balance;
  }

  async findAll(): Promise<LeaveBalance[]> {
    return Object.values(this.getCollection());
  }
}

export class MockWfhRequestRepository extends MockBaseRepository<WfhRequest> {
  constructor() {
    super('wfhRequests');
  }

  async findByEmployee(employeeId: string): Promise<WfhRequest[]> {
    return this.findByField('employeeId', employeeId);
  }

  async findPendingBySupervisor(supervisorId: string): Promise<WfhRequest[]> {
    const all = await this.findByField('supervisorId', supervisorId);
    return all.filter((r) => r.status === 'Pending');
  }
}

export class MockOvertimeRecordRepository extends MockBaseRepository<OvertimeRecord> {
  constructor() {
    super('overtimeRecords');
  }

  async findByEmployee(employeeId: string): Promise<OvertimeRecord[]> {
    return this.findByField('employeeId', employeeId);
  }

  async findByEmployeeAndMonth(employeeId: string, monthYear: string): Promise<OvertimeRecord[]> {
    const all = await this.findByEmployee(employeeId);
    return all.filter((r) => r.monthYear === monthYear);
  }
}

export class MockLieuLeaveRequestRepository extends MockBaseRepository<LieuLeaveRequest> {
  constructor() {
    super('lieuLeaveRequests');
  }

  async findByEmployee(employeeId: string): Promise<LieuLeaveRequest[]> {
    return this.findByField('employeeId', employeeId);
  }
}
