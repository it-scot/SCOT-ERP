// ============================================================
// SCoT ERP — Application Constants
// ============================================================

// --- Email Domains ---
export const STAFF_DOMAIN = 'scot.lk';
export const STUDENT_DOMAIN = 'student.scot.lk';

// --- Portal Types ---
export type PortalType = 'staff' | 'student';

// --- System Admin Emails (default allowlist) ---
export const SYSTEM_ADMIN_EMAILS = ['it@scot.lk', 'hr@scot.lk', 'yohan@scot.lk'];

// --- Special Role Emails ---
export const HR_EMAIL = 'hr@scot.lk';
export const IT_EMAIL = 'it@scot.lk';
export const COO_EMAIL = 'yohan@scot.lk';
export const ADMIN_DEPT_EMAIL = 'admin@scot.lk';

// --- Employee Status ---
export const EMPLOYEE_STATUSES = [
  'Onboarding',
  'Probation',
  'Active',
  'Notice Period',
  'Resigned',
  'Inactive',
] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

// --- Employee Category ---
export const EMPLOYEE_CATEGORIES = ['Academic', 'Non-Academic'] as const;
export type EmployeeCategory = (typeof EMPLOYEE_CATEGORIES)[number];

// --- Titles ---
export const TITLES = ['Mr', 'Ms', 'Mrs', 'Dr', 'Prof', 'Rev'] as const;
export type Title = (typeof TITLES)[number];

// --- Marital Status ---
export const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'] as const;
export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

// --- User Roles ---
export const USER_ROLES = [
  'Employee',
  'Supervisor',
  'HOD',
  'HR',
  'IT',
  'Admin',
  'COO',
  'SystemAdmin',
  'Student',
] as const;
export type UserRole = (typeof USER_ROLES)[number];

// --- Departments ---
export const DEPARTMENTS = [
  { code: 'BM', name: 'Business Management' },
  { code: 'IT', name: 'Information Technology' },
  { code: 'HR', name: 'Human Resources' },
  { code: 'ADMIN', name: 'Administration' },
  { code: 'COO', name: 'Executive Office' },
  { code: 'FIN', name: 'Finance' },
  { code: 'SA', name: 'Student Affairs' },
  { code: 'ENG', name: 'Engineering' },
] as const;

// --- Leave Types ---
export const LEAVE_TYPES = [
  'Hourly',
  'Half Day',
  'Full Day',
  'Annual',
  'Lieu',
] as const;
export type LeaveType = (typeof LEAVE_TYPES)[number];

