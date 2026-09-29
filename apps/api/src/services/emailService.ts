// ============================================================
// SCoT ERP — Email Service (IMailer adapter)
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import { getStore, persistStore } from '../repositories/dataStore.js';
import type { EmailLog } from '@scot-erp/shared';

export interface IMailer {
  send(params: { to: string; subject: string; body: string }): Promise<void>;
}

/**
 * Console mailer: logs to console and stores in the in-app Outbox.
 */
class ConsoleMailer implements IMailer {
  async send(params: { to: string; subject: string; body: string }): Promise<void> {
    const log: EmailLog = {
      id: uuidv4(),
      to: params.to,
      subject: params.subject,
      body: params.body,
      sentAt: new Date().toISOString(),
      status: 'sent',
      error: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in email logs for Outbox viewer
    const store = getStore();
    store.emailLogs[log.id] = log;
    persistStore();

    // Console output
    console.log(`\n📧 EMAIL SENT`);
    console.log(`   To: ${params.to}`);
    console.log(`   Subject: ${params.subject}`);
    console.log(`   Body: ${params.body.substring(0, 200)}${params.body.length > 200 ? '...' : ''}`);
    console.log('');
  }
}

/**
 * SMTP Mailer (documented stub for production).
 * To activate: set MAILER=smtp in .env with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.
 * Implementation: use nodemailer with SMTP transport.
 */
// class SmtpMailer implements IMailer { ... }

export class EmailService {
  private mailer: IMailer;

  constructor() {
    // For now always use console mailer
    this.mailer = new ConsoleMailer();
  }

  async send(params: { to: string; subject: string; body: string }): Promise<void> {
    await this.mailer.send(params);
  }

  async getOutbox(): Promise<EmailLog[]> {
    const store = getStore();
    return Object.values(store.emailLogs as Record<string, EmailLog>)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const emailService = new EmailService();
