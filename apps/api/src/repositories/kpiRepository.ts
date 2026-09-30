// ============================================================
// SCoT ERP — KPI Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import { getStore, persistStore } from './dataStore.js';
import type { KpiSnapshot, KpiConfig } from '@scot-erp/shared';

export class MockKpiSnapshotRepository extends MockBaseRepository<KpiSnapshot> {
  constructor() {
    super('kpiSnapshots');
  }

  async findByEmployee(employeeId: string): Promise<KpiSnapshot[]> {
    return this.findByField('employeeId', employeeId);
  }

  async findByPeriod(period: string): Promise<KpiSnapshot[]> {
    return this.findByField('period', period);
  }

  async findByEmployeeAndPeriod(employeeId: string, period: string): Promise<KpiSnapshot | null> {
    const byEmployee = await this.findByEmployee(employeeId);
    return byEmployee.find((s) => s.period === period) || null;
  }

  async findLatestByEmployee(employeeId: string): Promise<KpiSnapshot | null> {
    const all = await this.findByEmployee(employeeId);
    if (!all.length) return null;
    all.sort((a, b) => b.period.localeCompare(a.period));
    return all[0];
  }
}

export class KpiConfigRepository {
  getConfig(): KpiConfig | null {
    return getStore().kpiConfig;
  }

  saveConfig(config: KpiConfig): void {
    getStore().kpiConfig = config;
    persistStore();
  }
}
