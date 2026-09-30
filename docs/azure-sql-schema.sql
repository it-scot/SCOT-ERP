# SCoT ERP Azure SQL Schema

This file contains the T-SQL DDL for all entities in the SCoT ERP.
It is intended to be used when migrating from the `mock` data provider to `azuresql`.

```sql
-- 1. Reference Data & Settings
CREATE TABLE Departments (
    Code VARCHAR(10) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    HodStaffId VARCHAR(20) NULL
);

-- 2. Core Employee Data
CREATE TABLE Employees (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StaffId VARCHAR(20) UNIQUE NOT NULL,
    Status VARCHAR(50) NOT NULL, -- Active, Probation, Onboarding, Resigned, etc.
    CadreLevel VARCHAR(50) NOT NULL,
    Title VARCHAR(20) NOT NULL,
    NameInFull NVARCHAR(200) NOT NULL,
    PreferredName NVARCHAR(100) NOT NULL,
    Designation NVARCHAR(100) NOT NULL,
    DepartmentCode VARCHAR(10) REFERENCES Departments(Code),
    DateJoined DATE NOT NULL,
    SupervisorStaffId VARCHAR(20) NULL,
    DateOfBirth DATE NULL,
    MaritalStatus VARCHAR(20) NULL,
    NIC VARCHAR(20) UNIQUE NULL,
    ContactNumber VARCHAR(20) NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Address NVARCHAR(500) NULL,
    PersonalEmail VARCHAR(100) NULL,
    EmergencyContactName NVARCHAR(100) NULL,
    EmergencyContactRelationship VARCHAR(50) NULL,
    EmergencyContactMobile VARCHAR(20) NULL,
    EmergencyContactAddress NVARCHAR(500) NULL,
    
    -- System fields
    EmployeeCategory VARCHAR(50) NULL,
    BiometricId VARCHAR(50) NULL,
    LeaveEntitlementHours INT DEFAULT 112,
    ProbationEndDate DATE NULL,
    LastWorkingDate DATE NULL,
    
    -- Files
    PhotoUrl NVARCHAR(500) NULL,
    CvUrl NVARCHAR(500) NULL
);

-- Note: Employee UserRoles is a 1-to-many relationship
CREATE TABLE EmployeeRoles (
    EmployeeId UNIQUEIDENTIFIER REFERENCES Employees(Id),
    RoleName VARCHAR(50) NOT NULL,
    PRIMARY KEY (EmployeeId, RoleName)
);

-- 3. Attendance & Time Tracking
CREATE TABLE AttendancePunches (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EmployeeId UNIQUEIDENTIFIER REFERENCES Employees(Id),
    DeviceId VARCHAR(50) NULL,
    PunchTime DATETIME NOT NULL,
    Direction VARCHAR(10) NULL -- IN/OUT
);

CREATE TABLE AttendanceDays (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EmployeeId UNIQUEIDENTIFIER REFERENCES Employees(Id),
    RecordDate DATE NOT NULL,
    FirstPunch DATETIME NULL,
    LastPunch DATETIME NULL,
    WorkedHours DECIMAL(5,2) DEFAULT 0,
    OtHours DECIMAL(5,2) DEFAULT 0,
    LateMinutes INT DEFAULT 0,
    Status VARCHAR(100) NOT NULL, -- Present, Absent, Late, Present - WFH, etc.
    CONSTRAINT UQ_Employee_Date UNIQUE (EmployeeId, RecordDate)
);

-- 4. Leave & Requests
CREATE TABLE LeaveRequests (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EmployeeId UNIQUEIDENTIFIER REFERENCES Employees(Id),
    Type VARCHAR(50) NOT NULL, -- Annual, Half, Short, Lieu
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Hours DECIMAL(5,2) NOT NULL,
    Reason NVARCHAR(1000) NOT NULL,
    Status VARCHAR(50) NOT NULL, -- Pending, Approved, Declined, Cancelled
    ApproverId UNIQUEIDENTIFIER NULL REFERENCES Employees(Id),
    CreatedAt DATETIME DEFAULT GETUTCDATE()
);

-- 5. Tasks & SLA Engine
CREATE TABLE Tasks (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Type VARCHAR(50) NOT NULL,
    RefEntity VARCHAR(50) NOT NULL,
    RefId VARCHAR(50) NOT NULL,
    AssigneeUserId UNIQUEIDENTIFIER NULL REFERENCES Employees(Id),
    AssigneeDepartment VARCHAR(10) NULL REFERENCES Departments(Code),
    Title NVARCHAR(200) NOT NULL,
    Priority VARCHAR(20) DEFAULT 'Medium',
    Status VARCHAR(50) DEFAULT 'Open', -- Open, Done, Overdue, Cancelled
    SlaMinutes INT NOT NULL,
    DueAt DATETIME NOT NULL,
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    FirstViewedAt DATETIME NULL,
    CompletedAt DATETIME NULL,
    MonitoredBy UNIQUEIDENTIFIER NULL REFERENCES Employees(Id),
    MonitoredAt DATETIME NULL
);

-- 6. IT Inventory & Assets
CREATE TABLE InventoryItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(200) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    Spec NVARCHAR(1000) NULL,
    SerialNumber VARCHAR(100) UNIQUE NOT NULL,
    Status VARCHAR(50) DEFAULT 'In Stock', -- In Stock, Allocated, In Repair, Retired
    AssignedTo UNIQUEIDENTIFIER NULL REFERENCES Employees(Id),
    AssignedAt DATETIME NULL,
    Notes NVARCHAR(MAX) NULL
);

-- 7. Evaluations (360)
CREATE TABLE EvaluationCycles (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(200) NOT NULL,
    StartDate DATE NOT NULL,
    Deadline DATE NOT NULL,
    Status VARCHAR(50) DEFAULT 'Draft' -- Draft, Published, Closed, Results Released
);

CREATE TABLE EvaluationAssignments (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CycleId UNIQUEIDENTIFIER REFERENCES EvaluationCycles(Id),
    EvaluatorId UNIQUEIDENTIFIER REFERENCES Employees(Id),
    TargetId UNIQUEIDENTIFIER REFERENCES Employees(Id),
    Type VARCHAR(20) NOT NULL, -- Self, Peer, Superior
    Status VARCHAR(50) DEFAULT 'Pending', -- Pending, Completed
    Score DECIMAL(5,2) NULL,
    SubmittedAt DATETIME NULL
);

-- 8. KPI Snapshots
CREATE TABLE KpiSnapshots (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EmployeeId UNIQUEIDENTIFIER REFERENCES Employees(Id),
    Period VARCHAR(20) NOT NULL, -- e.g., '2026-M10' or '2026-Q3'
    TotalScore DECIMAL(5,2) NOT NULL,
    Band VARCHAR(50) NOT NULL,
    AttendanceScore DECIMAL(5,2) NOT NULL,
    EvaluationScore DECIMAL(5,2) NOT NULL,
    TaskTimelinessScore DECIMAL(5,2) NOT NULL,
    ReliabilityScore DECIMAL(5,2) NOT NULL,
    CreatedAt DATETIME DEFAULT GETUTCDATE()
);
```
