// ============================================================
// SCoT ERP — Zod Validation Schemas
// ============================================================
import { z } from 'zod';
import {
  EMPLOYEE_STATUSES,
  EMPLOYEE_CATEGORIES,
  TITLES,
  MARITAL_STATUSES,
  LEAVE_TYPES,
  REQUEST_STATUSES,
  DOCUMENT_TYPES,
  EVALUATION_PILLARS,
  EVALUATION_CYCLE_TYPES,
  EVALUATION_CYCLE_STATUSES,
} from './constants';

// ---- Sri Lankan NIC Validation ----
export const nicSchema = z.string().refine(
  (val) => {
    // Old format: 9 digits + V/X
    const oldFormat = /^\d{9}[VvXx]$/;
    // New format: 12 digits
    const newFormat = /^\d{12}$/;
    return oldFormat.test(val) || newFormat.test(val);
  },
  { message: 'Invalid Sri Lankan NIC. Must be 9 digits + V/X or 12 digits.' }
);

// ---- Email schemas ----
export const staffEmailSchema = z.string().email().refine(
  (val) => val.endsWith('@scot.lk') && !val.endsWith('@student.scot.lk'),
  { message: 'Must be a @scot.lk email address' }
);

export const studentEmailSchema = z.string().email().refine(
  (val) => val.endsWith('@student.scot.lk'),
  { message: 'Must be a @student.scot.lk email address' }
);

