// ============================================================
// SCoT ERP — API Configuration
// ============================================================
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',

  auth: {
    mode: (process.env.AUTH_MODE || 'dev') as 'dev' | 'google',
    jwtSecret: process.env.JWT_SECRET || 'scot-erp-dev-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  },

  data: {
    provider: (process.env.DATA_PROVIDER || 'mock') as 'mock' | 'azuresql',
    dataDir: path.resolve(__dirname, '../../../data'),
  },

  files: {
    storage: (process.env.FILE_STORAGE || 'local') as 'local' | 'azureblob',
    uploadDir: path.resolve(__dirname, '../../../uploads'),
    maxSize: 10 * 1024 * 1024, // 10 MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ],
  },

  mailer: {
    provider: (process.env.MAILER || 'console') as 'console' | 'smtp',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },

  calendar: {
    provider: (process.env.CALENDAR_PROVIDER || 'local') as 'local' | 'google',
    googleCredentials: process.env.GOOGLE_CALENDAR_CREDENTIALS || '',
    googleCalendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  deviceApiKey: process.env.DEVICE_API_KEY || 'biometric-dev-key',
};
