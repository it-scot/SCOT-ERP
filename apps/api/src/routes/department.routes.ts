// ============================================================
// SCoT ERP — Department Routes
// ============================================================
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { departmentRepo, employeeRepo } from '../repositories/index.js';

export const departmentRouter = Router();
departmentRouter.use(authenticate);

departmentRouter.get('/', async (_req, res, next) => {
  try {
    const departments = await departmentRepo.findAll();
    
    // Enrich with HOD names and headcounts
    const enriched = await Promise.all(
      departments.map(async (dept) => {
        const employees = await employeeRepo.findByDepartment(dept.code);
        const activeEmployees = employees.filter((e) => !['Resigned', 'Inactive'].includes(e.status));
        let hodName = null;
        if (dept.hodStaffId) {
          const hod = await employeeRepo.findByStaffId(dept.hodStaffId);
          hodName = hod?.preferredName || null;
        }
        return {
          ...dept,
          hodName,
          headcount: activeEmployees.length,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
});

departmentRouter.get('/:code', async (req, res, next) => {
  try {
    const dept = await departmentRepo.findByCode(req.params.code);
    if (!dept) {
      res.status(404).json({ success: false, error: 'Department not found' });
      return;
    }
    res.json({ success: true, data: dept });
  } catch (err) {
    next(err);
  }
});
