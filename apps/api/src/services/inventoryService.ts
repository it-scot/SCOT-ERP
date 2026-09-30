// ============================================================
// SCoT ERP — Inventory & Asset Service
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import {
  inventoryItemRepo,
  assetAssignmentRepo,
  assetTemplateRepo,
  assetRequestRepo,
  purchaseApprovalRepo,
  purchaseItemRepo,
  employeeRepo,
} from '../repositories/index.js';
import { taskService } from './taskService.js';
import { notificationService } from './notificationService.js';
import { auditService } from './auditService.js';
import type {
  InventoryItem,
  AssetAssignment,
  AssetRequest,
  AssetTemplate,
  PurchaseApproval,
  PurchaseItem,
} from '@scot-erp/shared';
import { DEFAULTS } from '@scot-erp/shared';

export class InventoryService {
  // ---- Inventory Items ----

  async getAllItems(page = 1, pageSize = 50, search?: string) {
    return inventoryItemRepo.paginate(undefined, page, pageSize, 'name', 'asc', search, ['name', 'spec', 'serialNumber', 'category']);
  }

  async getItemById(id: string): Promise<InventoryItem | null> {
    return inventoryItemRepo.findById(id);
  }

  async createItem(data: Partial<InventoryItem>, userId: string): Promise<InventoryItem> {
    const item = await inventoryItemRepo.create({
      id: uuidv4(),
      ...data,
      status: data.status || 'In Stock',
      assignedTo: null,
      assignedAt: null,
    });

    await auditService.log({
      userId,
      action: 'INVENTORY_ITEM_CREATED',
      entity: 'InventoryItem',
      entityId: item.id,
      before: null,
      after: item as any,
    });

    return item;
  }

  async updateItem(id: string, data: Partial<InventoryItem>, userId: string): Promise<InventoryItem | null> {
    const before = await inventoryItemRepo.findById(id);
    const updated = await inventoryItemRepo.update(id, data);

    if (updated) {
      await auditService.log({
        userId,
        action: 'INVENTORY_ITEM_UPDATED',
        entity: 'InventoryItem',
        entityId: id,
        before: before as any,
        after: updated as any,
      });
    }

    return updated;
  }

  async getInStockItems(): Promise<InventoryItem[]> {
    return inventoryItemRepo.findInStock();
  }

  async getItemsByEmployee(employeeId: string): Promise<InventoryItem[]> {
    return inventoryItemRepo.findAssignedTo(employeeId);
  }

  // ---- Asset Assignments ----

  async assignItem(inventoryItemId: string, employeeId: string, notes: string, userId: string): Promise<AssetAssignment> {
    // Update inventory item status
    await inventoryItemRepo.update(inventoryItemId, {
      status: 'Allocated',
      assignedTo: employeeId,
      assignedAt: new Date().toISOString(),
    });

    const assignment = await assetAssignmentRepo.create({
      id: uuidv4(),
      inventoryItemId,
      employeeId,
      assignedAt: new Date().toISOString(),
      returnedAt: null,
      condition: 'Good',
      notes,
    });

    await auditService.log({
      userId,
      action: 'ASSET_ASSIGNED',
      entity: 'AssetAssignment',
      entityId: assignment.id,
      before: null,
      after: { inventoryItemId, employeeId } as any,
    });

    return assignment;
  }

  async returnItem(assignmentId: string, condition: string, notes: string, userId: string): Promise<AssetAssignment | null> {
    const assignment = await assetAssignmentRepo.findById(assignmentId);
    if (!assignment) return null;

    // Update assignment
    const updated = await assetAssignmentRepo.update(assignmentId, {
      returnedAt: new Date().toISOString(),
      condition,
      notes,
    });

    // Return item to stock
    await inventoryItemRepo.update(assignment.inventoryItemId, {
      status: 'In Stock',
      assignedTo: null,
      assignedAt: null,
    });

    await auditService.log({
      userId,
      action: 'ASSET_RETURNED',
      entity: 'AssetAssignment',
      entityId: assignmentId,
      before: { returnedAt: null } as any,
      after: { returnedAt: updated?.returnedAt, condition } as any,
    });

    return updated;
  }

  async getAssignmentsByEmployee(employeeId: string): Promise<AssetAssignment[]> {
    return assetAssignmentRepo.findActiveByEmployee(employeeId);
  }

  // ---- Asset Templates ----

  async getAllTemplates(): Promise<AssetTemplate[]> {
    return assetTemplateRepo.findAll();
  }

  async getTemplateByCategory(category: string): Promise<AssetTemplate | null> {
    return assetTemplateRepo.findByCategory(category);
  }

  async createTemplate(data: Partial<AssetTemplate>, userId: string): Promise<AssetTemplate> {
    const template = await assetTemplateRepo.create({ id: uuidv4(), ...data });

    await auditService.log({
      userId,
      action: 'ASSET_TEMPLATE_CREATED',
      entity: 'AssetTemplate',
      entityId: template.id,
      before: null,
      after: template as any,
    });

    return template;
  }

  async updateTemplate(id: string, data: Partial<AssetTemplate>, userId: string): Promise<AssetTemplate | null> {
    const before = await assetTemplateRepo.findById(id);
    const updated = await assetTemplateRepo.update(id, data);

    if (updated) {
      await auditService.log({
        userId,
        action: 'ASSET_TEMPLATE_UPDATED',
        entity: 'AssetTemplate',
        entityId: id,
        before: before as any,
        after: updated as any,
      });
    }

    return updated;
  }

  // ---- Asset Requests ----

