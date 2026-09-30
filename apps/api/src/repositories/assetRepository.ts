// ============================================================
// SCoT ERP — Asset Request & Template Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { AssetRequest, AssetTemplate } from '@scot-erp/shared';

export class MockAssetTemplateRepository extends MockBaseRepository<AssetTemplate> {
  constructor() {
    super('assetTemplates');
  }

  async findByCategory(category: string): Promise<AssetTemplate | null> {
    return this.findOneByField('category', category);
  }
}

export class MockAssetRequestRepository extends MockBaseRepository<AssetRequest> {
  constructor() {
    super('assetRequests');
  }

  async findByOnboardingCase(caseId: string): Promise<AssetRequest[]> {
    return this.findByField('onboardingCaseId', caseId);
  }

  async findByRequestedFor(employeeId: string): Promise<AssetRequest[]> {
    return this.findByField('requestedFor', employeeId);
  }

  async findByDepartment(departmentCode: string): Promise<AssetRequest[]> {
    return this.findByField('departmentCode', departmentCode);
  }

  async findByStatus(status: string): Promise<AssetRequest[]> {
    return this.findByField('status', status);
  }
}
