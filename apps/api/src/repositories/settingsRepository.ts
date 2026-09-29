// ============================================================
// SCoT ERP — Settings Repository
// ============================================================
import { getStore, persistStore } from './dataStore.js';
import type { SystemSettings } from '@scot-erp/shared';
import { DEFAULTS } from '@scot-erp/shared';

export class MockSettingsRepository {
  async get(): Promise<SystemSettings> {
    const store = getStore();
    if (!store.settings) {
      store.settings = this.getDefaults();
      persistStore();
    }
    return store.settings as SystemSettings;
  }

  async update(data: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = await this.get();
    const updated = { ...current, ...data };
    getStore().settings = updated;
    persistStore();
    return updated;
  }

  private getDefaults(): SystemSettings {
    return {
      graceMinutes: DEFAULTS.graceMinutes,
      standardWorkingHoursPerDay: DEFAULTS.standardWorkingHoursPerDay,
      otThresholdMinutes: DEFAULTS.otThresholdMinutes,
      otRequiresApproval: false,
      maxLeaveRequestDays: DEFAULTS.maxLeaveRequestDays,
      defaultLeaveEntitlementDays: DEFAULTS.defaultLeaveEntitlementDays,
      slaDefaults: DEFAULTS.slaDefaults as unknown as Record<string, number>,
      kpiWeights: DEFAULTS.kpiWeights as unknown as Record<string, number>,
      evaluationPillarWeights: DEFAULTS.evaluationPillarWeights as unknown as Record<string, number>,
      evaluatorBiasPenalties: DEFAULTS.evaluatorBiasPenalties as unknown as Record<string, number>,
      ratingScale: { ...DEFAULTS.ratingScale },
      onboardingNotificationRecipients: ['it@scot.lk', 'admin@scot.lk', 'yohan@scot.lk'],
      revokeAccessOn: 'acceptance',
      systemAdminEmails: ['it@scot.lk', 'hr@scot.lk', 'yohan@scot.lk'],
    };
  }
}
