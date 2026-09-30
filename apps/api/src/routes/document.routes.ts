// ============================================================
// SCoT ERP — Document Routes (Full Implementation)
// ============================================================
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { documentRepo, employeeRepo } from '../repositories/index.js';
import { auditService } from '../services/auditService.js';
import { createDocumentSchema } from '@scot-erp/shared';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

export const documentRouter = Router();
documentRouter.use(authenticate);

// GET /api/documents/employee/:employeeId — Documents for an employee
documentRouter.get('/employee/:employeeId', async (req, res, next) => {
  try {
    const docs = await documentRepo.findByEmployee(req.params.employeeId);
    res.json({ success: true, data: docs });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/my — My documents
documentRouter.get('/my', async (req, res, next) => {
  try {
    const docs = await documentRepo.findByEmployee(req.user!.id);
    res.json({ success: true, data: docs });
  } catch (err) {
    next(err);
  }
});

// POST /api/documents — Upload a document (HR or self for limited types)
documentRouter.post('/', async (req, res, next) => {
  try {
    const data = createDocumentSchema.parse(req.body);
    const { fileId, fileName } = req.body;

    if (!fileId || !fileName) {
      res.status(400).json({ success: false, error: 'fileId and fileName are required. Upload the file first via /api/files/upload.' });
      return;
    }

    // Check authorization
    const isSelf = data.employeeId === req.user!.id;
    const isHr = req.user!.roles.some((r) => ['HR', 'SystemAdmin'].includes(r));

    if (!isSelf && !isHr) {
      throw new ForbiddenError('Only HR or the employee can upload documents.');
    }

    // Self-upload limited to CV
    if (isSelf && !isHr && data.type !== 'CV') {
      throw new ForbiddenError('You can only upload CV documents. Contact HR for other document types.');
    }

    // Get existing version count
    const existingDocs = await documentRepo.findByType(data.employeeId, data.type);
    const version = existingDocs.length + 1;

    const docId = uuidv4();
    const doc = await documentRepo.create({
      id: docId,
      employeeId: data.employeeId,
      type: data.type,
      label: data.label,
      fileId,
      fileName,
      uploadedBy: req.user!.id,
      version,
      isDeleted: false,
    });

    // If it's a CV, update the employee's cvFileId
    if (data.type === 'CV') {
      await employeeRepo.update(data.employeeId, { cvFileId: fileId });
    }

    await auditService.log({
      userId: req.user!.id,
      action: 'UPLOAD_DOCUMENT',
      entity: 'EmployeeDocument',
      entityId: docId,
      after: { employeeId: data.employeeId, type: data.type, label: data.label },
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/documents/:id — Soft-delete a document (HR only)
documentRouter.delete('/:id', requireRoles('HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    const doc = await documentRepo.findById(req.params.id);
    if (!doc) throw new NotFoundError('Document');

    await documentRepo.update(req.params.id, { isDeleted: true });

    await auditService.log({
      userId: req.user!.id,
      action: 'DELETE_DOCUMENT',
      entity: 'EmployeeDocument',
      entityId: req.params.id,
      before: { type: doc.type, label: doc.label },
    });

    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id — Get a single document
documentRouter.get('/:id', async (req, res, next) => {
  try {
    const doc = await documentRepo.findById(req.params.id);
    if (!doc || doc.isDeleted) throw new NotFoundError('Document');
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});
