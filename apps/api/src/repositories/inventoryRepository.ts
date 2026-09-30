// ============================================================
// SCoT ERP — Inventory & Asset Assignment Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { InventoryItem, AssetAssignment } from '@scot-erp/shared';

export class MockInventoryItemRepository extends MockBaseRepository<InventoryItem> {
  constructor() {
    super('inventoryItems');
  }

  async findInStock(): Promise<InventoryItem[]> {
    return this.findByField('status', 'In Stock');
  }

  async findByCategory(category: string): Promise<InventoryItem[]> {
    return this.findByField('category', category);
  }

  async findByStatus(status: string): Promise<InventoryItem[]> {
    return this.findByField('status', status);
  }

  async findAssignedTo(employeeId: string): Promise<InventoryItem[]> {
    return this.findByField('assignedTo', employeeId);
  }

  async search(query: string): Promise<InventoryItem[]> {
    const all = await this.findAll();
    const lower = query.toLowerCase();
    return all.filter(
      (i) =>
        i.name.toLowerCase().includes(lower) ||
        i.spec.toLowerCase().includes(lower) ||
        i.serialNumber.toLowerCase().includes(lower) ||
        i.category.toLowerCase().includes(lower)
    );
  }
}

export class MockAssetAssignmentRepository extends MockBaseRepository<AssetAssignment> {
  constructor() {
    super('assetAssignments');
  }

  async findByEmployee(employeeId: string): Promise<AssetAssignment[]> {
    return this.findByField('employeeId', employeeId);
  }

  async findByItem(inventoryItemId: string): Promise<AssetAssignment[]> {
    return this.findByField('inventoryItemId', inventoryItemId);
  }

  async findActiveByEmployee(employeeId: string): Promise<AssetAssignment[]> {
    const all = await this.findByEmployee(employeeId);
    return all.filter((a) => !a.returnedAt);
  }

  async findActiveByItem(inventoryItemId: string): Promise<AssetAssignment[]> {
    const all = await this.findByItem(inventoryItemId);
    return all.filter((a) => !a.returnedAt);
  }
}