// ---- Login ----
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// ---- Employee ----
export const createEmployeeSchema = z.object({
  staffId: z.string().min(1, 'Staff ID is required'),
  status: z.enum(EMPLOYEE_STATUSES).default('Active'),
  cadreLevel: z.string().min(1),
  title: z.enum(TITLES),
  nameInFull: z.string().min(1, 'Full name is required'),
  preferredName: z.string().min(1, 'Preferred name is required'),
  designation: z.string().min(1),
  departmentCode: z.string().min(1),
  dateJoined: z.string(),
  userRole: z.array(z.string()).default(['Employee']),
  supervisorStaffId: z.string().nullable().default(null),
  dateOfBirth: z.string(),
  maritalStatus: z.enum(MARITAL_STATUSES),
  nic: nicSchema,
  contactNumber: z.string().min(1),
  email: staffEmailSchema,
  address: z.string().min(1),
  personalEmail: z.string().email(),
  emergencyContactName: z.string().min(1),
  emergencyContactRelationship: z.string().min(1),
  emergencyContactMobile: z.string().min(1),
  emergencyContactAddress: z.string().min(1),
  employeeCategory: z.enum(EMPLOYEE_CATEGORIES),
  biometricId: z.string().optional(),
  shiftPatternId: z.string().default('mon-sat'),
  timeSlotId: z.string().default('slot-0830-1730'),
  leaveEntitlementHours: z.number().positive().default(112), // 14 * 8
  probationEndDate: z.string().nullable().default(null),
  lastWorkingDate: z.string().nullable().default(null),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

// Employee self-edit (limited fields)
export const employeeSelfEditSchema = z.object({
  contactNumber: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  personalEmail: z.string().email().optional(),
  emergencyContactName: z.string().min(1).optional(),
  emergencyContactRelationship: z.string().min(1).optional(),
  emergencyContactMobile: z.string().min(1).optional(),
  emergencyContactAddress: z.string().min(1).optional(),
});

// ---- Leave ----
export const createLeaveRequestSchema = z.object({
  type: z.enum(LEAVE_TYPES),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string().nullable().default(null),
  endTime: z.string().nullable().default(null),
  dates: z.array(z.string()).default([]),
  totalHours: z.number().positive(),
  reason: z.string().min(1, 'Reason is required'),
});

export const respondLeaveRequestSchema = z.object({
  status: z.enum(['Approved', 'Declined'] as const),
  comment: z.string().optional(),
});

// ---- WFH ----
export const createWfhRequestSchema = z.object({
  dates: z.array(z.string()).min(1),
  reason: z.string().min(1),
});

export const respondWfhRequestSchema = z.object({
  status: z.enum(['Approved', 'Declined'] as const),
  comment: z.string().optional(),
});

// ---- Lieu Leave ----
export const createLieuLeaveRequestSchema = z.object({
  otRecordIds: z.array(z.string()).min(1),
  requestedDate: z.string(),
  totalHours: z.number().positive(),
});

// ---- Salary ----
export const createSalaryRecordSchema = z.object({
  employeeId: z.string(),
  effectiveFrom: z.string(),
  basicSalary: z.number().positive(),
  allowances: z.array(z.object({ label: z.string(), amount: z.number() })).default([]),
  deductions: z.array(z.object({ label: z.string(), amount: z.number() })).default([]),
  bankName: z.string().min(1),
  bankBranch: z.string().min(1),
  bankAccountNo: z.string().min(1),
  epfPercentage: z.number().min(0).max(100).default(8),
  etfPercentage: z.number().min(0).max(100).default(3),
});

// ---- Document ----
export const createDocumentSchema = z.object({
  employeeId: z.string(),
  type: z.enum(DOCUMENT_TYPES),
  label: z.string().min(1),
});

// ---- Resignation ----
export const createResignationSchema = z.object({
  proposedLastWorkingDate: z.string(),
  reason: z.string().min(1),
});

export const respondResignationSchema = z.object({
  status: z.enum(['Accepted', 'Declined'] as const),
  comment: z.string().optional(),
});

// ---- Onboarding ----
export const createUpcomingJoinerSchema = z.object({
  staffId: z.string().min(1),
  nameInFull: z.string().min(1),
  joinDate: z.string(),
  designation: z.string().min(1),
  departmentCode: z.string().min(1),
});

// ---- Asset Request ----
export const createAssetRequestSchema = z.object({
  onboardingCaseId: z.string().nullable().default(null),
  requestedFor: z.string(),
  departmentCode: z.string(),
  items: z.array(z.object({
    label: z.string(),
    spec: z.string(),
    quantity: z.number().positive(),
    required: z.boolean(),
  })),
});

// ---- Purchase ----
export const respondPurchaseApprovalSchema = z.object({
  status: z.enum(['Approved', 'Rejected'] as const),
  comment: z.string().optional(),
});

export const updatePurchaseItemSchema = z.object({
  vendor: z.string().min(1),
  cost: z.number().positive(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string(),
});

// ---- Evaluation ----
export const createEvaluationTemplateSchema = z.object({
  name: z.string().min(1),
  targetType: z.enum(['Employee', 'HOD'] as const),
  criteria: z.array(z.object({
    name: z.string(),
    weight: z.number().positive(),
    questions: z.array(z.object({
      text: z.string(),
      weight: z.number().positive(),
      applicableTo: z.array(z.enum(EVALUATION_PILLARS)),
      hasComment: z.boolean().default(false),
    })),
  })),
  ratingScaleMin: z.number().default(1),
  ratingScaleMax: z.number().default(5),
});

export const createEvaluationCycleSchema = z.object({
  name: z.string().min(1),
  type: z.enum(EVALUATION_CYCLE_TYPES),
  templateId: z.string(),
  hodTemplateId: z.string().nullable().default(null),
  startDate: z.string(),
  deadline: z.string(),
  pillarWeights: z.object({
    self: z.number(),
    peer: z.number(),
    superior: z.number(),
  }).default({ self: 10, peer: 30, superior: 60 }),
  targetEmployeeIds: z.array(z.string()).nullable().default(null),
});

export const submitEvaluationResponseSchema = z.object({
  assignmentId: z.string(),
  criterionScores: z.array(z.object({
    criterionId: z.string(),
    questionScores: z.array(z.object({
      questionId: z.string(),
      score: z.number(),
      comment: z.string().nullable().default(null),
    })),
  })),
});

// ---- Attendance Punch ----
export const attendancePunchSchema = z.object({
  deviceId: z.string(),
  biometricId: z.string(),
  timestamp: z.string(),
  direction: z.enum(['in', 'out']).nullable().default(null),
});

export const attendancePunchBatchSchema = z.array(attendancePunchSchema);

// ---- Settings ----
export const updateSettingsSchema = z.object({
  graceMinutes: z.number().min(0).optional(),
  standardWorkingHoursPerDay: z.number().min(1).optional(),
  otThresholdMinutes: z.number().min(0).optional(),
  otRequiresApproval: z.boolean().optional(),
  maxLeaveRequestDays: z.number().min(1).optional(),
  defaultLeaveEntitlementDays: z.number().min(0).optional(),
  slaDefaults: z.record(z.number()).optional(),
  kpiWeights: z.record(z.number()).optional(),
  evaluationPillarWeights: z.record(z.number()).optional(),
  evaluatorBiasPenalties: z.record(z.number()).optional(),
  ratingScale: z.object({ min: z.number(), max: z.number() }).optional(),
  onboardingNotificationRecipients: z.array(z.string()).optional(),
  revokeAccessOn: z.enum(['acceptance', 'lastWorkingDay']).optional(),
  systemAdminEmails: z.array(z.string().email()).optional(),
});

// ---- Pagination ----
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
});
