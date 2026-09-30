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
import { MockOnboardingCaseRepository, MockOnboardingStepRepository } from './onboardingRepository.js';
import {
  MockResignationCaseRepository,
  MockHandoverEventRepository,
  MockExitEvaluationRepository,
  MockServiceLetterRequestRepository,
} from './resignationRepository.js';
import { MockInventoryItemRepository, MockAssetAssignmentRepository } from './inventoryRepository.js';
import { MockAssetTemplateRepository, MockAssetRequestRepository } from './assetRepository.js';
import { MockPurchaseApprovalRepository, MockPurchaseItemRepository } from './purchaseRepository.js';
import {
  MockEvaluationTemplateRepository,
  MockEvaluationCycleRepository,
  MockEvaluationAssignmentRepository,
  MockEvaluationResponseRepository,
  MockEvaluationResultRepository,
} from './evaluationRepository.js';
import { MockKpiSnapshotRepository, KpiConfigRepository } from './kpiRepository.js';
import { MockCalendarEventRepository } from './calendarRepository.js';
import { MockShiftAssignmentRepository } from './shiftAssignmentRepository.js';

// Singleton instances — Core
export const employeeRepo = new MockEmployeeRepository();
export const departmentRepo = new MockDepartmentRepository();
export const notificationRepo = new MockNotificationRepository();
export const taskRepo = new MockTaskRepository();
export const auditLogRepo = new MockAuditLogRepository();

// Leave & Time
export const leaveRequestRepo = new MockLeaveRequestRepository();
export const leaveBalanceRepo = new MockLeaveBalanceRepository();
export const wfhRequestRepo = new MockWfhRequestRepository();
export const overtimeRecordRepo = new MockOvertimeRecordRepository();
export const lieuLeaveRequestRepo = new MockLieuLeaveRequestRepository();

// Attendance
export const attendancePunchRepo = new MockAttendancePunchRepository();
export const attendanceDayRepo = new MockAttendanceDayRepository();

// Salary
export const salaryRecordRepo = new MockSalaryRecordRepository();
export const payslipRepo = new MockPayslipRepository();

// Documents & Settings
export const documentRepo = new MockDocumentRepository();
export const settingsRepo = new MockSettingsRepository();
export const publicHolidayRepo = new MockPublicHolidayRepository();

// Onboarding
export const onboardingCaseRepo = new MockOnboardingCaseRepository();
export const onboardingStepRepo = new MockOnboardingStepRepository();

// Resignation
export const resignationCaseRepo = new MockResignationCaseRepository();
export const handoverEventRepo = new MockHandoverEventRepository();
export const exitEvaluationRepo = new MockExitEvaluationRepository();
export const serviceLetterRequestRepo = new MockServiceLetterRequestRepository();

// Inventory & Assets
export const inventoryItemRepo = new MockInventoryItemRepository();
export const assetAssignmentRepo = new MockAssetAssignmentRepository();
export const assetTemplateRepo = new MockAssetTemplateRepository();
export const assetRequestRepo = new MockAssetRequestRepository();

// Purchase
export const purchaseApprovalRepo = new MockPurchaseApprovalRepository();
export const purchaseItemRepo = new MockPurchaseItemRepository();

// Evaluation
export const evaluationTemplateRepo = new MockEvaluationTemplateRepository();
export const evaluationCycleRepo = new MockEvaluationCycleRepository();
export const evaluationAssignmentRepo = new MockEvaluationAssignmentRepository();
export const evaluationResponseRepo = new MockEvaluationResponseRepository();
export const evaluationResultRepo = new MockEvaluationResultRepository();

// KPI
export const kpiSnapshotRepo = new MockKpiSnapshotRepository();
export const kpiConfigRepo = new KpiConfigRepository();

// Calendar & Shifts
export const calendarEventRepo = new MockCalendarEventRepository();
export const shiftAssignmentRepo = new MockShiftAssignmentRepository();

export async function initializeDataStore() {
  await loadStore();
}

// Re-export types
export type { IEmployeeRepository, IDepartmentRepository, INotificationRepository };
