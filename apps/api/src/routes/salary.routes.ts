// SCoT ERP — Salary Routes
import { Router } from 'express';
import { authenticate, requireSalaryAccess } from '../middleware/auth.js';
import { salaryRecordRepo, payslipRepo } from '../repositories/index.js';
export const salaryRouter = Router();
salaryRouter.use(authenticate);

salaryRouter.get('/my', async (req, res, next) => {
  try {
    const current = await salaryRecordRepo.findCurrentByEmployee(req.user!.id);
    const history = await salaryRecordRepo.findByEmployee(req.user!.id);
    res.json({ success: true, data: { current, history } });
  } catch (err) { next(err); }
});

salaryRouter.get('/my/payslips', async (req, res, next) => {
  try {
    const payslips = await payslipRepo.findByEmployee(req.user!.id);
    res.json({ success: true, data: payslips });
  } catch (err) { next(err); }
});

salaryRouter.get('/employee/:employeeId', requireSalaryAccess(), async (req, res, next) => {
  try {
    const current = await salaryRecordRepo.findCurrentByEmployee(req.params.employeeId);
    const history = await salaryRecordRepo.findByEmployee(req.params.employeeId);
    res.json({ success: true, data: { current, history } });
  } catch (err) { next(err); }
});