// --- Request Statuses ---
export const REQUEST_STATUSES = [
  'Pending',
  'Approved',
  'Declined',
  'Cancelled',
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

// --- Attendance Statuses ---
export const ATTENDANCE_STATUSES = [
  'Present',
  'Present - Approved Leave',
  'Present - WFH',
  'Late',
  'Absent',
  'Early Out',
  'Incomplete',
  'Off Day',
  'Public Holiday',
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

// --- Task Statuses ---
export const TASK_STATUSES = ['Open', 'Done', 'Overdue', 'Cancelled'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

// --- Task Types ---
export const TASK_TYPES = [
  'LeaveApproval',
  'WfhApproval',
  'LieuLeaveApproval',
  'AttendanceCorrectionApproval',
  'ResignationApproval',
  'AssetRequest',
  'PurchaseApproval',
  'PurchaseItem',
  'ITSetup',
  'ITHandover',
  'HRMonitoring',
  'PayslipUpload',
  'ServiceLetterUpload',
  'EvaluationSubmission',
  'OnboardingStep',
  'ExitStep',
  'CalendarEvent',
] as const;
export type TaskType = (typeof TASK_TYPES)[number];

// --- Onboarding Step Types ---
export const ONBOARDING_STEPS = [
  'HODAssetRequest',
  'ITAdminReview',
  'ITPurchaseRequest',
  'COOPurchaseApproval',
  'AdminPurchase',
  'AdminHandoverToIT',
  'ITSetup',
  'ITHandoverToEmployee',
  'HRProfileCreation',
] as const;
export type OnboardingStepType = (typeof ONBOARDING_STEPS)[number];

// --- Resignation Step Types ---
export const RESIGNATION_STEPS = [
  'HODResponse',
  'ScheduleHandover',
  'CalendarEvent',
  'ITAssetHandover',
  'ExitEvaluation',
  'ServiceLetterRequest',
  'HRServiceLetterUpload',
  'EmployeeAcceptance',
] as const;
export type ResignationStepType = (typeof RESIGNATION_STEPS)[number];

// --- Notification Channels ---
export const NOTIFICATION_CHANNELS = ['in-app', 'email', 'both'] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

// --- Evaluation ---
export const EVALUATION_CYCLE_STATUSES = [
  'Draft',
  'Published',
  'Closed',
  'Results Released',
] as const;
export type EvaluationCycleStatus = (typeof EVALUATION_CYCLE_STATUSES)[number];

export const EVALUATION_CYCLE_TYPES = ['Annual', 'Probation'] as const;
export type EvaluationCycleType = (typeof EVALUATION_CYCLE_TYPES)[number];

export const EVALUATION_PILLARS = ['Self', 'Peer', 'Superior'] as const;
export type EvaluationPillar = (typeof EVALUATION_PILLARS)[number];

export const EVALUATOR_PATTERNS = [
  'Balanced',
  'Harsh',
  'Lenient',
  'Straight-lining',
  'Insufficient Data',
] as const;
export type EvaluatorPattern = (typeof EVALUATOR_PATTERNS)[number];

export const KPI_BANDS = [
  { label: 'Outstanding', min: 90, max: 100, color: '#10B981' },
  { label: 'Exceeds Expectations', min: 80, max: 89, color: '#3B82F6' },
  { label: 'Meets Expectations', min: 65, max: 79, color: '#F59E0B' },
  { label: 'Needs Improvement', min: 50, max: 64, color: '#F97316' },
  { label: 'Unsatisfactory', min: 0, max: 49, color: '#EF4444' },
] as const;

// --- Shift Patterns ---
export const SHIFT_PATTERNS = [
  { id: 'mon-sat', label: 'Monday–Saturday', days: [1, 2, 3, 4, 5, 6] },
  { id: 'thu-mon', label: 'Thursday–Monday', days: [4, 5, 6, 0, 1] },
] as const;

export const TIME_SLOTS = [
  { id: 'slot-0830-1730', label: '8:30 AM – 5:30 PM', startHour: 8, startMinute: 30, endHour: 17, endMinute: 30 },
  { id: 'slot-0800-1700', label: '8:00 AM – 5:00 PM', startHour: 8, startMinute: 0, endHour: 17, endMinute: 0 },
  { id: 'slot-0900-1800', label: '9:00 AM – 6:00 PM', startHour: 9, startMinute: 0, endHour: 18, endMinute: 0 },
] as const;

// --- Asset Status ---
export const ASSET_STATUSES = [
  'In Stock',
  'Allocated',
  'In Repair',
  'Retired',
] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

// --- Purchase Statuses ---
export const PURCHASE_STATUSES = [
  'Pending Approval',
  'Approved',
  'Rejected',
  'Purchased',
  'Handed Over to IT',
] as const;
export type PurchaseStatus = (typeof PURCHASE_STATUSES)[number];

// --- Document Types ---
export const DOCUMENT_TYPES = [
  'CV',
  'Appointment Letter',
  'Other Letter',
  'Service Letter',
  'Other',
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

// --- Date Format ---
export const DATE_FORMAT = 'd-MMM-yy';
export const DATETIME_FORMAT = 'd-MMM-yy h:mm a';
export const TIMEZONE = 'Asia/Colombo';
export const CURRENCY = 'LKR';

// --- Defaults (configurable) ---
export const DEFAULTS = {
  graceMinutes: 15,
  standardWorkingHoursPerDay: 8,
  defaultLeaveEntitlementDays: 14,
  otThresholdMinutes: 30,
  maxLeaveRequestDays: 14,
  maxFileSize: 10 * 1024 * 1024, // 10 MB
  allowedFileTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
  slaDefaults: {
    leaveApprovalMinutes: 480, // 1 working day
    sameDayLeaveMinutes: 60,
    hodAssetRequestMinutes: 960, // 2 working days
    itAdminReviewMinutes: 480,
    itPurchaseRequestMinutes: 480,
    cooPurchaseApprovalMinutes: 960,
    adminHandoverToITDaysBefore: 2,
    itSetupDaysBefore: 1,
    hrMonitoringMinutes: 480,
  },
  kpiWeights: {
    attendance: 30,
    evaluation: 35,
    responsiveness: 20,
    evaluatorReliability: 15,
  },
  evaluationPillarWeights: {
    self: 10,
    peer: 30,
    superior: 60,
  },
  evaluatorBiasPenalties: {
    harsh: -15,
    lenient: -5,
    straightLining: -5,
  },
  ratingScale: { min: 1, max: 5 },
};

// --- Status Badge Colors ---
export const STATUS_COLORS: Record<string, string> = {
  Approved: '#10B981',
  Present: '#10B981',
  Active: '#10B981',
  Pending: '#F59E0B',
  Onboarding: '#F59E0B',
  Probation: '#F59E0B',
  Declined: '#EF4444',
  Absent: '#EF4444',
  Inactive: '#EF4444',
  Unsatisfactory: '#EF4444',
  Late: '#F97316',
  'Notice Period': '#F97316',
  'Early Out': '#F97316',
  Leave: '#3B82F6',
  'Present - Approved Leave': '#3B82F6',
  WFH: '#8B5CF6',
  'Present - WFH': '#8B5CF6',
  Holiday: '#6B7280',
  'Off Day': '#6B7280',
  'Public Holiday': '#6B7280',
  Resigned: '#6B7280',
  Open: '#3B82F6',
  Done: '#10B981',
  Overdue: '#EF4444',
  Cancelled: '#6B7280',
};
