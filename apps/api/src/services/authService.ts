// ============================================================
// SCoT ERP — Auth Service
// ============================================================
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { employeeRepo, departmentRepo } from '../repositories/index.js';
import { STAFF_DOMAIN, STUDENT_DOMAIN, SYSTEM_ADMIN_EMAILS, HR_EMAIL, IT_EMAIL, COO_EMAIL, ADMIN_DEPT_EMAIL } from '@scot-erp/shared';
import type { AuthUser, UserRole, Employee } from '@scot-erp/shared';
import { UnauthorizedError } from '../middleware/errorHandler.js';

export class AuthService {
  /**
   * Determine which portal an email belongs to.
   */
  getPortal(email: string): 'staff' | 'student' | null {
    const domain = email.split('@')[1];
    if (!domain) return null;

    // Must check student domain first since student.scot.lk contains scot.lk
    if (domain === STUDENT_DOMAIN) return 'student';
    if (domain === STAFF_DOMAIN) return 'staff';
    return null;
  }

  /**
   * Dev mode login: just validate the email against the employee list.
   */
  async devLogin(email: string): Promise<AuthUser> {
    const portal = this.getPortal(email);
    if (!portal) {
      throw new UnauthorizedError('Email domain not recognized. Use @scot.lk or @student.scot.lk');
    }

    if (portal === 'student') {
      // Student portal shell — minimal user
      return {
        id: email,
        email,
        staffId: null,
        roles: ['Student'],
        portal: 'student',
        preferredName: email.split('@')[0],
        photoUrl: null,
        departmentCode: null,
        designation: null,
      };
    }

    // Staff portal
    const employee = await employeeRepo.findByEmail(email);
    if (!employee) {
      throw new UnauthorizedError('Your account has not been created by HR.');
    }

    if (employee.status === 'Resigned' || employee.status === 'Inactive') {
      throw new UnauthorizedError('Your account is no longer active. Contact HR for assistance.');
    }

    const roles = await this.resolveRoles(employee);

    return {
      id: employee.id,
      email: employee.email,
      staffId: employee.staffId,
      roles,
      portal: 'staff',
      preferredName: employee.preferredName,
      photoUrl: employee.photoUrl,
      departmentCode: employee.departmentCode,
      designation: employee.designation,
    };
  }

  /**
   * Derive all roles for an employee.
   */
  async resolveRoles(employee: Employee): Promise<UserRole[]> {
    const roles = new Set<UserRole>();

    // Everyone is an Employee
    roles.add('Employee');

    // Explicit roles from userRole field
    if (employee.userRole) {
      employee.userRole.forEach((r) => roles.add(r as UserRole));
    }

    // System Admin (allowlist)
    const settings = await import('../repositories/index.js').then((m) => m.settingsRepo.get());
    const adminEmails = (await settings).systemAdminEmails || SYSTEM_ADMIN_EMAILS;
    if (adminEmails.includes(employee.email)) {
      roles.add('SystemAdmin');
    }

    // Special email-based roles
    if (employee.email === HR_EMAIL) roles.add('HR');
    if (employee.email === IT_EMAIL) roles.add('IT');
    if (employee.email === COO_EMAIL) roles.add('COO');
    if (employee.email === ADMIN_DEPT_EMAIL) roles.add('Admin');

    // HOD: check if this employee is HOD of any department
    const departments = await departmentRepo.findAll();
    const isHod = departments.some((d) => d.hodStaffId === employee.staffId);
    if (isHod) roles.add('HOD');

    // Supervisor: check if anyone references this employee as their supervisor
    const directReports = await employeeRepo.findBySupervisor(employee.staffId);
    if (directReports.length > 0) roles.add('Supervisor');

    return Array.from(roles);
  }

  /**
   * Generate JWT token.
   */
  generateToken(user: AuthUser): string {
    return jwt.sign(user, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresIn,
    });
  }

  /**
   * Generate refresh token.
   */
  generateRefreshToken(user: AuthUser): string {
    return jwt.sign({ id: user.id, email: user.email }, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtRefreshExpiresIn,
    });
  }
}

export const authService = new AuthService();
