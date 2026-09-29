// ============================================================
// SCoT ERP — Notification Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { Notification } from '@scot-erp/shared';

export interface INotificationRepository {
  findAll(filters?: Record<string, any>): Promise<Notification[]>;
  findById(id: string): Promise<Notification | null>;
  findByRecipient(recipientId: string): Promise<Notification[]>;
  findUnreadByRecipient(recipientId: string): Promise<Notification[]>;
  create(data: Partial<Notification>): Promise<Notification>;
  update(id: string, data: Partial<Notification>): Promise<Notification | null>;
  markAsRead(id: string): Promise<Notification | null>;
  markAllAsRead(recipientId: string): Promise<void>;
  countUnread(recipientId: string): Promise<number>;
}

export class MockNotificationRepository
  extends MockBaseRepository<Notification>
  implements INotificationRepository
{
  constructor() {
    super('notifications');
  }

  async findByRecipient(recipientId: string): Promise<Notification[]> {
    const all = await this.findByField('recipientId', recipientId);
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findUnreadByRecipient(recipientId: string): Promise<Notification[]> {
    const all = await this.findByRecipient(recipientId);
    return all.filter((n) => !n.isRead);
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this.update(id, {
      isRead: true,
      seenAt: new Date().toISOString(),
    } as Partial<Notification>);
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    const unread = await this.findUnreadByRecipient(recipientId);
    const now = new Date().toISOString();
    for (const n of unread) {
      await this.update(n.id, { isRead: true, seenAt: now } as Partial<Notification>);
    }
  }

  async countUnread(recipientId: string): Promise<number> {
    const unread = await this.findUnreadByRecipient(recipientId);
    return unread.length;
  }
}