  async createAssetRequest(data: any, userId: string): Promise<AssetRequest> {
    // Check which items are in stock
    const inStockItems = await inventoryItemRepo.findInStock();
    const items = data.items.map((item: any) => {
      const match = inStockItems.find(
        (s) => s.name.toLowerCase().includes(item.label.toLowerCase()) ||
               s.category.toLowerCase() === item.label.toLowerCase()
      );
      return {
        id: uuidv4(),
        ...item,
        inStock: !!match,
        stockItemId: match?.id || null,
      };
    });

    // Check if matches template
    const employee = await employeeRepo.findById(data.requestedFor);
    let matchesTemplate = false;
    if (employee) {
      const template = await assetTemplateRepo.findByCategory(employee.employeeCategory);
      if (template) {
        matchesTemplate = template.items.every((ti) =>
          items.some((ri: any) => ri.label === ti.label)
        );
      }
    }

    const allInStock = items.every((i: any) => i.inStock);

    const request = await assetRequestRepo.create({
      id: uuidv4(),
      onboardingCaseId: data.onboardingCaseId || null,
      requestedBy: userId,
      requestedFor: data.requestedFor,
      departmentCode: data.departmentCode,
      items,
      matchesTemplate,
      allInStock,
      status: 'Pending',
      purchaseApprovalId: null,
    });

    // Notify IT admin
    const itEmployees = await employeeRepo.findAll({ departmentCode: 'IT' });
    const itManager = itEmployees.find((e) => e.userRole.includes('IT'));
    if (itManager) {
      await taskService.createTask({
        type: 'AssetRequest',
        refEntity: 'AssetRequest',
        refId: request.id,
        assigneeUserId: itManager.id,
        slaMinutes: DEFAULTS.slaDefaults.itAdminReviewMinutes,
        title: `Asset Request Review`,
        description: `New asset request for ${employee?.preferredName || data.requestedFor}`,
        priority: 'medium',
      });
    }

    return request;
  }

  async getAssetRequests(page = 1, pageSize = 50) {
    return assetRequestRepo.paginate(undefined, page, pageSize, 'createdAt', 'desc');
  }

  async getAssetRequestById(id: string): Promise<AssetRequest | null> {
    return assetRequestRepo.findById(id);
  }

  async approveAssetRequest(id: string, userId: string): Promise<AssetRequest | null> {
    const request = await assetRequestRepo.findById(id);
    if (!request) return null;

    // If all items in stock, move to In Progress directly
    // If some need purchasing, create a purchase approval
    const needsPurchase = request.items.some((i) => !i.inStock);

    if (needsPurchase) {
      const outOfStockItems = request.items.filter((i) => !i.inStock);
      const purchaseId = uuidv4();
      await purchaseApprovalRepo.create({
        id: purchaseId,
        assetRequestId: id,
        requestedBy: userId,
        items: outOfStockItems.map((i) => ({
          id: uuidv4(),
          purchaseApprovalId: purchaseId,
          label: i.label,
          spec: i.spec,
          vendor: null,
          cost: null,
          serialNumber: null,
          purchaseDate: null,
          quotationFileId: null,
          invoiceFileId: null,
          warrantyFileId: null,
          status: 'Pending' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        status: 'Pending Approval',
        cooComment: null,
        approvedAt: null,
        approvedBy: null,
      });

      await assetRequestRepo.update(id, { status: 'Approved', purchaseApprovalId: purchaseId });

      // Create COO approval task
      const coo = await employeeRepo.findByEmail('yohan@scot.lk');
      if (coo) {
        await taskService.createTask({
          type: 'PurchaseApproval',
          refEntity: 'PurchaseApproval',
          refId: purchaseId,
          assigneeUserId: coo.id,
          slaMinutes: DEFAULTS.slaDefaults.cooPurchaseApprovalMinutes,
          title: `Purchase Approval Required`,
          description: `Purchase request for ${outOfStockItems.length} items.`,
          priority: 'high',
        });
      }
    } else {
      await assetRequestRepo.update(id, { status: 'In Progress' });
    }

    return assetRequestRepo.findById(id);
  }

  // ---- Purchase ----

  async getPurchaseApprovals(page = 1, pageSize = 50) {
    return purchaseApprovalRepo.paginate(undefined, page, pageSize, 'createdAt', 'desc');
  }

  async getPurchaseApprovalById(id: string): Promise<PurchaseApproval | null> {
    return purchaseApprovalRepo.findById(id);
  }

  async respondToPurchase(id: string, status: 'Approved' | 'Rejected', comment: string | null, userId: string): Promise<PurchaseApproval | null> {
    const now = new Date().toISOString();
    const before = await purchaseApprovalRepo.findById(id);

    const updated = await purchaseApprovalRepo.update(id, {
      status: status === 'Approved' ? 'Approved' : 'Rejected',
      cooComment: comment,
      approvedAt: status === 'Approved' ? now : null,
      approvedBy: status === 'Approved' ? userId : null,
    });

    // Complete the task
    const tasks = await taskService.getTasksByRef('PurchaseApproval', id);
    for (const task of tasks) {
      if (task.status === 'Open' || task.status === 'Overdue') {
        await taskService.complete(task.id);
      }
    }

    await auditService.log({
      userId,
      action: `PURCHASE_${status.toUpperCase()}`,
      entity: 'PurchaseApproval',
      entityId: id,
      before: { status: before?.status } as any,
      after: { status } as any,
    });

    return updated;
  }

  async updatePurchaseItem(itemId: string, data: Partial<PurchaseItem>, userId: string): Promise<PurchaseItem | null> {
    const updated = await purchaseItemRepo.update(itemId, data);

    if (updated) {
      await auditService.log({
        userId,
        action: 'PURCHASE_ITEM_UPDATED',
        entity: 'PurchaseItem',
        entityId: itemId,
        before: null,
        after: data as any,
      });
    }

    return updated;
  }
}

export const inventoryService = new InventoryService();
