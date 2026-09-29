// ============================================================
// SCoT ERP — Auth Routes
// ============================================================
import { Router } from 'express';
import { authService } from '../services/authService.js';
import { config } from '../config.js';
import { loginSchema } from '@scot-erp/shared';
import { authenticate } from '../middleware/auth.js';
import { employeeRepo } from '../repositories/index.js';

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email } = loginSchema.parse(req.body);

    if (config.auth.mode === 'dev') {
      const user = await authService.devLogin(email);
      const token = authService.generateToken(user);
      const refreshToken = authService.generateRefreshToken(user);

      res.cookie('token', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ success: true, data: { user, token } });
    } else {
      // Google auth mode — will verify ID token
      res.status(501).json({ success: false, error: 'Google auth not yet configured. Set AUTH_MODE=dev' });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticate, async (req, res) => {
  res.json({ success: true, data: req.user });
});

// POST /api/auth/logout
authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
});

// GET /api/auth/demo-accounts (dev mode only)
authRouter.get('/demo-accounts', async (_req, res) => {
  if (config.auth.mode !== 'dev') {
    res.json({ success: true, data: [] });
    return;
  }

  const employees = await employeeRepo.findAll();
  const roleMap: Record<string, string[]> = {};

  // Gather demo accounts — one per notable role
  const demoEmails = [
    'it@scot.lk',
    'hr@scot.lk',
    'yohan@scot.lk',
    'admin@scot.lk',
  ];

  // Find HODs
  const departments = await (await import('../repositories/index.js')).departmentRepo.findAll();
  for (const dept of departments) {
    if (dept.hodStaffId) {
      const hod = await employeeRepo.findByStaffId(dept.hodStaffId);
      if (hod && !demoEmails.includes(hod.email)) {
        demoEmails.push(hod.email);
      }
    }
  }

  // Add a few regular employees
  const regulars = employees
    .filter((e) => !demoEmails.includes(e.email) && e.status === 'Active')
    .slice(0, 3);
  regulars.forEach((e) => demoEmails.push(e.email));

  // Add a student
  demoEmails.push('student1@student.scot.lk');

  const accounts = [];
  for (const email of demoEmails) {
    try {
      const user = await authService.devLogin(email);
      accounts.push({
        email: user.email,
        name: user.preferredName,
        roles: user.roles,
        portal: user.portal,
      });
    } catch {
      // Skip accounts that fail
    }
  }

  res.json({ success: true, data: accounts });
});
