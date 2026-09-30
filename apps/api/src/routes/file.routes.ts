// ============================================================
// SCoT ERP — File Routes (Upload + Serve)
// ============================================================
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { config } from '../config.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = config.files.uploadDir;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${uuidv4()}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.files.maxSize },
  fileFilter: (_req, file, cb) => {
    if (config.files.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed. Allowed: ${config.files.allowedTypes.join(', ')}`));
    }
  },
});

export const fileRouter = Router();
fileRouter.use(authenticate);

// POST /api/files/upload — Upload a file
fileRouter.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        fileId: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: `/api/files/${req.file.filename}`,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/files/upload-multiple — Upload multiple files
fileRouter.post('/upload-multiple', upload.array('files', 10), async (req, res, next) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, error: 'No files uploaded' });
      return;
    }

    const result = files.map((f) => ({
      fileId: f.filename,
      originalName: f.originalname,
      mimeType: f.mimetype,
      size: f.size,
      path: `/api/files/${f.filename}`,
    }));

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/files/:fileId — Serve a file
fileRouter.get('/:fileId', async (req, res, next) => {
  try {
    const filePath = path.join(config.files.uploadDir, req.params.fileId);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, error: 'File not found' });
      return;
    }

    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/files/:fileId — Delete a file (admin only)
fileRouter.delete('/:fileId', async (req, res, next) => {
  try {
    const isAdmin = req.user!.roles.some((r) => ['HR', 'SystemAdmin', 'IT'].includes(r));
    if (!isAdmin) {
      res.status(403).json({ success: false, error: 'Only HR/IT can delete files' });
      return;
    }

    const filePath = path.join(config.files.uploadDir, req.params.fileId);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, error: 'File not found' });
      return;
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'File deleted' });
  } catch (err) {
    next(err);
  }
});
