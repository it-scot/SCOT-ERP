// ============================================================
// SCoT ERP — Seed Data Generator
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import { getStore, setStore, persistStore, loadStore } from './repositories/dataStore.js';
import type { DataStore } from './repositories/dataStore.js';
import { config } from './config.js';
import { format, subDays, subMonths, addDays } from 'date-fns';

function createEmptyStore(): DataStore {
  return {
    employees: {}, departments: {}, attendancePunches: {}, attendanceDays: {},
    leaveRequests: {}, leaveBalances: {}, wfhRequests: {}, overtimeRecords: {},
    lieuLeaveRequests: {}, salaryRecords: {}, payslips: {}, employeeDocuments: {},
    notifications: {}, emailLogs: {}, tasks: {}, auditLogs: {},
    onboardingCases: {}, onboardingSteps: {}, assetTemplates: {}, assetRequests: {},
    purchaseApprovals: {}, purchaseItems: {}, inventoryItems: {}, assetAssignments: {},
    resignationCases: {}, handoverEvents: {}, exitEvaluations: {}, serviceLetterRequests: {},
    evaluationTemplates: {}, evaluationCycles: {}, evaluationAssignments: {},
    evaluationResponses: {}, evaluationResults: {}, kpiSnapshots: {}, kpiConfig: null,
    publicHolidays: {}, calendarEvents: {}, shiftAssignments: {}, settings: null,
  };
}

const now = new Date();
const iso = (d: Date) => d.toISOString();

function id(): string { return uuidv4(); }

