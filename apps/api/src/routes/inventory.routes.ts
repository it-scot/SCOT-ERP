// ============================================================
// SCoT ERP — Inventory & Asset Routes
// ============================================================
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { inventoryService } from '../services/inventoryService.js';
import { createAssetRequestSchema, respondPurchaseApprovalSchema, updatePurchaseItemSchema } from '@scot-erp/shared';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

export const inventoryRouter = Router();
inventoryRouter.use(authenticate);

// ============ Inventory Items ============

// GET /api/inventory/items — List all inventory items (IT/Admin)
inventoryRouter.get('/items', requireRoles('IT', 'Admin', 'HR', 'COO', 'SystemAdmin'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;
    const search = req.query.search as string;
    const result = await inventoryService.getAllItems(page, pageSize, search);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// GET /api/inventory/items/in-stock — In-stock items
inventoryRouter.get('/items/in-stock', requireRoles('IT', 'Admin', 'SystemAdmin'), async (_req, res, next) => {
  try {
    const items = await inventoryService.getInStockItems();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

// GET /api/inventory/items/:id — Get item by ID
inventoryRouter.get('/items/:id', requireRoles('IT', 'Admin', 'HR', 'COO', 'SystemAdmin'), async (req, res, next) => {
  try {
    const item = await inventoryService.getItemById(req.params.id);
    if (!item) throw new NotFoundError('Inventory item');
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory/items — Create item (IT)
inventoryRouter.post('/items', requireRoles('IT', 'SystemAdmin'), async (req, res, next) => {
  try {
    const item = await inventoryService.createItem(req.body, req.user!.id);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

// PUT /api/inventory/items/:id — Update item (IT)
inventoryRouter.put('/items/:id', requireRoles('IT', 'SystemAdmin'), async (req, res, next) => {
  try {
    const updated = await inventoryService.updateItem(req.params.id, req.body, req.user!.id);
    if (!updated) throw new NotFoundError('Inventory item');
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// GET /api/inventory/items/employee/:employeeId — Items assigned to an employee
inventoryRouter.get('/items/employee/:employeeId', requireRoles('IT', 'HR', 'COO', 'SystemAdmin'), async (req, res, next) => {
  try {
    const items = await inventoryService.getItemsByEmployee(req.params.employeeId);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

// ============ Asset Assignments ============

// POST /api/inventory/assign — Assign item to employee (IT)
inventoryRouter.post('/assign', requireRoles('IT', 'SystemAdmin'), async (req, res, next) => {
  try {
    const { inventoryItemId, employeeId, notes } = req.body;
    if (!inventoryItemId || !employeeId) throw new ValidationError('inventoryItemId and employeeId are required');

    const assignment = await inventoryService.assignItem(inventoryItemId, employeeId, notes || '', req.user!.id);
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory/return/:assignmentId — Return an item
inventoryRouter.post('/return/:assignmentId', requireRoles('IT', 'SystemAdmin'), async (req, res, next) => {
  try {
    const { condition, notes } = req.body;
    const assignment = await inventoryService.returnItem(req.params.assignmentId, condition || 'Good', notes || '', req.user!.id);
    if (!assignment) throw new NotFoundError('Asset assignment');
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
});

// GET /api/inventory/assignments/:employeeId — Assignments for an employee
inventoryRouter.get('/assignments/:employeeId', async (req, res, next) => {
  try {
    const assignments = await inventoryService.getAssignmentsByEmployee(req.params.employeeId);
    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
});

// ============ Asset Templates ============

// GET /api/inventory/templates — List all asset templates
inventoryRouter.get('/templates', requireRoles('IT', 'HOD', 'Admin', 'HR', 'COO', 'SystemAdmin'), async (_req, res, next) => {
  try {
    const templates = await inventoryService.getAllTemplates();
    res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory/templates — Create asset template (IT)
inventoryRouter.post('/templates', requireRoles('IT', 'SystemAdmin'), async (req, res, next) => {
  try {
    const template = await inventoryService.createTemplate(req.body, req.user!.id);
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
});

// PUT /api/inventory/templates/:id — Update asset template (IT)
inventoryRouter.put('/templates/:id', requireRoles('IT', 'SystemAdmin'), async (req, res, next) => {
  try {
    const updated = await inventoryService.updateTemplate(req.params.id, req.body, req.user!.id);
    if (!updated) throw new NotFoundError('Asset template');
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// ============ Asset Requests ============

// GET /api/inventory/requests — List asset requests
inventoryRouter.get('/requests', requireRoles('IT', 'Admin', 'HR', 'COO', 'SystemAdmin'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;
    const result = await inventoryService.getAssetRequests(page, pageSize);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// GET /api/inventory/requests/:id — Get asset request by ID
inventoryRouter.get('/requests/:id', async (req, res, next) => {
  try {
    const request = await inventoryService.getAssetRequestById(req.params.id);
    if (!request) throw new NotFoundError('Asset request');
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory/requests — Create asset request (HOD)
inventoryRouter.post('/requests', requireRoles('HOD', 'IT', 'Admin', 'SystemAdmin'), async (req, res, next) => {
  try {
    const data = createAssetRequestSchema.parse(req.body);
    const request = await inventoryService.createAssetRequest(data, req.user!.id);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory/requests/:id/approve — Approve asset request (IT)
inventoryRouter.post('/requests/:id/approve', requireRoles('IT', 'SystemAdmin'), async (req, res, next) => {
  try {
    const request = await inventoryService.approveAssetRequest(req.params.id, req.user!.id);
    if (!request) throw new NotFoundError('Asset request');
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

// ============ Purchase Approvals ============

// GET /api/inventory/purchases — List purchase approvals
inventoryRouter.get('/purchases', requireRoles('COO', 'Admin', 'IT', 'HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;
    const result = await inventoryService.getPurchaseApprovals(page, pageSize);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// GET /api/inventory/purchases/:id — Get purchase approval by ID
inventoryRouter.get('/purchases/:id', requireRoles('COO', 'Admin', 'IT', 'SystemAdmin'), async (req, res, next) => {
  try {
    const approval = await inventoryService.getPurchaseApprovalById(req.params.id);
    if (!approval) throw new NotFoundError('Purchase approval');
    res.json({ success: true, data: approval });
  } catch (err) {
    next(err);
  }
});

// PUT /api/inventory/purchases/:id/respond — Approve/reject purchase (COO)
inventoryRouter.put('/purchases/:id/respond', requireRoles('COO', 'SystemAdmin'), async (req, res, next) => {
  try {
    const data = respondPurchaseApprovalSchema.parse(req.body);
    const updated = await inventoryService.respondToPurchase(
      req.params.id,
      data.status,
      data.comment || null,
      req.user!.id
    );
    if (!updated) throw new NotFoundError('Purchase approval');
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// PUT /api/inventory/purchases/items/:itemId — Update purchase item details (Admin)
inventoryRouter.put('/purchases/items/:itemId', requireRoles('Admin', 'IT', 'SystemAdmin'), async (req, res, next) => {
  try {
    const data = updatePurchaseItemSchema.parse(req.body);
    const updated = await inventoryService.updatePurchaseItem(req.params.itemId, data, req.user!.id);
    if (!updated) throw new NotFoundError('Purchase item');
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});
