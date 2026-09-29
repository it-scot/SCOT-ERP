// ============================================================
// SCoT ERP — Employee Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { Employee } from '@scot-erp/shared';

export interface IEmployeeRepository {
  findAll(filters?: Record<string, any>): Promise<Employee[]>;
  findById(id: string): Promise<Employee | null>;
  findByEmail(email: string): Promise<Employee | null>;
  findByStaffId(staffId: string): Promise<Employee | null>;
  findByDepartment(departmentCode: string): Promise<Employee[]>;
  findBySupervisor(supervisorStaffId: string): Promise<Employee[]>;
  create(data: Partial<Employee>): Promise<Employee>;
  update(id: string, data: Partial<Employee>): Promise<Employee | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: Record<string, any>): Promise<number>;
  paginate(
    filters?: Record<string, any>,
    page?: number,
    pageSize?: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    search?: string
  ): Promise<{ data: Employee[]; total: number; page: number; pageSize: number; totalPages: number }>;
}

export class MockEmployeeRepository
  extends MockBaseRepository<Employee>
  implements IEmployeeRepository
{
  constructor() {
    super('employees');
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return this.findOneByField('email', email);
  }

  async findByStaffId(staffId: string): Promise<Employee | null> {
    return this.findOneByField('staffId', staffId);
  }

  async findByDepartment(departmentCode: string): Promise<Employee[]> {
    return this.findByField('departmentCode', departmentCode);
  }

  async findBySupervisor(supervisorStaffId: string): Promise<Employee[]> {
    return this.findByField('supervisorStaffId', supervisorStaffId);
  }

  async paginate(
    filters?: Record<string, any>,
    page = 1,
    pageSize = 20,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    search?: string
  ) {
    return super.paginate(
      filters,
      page,
      pageSize,
      sortBy || 'nameInFull',
      sortOrder,
      search,
      ['nameInFull', 'preferredName', 'email', 'staffId', 'designation']
    );
  }
}
