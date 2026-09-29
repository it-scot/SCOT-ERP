// ============================================================
// SCoT ERP — Audit Log Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { AuditLog } from '@scot-erp/shared';

export class MockAuditLogRepository extends MockBaseRepository<AuditLog> {
  constructor() {
    super('auditLogs');
  }

  async findByEntity(entity: string, entityId: string): Promise<AuditLog[]> {
    const all = await this.findAll();
    return all.filter((a) => a.entity === entity && a.entityId === entityId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.findByField('userId', userId);
  }
}
