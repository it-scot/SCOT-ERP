# Configurable KPI Engine

## 1. KPI Definitions
KPIs are defined dynamically, not hard-coded.
- **Entity**: Employee KPI, Department KPI.
- **Metrics**: 
  - Attendance % (Weight: 20%)
  - Punctuality / Late occurrences (Weight: 15%)
  - 360 Evaluation Composite Score (Weight: 40%)
  - Workflow SLA Compliance / Response Time (Weight: 25%)

## 2. SLA & Response Time Calculation
- Every workflow step records `created_at` and `completed_at`.
- The delta is calculated.
- If delta > SLA threshold, metric drops.
- Example: HR Onboarding completion time feeds directly into HR Department KPI.

## 3. Storage & History
- KPI scores are snapshotted quarterly/annually.
- Previous year KPIs become immutable to enable year-over-year growth charts.
