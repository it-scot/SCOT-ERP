// ============================================================
// SCoT ERP — Shift Assignment Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { ShiftAssignment } from '@scot-erp/shared';

export class MockShiftAssignmentRepository extends MockBaseRepository<ShiftAssignment> {
  constructor() {
    super('shiftAssignments');
  }

  async findByEmployee(employeeId: string): Promise<ShiftAssignment[]> {
    return this.findByField('employeeId', employeeId);
  }

  async findActiveByEmployee(employeeId: string): Promise<ShiftAssignment | null> {
    const all = await this.findByEmployee(employeeId);
    const now = new Date().toISOString().split('T')[0];
    const active = all.find(
      (a) => a.effectiveFrom <= now && (!a.effectiveTo || a.effectiveTo >= now)
    );
    return active || null;
  }

  async findByPattern(shiftPatternId: string): Promise<ShiftAssignment[]> {
    return this.findByField('shiftPatternId', shiftPatternId);
  }
}
