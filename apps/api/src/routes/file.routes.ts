// SCoT ERP — File Routes
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import path from 'path';
import { config } from '../config.js';
export const fileRouter = Router();
fileRouter.use(authenticate);

fileRouter.get('/:fileId', async (req, res, next) => {
  try {
    const filePath = path.join(config.files.uploadDir, req.params.fileId);
    res.sendFile(filePath);
  } catch (err) { next(err); }
});
