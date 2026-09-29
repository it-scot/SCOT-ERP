// SCoT ERP — Dashboard Routes
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { employeeRepo, attendanceDayRepo, leaveRequestRepo, taskRepo, publicHolidayRepo } from '../repositories/index.js';
import { format } from 'date-fns';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

// GET /api/dashboard/admin — System Admin Dashboard stats
dashboardRouter.get('/admin', requireRoles('SystemAdmin', 'HR', 'COO'), async (req, res, next) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const allEmployees = await employeeRepo.findAll();
    const active = allEmployees.filter((e) => ['Active', 'Probation'].includes(e.status));

    const todayAttendance = await attendanceDayRepo.findByDate(today);
    const present = todayAttendance.filter((a) => a.status === 'Present' || a.status === 'Present - WFH' || a.status === 'Present - Approved Leave');
    const absent = todayAttendance.filter((a) => a.isAbsent);
    const late = todayAttendance.filter((a) => a.isLate);
    const onLeave = todayAttendance.filter((a) => a.isLeave);
    const wfh = todayAttendance.filter((a) => a.isWfh);

    const allTasks = await taskRepo.findAll();
    const pendingApprovals = allTasks.filter((t) => t.status === 'Open' || t.status === 'Overdue');

    const pendingLeave = await leaveRequestRepo.findAll({ status: 'Pending' });

    // Department headcount
    const departments = await (await import('../repositories/index.js')).departmentRepo.findAll();
    const deptHeadcount = await Promise.all(
      departments.map(async (d) => {
        const emps = await employeeRepo.findByDepartment(d.code);
        return {
          department: d.name,
          code: d.code,
          count: emps.filter((e) => !['Resigned', 'Inactive'].includes(e.status)).length,
        };
      })
    );

    res.json({
      success: true,
      data: {
        headcount: active.length,
        presentToday: present.length,
        absentToday: absent.length,
        onLeave: onLeave.length,
        wfh: wfh.length,
        lateToday: late.length,
        pendingApprovals: pendingApprovals.length,
        pendingLeaveRequests: pendingLeave.length,
        departmentHeadcount: deptHeadcount,
        onboardingCases: allEmployees.filter((e) => e.status === 'Onboarding').length,
        noticePeriod: allEmployees.filter((e) => e.status === 'Notice Period').length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/employee — My Dashboard
dashboardRouter.get('/employee', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const today = format(new Date(), 'yyyy-MM-dd');

    const todayAttendance = await attendanceDayRepo.findByEmployeeAndDate(userId, today);
    const pendingLeave = (await leaveRequestRepo.findByEmployee(userId))
      .filter((l) => l.status === 'Pending');
    const myTasks = await taskRepo.findOpenByAssignee(userId);

    res.json({
      success: true,
      data: {
        todayAttendance,
        pendingLeaveRequests: pendingLeave.length,
        openTasks: myTasks.length,
      },
    });
  } catch (err) {
    next(err);
  }
});
