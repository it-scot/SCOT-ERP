// ============================================================
// SCoT ERP — Department Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { Department } from '@scot-erp/shared';

export interface IDepartmentRepository {
  findAll(): Promise<Department[]>;
  findById(id: string): Promise<Department | null>;
  findByCode(code: string): Promise<Department | null>;
  create(data: Partial<Department>): Promise<Department>;
  update(id: string, data: Partial<Department>): Promise<Department | null>;
}

export class MockDepartmentRepository
  extends MockBaseRepository<Department>
  implements IDepartmentRepository
{
  constructor() {
    super('departments');
  }

  async findByCode(code: string): Promise<Department | null> {
    return this.findOneByField('code', code);
  }
}
