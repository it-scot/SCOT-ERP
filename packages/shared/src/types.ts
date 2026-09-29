// ============================================================
// SCoT ERP — Shared Type Definitions
// ============================================================
import type {
  EmployeeStatus,
  EmployeeCategory,
  Title,
  MaritalStatus,
  UserRole,
  RequestStatus,
  AttendanceStatus,
  TaskStatus,
  TaskType,
  OnboardingStepType,
  ResignationStepType,
  NotificationChannel,
  EvaluationCycleStatus,
  EvaluationCycleType,
  EvaluationPillar,
  EvaluatorPattern,
  AssetStatus,
  PurchaseStatus,
  DocumentType,
  LeaveType,
} from './constants';

// ---- Base ----
export interface BaseEntity {
  id: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

// ---- Department ----
export interface Department extends BaseEntity {
  code: string;
  name: string;
  hodStaffId: string | null;
}

// ---- Employee ----
export interface Employee extends BaseEntity {
  staffId: string;
  status: EmployeeStatus;
  cadreLevel: string;
  title: Title;
  nameInFull: string;
  preferredName: string;
  designation: string;
  departmentCode: string;
  dateJoined: string;
  userRole: UserRole[];
  supervisorStaffId: string | null;
  cvFileId: string | null;
  photoUrl: string | null;
  dateOfBirth: string;
  maritalStatus: MaritalStatus;
  nic: string;
  contactNumber: string;
  email: string;
  address: string;
  personalEmail: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactMobile: string;
  emergencyContactAddress: string;
  employeeCategory: EmployeeCategory;
  biometricId: string;
  shiftPatternId: string;
  timeSlotId: string;
  leaveEntitlementHours: number;
  probationEndDate: string | null;
  lastWorkingDate: string | null;
}

// ---- Shift ----
export interface ShiftPattern {
  id: string;
  label: string;
  days: number[]; // 0=Sun, 1=Mon, etc.
}

export interface TimeSlot {
  id: string;
  label: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface ShiftAssignment extends BaseEntity {
  employeeId: string;
  shiftPatternId: string;
  timeSlotId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
}

// ---- Attendance ----
export interface AttendancePunch extends BaseEntity {
  deviceId: string;
  biometricId: string;
  timestamp: string;
  direction: 'in' | 'out' | null;
}

export interface AttendanceDay extends BaseEntity {
  employeeId: string;
  date: string;
  expectedShiftPatternId: string;
  expectedTimeSlotId: string;
  firstPunchIn: string | null;
  lastPunchOut: string | null;
  workedMinutes: number;
  expectedMinutes: number;
  status: AttendanceStatus;
  isLate: boolean;
  lateMinutes: number;
  isEarlyOut: boolean;
  earlyOutMinutes: number;
  isAbsent: boolean;
  isWfh: boolean;
  isLeave: boolean;
  isHoliday: boolean;
  isOffDay: boolean;
  otMinutes: number;
  linkedLeaveRequestId: string | null;
  linkedWfhRequestId: string | null;
  correctionRequestId: string | null;
  notes: string;
}

// ---- Leave ----
export interface LeaveRequest extends BaseEntity {
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  startTime: string | null; // For hourly leave
  endTime: string | null;
  dates: string[]; // For multi-day annual leave
  totalHours: number;
  reason: string;
  status: RequestStatus;
  supervisorId: string;
  supervisorComment: string | null;
  respondedAt: string | null;
  isBackdated: boolean;
  backdateReason: string | null;
}

export interface LeaveBalance {
  employeeId: string;
  year: number;
  allocatedHours: number;
  usedHours: number;
  pendingHours: number;
  remainingHours: number;
  lieuHoursAccrued: number;
  lieuHoursUsed: number;
}

// ---- WFH ----
export interface WfhRequest extends BaseEntity {
  employeeId: string;
  dates: string[];
  reason: string;
  status: RequestStatus;
  supervisorId: string;
  supervisorComment: string | null;
  respondedAt: string | null;
}

// ---- Overtime ----
export interface OvertimeRecord extends BaseEntity {
  employeeId: string;
  date: string;
  otMinutes: number;
  monthYear: string; // YYYY-MM
  convertedToLieu: boolean;
  lieuLeaveRequestId: string | null;
}

export interface LieuLeaveRequest extends BaseEntity {
  employeeId: string;
  otRecordIds: string[];
  requestedDate: string;
  totalHours: number;
  status: RequestStatus;
  supervisorId: string;
  supervisorComment: string | null;
  respondedAt: string | null;
}

// ---- Salary ----
export interface SalaryRecord extends BaseEntity {
  employeeId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  basicSalary: number;
  allowances: { label: string; amount: number }[];
  deductions: { label: string; amount: number }[];
  bankName: string;
  bankBranch: string;
  bankAccountNo: string;
  epfPercentage: number;
  etfPercentage: number;
  grossSalary: number;
  netSalary: number;
}

export interface Payslip extends BaseEntity {
  employeeId: string;
  monthYear: string; // YYYY-MM
  fileId: string;
  fileName: string;
  uploadedBy: string;
  notifiedAt: string | null;
}

// ---- Documents ----
export interface EmployeeDocument extends BaseEntity {
  employeeId: string;
  type: DocumentType;
  label: string;
  fileId: string;
  fileName: string;
  uploadedBy: string;
  version: number;
  isDeleted: boolean;
}

// ---- Notifications ----
export interface Notification extends BaseEntity {
  recipientId: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  deepLink: string | null;
  deliveredAt: string | null;
  seenAt: string | null;
  actedAt: string | null;
  isRead: boolean;
}

// ---- Email Log ----
export interface EmailLog extends BaseEntity {
  to: string;
  subject: string;
  body: string;
  sentAt: string | null;
  status: 'queued' | 'sent' | 'failed';
  error: string | null;
}

// ---- Tasks ----
export interface Task extends BaseEntity {
  type: TaskType;
  refEntity: string;
  refId: string;
  assigneeUserId: string | null;
  assigneeDepartment: string | null;
  dueAt: string;
  slaMinutes: number;
  firstViewedAt: string | null;
  respondedAt: string | null;
  completedAt: string | null;
  monitoredBy: string | null;
  monitoredAt: string | null;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
}

// ---- Audit Log ----
export interface AuditLog extends BaseEntity {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
}

// ---- Onboarding ----
export interface OnboardingCase extends BaseEntity {
  employeeId: string;
  joinDate: string;
  designation: string;
  departmentCode: string;
  status: 'In Progress' | 'Completed' | 'Cancelled';
  steps: OnboardingStep[];
}

export interface OnboardingStep extends BaseEntity {
  caseId: string;
  type: OnboardingStepType;
  assigneeDepartment: string;
  assigneeUserId: string | null;
  dueAt: string;
  completedAt: string | null;
  monitoredBy: string | null;
  monitoredAt: string | null;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  notes: string;
  taskId: string | null;
}

// ---- Asset Templates ----
export interface AssetTemplate extends BaseEntity {
  name: string;
  category: EmployeeCategory;
  items: AssetTemplateItem[];
}

export interface AssetTemplateItem {
  id: string;
  label: string;
  spec: string;
  quantity: number;
  required: boolean;
}

// ---- Asset Request ----
export interface AssetRequest extends BaseEntity {
  onboardingCaseId: string | null;
  requestedBy: string;
  requestedFor: string;
  departmentCode: string;
  items: AssetRequestItem[];
  matchesTemplate: boolean;
  allInStock: boolean;
  status: 'Pending' | 'Approved' | 'In Progress' | 'Completed';
  purchaseApprovalId: string | null;
}

export interface AssetRequestItem {
  id: string;
  label: string;
  spec: string;
  quantity: number;
  required: boolean;
  inStock: boolean;
  stockItemId: string | null;
}

// ---- Purchase ----
export interface PurchaseApproval extends BaseEntity {
  assetRequestId: string;
  requestedBy: string;
  items: PurchaseItem[];
  status: PurchaseStatus;
  cooComment: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
}

export interface PurchaseItem extends BaseEntity {
  purchaseApprovalId: string;
  label: string;
  spec: string;
  vendor: string | null;
  cost: number | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  quotationFileId: string | null;
  invoiceFileId: string | null;
  warrantyFileId: string | null;
  status: 'Pending' | 'Purchased' | 'Handed Over';
}

// ---- Inventory ----
export interface InventoryItem extends BaseEntity {
  name: string;
  spec: string;
  serialNumber: string;
  status: AssetStatus;
  assignedTo: string | null;
  assignedAt: string | null;
  category: string;
  notes: string;
}

export interface AssetAssignment extends BaseEntity {
  inventoryItemId: string;
  employeeId: string;
  assignedAt: string;
  returnedAt: string | null;
  condition: string;
  notes: string;
}

// ---- Resignation ----
export interface ResignationCase extends BaseEntity {
  employeeId: string;
  proposedLastWorkingDate: string;
  reason: string;
  hodId: string;
  hodStatus: RequestStatus;
  hodComment: string | null;
  hodRespondedAt: string | null;
  handoverDate: string | null;
  calendarEventId: string | null;
  itHandoverCompleted: boolean;
  itHandoverAt: string | null;
  exitEvaluationSubmitted: boolean;
  exitEvaluationAt: string | null;
  serviceLetterRequested: boolean;
  serviceLetterRequestedAt: string | null;
  serviceLetterFileId: string | null;
  serviceLetterUploadedAt: string | null;
  serviceLetterAccepted: boolean;
  serviceLetterAcceptedAt: string | null;
  status: 'Submitted' | 'Accepted' | 'In Progress' | 'Completed' | 'Declined';
}

export interface HandoverEvent extends BaseEntity {
  resignationCaseId: string;
  inventoryItemId: string;
  handedOverAt: string | null;
  condition: string;
  notes: string;
  receivedBy: string | null;
}

// ---- Exit Evaluation ----
export interface ExitEvaluation extends BaseEntity {
  resignationCaseId: string;
  employeeId: string;
  responses: { question: string; answer: string }[];
  submittedAt: string;
}

// ---- Service Letter ----
export interface ServiceLetterRequest extends BaseEntity {
  employeeId: string;
  resignationCaseId: string;
  status: 'Requested' | 'Uploaded' | 'Accepted';
  fileId: string | null;
  requestedAt: string;
  uploadedAt: string | null;
  acceptedAt: string | null;
}

// ---- Evaluation System ----
export interface EvaluationTemplate extends BaseEntity {
  name: string;
  targetType: 'Employee' | 'HOD';
  criteria: EvaluationCriterion[];
  ratingScaleMin: number;
  ratingScaleMax: number;
  version: number;
  isLocked: boolean;
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  weight: number;
  questions: EvaluationQuestion[];
}

export interface EvaluationQuestion {
  id: string;
  text: string;
  weight: number;
  applicableTo: EvaluationPillar[];
  hasComment: boolean;
}

export interface EvaluationCycle extends BaseEntity {
  name: string;
  type: EvaluationCycleType;
  templateId: string;
  hodTemplateId: string | null;
  startDate: string;
  deadline: string;
  status: EvaluationCycleStatus;
  pillarWeights: { self: number; peer: number; superior: number };
  targetEmployeeIds: string[] | null; // null = all, or specific for probation
}

export interface EvaluationAssignment extends BaseEntity {
  cycleId: string;
  evaluatorId: string;
  targetId: string;
  pillar: EvaluationPillar;
  templateId: string;
  status: 'Pending' | 'Submitted';
  submittedAt: string | null;
  dueAt: string;
}

export interface EvaluationResponse extends BaseEntity {
  assignmentId: string;
  cycleId: string;
  evaluatorId: string;
  targetId: string;
  pillar: EvaluationPillar;
  criterionScores: {
    criterionId: string;
    questionScores: {
      questionId: string;
      score: number;
      comment: string | null;
    }[];
    averageScore: number;
    weightedScore: number;
  }[];
  overallScore: number;
}

export interface EvaluationResult extends BaseEntity {
  cycleId: string;
  employeeId: string;
  selfScore: number | null;
  peerScore: number | null;
  peerCount: number;
  superiorScore: number | null;
  superiorEvaluatorId: string | null;
  finalScore: number;
  band: string;
  pillarWeights: { self: number; peer: number; superior: number };
  criterionBreakdown: {
    criterionId: string;
    criterionName: string;
    selfScore: number | null;
    peerScore: number | null;
    superiorScore: number | null;
    finalScore: number;
  }[];
  isPeerNil: boolean;
}

// ---- KPI ----
export interface KpiSnapshot extends BaseEntity {
  employeeId: string;
  period: string; // YYYY-MM or YYYY-Q1, etc.
  attendanceScore: number;
  evaluationScore: number;
  responsivenessScore: number;
  evaluatorReliabilityScore: number;
  weights: {
    attendance: number;
    evaluation: number;
    responsiveness: number;
    evaluatorReliability: number;
  };
  compositeScore: number;
  band: string;
  details: Record<string, unknown>;
}

export interface KpiConfig extends BaseEntity {
  weights: {
    attendance: number;
    evaluation: number;
    responsiveness: number;
    evaluatorReliability: number;
  };
  bands: { label: string; min: number; max: number }[];
  evaluatorBiasPenalties: {
    harsh: number;
    lenient: number;
    straightLining: number;
  };
}

// ---- Public Holidays ----
export interface PublicHoliday extends BaseEntity {
  date: string;
  name: string;
  isRecurring: boolean;
}

// ---- Calendar Event ----
export interface CalendarEvent extends BaseEntity {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  attendees: string[];
  icsData: string | null;
  googleEventId: string | null;
}

// ---- Settings ----
export interface SystemSettings {
  graceMinutes: number;
  standardWorkingHoursPerDay: number;
  otThresholdMinutes: number;
  otRequiresApproval: boolean;
  maxLeaveRequestDays: number;
  defaultLeaveEntitlementDays: number;
  slaDefaults: Record<string, number>;
  kpiWeights: Record<string, number>;
  evaluationPillarWeights: Record<string, number>;
  evaluatorBiasPenalties: Record<string, number>;
  ratingScale: { min: number; max: number };
  onboardingNotificationRecipients: string[];
  revokeAccessOn: 'acceptance' | 'lastWorkingDay';
  systemAdminEmails: string[];
}

// ---- Auth ----
export interface AuthUser {
  id: string;
  email: string;
  staffId: string | null;
  roles: UserRole[];
  portal: 'staff' | 'student';
  preferredName: string;
  photoUrl: string | null;
  departmentCode: string | null;
  designation: string | null;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

// ---- API Response ----
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---- Query Params ----
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
