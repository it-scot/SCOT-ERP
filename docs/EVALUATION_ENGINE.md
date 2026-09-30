# 360-Degree Evaluation Engine

## 1. Forms & Publishing
Admin creates `EvaluationCycle` (e.g., "Annual 2026") with start/end dates.
Admin creates `EvaluationTemplate` comprising `Categories` (Leadership, Communication) and `Questions` with weights.

## 2. Standard Employee Evaluation
Triggered upon cycle publish. Comprises 3 independent assignments:
- **Self Evaluation**: Employee evaluates themselves.
- **Peer Evaluation**: 
  - System dynamically selects peers within the same `departmentId`.
  - Anonymity enforced (UI never reveals peer ID).
  - If no peers exist, automatically mapped as `NIL` to prevent blocking the final score calculation.
- **HOD Evaluation**: Department HOD evaluates the employee.

## 3. HOD Evaluation
- **Self Evaluation**.
- **Peer Evaluation**: Evaluated by all other HODs across the company.
- **Superior Evaluation**: Evaluated by COO.

## 4. Evaluator Behavior Analytics (KPI Impact)
The system calculates standard deviation of scores given by an evaluator.
- If an evaluator consistently gives < 20% or > 80% marks compared to department average, a flag is raised.
- This flag feeds into the evaluator's own KPI as an "Unusually Strict" or "Unusually Generous" penalty.
