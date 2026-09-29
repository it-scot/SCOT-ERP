// ============================================================
// SCoT ERP — Employee Routes
// ============================================================
import { Router } from 'express';
import { authenticate, requireRoles, requireSelf } from '../middleware/auth.js';
import { employeeRepo } from '../repositories/index.js';
import { auditService } from '../services/auditService.js';
import { createEmployeeSchema, updateEmployeeSchema, employeeSelfEditSchema, paginationSchema } from '@scot-erp/shared';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

export const employeeRouter = Router();
employeeRouter.use(authenticate);

// GET /api/employees — list with pagination, filtering, search
employeeRouter.get('/', async (req, res, next) => {
  try {
    const { page, pageSize, sortBy, sortOrder, search } = paginationSchema.parse(req.query);
    const { department, status, role } = req.query;

    const filters: Record<string, any> = {};
    if (department) filters.departmentCode = department;
    if (status) filters.status = status;

    const result = await employeeRepo.paginate(
      filters,
      page,
      pageSize,
      sortBy || 'nameInFull',
      sortOrder,
      search
    );

    // Mask sensitive fields for non-HR/COO users
    const isHrOrCoo = req.user!.roles.some((r) => ['HR', 'COO', 'SystemAdmin'].includes(r));
    if (!isHrOrCoo) {
      result.data = result.data.map((emp) => ({
        ...emp,
        nic: emp.nic ? emp.nic.slice(0, 4) + '****' + emp.nic.slice(-2) : '',
      }));
    }

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/:id — single employee
employeeRouter.get('/:id', async (req, res, next) => {
  try {
    const employee = await employeeRepo.findById(req.params.id);
    if (!employee) throw new NotFoundError('Employee');

    // Check access: self, HR, COO, supervisor, HOD
    const isSelf = req.user!.id === employee.id;
    const isPrivileged = req.user!.roles.some((r) => ['HR', 'COO', 'SystemAdmin'].includes(r));
    const isSupervisor = employee.supervisorStaffId === req.user!.staffId;

    // Check if user is HOD of the employee's department
    const dept = await (await import('../repositories/index.js')).departmentRepo.findByCode(employee.departmentCode);
    const isHod = dept?.hodStaffId === req.user!.staffId;

    if (!isSelf && !isPrivileged && !isSupervisor && !isHod) {
      // Return basic public info only
      res.json({
        success: true,
        data: {
          id: employee.id,
          staffId: employee.staffId,
          preferredName: employee.preferredName,
          designation: employee.designation,
          departmentCode: employee.departmentCode,
          email: employee.email,
          photoUrl: employee.photoUrl,
        },
      });
      return;
    }

    // Mask NIC for non-HR
    if (!isPrivileged && !isSelf) {
      employee.nic = employee.nic ? employee.nic.slice(0, 4) + '****' + employee.nic.slice(-2) : '';
    }

    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
});

// POST /api/employees — create (HR only)
employeeRouter.post('/', requireRoles('HR', 'SystemAdmin'), async (req, res, next) => {
  try {
    const data = createEmployeeSchema.parse(req.body);
    const id = uuidv4();

    const employee = await employeeRepo.create({
      ...data,
      id,
      cvFileId: null,
      photoUrl: null,
      biometricId: data.biometricId || data.staffId,
    });

    await auditService.log({
      userId: req.user!.id,
      action: 'CREATE',
      entity: 'Employee',
      entityId: id,
      after: employee as any,
    });

    res.status(201).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
});

// PUT /api/employees/:id — update (HR only, or self for limited fields)
employeeRouter.put('/:id', async (req, res, next) => {
  try {
    const employee = await employeeRepo.findById(req.params.id);
    if (!employee) throw new NotFoundError('Employee');

    const isSelf = req.user!.id === employee.id;
    const isHr = req.user!.roles.some((r) => ['HR', 'SystemAdmin'].includes(r));

    if (isSelf && !isHr) {
      // Limited self-edit
      const data = employeeSelfEditSchema.parse(req.body);
      const before = { ...employee };
      const updated = await employeeRepo.update(req.params.id, data);

      await auditService.log({
        userId: req.user!.id,
        action: 'SELF_UPDATE',
        entity: 'Employee',
        entityId: req.params.id,
        before: before as any,
        after: updated as any,
      });

      res.json({ success: true, data: updated });
    } else if (isHr) {
      const data = updateEmployeeSchema.parse(req.body);
      const before = { ...employee };
      const updated = await employeeRepo.update(req.params.id, data);

      await auditService.log({
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Employee',
        entityId: req.params.id,
        before: before as any,
        after: updated as any,
      });

      res.json({ success: true, data: updated });
    } else {
      throw new ForbiddenError('Only HR or the employee can update this profile');
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/by-email/:email
employeeRouter.get('/by-email/:email', async (req, res, next) => {
  try {
    const employee = await employeeRepo.findByEmail(req.params.email);
    if (!employee) throw new NotFoundError('Employee');
    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/department/:code — employees in a department
employeeRouter.get('/department/:code', async (req, res, next) => {
  try {
    const employees = await employeeRepo.findByDepartment(req.params.code);
    res.json({ success: true, data: employees });
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/:id/direct-reports — supervisees
employeeRouter.get('/:id/direct-reports', async (req, res, next) => {
  try {
    const employee = await employeeRepo.findById(req.params.id);
    if (!employee) throw new NotFoundError('Employee');

    const directReports = await employeeRepo.findBySupervisor(employee.staffId);
    res.json({ success: true, data: directReports });
  } catch (err) {
    next(err);
  }
});
