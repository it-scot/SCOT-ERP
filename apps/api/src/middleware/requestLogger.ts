// ============================================================
// SCoT ERP — Request Logger Middleware
// ============================================================
import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, url } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const color = statusCode >= 400 ? '\x1b[31m' : statusCode >= 300 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}${method}\x1b[0m ${url} ${statusCode} ${duration}ms`);
  });

  next();
}
