// ============================================================
// SCoT ERP — Repository Registry & Initializer
// ============================================================
import { loadStore } from './dataStore.js';
import { MockEmployeeRepository, type IEmployeeRepository } from './employeeRepository.js';
import { MockDepartmentRepository, type IDepartmentRepository } from './departmentRepository.js';
import { MockNotificationRepository, type INotificationRepository } from './notificationRepository.js';
import { MockTaskRepository } from './taskRepository.js';
import { MockAuditLogRepository } from './auditLogRepository.js';
import {
  MockLeaveRequestRepository,
  MockLeaveBalanceRepository,
  MockWfhRequestRepository,
  MockOvertimeRecordRepository,
  MockLieuLeaveRequestRepository,
} from './leaveRepository.js';
import { MockAttendancePunchRepository, MockAttendanceDayRepository } from './attendanceRepository.js';
import { MockSalaryRecordRepository, MockPayslipRepository } from './salaryRepository.js';
import { MockDocumentRepository } from './documentRepository.js';
import { MockSettingsRepository } from './settingsRepository.js';
import { MockPublicHolidayRepository } from './holidayRepository.js';

// Singleton instances
export const employeeRepo = new MockEmployeeRepository();
export const departmentRepo = new MockDepartmentRepository();
export const notificationRepo = new MockNotificationRepository();
export const taskRepo = new MockTaskRepository();
export const auditLogRepo = new MockAuditLogRepository();
export const leaveRequestRepo = new MockLeaveRequestRepository();
export const leaveBalanceRepo = new MockLeaveBalanceRepository();
export const wfhRequestRepo = new MockWfhRequestRepository();
export const overtimeRecordRepo = new MockOvertimeRecordRepository();
export const lieuLeaveRequestRepo = new MockLieuLeaveRequestRepository();
export const attendancePunchRepo = new MockAttendancePunchRepository();
export const attendanceDayRepo = new MockAttendanceDayRepository();
export const salaryRecordRepo = new MockSalaryRecordRepository();
export const payslipRepo = new MockPayslipRepository();
export const documentRepo = new MockDocumentRepository();
export const settingsRepo = new MockSettingsRepository();
export const publicHolidayRepo = new MockPublicHolidayRepository();

export async function initializeDataStore() {
  await loadStore();
}

// Re-export types
export type { IEmployeeRepository, IDepartmentRepository, INotificationRepository };
