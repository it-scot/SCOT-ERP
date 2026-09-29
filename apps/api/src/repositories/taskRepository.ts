// ============================================================
// SCoT ERP — Task Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { Task } from '@scot-erp/shared';

export class MockTaskRepository extends MockBaseRepository<Task> {
  constructor() {
    super('tasks');
  }

  async findByAssignee(userId: string): Promise<Task[]> {
    return this.findByField('assigneeUserId', userId);
  }

  async findByDepartment(dept: string): Promise<Task[]> {
    return this.findByField('assigneeDepartment', dept);
  }

  async findOpenByAssignee(userId: string): Promise<Task[]> {
    const all = await this.findByAssignee(userId);
    return all.filter((t) => t.status === 'Open' || t.status === 'Overdue');
  }

  async findByRef(refEntity: string, refId: string): Promise<Task[]> {
    const all = await this.findAll();
    return all.filter((t) => t.refEntity === refEntity && t.refId === refId);
  }
}
