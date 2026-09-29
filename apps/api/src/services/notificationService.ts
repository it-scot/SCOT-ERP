// ============================================================
// SCoT ERP — Notification Service
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import { notificationRepo } from '../repositories/index.js';
import { emailService } from './emailService.js';
import type { Notification } from '@scot-erp/shared';

export class NotificationService {
  async send(params: {
    recipientId: string;
    recipientEmail?: string;
    title: string;
    body: string;
    deepLink?: string;
    channel?: 'in-app' | 'email' | 'both';
  }): Promise<Notification> {
    const channel = params.channel || 'both';

    // Create in-app notification
    const notification = await notificationRepo.create({
      id: uuidv4(),
      recipientId: params.recipientId,
      channel,
      title: params.title,
      body: params.body,
      deepLink: params.deepLink || null,
      deliveredAt: new Date().toISOString(),
      seenAt: null,
      actedAt: null,
      isRead: false,
    });

    // Send email if channel includes email
    if ((channel === 'email' || channel === 'both') && params.recipientEmail) {
      await emailService.send({
        to: params.recipientEmail,
        subject: params.title,
        body: params.body,
      });
    }

    return notification;
  }

  async sendToMultiple(params: {
    recipients: { id: string; email?: string }[];
    title: string;
    body: string;
    deepLink?: string;
    channel?: 'in-app' | 'email' | 'both';
  }): Promise<Notification[]> {
    const results: Notification[] = [];
    for (const recipient of params.recipients) {
      const n = await this.send({
        recipientId: recipient.id,
        recipientEmail: recipient.email,
        title: params.title,
        body: params.body,
        deepLink: params.deepLink,
        channel: params.channel,
      });
      results.push(n);
    }
    return results;
  }

  async getForUser(userId: string) {
    return notificationRepo.findByRecipient(userId);
  }

  async getUnreadCount(userId: string) {
    return notificationRepo.countUnread(userId);
  }

  async markAsRead(notificationId: string) {
    return notificationRepo.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string) {
    return notificationRepo.markAllAsRead(userId);
  }
}

export const notificationService = new NotificationService();
