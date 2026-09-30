// ============================================================
// SCoT ERP — Purchase Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { PurchaseApproval, PurchaseItem } from '@scot-erp/shared';

export class MockPurchaseApprovalRepository extends MockBaseRepository<PurchaseApproval> {
  constructor() {
    super('purchaseApprovals');
  }

  async findByAssetRequest(assetRequestId: string): Promise<PurchaseApproval[]> {
    return this.findByField('assetRequestId', assetRequestId);
  }

  async findByStatus(status: string): Promise<PurchaseApproval[]> {
    return this.findByField('status', status);
  }

  async findPending(): Promise<PurchaseApproval[]> {
    return this.findByStatus('Pending Approval');
  }
}

export class MockPurchaseItemRepository extends MockBaseRepository<PurchaseItem> {
  constructor() {
    super('purchaseItems');
  }

  async findByApproval(purchaseApprovalId: string): Promise<PurchaseItem[]> {
    return this.findByField('purchaseApprovalId', purchaseApprovalId);
  }

  async findByStatus(status: string): Promise<PurchaseItem[]> {
    return this.findByField('status', status);
  }
}
