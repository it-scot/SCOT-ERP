// ============================================================
// SCoT ERP — Document Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { EmployeeDocument } from '@scot-erp/shared';

export class MockDocumentRepository extends MockBaseRepository<EmployeeDocument> {
  constructor() {
    super('employeeDocuments');
  }

  async findByEmployee(employeeId: string): Promise<EmployeeDocument[]> {
    const all = await this.findByField('employeeId', employeeId);
    return all.filter((d) => !d.isDeleted);
  }

  async findByType(employeeId: string, type: string): Promise<EmployeeDocument[]> {
    const all = await this.findByEmployee(employeeId);
    return all.filter((d) => d.type === type);
  }
}
