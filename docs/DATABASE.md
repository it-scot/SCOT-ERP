# Database Architecture (ERD Plan)

## Core Entities & Relationships

### Users & Authentication
- **User**: Base identity linked to Google Auth. (`id`, `email`, `domain`, `portal_type`)
- **Role**: `id`, `name`
- **Permission**: `id`, `name`, `module`
- **UserRole**: junction table.
- **RolePermission**: junction table.

### Employee Master
- **Employee**: `id`, `userId`, `staffId`, `title`, `firstName`, `lastName`, `designationId`, `departmentId`, `supervisorId`, `hodId`, `shiftTemplateId`, `cadreLevel`, `dob`, `nic`, `contact`, `address`, `emergencyContact`, `status`.
- **Department**: `id`, `name`, `code`, `hodId`
- **Designation**: `id`, `name`, `cadreLevel`
- **EmployeeDocument**: `id`, `employeeId`, `type`, `title`, `url`, `uploadedBy`

### Time & Attendance
- **ShiftTemplate**: `id`, `name`, `workingDays`, `startTime`, `endTime`, `gracePeriod`
- **AttendanceRecord**: `id`, `employeeId`, `date`, `firstIn`, `lastOut`, `status` (Present, Absent, Late, HalfDay), `isWfh`
- **LeaveType**: `id`, `name`, `annualQuotaHours`
- **LeaveBalance**: `id`, `employeeId`, `leaveTypeId`, `allocated`, `used`
- **LeaveRequest**: `id`, `employeeId`, `leaveTypeId`, `startDate`, `endDate`, `status` (Pending, Approved, Rejected), `approverId`

### SLA & Workflows
- **WorkflowTracker**: `id`, `type` (Onboarding, Offboarding, Procurement), `entityId`, `status`, `ownerId`, `dueDate`, `completedAt`
- **WorkflowStep**: `id`, `workflowId`, `name`, `status`, `ownerRole`, `dueDate`, `completedAt`

### Assets
- **Asset**: `id`, `assetId`, `type`, `serialNumber`, `assignedTo`, `status` (Available, Assigned, Repair, Retired)
