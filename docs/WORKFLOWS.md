# Workflows Engine Documentation

## 1. Employee Lifecycle Workflow
**States**: PRE_ONBOARDING -> ONBOARDING -> ACTIVE -> ON_LEAVE -> RESIGNATION_PENDING -> OFFBOARDING -> RESIGNED

## 2. Onboarding Workflow (SLA Based)
1. **Initiation**: HR creates basic record (Emp No, Name, Dept). Status -> ONBOARDING.
2. **Asset Request**: HOD selects IT asset template.
3. **Approval**: IT reviews. If non-standard -> COO Approval.
4. **Procurement**: Admin purchases and attaches invoices.
5. **Provisioning**: IT configures and assigns to employee.
6. **Completion**: HR fills remaining profile data. Status -> ACTIVE.
*KPI Mechanism*: Each step has a calculated `expectedCompletionDate`. Overdue steps negatively impact the responsible department's KPI.

## 3. Offboarding / Resignation Workflow
1. **Request**: Employee submits resignation + proposed last day.
2. **Acceptance**: HOD approves.
3. **Scheduling**: Google Calendar event generated for Asset Handover (usually 1 day before last day).
4. **Asset Return**: IT verifies and marks assets returned.
5. **Exit Evaluation**: Employee fills out Company Exit Form.
6. **Service Letter**: Unlocked. HR uploads letter.
7. **Finalization**: Employee accepts letter. Account disabled. Status -> RESIGNED.
