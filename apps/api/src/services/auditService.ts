// ============================================================
// SCoT ERP — Audit Service
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import { auditLogRepo } from '../repositories/index.js';
import type { AuditLog } from '@scot-erp/shared';

export class AuditService {
  async log(params: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    return auditLogRepo.create({
      id: uuidv4(),
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      before: params.before || null,
      after: params.after || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
    });
  }

  async getAll(page = 1, pageSize = 50, search?: string) {
    return auditLogRepo.paginate(
      undefined,
      page,
      pageSize,
      'createdAt',
      'desc',
      search,
      ['action', 'entity', 'userId']
    );
  }

  async getByEntity(entity: string, entityId: string) {
    return auditLogRepo.findByEntity(entity, entityId);
  }
}

export const auditService = new AuditService();
