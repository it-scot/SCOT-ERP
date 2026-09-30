// ============================================================
// SCoT ERP — KPI Service
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import {
  kpiSnapshotRepo,
  kpiConfigRepo,
  employeeRepo,
  attendanceDayRepo,
  evaluationResultRepo,
  taskRepo,
  evaluationAssignmentRepo,
  evaluationResponseRepo,
} from '../repositories/index.js';
import { auditService } from './auditService.js';
import type { KpiSnapshot, KpiConfig } from '@scot-erp/shared';
import { DEFAULTS, KPI_BANDS } from '@scot-erp/shared';

export class KpiService {
  // ---- Config ----

  getConfig(): KpiConfig | null {
    return kpiConfigRepo.getConfig();
  }

  saveConfig(config: KpiConfig, userId: string): void {
    kpiConfigRepo.saveConfig(config);
    auditService.log({
      userId,
      action: 'KPI_CONFIG_UPDATED',
      entity: 'KpiConfig',
      entityId: 'global',
      before: null,
      after: config as any,
    });
  }

  // ---- Snapshots ----

  async getSnapshotsByEmployee(employeeId: string): Promise<KpiSnapshot[]> {
    return kpiSnapshotRepo.findByEmployee(employeeId);
  }

  async getSnapshotsByPeriod(period: string): Promise<KpiSnapshot[]> {
    return kpiSnapshotRepo.findByPeriod(period);
  }

  async getLatestSnapshot(employeeId: string): Promise<KpiSnapshot | null> {
    return kpiSnapshotRepo.findLatestByEmployee(employeeId);
  }

  /**
   * Calculate KPI score for an employee for a given period.
   * Composite = (Attendance × w1) + (Evaluation × w2) + (Responsiveness × w3) + (EvaluatorReliability × w4)
   */
  async calculateKpi(employeeId: string, period: string, userId: string): Promise<KpiSnapshot> {
    const weights = this.getEffectiveWeights();

    // 1. Attendance Score (0–100)
    const attendanceScore = await this.calculateAttendanceScore(employeeId, period);

    // 2. Evaluation Score (0–100)
    const evaluationScore = await this.calculateEvaluationScore(employeeId);

    // 3. Responsiveness Score (0–100) — based on task SLA adherence
    const responsivenessScore = await this.calculateResponsivenessScore(employeeId);

    // 4. Evaluator Reliability Score (0–100)
    const evaluatorReliabilityScore = await this.calculateEvaluatorReliabilityScore(employeeId);

    // Composite
    const compositeScore =
      (attendanceScore * weights.attendance / 100) +
      (evaluationScore * weights.evaluation / 100) +
      (responsivenessScore * weights.responsiveness / 100) +
      (evaluatorReliabilityScore * weights.evaluatorReliability / 100);

    const band = this.getBand(compositeScore);

    const snapshot = await kpiSnapshotRepo.create({
      id: uuidv4(),
      employeeId,
      period,
      attendanceScore: Math.round(attendanceScore * 100) / 100,
      evaluationScore: Math.round(evaluationScore * 100) / 100,
      responsivenessScore: Math.round(responsivenessScore * 100) / 100,
      evaluatorReliabilityScore: Math.round(evaluatorReliabilityScore * 100) / 100,
      weights,
      compositeScore: Math.round(compositeScore * 100) / 100,
      band,
      details: {
        calculatedAt: new Date().toISOString(),
        calculatedBy: userId,
      },
    });

    return snapshot;
  }

  /**
   * Bulk calculate KPI for all active employees.
   */
  async calculateAllKpis(period: string, userId: string): Promise<KpiSnapshot[]> {
    const employees = await employeeRepo.findAll();
    const active = employees.filter((e) => ['Active', 'Probation'].includes(e.status));

    const snapshots: KpiSnapshot[] = [];
    for (const emp of active) {
      const snapshot = await this.calculateKpi(emp.id, period, userId);
      snapshots.push(snapshot);
    }

    await auditService.log({
      userId,
      action: 'KPI_BULK_CALCULATED',
      entity: 'KpiSnapshot',
      entityId: period,
      before: null,
      after: { count: snapshots.length, period } as any,
    });

    return snapshots;
  }

  // ---- Private Score Calculators ----

