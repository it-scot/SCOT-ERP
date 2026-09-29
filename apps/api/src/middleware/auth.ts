// ============================================================
// SCoT ERP — Auth Middleware (JWT + RBAC)
// ============================================================
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { UnauthorizedError, ForbiddenError } from './errorHandler.js';
import type { AuthUser, UserRole } from '@scot-erp/shared';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    // Try cookie first, then Authorization header
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      next(err);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
}

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const hasRole = roles.some((role) => req.user!.roles.includes(role));
    if (!hasRole) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }

    next();
  };
}

export function requirePortal(portal: 'staff' | 'student') {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (req.user.portal !== portal) {
      return next(new ForbiddenError(`This resource requires ${portal} portal access`));
    }

    next();
  };
}

export function requireSelf(paramName: string = 'id') {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const targetId = req.params[paramName];
    const isAdmin = req.user.roles.some((r) =>
      ['SystemAdmin', 'HR', 'COO'].includes(r)
    );

    if (!isAdmin && req.user.id !== targetId && req.user.staffId !== targetId) {
      return next(new ForbiddenError('You can only access your own data'));
    }

    next();
  };
}

// Check if user can view salary data (HR, COO, or self only — NOT IT)
export function requireSalaryAccess(paramName: string = 'employeeId') {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const targetId = req.params[paramName];
    const isSelf = req.user.id === targetId || req.user.staffId === targetId;
    const hasAccess = req.user.roles.some((r) => ['HR', 'COO'].includes(r));

    if (!isSelf && !hasAccess) {
      return next(new ForbiddenError('Salary data is restricted to HR, COO, and the employee'));
    }

    next();
  };
}
