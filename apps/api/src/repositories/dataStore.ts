// ============================================================
// SCoT ERP — Mock Data Store (JSON file persistence)
// ============================================================
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

export interface DataStore {
  employees: Record<string, any>;
  departments: Record<string, any>;
  attendancePunches: Record<string, any>;
  attendanceDays: Record<string, any>;
  leaveRequests: Record<string, any>;
  leaveBalances: Record<string, any>;
  wfhRequests: Record<string, any>;
  overtimeRecords: Record<string, any>;
  lieuLeaveRequests: Record<string, any>;
  salaryRecords: Record<string, any>;
  payslips: Record<string, any>;
  employeeDocuments: Record<string, any>;
  notifications: Record<string, any>;
  emailLogs: Record<string, any>;
  tasks: Record<string, any>;
  auditLogs: Record<string, any>;
  onboardingCases: Record<string, any>;
  onboardingSteps: Record<string, any>;
  assetTemplates: Record<string, any>;
  assetRequests: Record<string, any>;
  purchaseApprovals: Record<string, any>;
  purchaseItems: Record<string, any>;
  inventoryItems: Record<string, any>;
  assetAssignments: Record<string, any>;
  resignationCases: Record<string, any>;
  handoverEvents: Record<string, any>;
  exitEvaluations: Record<string, any>;
  serviceLetterRequests: Record<string, any>;
  evaluationTemplates: Record<string, any>;
  evaluationCycles: Record<string, any>;
  evaluationAssignments: Record<string, any>;
  evaluationResponses: Record<string, any>;
  evaluationResults: Record<string, any>;
  kpiSnapshots: Record<string, any>;
  kpiConfig: any;
  publicHolidays: Record<string, any>;
  calendarEvents: Record<string, any>;
  shiftAssignments: Record<string, any>;
  settings: any;
}

const STORE_FILE = path.join(config.data.dataDir, 'store.json');

let store: DataStore = createEmptyStore();

function createEmptyStore(): DataStore {
  return {
    employees: {},
    departments: {},
    attendancePunches: {},
    attendanceDays: {},
    leaveRequests: {},
    leaveBalances: {},
    wfhRequests: {},
    overtimeRecords: {},
    lieuLeaveRequests: {},
    salaryRecords: {},
    payslips: {},
    employeeDocuments: {},
    notifications: {},
    emailLogs: {},
    tasks: {},
    auditLogs: {},
    onboardingCases: {},
    onboardingSteps: {},
    assetTemplates: {},
    assetRequests: {},
    purchaseApprovals: {},
    purchaseItems: {},
    inventoryItems: {},
    assetAssignments: {},
    resignationCases: {},
    handoverEvents: {},
    exitEvaluations: {},
    serviceLetterRequests: {},
    evaluationTemplates: {},
    evaluationCycles: {},
    evaluationAssignments: {},
    evaluationResponses: {},
    evaluationResults: {},
    kpiSnapshots: {},
    kpiConfig: null,
    publicHolidays: {},
    calendarEvents: {},
    shiftAssignments: {},
    settings: null,
  };
}

export function getStore(): DataStore {
  return store;
}

export function setStore(newStore: DataStore) {
  store = newStore;
}

let saveTimeout: NodeJS.Timeout | null = null;

export function persistStore() {
  // Debounce writes to avoid excessive I/O
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const dir = path.dirname(STORE_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist store:', err);
    }
  }, 500);
}

export async function loadStore(): Promise<void> {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Merge with empty store to ensure all collections exist
      store = { ...createEmptyStore(), ...parsed };
      console.log('  ✅ Loaded data store from disk');
    } else {
      console.log('  ℹ️  No data store found. Run `npm run seed` to create demo data.');
      store = createEmptyStore();
    }
  } catch (err) {
    console.error('  ⚠️  Failed to load data store, starting fresh:', err);
    store = createEmptyStore();
  }
}

export function resetStore(): void {
  store = createEmptyStore();
  persistStore();
  console.log('  🗑️  Data store reset');
}