// ---- Sri Lankan Names ----
const sriLankanNames = [
  { full: 'Kasun Rajapaksa', preferred: 'Kasun', title: 'Mr' as const },
  { full: 'Nimal Perera', preferred: 'Nimal', title: 'Mr' as const },
  { full: 'Samantha Silva', preferred: 'Samantha', title: 'Ms' as const },
  { full: 'Dilshan Fernando', preferred: 'Dilshan', title: 'Mr' as const },
  { full: 'Chaminda Jayawardena', preferred: 'Chaminda', title: 'Mr' as const },
  { full: 'Lakshmi De Silva', preferred: 'Lakshmi', title: 'Ms' as const },
  { full: 'Ruwan Bandara', preferred: 'Ruwan', title: 'Mr' as const },
  { full: 'Anjali Wickramasinghe', preferred: 'Anjali', title: 'Ms' as const },
  { full: 'Pradeep Samaraweera', preferred: 'Pradeep', title: 'Mr' as const },
  { full: 'Hashini Gunaratne', preferred: 'Hashini', title: 'Ms' as const },
  { full: 'Tharindu Senaratne', preferred: 'Tharindu', title: 'Mr' as const },
  { full: 'Sachini Karunaratne', preferred: 'Sachini', title: 'Ms' as const },
  { full: 'Dinesh Rathnayake', preferred: 'Dinesh', title: 'Mr' as const },
  { full: 'Nipuni Ranasinghe', preferred: 'Nipuni', title: 'Ms' as const },
  { full: 'Buddhika Dissanayake', preferred: 'Buddhika', title: 'Mr' as const },
  { full: 'Sanduni Gamage', preferred: 'Sanduni', title: 'Ms' as const },
  { full: 'Asanka Ekanayake', preferred: 'Asanka', title: 'Mr' as const },
  { full: 'Dilani Abeysekara', preferred: 'Dilani', title: 'Ms' as const },
  { full: 'Ishan Liyanage', preferred: 'Ishan', title: 'Mr' as const },
  { full: 'Kavindi Amarasinghe', preferred: 'Kavindi', title: 'Ms' as const },
  { full: 'Roshan Weerasinghe', preferred: 'Roshan', title: 'Mr' as const },
  { full: 'Hasitha Kumarasinghe', preferred: 'Hasitha', title: 'Mr' as const },
  { full: 'Madushi Herath', preferred: 'Madushi', title: 'Ms' as const },
  { full: 'Nuwan Jayasuriya', preferred: 'Nuwan', title: 'Mr' as const },
  { full: 'Shanika Pathirana', preferred: 'Shanika', title: 'Ms' as const },
  { full: 'Lasith Malinga', preferred: 'Lasith', title: 'Mr' as const },
  { full: 'Dewmi Siriwardena', preferred: 'Dewmi', title: 'Ms' as const },
  { full: 'Janith Weerakoon', preferred: 'Janith', title: 'Mr' as const },
  { full: 'Rashmi Tennakoon', preferred: 'Rashmi', title: 'Ms' as const },
  { full: 'Supun Fonseka', preferred: 'Supun', title: 'Mr' as const },
  { full: 'Nethmi Wijesooriya', preferred: 'Nethmi', title: 'Ms' as const },
  { full: 'Hirantha Gunasekara', preferred: 'Hirantha', title: 'Mr' as const },
  { full: 'Dulani Madushan', preferred: 'Dulani', title: 'Ms' as const },
  { full: 'Chamara Kapugedera', preferred: 'Chamara', title: 'Mr' as const },
  { full: 'Ishara Nanayakkara', preferred: 'Ishara', title: 'Ms' as const },
  { full: 'Mahela Jayaratne', preferred: 'Mahela', title: 'Mr' as const },
  { full: 'Gayan Senanayake', preferred: 'Gayan', title: 'Mr' as const },
  { full: 'Tharushi Mendis', preferred: 'Tharushi', title: 'Ms' as const },
  { full: 'Sadun Weerasooriya', preferred: 'Sadun', title: 'Mr' as const },
  { full: 'Chathurika Jayamanne', preferred: 'Chathurika', title: 'Ms' as const },
  { full: 'Amitha Ratnayake', preferred: 'Amitha', title: 'Mr' as const },
  { full: 'Eranga Desilva', preferred: 'Eranga', title: 'Mr' as const },
  { full: 'Thilini Cooray', preferred: 'Thilini', title: 'Ms' as const },
  { full: 'Ravindra Pushpakumara', preferred: 'Ravindra', title: 'Mr' as const },
  { full: 'Madara Sugathadasa', preferred: 'Madara', title: 'Ms' as const },
  { full: 'Kavindu Hapuarachchi', preferred: 'Kavindu', title: 'Mr' as const },
  { full: 'Senuri Dahanayake', preferred: 'Senuri', title: 'Ms' as const },
  { full: 'Pasindu Gunathilake', preferred: 'Pasindu', title: 'Mr' as const },
  { full: 'Sasini Peris', preferred: 'Sasini', title: 'Ms' as const },
  { full: 'Vimukthi Karunathilake', preferred: 'Vimukthi', title: 'Mr' as const },
  { full: 'Ashan Priyadarshana', preferred: 'Ashan', title: 'Mr' as const },
  { full: 'Thanuja Mudalige', preferred: 'Thanuja', title: 'Ms' as const },
  { full: 'Sahan Kumara', preferred: 'Sahan', title: 'Mr' as const },
  { full: 'Dilhani Perera', preferred: 'Dilhani', title: 'Ms' as const },
  { full: 'Akalanka Ganegoda', preferred: 'Akalanka', title: 'Mr' as const },
  { full: 'Hansika Munasinghe', preferred: 'Hansika', title: 'Ms' as const },
  { full: 'Malintha Wickremarachchi', preferred: 'Malintha', title: 'Mr' as const },
  { full: 'Pawani Jayathilaka', preferred: 'Pawani', title: 'Ms' as const },
  { full: 'Damith Abeyratne', preferred: 'Damith', title: 'Mr' as const },
  { full: 'Imasha Hewage', preferred: 'Imasha', title: 'Ms' as const },
  { full: 'Sandaruwan Fernando', preferred: 'Sandaruwan', title: 'Mr' as const },
  { full: 'Gayathri Dissanayake', preferred: 'Gayathri', title: 'Ms' as const },
  { full: 'Dhananjaya Lakshan', preferred: 'Dhananjaya', title: 'Mr' as const },
  { full: 'Udeshika Waduge', preferred: 'Udeshika', title: 'Ms' as const },
  { full: 'Isuru Udayanga', preferred: 'Isuru', title: 'Mr' as const },
  { full: 'Manisha Rajapakse', preferred: 'Manisha', title: 'Ms' as const },
  { full: 'Shehan Madusanka', preferred: 'Shehan', title: 'Mr' as const },
  { full: 'Oshadi Wimalasooriya', preferred: 'Oshadi', title: 'Ms' as const },
  { full: 'Ravindu Perera', preferred: 'Ravindu', title: 'Mr' as const },
  { full: 'Harshi Jayakody', preferred: 'Harshi', title: 'Ms' as const },
  { full: 'Thisara Perera', preferred: 'Thisara', title: 'Mr' as const },
  { full: 'Malini Fonseka', preferred: 'Malini', title: 'Ms' as const },
  { full: 'Upul Tharanga', preferred: 'Upul', title: 'Mr' as const },
  { full: 'Renuka Herath', preferred: 'Renuka', title: 'Ms' as const },
  { full: 'Nadeesha Ranaweera', preferred: 'Nadeesha', title: 'Ms' as const },
  { full: 'Charith Asalanka', preferred: 'Charith', title: 'Mr' as const },
  { full: 'Vishwa Vithanage', preferred: 'Vishwa', title: 'Mr' as const },
  { full: 'Minoli Rajapaksha', preferred: 'Minoli', title: 'Ms' as const },
  { full: 'Pathum Nissanka', preferred: 'Pathum', title: 'Mr' as const },
  { full: 'Chathumini Jayasekera', preferred: 'Chathumini', title: 'Ms' as const },
  { full: 'Dimuth Karunaratne', preferred: 'Dimuth', title: 'Mr' as const },
  { full: 'Rashmika Kodithuwakku', preferred: 'Rashmika', title: 'Ms' as const },
  { full: 'Kusal Perera', preferred: 'Kusal', title: 'Mr' as const },
  { full: 'Sachithra Senanayake', preferred: 'Sachithra', title: 'Ms' as const },
  { full: 'Angelo Mathews', preferred: 'Angelo', title: 'Mr' as const },
  { full: 'Chamari Athapaththu', preferred: 'Chamari', title: 'Ms' as const },
  { full: 'Dasun Shanaka', preferred: 'Dasun', title: 'Mr' as const },
  { full: 'Ama De Silva', preferred: 'Ama', title: 'Ms' as const },
  { full: 'Lahiru Kumara', preferred: 'Lahiru', title: 'Mr' as const },
  { full: 'Inoka Ranaweera', preferred: 'Inoka', title: 'Ms' as const },
  { full: 'Dushmantha Chameera', preferred: 'Dushmantha', title: 'Mr' as const },
  { full: 'Nilmini Tennakoon', preferred: 'Nilmini', title: 'Ms' as const },
  { full: 'Wanindu Hasaranga', preferred: 'Wanindu', title: 'Mr' as const },
  { full: 'Sithara Hapuarachchi', preferred: 'Sithara', title: 'Ms' as const },
  { full: 'Maheesh Theekshana', preferred: 'Maheesh', title: 'Mr' as const },
  { full: 'Kavisha Dilhari', preferred: 'Kavisha', title: 'Ms' as const },
  { full: 'Bhanuka Rajapaksa', preferred: 'Bhanuka', title: 'Mr' as const },
  { full: 'Harshitha Samarawickrama', preferred: 'Harshitha', title: 'Ms' as const },
  { full: 'Avishka Fernando', preferred: 'Avishka', title: 'Mr' as const },
  { full: 'Udeni Wickramasiri', preferred: 'Udeni', title: 'Ms' as const },
  { full: 'Dunith Wellalage', preferred: 'Dunith', title: 'Mr' as const },
  { full: 'Priyanwada Kumari', preferred: 'Priyanwada', title: 'Ms' as const },
  { full: 'Kamindu Mendis', preferred: 'Kamindu', title: 'Mr' as const },
  { full: 'Vindya Kumaratunga', preferred: 'Vindya', title: 'Ms' as const },
  { full: 'Asitha Fernando', preferred: 'Asitha', title: 'Mr' as const },
  { full: 'Nayomi Hansini', preferred: 'Nayomi', title: 'Ms' as const },
  { full: 'Ramesh Mendis', preferred: 'Ramesh', title: 'Mr' as const },
  { full: 'Geethika Rajapaksha', preferred: 'Geethika', title: 'Ms' as const },
  { full: 'Thilina Kandamby', preferred: 'Thilina', title: 'Mr' as const },
  { full: 'Sandali Kumari', preferred: 'Sandali', title: 'Ms' as const },
  { full: 'Suranga Lakmal', preferred: 'Suranga', title: 'Mr' as const },
  { full: 'Dinusha Gunawardena', preferred: 'Dinusha', title: 'Ms' as const },
];

