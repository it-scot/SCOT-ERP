// ============================================================
// SCoT ERP — Express App Setup
// ============================================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { authRouter } from './routes/auth.routes.js';
import { employeeRouter } from './routes/employee.routes.js';
import { departmentRouter } from './routes/department.routes.js';
import { attendanceRouter } from './routes/attendance.routes.js';
import { leaveRouter } from './routes/leave.routes.js';
import { wfhRouter } from './routes/wfh.routes.js';
import { notificationRouter } from './routes/notification.routes.js';
import { taskRouter } from './routes/task.routes.js';
import { settingsRouter } from './routes/settings.routes.js';
import { auditRouter } from './routes/audit.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { shiftRouter } from './routes/shift.routes.js';
import { salaryRouter } from './routes/salary.routes.js';
import { documentRouter } from './routes/document.routes.js';
import { fileRouter } from './routes/file.routes.js';
import { holidayRouter } from './routes/holiday.routes.js';
import { emailRouter } from './routes/email.routes.js';
import { overtimeRouter } from './routes/overtime.routes.js';
import { onboardingRouter } from './routes/onboarding.routes.js';
import { resignationRouter } from './routes/resignation.routes.js';
import { evaluationRouter } from './routes/evaluation.routes.js';
import { kpiRouter } from './routes/kpi.routes.js';
import { inventoryRouter } from './routes/inventory.routes.js';
import { calendarRouter } from './routes/calendar.routes.js';

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(requestLogger);

// Static files for uploads (authenticated via route)
app.use('/uploads', express.static(config.files.uploadDir));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/leave', leaveRouter);
app.use('/api/wfh', wfhRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/shifts', shiftRouter);
app.use('/api/salary', salaryRouter);
app.use('/api/documents', documentRouter);
app.use('/api/files', fileRouter);
app.use('/api/holidays', holidayRouter);
app.use('/api/emails', emailRouter);
app.use('/api/overtime', overtimeRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/resignation', resignationRouter);
app.use('/api/evaluations', evaluationRouter);
app.use('/api/kpi', kpiRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/calendar', calendarRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

export { app };