  private async calculateAttendanceScore(employeeId: string, period: string): Promise<number> {
    // Get attendance for the period (YYYY-MM)
    const [year, month] = period.split('-').map(Number);
    if (!year || !month) return 100;

    const startDate = `${period}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${period}-${String(lastDay).padStart(2, '0')}`;

    const days = await attendanceDayRepo.findByDateRange(employeeId, startDate, endDate);
    if (!days.length) return 100; // No data yet

    const workingDays = days.filter((d) => !d.isHoliday && !d.isOffDay);
    if (!workingDays.length) return 100;

    const presentDays = workingDays.filter(
      (d) => !d.isAbsent && (d.status.includes('Present') || d.isLeave || d.isWfh)
    );

    const latePenalty = workingDays.filter((d) => d.isLate).length * 2; // -2 per late day
    const absentPenalty = workingDays.filter((d) => d.isAbsent).length * 5; // -5 per absent day

    const baseScore = (presentDays.length / workingDays.length) * 100;
    return Math.max(0, Math.min(100, baseScore - latePenalty - absentPenalty));
  }

  private async calculateEvaluationScore(employeeId: string): Promise<number> {
    const results = await evaluationResultRepo.findByEmployee(employeeId);
    if (!results.length) return 75; // Default neutral score

    // Use latest evaluation result
    const latest = results.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return latest.finalScore;
  }

  private async calculateResponsivenessScore(employeeId: string): Promise<number> {
    const allTasks = await taskRepo.findAll();
    const myTasks = allTasks.filter(
      (t) => t.assigneeUserId === employeeId && (t.status === 'Done' || t.status === 'Overdue')
    );

    if (!myTasks.length) return 100; // No tasks = perfect

    let totalScore = 0;
    for (const task of myTasks) {
      if (task.status === 'Done' && task.completedAt) {
        const completed = new Date(task.completedAt).getTime();
        const due = new Date(task.dueAt).getTime();
        if (completed <= due) {
          totalScore += 100;
        } else {
          // Decay for late completion
          const slaMs = task.slaMinutes * 60 * 1000;
          const overtime = completed - due;
          const score = Math.max(0, 100 - (overtime / slaMs) * 100);
          totalScore += score;
        }
      } else if (task.status === 'Overdue') {
        totalScore += 0;
      }
    }

    return totalScore / myTasks.length;
  }

  private async calculateEvaluatorReliabilityScore(employeeId: string): Promise<number> {
    // Check if employee completed their evaluation assignments on time
    const assignments = await evaluationAssignmentRepo.findByEvaluator(employeeId);
    if (!assignments.length) return 100;

    const submitted = assignments.filter((a) => a.status === 'Submitted');
    const baseScore = (submitted.length / assignments.length) * 100;

    // Check for bias patterns in responses
    const responses = await evaluationResponseRepo.findAll();
    const myResponses = responses.filter((r) => r.evaluatorId === employeeId);

    if (myResponses.length < 3) return baseScore; // Not enough data

    // Check for straight-lining (all same scores)
    const scores = myResponses.flatMap((r) =>
      r.criterionScores.flatMap((cs) => cs.questionScores.map((qs) => qs.score))
    );

    const uniqueScores = new Set(scores);
    if (uniqueScores.size === 1 && scores.length > 5) {
      // Straight-lining penalty
      return Math.max(0, baseScore + DEFAULTS.evaluatorBiasPenalties.straightLining);
    }

    // Check for extreme bias (all very high or very low)
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    const scaleMax = 5; // Default
    if (avg >= scaleMax * 0.95) {
      return Math.max(0, baseScore + DEFAULTS.evaluatorBiasPenalties.lenient);
    }
    if (avg <= scaleMax * 0.25) {
      return Math.max(0, baseScore + DEFAULTS.evaluatorBiasPenalties.harsh);
    }

    return baseScore;
  }

  private getEffectiveWeights() {
    const config = kpiConfigRepo.getConfig();
    return config?.weights || DEFAULTS.kpiWeights;
  }

  private getBand(score: number): string {
    for (const band of KPI_BANDS) {
      if (score >= band.min && score <= band.max) {
        return band.label;
      }
    }
    return 'Unsatisfactory';
  }

  // ---- Leaderboard ----

  async getLeaderboard(period: string): Promise<KpiSnapshot[]> {
    const snapshots = await kpiSnapshotRepo.findByPeriod(period);
    return snapshots.sort((a, b) => b.compositeScore - a.compositeScore);
  }
}

export const kpiService = new KpiService();
