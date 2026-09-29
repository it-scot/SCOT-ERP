// ============================================================
// SCoT ERP — Task / SLA Service
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import { taskRepo } from '../repositories/index.js';
import type { Task, TaskType, TaskStatus } from '@scot-erp/shared';

export class TaskService {
  async createTask(params: {
    type: TaskType;
    refEntity: string;
    refId: string;
    assigneeUserId?: string;
    assigneeDepartment?: string;
    slaMinutes: number;
    title: string;
    description: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    monitoredBy?: string;
  }): Promise<Task> {
    const now = new Date();
    const dueAt = new Date(now.getTime() + params.slaMinutes * 60 * 1000);

    return taskRepo.create({
      id: uuidv4(),
      type: params.type,
      refEntity: params.refEntity,
      refId: params.refId,
      assigneeUserId: params.assigneeUserId || null,
      assigneeDepartment: params.assigneeDepartment || null,
      dueAt: dueAt.toISOString(),
      slaMinutes: params.slaMinutes,
      firstViewedAt: null,
      respondedAt: null,
      completedAt: null,
      monitoredBy: params.monitoredBy || null,
      monitoredAt: null,
      status: 'Open',
      priority: params.priority || 'medium',
      title: params.title,
      description: params.description,
    });
  }

  async markViewed(taskId: string): Promise<Task | null> {
    const task = await taskRepo.findById(taskId);
    if (!task || task.firstViewedAt) return task;
    return taskRepo.update(taskId, { firstViewedAt: new Date().toISOString() });
  }

  async complete(taskId: string): Promise<Task | null> {
    const now = new Date().toISOString();
    return taskRepo.update(taskId, {
      completedAt: now,
      respondedAt: now,
      status: 'Done',
    });
  }

  async cancel(taskId: string): Promise<Task | null> {
    return taskRepo.update(taskId, { status: 'Cancelled' });
  }

  async markMonitored(taskId: string, monitoredBy: string): Promise<Task | null> {
    return taskRepo.update(taskId, {
      monitoredBy,
      monitoredAt: new Date().toISOString(),
    });
  }

  /**
   * Calculate timeliness score (0–100).
   * 100 if completed on/before dueAt; decays linearly to 0 at 2× the SLA.
   */
  calculateTimelinessScore(task: Task): number {
    if (!task.completedAt) return 0;

    const completed = new Date(task.completedAt).getTime();
    const due = new Date(task.dueAt).getTime();
    const created = new Date(task.createdAt).getTime();
    const slaMs = task.slaMinutes * 60 * 1000;

    if (completed <= due) return 100;

    const overtime = completed - due;
    const maxOvertime = slaMs; // At 2× SLA total = 1× SLA overtime
    const score = Math.max(0, 100 - (overtime / maxOvertime) * 100);
    return Math.round(score * 100) / 100;
  }

  async getOpenTasksForUser(userId: string) {
    return taskRepo.findOpenByAssignee(userId);
  }

  async getTasksByRef(entity: string, refId: string) {
    return taskRepo.findByRef(entity, refId);
  }

  async getAll(page = 1, pageSize = 50) {
    return taskRepo.paginate(undefined, page, pageSize, 'createdAt', 'desc');
  }

  /**
   * Check for overdue tasks and update their status.
   */
  async checkOverdueTasks(): Promise<void> {
    const allTasks = await taskRepo.findAll();
    const now = new Date();

    for (const task of allTasks) {
      if (task.status === 'Open' && new Date(task.dueAt) < now) {
        await taskRepo.update(task.id, { status: 'Overdue' });
      }
    }
  }
}

export const taskService = new TaskService();