function generateNic(): string {
  // Generate old format NIC
  const num = Math.floor(100000000 + Math.random() * 900000000);
  return `${num}V`;
}

function generatePhone(): string {
  const prefixes = ['071', '072', '075', '076', '077', '078'];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${Math.floor(1000000 + Math.random() * 9000000)}`;
}

async function seed() {
  console.log('🌱 Seeding SCoT ERP demo data...');
  const store = createEmptyStore();
  setStore(store);

  const nowStr = iso(now);

  // ---- Departments ----
  const departments = [
    { code: 'BM', name: 'Business Management' },
    { code: 'IT', name: 'Information Technology' },
    { code: 'HR', name: 'Human Resources' },
    { code: 'ADMIN', name: 'Administration' },
    { code: 'COO', name: 'Executive Office' },
    { code: 'FIN', name: 'Finance' },
    { code: 'SA', name: 'Student Affairs' },
    { code: 'ENG', name: 'Engineering' },
  ];

  // We'll set HOD after creating employees
  for (const d of departments) {
    const deptId = id();
    store.departments[deptId] = {
      id: deptId, code: d.code, name: d.name, hodStaffId: null,
      createdAt: nowStr, updatedAt: nowStr,
    };
  }

  // ---- Employees ----
  let nameIdx = 0;
  const employeeIds: Record<string, string> = {}; // staffId -> id
  const employeeMap: Record<string, any> = {}; // id -> employee

  function createEmployee(overrides: any) {
    const n = sriLankanNames[nameIdx++] || { full: `Employee ${nameIdx}`, preferred: `Emp${nameIdx}`, title: 'Mr' as const };
    const empId = id();
    const staffId = overrides.staffId || String(nameIdx).padStart(3, '0');
    const email = overrides.email || `${n.preferred.toLowerCase()}@scot.lk`;
    const emp = {
      id: empId,
      staffId,
      status: 'Active' as const,
      cadreLevel: overrides.cadreLevel || 'Level 3',
      title: overrides.title || n.title,
      nameInFull: overrides.nameInFull || n.full,
      preferredName: overrides.preferredName || n.preferred,
      designation: overrides.designation || 'Lecturer - Grade II',
      departmentCode: overrides.departmentCode || 'BM',
      dateJoined: overrides.dateJoined || format(subMonths(now, Math.floor(Math.random() * 36) + 6), 'yyyy-MM-dd'),
      userRole: overrides.userRole || ['Employee'],
      supervisorStaffId: overrides.supervisorStaffId || null,
      cvFileId: null,
      photoUrl: null,
      dateOfBirth: format(subDays(now, Math.floor(Math.random() * 10000) + 8000), 'yyyy-MM-dd'),
      maritalStatus: Math.random() > 0.5 ? 'Married' : 'Single',
      nic: generateNic(),
      contactNumber: generatePhone(),
      email,
      address: `No. ${Math.floor(Math.random() * 200) + 1}, ${['Galle Road, Colombo', 'Kandy Road, Peradeniya', 'Main Street, Nugegoda', 'Park Road, Dehiwala', 'Temple Road, Maharagama'][Math.floor(Math.random() * 5)]}`,
      personalEmail: `${n.preferred.toLowerCase()}${Math.floor(Math.random() * 99)}@gmail.com`,
      emergencyContactName: sriLankanNames[(nameIdx + 50) % sriLankanNames.length]?.full || 'Emergency Contact',
      emergencyContactRelationship: ['Spouse', 'Parent', 'Sibling'][Math.floor(Math.random() * 3)],
      emergencyContactMobile: generatePhone(),
      emergencyContactAddress: 'Same as above',
      employeeCategory: overrides.employeeCategory || 'Academic',
      biometricId: staffId,
      shiftPatternId: overrides.shiftPatternId || 'mon-sat',
      timeSlotId: overrides.timeSlotId || 'slot-0830-1730',
      leaveEntitlementHours: 112, // 14 * 8
      probationEndDate: overrides.probationEndDate || null,
      lastWorkingDate: overrides.lastWorkingDate || null,
      createdAt: nowStr,
      updatedAt: nowStr,
      ...overrides,
      id: empId,
    };
    store.employees[empId] = emp;
    employeeIds[staffId] = empId;
    employeeMap[empId] = emp;
    return emp;
  }

  // ---- Special Accounts ----
  // COO - Yohan
  const coo = createEmployee({
    staffId: '001', email: 'yohan@scot.lk', nameInFull: 'Yohan Samarasekara', preferredName: 'Yohan',
    designation: 'Chief Operating Officer', departmentCode: 'COO', cadreLevel: 'Level 1',
    userRole: ['Employee', 'COO'], employeeCategory: 'Non-Academic', title: 'Mr',
    dateJoined: format(subMonths(now, 48), 'yyyy-MM-dd'),
  });

  // HR Manager
  const hrManager = createEmployee({
    staffId: '002', email: 'hr@scot.lk', nameInFull: 'Nimal Perera', preferredName: 'Nimal',
    designation: 'HR Manager', departmentCode: 'HR', cadreLevel: 'Level 2',
    userRole: ['Employee', 'HR'], employeeCategory: 'Non-Academic', title: 'Mr',
    supervisorStaffId: '001', dateJoined: format(subMonths(now, 36), 'yyyy-MM-dd'),
  });

  // IT Manager
  const itManager = createEmployee({
    staffId: '003', email: 'it@scot.lk', nameInFull: 'Samantha Silva', preferredName: 'Samantha',
    designation: 'IT Manager', departmentCode: 'IT', cadreLevel: 'Level 2',
    userRole: ['Employee', 'IT'], employeeCategory: 'Non-Academic', title: 'Ms',
    supervisorStaffId: '001', dateJoined: format(subMonths(now, 36), 'yyyy-MM-dd'),
  });

  // Admin Department
  const adminManager = createEmployee({
    staffId: '004', email: 'admin@scot.lk', nameInFull: 'Dilshan Fernando', preferredName: 'Dilshan',
    designation: 'Administration Manager', departmentCode: 'ADMIN', cadreLevel: 'Level 2',
    userRole: ['Employee', 'Admin'], employeeCategory: 'Non-Academic', title: 'Mr',
    supervisorStaffId: '001', dateJoined: format(subMonths(now, 30), 'yyyy-MM-dd'),
  });

  // ---- HODs ----
  const hodBM = createEmployee({
    staffId: '010', nameInFull: 'Chaminda Jayawardena', preferredName: 'Chaminda',
    designation: 'Head of Department - BM', departmentCode: 'BM', cadreLevel: 'Level 2',
    userRole: ['Employee', 'HOD'], employeeCategory: 'Academic', title: 'Dr',
    supervisorStaffId: '001', email: 'chaminda@scot.lk',
    dateJoined: format(subMonths(now, 30), 'yyyy-MM-dd'),
  });

  const hodIT = createEmployee({
    staffId: '011', nameInFull: 'Lakshmi De Silva', preferredName: 'Lakshmi',
    designation: 'Head of Department - IT', departmentCode: 'IT', cadreLevel: 'Level 2',
    userRole: ['Employee', 'HOD'], employeeCategory: 'Academic', title: 'Dr',
    supervisorStaffId: '001', email: 'lakshmi@scot.lk',
    dateJoined: format(subMonths(now, 24), 'yyyy-MM-dd'),
  });

  const hodFIN = createEmployee({
    staffId: '012', nameInFull: 'Ruwan Bandara', preferredName: 'Ruwan',
    designation: 'Head of Department - Finance', departmentCode: 'FIN', cadreLevel: 'Level 2',
    userRole: ['Employee', 'HOD'], employeeCategory: 'Non-Academic', title: 'Mr',
    supervisorStaffId: '001', email: 'ruwan@scot.lk',
    dateJoined: format(subMonths(now, 20), 'yyyy-MM-dd'),
  });

  const hodENG = createEmployee({
    staffId: '013', nameInFull: 'Anjali Wickramasinghe', preferredName: 'Anjali',
    designation: 'Head of Department - Engineering', departmentCode: 'ENG', cadreLevel: 'Level 2',
    userRole: ['Employee', 'HOD'], employeeCategory: 'Academic', title: 'Dr',
    supervisorStaffId: '001', email: 'anjali@scot.lk',
    dateJoined: format(subMonths(now, 18), 'yyyy-MM-dd'),
  });

  const hodSA = createEmployee({
    staffId: '014', nameInFull: 'Pradeep Samaraweera', preferredName: 'Pradeep',
    designation: 'Head of Department - Student Affairs', departmentCode: 'SA', cadreLevel: 'Level 2',
    userRole: ['Employee', 'HOD'], employeeCategory: 'Non-Academic', title: 'Mr',
    supervisorStaffId: '001', email: 'pradeep@scot.lk',
    dateJoined: format(subMonths(now, 16), 'yyyy-MM-dd'),
  });

  // Update departments with HODs
  for (const dept of Object.values(store.departments)) {
    const d = dept as any;
    if (d.code === 'BM') d.hodStaffId = '010';
    else if (d.code === 'IT') d.hodStaffId = '011';
    else if (d.code === 'HR') d.hodStaffId = '002';
    else if (d.code === 'ADMIN') d.hodStaffId = '004';
    else if (d.code === 'COO') d.hodStaffId = '001';
    else if (d.code === 'FIN') d.hodStaffId = '012';
    else if (d.code === 'SA') d.hodStaffId = '014';
    else if (d.code === 'ENG') d.hodStaffId = '013';
  }

  // ---- Regular employees per department ----
  const deptDistribution: Record<string, { count: number; desigs: string[]; category: string; hodStaffId: string; slots: string[] }> = {
    BM: { count: 20, desigs: ['Lecturer - Grade I', 'Lecturer - Grade II', 'Senior Lecturer', 'Instructor'], category: 'Academic', hodStaffId: '010', slots: ['slot-0830-1730', 'slot-0900-1800'] },
    IT: { count: 15, desigs: ['Systems Administrator', 'IT Support Officer', 'Network Engineer', 'Software Developer', 'Lecturer - Grade II'], category: 'Academic', hodStaffId: '011', slots: ['slot-0830-1730', 'slot-0800-1700'] },
    HR: { count: 5, desigs: ['HR Executive', 'HR Assistant', 'Recruitment Officer'], category: 'Non-Academic', hodStaffId: '002', slots: ['slot-0830-1730'] },
    ADMIN: { count: 8, desigs: ['Admin Executive', 'Admin Assistant', 'Procurement Officer', 'Office Coordinator'], category: 'Non-Academic', hodStaffId: '004', slots: ['slot-0800-1700'] },
    FIN: { count: 8, desigs: ['Accountant', 'Finance Executive', 'Audit Officer', 'Cashier'], category: 'Non-Academic', hodStaffId: '012', slots: ['slot-0830-1730'] },
    SA: { count: 6, desigs: ['Student Counselor', 'Registrar Assistant', 'Admissions Officer'], category: 'Non-Academic', hodStaffId: '014', slots: ['slot-0830-1730'] },
    ENG: { count: 18, desigs: ['Lecturer - Grade I', 'Lecturer - Grade II', 'Senior Lecturer', 'Lab Instructor', 'Workshop Instructor'], category: 'Academic', hodStaffId: '013', slots: ['slot-0830-1730', 'slot-0900-1800'] },
  };

  // Track supervisors for each department
  const deptSupervisors: Record<string, string[]> = {};

  for (const [deptCode, conf] of Object.entries(deptDistribution)) {
    const supervisorCandidates: string[] = [];

    for (let i = 0; i < conf.count; i++) {
      if (nameIdx >= sriLankanNames.length) break;
      const n = sriLankanNames[nameIdx];
      const staffIdNum = String(100 + Object.keys(employeeIds).length);
      const isSuper = i < 2; // first 2 per dept are supervisors
      const shiftPattern = i % 3 === 0 ? 'thu-mon' : 'mon-sat';

      const emp = createEmployee({
        staffId: staffIdNum,
        designation: conf.desigs[i % conf.desigs.length],
        departmentCode: deptCode,
        employeeCategory: conf.category as any,
        supervisorStaffId: isSuper ? conf.hodStaffId : (supervisorCandidates[0] || conf.hodStaffId),
        shiftPatternId: shiftPattern,
        timeSlotId: conf.slots[i % conf.slots.length],
        email: `${n.preferred.toLowerCase()}@scot.lk`,
        userRole: isSuper ? ['Employee', 'Supervisor'] : ['Employee'],
        status: i === conf.count - 1 && deptCode === 'BM' ? 'Probation' : 'Active',
        probationEndDate: i === conf.count - 1 && deptCode === 'BM' ? format(addDays(now, 60), 'yyyy-MM-dd') : null,
      });

      if (isSuper) {
        supervisorCandidates.push(emp.staffId);
      }
    }

    deptSupervisors[deptCode] = supervisorCandidates;
  }

  // ---- Single-person department (to demo Nil peer) ----
  // Already have COO dept with just Yohan — that works for the peer-nil demo

  // ---- Onboarding employee (Thusitha) ----
  const thusitha = createEmployee({
    staffId: '173',
    nameInFull: 'Thusitha Dissanayaka',
    preferredName: 'Thusitha',
    designation: 'Lecturer - Grade II',
    departmentCode: 'BM',
    status: 'Onboarding',
    employeeCategory: 'Academic',
    email: 'thusitha@scot.lk',
    dateJoined: '2026-10-08',
    supervisorStaffId: '010',
    title: 'Mr',
  });

  // Create onboarding case for Thusitha
  const onboardingId = id();
  store.onboardingCases[onboardingId] = {
    id: onboardingId,
    employeeId: thusitha.id,
    joinDate: '2026-10-08',
    designation: 'Lecturer - Grade II',
    departmentCode: 'BM',
    status: 'In Progress',
    steps: [],
    createdAt: nowStr,
    updatedAt: nowStr,
  };

  // ---- Resignation case employee ----
  // Find an employee in BM dept
  const bmEmployees = Object.values(store.employees).filter((e: any) => e.departmentCode === 'BM' && e.status === 'Active' && e.staffId !== '010') as any[];
  if (bmEmployees.length > 2) {
    const resignee = bmEmployees[2];
    resignee.status = 'Notice Period';
    resignee.lastWorkingDate = format(addDays(now, 30), 'yyyy-MM-dd');
    store.employees[resignee.id] = resignee;

    const resignationId = id();
    store.resignationCases[resignationId] = {
      id: resignationId,
      employeeId: resignee.id,
      proposedLastWorkingDate: format(addDays(now, 30), 'yyyy-MM-dd'),
      reason: 'Pursuing opportunities abroad',
      hodId: hodBM.id,
      hodStatus: 'Approved',
      hodComment: 'Best wishes',
      hodRespondedAt: iso(subDays(now, 5)),
      handoverDate: format(addDays(now, 28), 'yyyy-MM-dd'),
      calendarEventId: null,
      itHandoverCompleted: false,
      itHandoverAt: null,
      exitEvaluationSubmitted: false,
      exitEvaluationAt: null,
      serviceLetterRequested: false,
      serviceLetterRequestedAt: null,
      serviceLetterFileId: null,
      serviceLetterUploadedAt: null,
      serviceLetterAccepted: false,
      serviceLetterAcceptedAt: null,
      status: 'Accepted',
      createdAt: iso(subDays(now, 7)),
      updatedAt: nowStr,
    };
  }

  // ---- Public Holidays (Sri Lankan 2026 placeholders) ----
  const holidays2026 = [
    { date: '2026-01-14', name: 'Tamil Thai Pongal Day' },
    { date: '2026-01-15', name: 'Duruthu Full Moon Poya Day' },
    { date: '2026-02-04', name: 'Independence Day' },
    { date: '2026-02-13', name: 'Navam Full Moon Poya Day' },
    { date: '2026-03-15', name: 'Medin Full Moon Poya Day' },
    { date: '2026-04-13', name: 'Day prior to Sinhala/Tamil New Year' },
    { date: '2026-04-14', name: 'Sinhala/Tamil New Year' },
    { date: '2026-04-14', name: 'Bak Full Moon Poya Day' },
    { date: '2026-05-01', name: 'May Day' },
    { date: '2026-05-13', name: 'Vesak Full Moon Poya Day' },
    { date: '2026-05-14', name: 'Day following Vesak' },
    { date: '2026-06-12', name: 'Poson Full Moon Poya Day' },
    { date: '2026-07-11', name: 'Esala Full Moon Poya Day' },
    { date: '2026-08-10', name: 'Nikini Full Moon Poya Day' },
    { date: '2026-09-08', name: 'Binara Full Moon Poya Day' },
    { date: '2026-10-08', name: 'Vap Full Moon Poya Day' },
    { date: '2026-10-20', name: 'Deepavali' },
    { date: '2026-11-06', name: 'Il Full Moon Poya Day' },
    { date: '2026-12-06', name: 'Unduvap Full Moon Poya Day' },
    { date: '2026-12-25', name: 'Christmas Day' },
  ];

  for (const h of holidays2026) {
    const hId = id();
    store.publicHolidays[hId] = {
      id: hId, date: h.date, name: h.name, isRecurring: false,
      createdAt: nowStr, updatedAt: nowStr,
    };
  }

  // ---- Asset Templates ----
  const academicTemplateId = id();
  store.assetTemplates[academicTemplateId] = {
    id: academicTemplateId,
    name: 'Academic Staff Standard',
    category: 'Academic',
    items: [
      { id: id(), label: 'Processor', spec: 'i5 (4 physical cores)', quantity: 1, required: true },
      { id: id(), label: 'RAM', spec: '16 GB single DIMM', quantity: 1, required: true },
      { id: id(), label: 'Dedicated Graphics', spec: 'No', quantity: 1, required: false },
      { id: id(), label: 'Storage', spec: '512 GB NVMe', quantity: 1, required: true },
      { id: id(), label: 'Display', spec: 'FHD', quantity: 1, required: true },
      { id: id(), label: 'Keyboard & Mouse', spec: 'Logitech wireless', quantity: 1, required: true },
      { id: id(), label: 'Monitor', spec: '22-24 inch, FHD 1920p, HDMI with cable', quantity: 1, required: true },
      { id: id(), label: 'Headset', spec: 'Yes', quantity: 1, required: true },
    ],
    createdAt: nowStr,
    updatedAt: nowStr,
  };

  const nonAcademicTemplateId = id();
  store.assetTemplates[nonAcademicTemplateId] = {
    id: nonAcademicTemplateId,
    name: 'Non-Academic Staff Standard',
    category: 'Non-Academic',
    items: [
      { id: id(), label: 'Processor', spec: 'i3 (2 cores)', quantity: 1, required: true },
      { id: id(), label: 'RAM', spec: '8 GB', quantity: 1, required: true },
      { id: id(), label: 'Storage', spec: '256 GB SSD', quantity: 1, required: true },
      { id: id(), label: 'Display', spec: 'HD', quantity: 1, required: true },
      { id: id(), label: 'Keyboard & Mouse', spec: 'USB wired', quantity: 1, required: true },
      { id: id(), label: 'Monitor', spec: '19-21 inch, HD', quantity: 1, required: false },
    ],
    createdAt: nowStr,
    updatedAt: nowStr,
  };

  // ---- Some IT Inventory ----
  const stockItems = [
    { name: 'Dell Latitude 5540', spec: 'i5-1345U, 16GB, 512GB NVMe, FHD', serial: 'DL5540-001', status: 'In Stock', category: 'Laptop' },
    { name: 'Dell Latitude 5540', spec: 'i5-1345U, 16GB, 512GB NVMe, FHD', serial: 'DL5540-002', status: 'Allocated', category: 'Laptop' },
    { name: 'HP ProDesk 400 G9', spec: 'i3-12100, 8GB, 256GB SSD', serial: 'HP400-001', status: 'In Stock', category: 'Desktop' },
    { name: 'Logitech MK270', spec: 'Wireless keyboard & mouse combo', serial: 'LMK270-001', status: 'In Stock', category: 'Peripheral' },
    { name: 'Dell P2422H', spec: '24 inch, FHD, HDMI', serial: 'DP2422-001', status: 'In Stock', category: 'Monitor' },
    { name: 'Dell P2422H', spec: '24 inch, FHD, HDMI', serial: 'DP2422-002', status: 'In Stock', category: 'Monitor' },
    { name: 'Jabra Evolve2 30', spec: 'USB-C, Stereo', serial: 'JE230-001', status: 'In Stock', category: 'Headset' },
  ];

  for (const item of stockItems) {
    const itemId = id();
    store.inventoryItems[itemId] = {
      id: itemId, name: item.name, spec: item.spec, serialNumber: item.serial,
      status: item.status, assignedTo: null, assignedAt: null, category: item.category,
      notes: '', createdAt: nowStr, updatedAt: nowStr,
    };
  }

  // ---- Leave Balances ----
  const year = now.getFullYear();
  for (const emp of Object.values(store.employees) as any[]) {
    if (['Active', 'Probation', 'Notice Period'].includes(emp.status)) {
      const used = Math.floor(Math.random() * 40); // 0-40 hours used
      const pending = Math.floor(Math.random() * 16);
      const key = `${emp.id}_${year}`;
      store.leaveBalances[key] = {
        employeeId: emp.id, year,
        allocatedHours: emp.leaveEntitlementHours || 112,
        usedHours: used, pendingHours: pending,
        remainingHours: (emp.leaveEntitlementHours || 112) - used - pending,
        lieuHoursAccrued: Math.floor(Math.random() * 8),
        lieuHoursUsed: 0,
      };
    }
  }

  // ---- Sample Leave Requests ----
  const activeEmps = (Object.values(store.employees) as any[]).filter((e) => e.status === 'Active');
  for (let i = 0; i < 20; i++) {
    const emp = activeEmps[i % activeEmps.length];
    const statuses = ['Approved', 'Approved', 'Approved', 'Pending', 'Declined'] as const;
    const leaveDate = format(subDays(now, Math.floor(Math.random() * 60)), 'yyyy-MM-dd');
    const reqId = id();
    store.leaveRequests[reqId] = {
      id: reqId, employeeId: emp.id, type: 'Full Day',
      startDate: leaveDate, endDate: leaveDate,
      startTime: null, endTime: null, dates: [leaveDate],
      totalHours: 8, reason: ['Personal', 'Family event', 'Medical', 'Travel'][Math.floor(Math.random() * 4)],
      status: statuses[i % statuses.length],
      supervisorId: emp.supervisorStaffId ? employeeIds[emp.supervisorStaffId] || '' : '',
      supervisorComment: statuses[i % statuses.length] === 'Declined' ? 'Insufficient coverage' : null,
      respondedAt: statuses[i % statuses.length] !== 'Pending' ? iso(subDays(now, Math.floor(Math.random() * 3))) : null,
      isBackdated: false, backdateReason: null,
      createdAt: iso(subDays(now, Math.floor(Math.random() * 65))),
      updatedAt: nowStr,
    };
  }

  // ---- Sample Salary Records ----
  for (const emp of activeEmps.slice(0, 30)) {
    const salId = id();
    const basic = 50000 + Math.floor(Math.random() * 150000);
    store.salaryRecords[salId] = {
      id: salId, employeeId: emp.id,
      effectiveFrom: emp.dateJoined, effectiveTo: null,
      basicSalary: basic,
      allowances: [
        { label: 'Transport', amount: 5000 },
        { label: 'Research', amount: emp.employeeCategory === 'Academic' ? 10000 : 0 },
      ],
      deductions: [
        { label: 'EPF Employee', amount: Math.round(basic * 0.08) },
      ],
      bankName: ['BOC', 'People\'s Bank', 'Commercial Bank', 'HNB'][Math.floor(Math.random() * 4)],
      bankBranch: 'Colombo',
      bankAccountNo: String(Math.floor(10000000 + Math.random() * 90000000)),
      epfPercentage: 8, etfPercentage: 3,
      grossSalary: basic + 15000,
      netSalary: basic + 15000 - Math.round(basic * 0.08),
      createdAt: nowStr, updatedAt: nowStr,
    };
  }

  // ---- Settings ----
  store.settings = {
    graceMinutes: 15,
    standardWorkingHoursPerDay: 8,
    otThresholdMinutes: 30,
    otRequiresApproval: false,
    maxLeaveRequestDays: 14,
    defaultLeaveEntitlementDays: 14,
    slaDefaults: {
      leaveApprovalMinutes: 480,
      sameDayLeaveMinutes: 60,
      hodAssetRequestMinutes: 960,
      itAdminReviewMinutes: 480,
      itPurchaseRequestMinutes: 480,
      cooPurchaseApprovalMinutes: 960,
      adminHandoverToITDaysBefore: 2,
      itSetupDaysBefore: 1,
      hrMonitoringMinutes: 480,
    },
    kpiWeights: { attendance: 30, evaluation: 35, responsiveness: 20, evaluatorReliability: 15 },
    evaluationPillarWeights: { self: 10, peer: 30, superior: 60 },
    evaluatorBiasPenalties: { harsh: -15, lenient: -5, straightLining: -5 },
    ratingScale: { min: 1, max: 5 },
    onboardingNotificationRecipients: ['it@scot.lk', 'admin@scot.lk', 'yohan@scot.lk'],
    revokeAccessOn: 'acceptance',
    systemAdminEmails: ['it@scot.lk', 'hr@scot.lk', 'yohan@scot.lk'],
  };

  // ---- Save ----
  persistStore();
  console.log(`  ✅ Created ${Object.keys(store.departments).length} departments`);
  console.log(`  ✅ Created ${Object.keys(store.employees).length} employees`);
  console.log(`  ✅ Created ${Object.keys(store.publicHolidays).length} public holidays`);
  console.log(`  ✅ Created ${Object.keys(store.leaveRequests).length} leave requests`);
  console.log(`  ✅ Created ${Object.keys(store.leaveBalances).length} leave balances`);
  console.log(`  ✅ Created ${Object.keys(store.salaryRecords).length} salary records`);
  console.log(`  ✅ Created ${Object.keys(store.inventoryItems).length} inventory items`);
  console.log(`  ✅ Created ${Object.keys(store.assetTemplates).length} asset templates`);
  console.log(`  ✅ Created 1 onboarding case (Thusitha)`);
  console.log(`  ✅ Created 1 resignation case`);
  console.log('\n🎉 Seed complete!\n');
  console.log('Demo accounts:');
  console.log('  COO:     yohan@scot.lk');
  console.log('  HR:      hr@scot.lk');
  console.log('  IT:      it@scot.lk');
  console.log('  Admin:   admin@scot.lk');
  console.log('  HOD BM:  chaminda@scot.lk');
  console.log('  HOD IT:  lakshmi@scot.lk');
  console.log('  Student: student1@student.scot.lk');

  // Wait for debounced write
  await new Promise((resolve) => setTimeout(resolve, 1000));
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
