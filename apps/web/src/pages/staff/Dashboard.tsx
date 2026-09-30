import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Check if admin or employee
  const isAdmin = user?.roles?.some(r => ['SystemAdmin', 'HR', 'COO'].includes(r));
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', isAdmin ? 'admin' : 'employee'],
    queryFn: async () => {
      const res = await api.get(isAdmin ? '/dashboard/admin' : '/dashboard/employee');
      return res.data.data;
    }
  });

  return (
    <Container fluid className="px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <p className="text-muted mb-0">Welcome back, {user?.preferredName}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : isAdmin ? (
        <AdminDashboard data={dashboardData} />
      ) : (
        <EmployeeDashboard data={dashboardData} />
      )}
    </Container>
  );
};

const AdminDashboard = ({ data }: { data: any }) => {
  if (!data) return null;
  
  const statCards = [
    { title: 'Total Employees', value: data.headcount, icon: 'bi-people', color: 'primary' },
    { title: 'Present Today', value: data.presentToday, icon: 'bi-check-circle', color: 'success' },
    { title: 'Absent Today', value: data.absentToday, icon: 'bi-x-circle', color: 'danger' },
    { title: 'On Leave', value: data.onLeave, icon: 'bi-calendar-minus', color: 'warning' },
    { title: 'Working from Home', value: data.wfh, icon: 'bi-house-laptop', color: 'info' },
    { title: 'Late Arrivals', value: data.lateToday, icon: 'bi-clock-history', color: 'orange' },
    { title: 'Pending Approvals', value: data.pendingApprovals, icon: 'bi-inbox', color: 'purple' },
    { title: 'Onboarding Cases', value: data.onboardingCases, icon: 'bi-person-plus', color: 'teal' },
  ];

  return (
    <>
      <Row className="g-4 mb-4">
        {statCards.map((stat, i) => (
          <Col md={6} xl={3} key={i}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div className={`rounded-circle bg-${stat.color} bg-opacity-10 text-${stat.color} d-flex align-items-center justify-content-center me-3`} style={{ width: 48, height: 48 }}>
                  <i className={`bi ${stat.icon} fs-4`}></i>
                </div>
                <div>
                  <p className="text-muted mb-0 fw-medium" style={{ fontSize: '0.875rem' }}>{stat.title}</p>
                  <h3 className="fw-bold mb-0 text-dark">{stat.value}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="fw-bold mb-0">Department Headcount</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-muted" style={{ fontSize: '0.875rem' }}>
                    <tr>
                      <th className="fw-semibold">Department</th>
                      <th className="fw-semibold">Code</th>
                      <th className="fw-semibold text-end">Headcount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.departmentHeadcount?.map((dept: any, i: number) => (
                      <tr key={i}>
                        <td className="fw-medium text-dark">{dept.department}</td>
                        <td><span className="badge bg-light text-dark border">{dept.code}</span></td>
                        <td className="text-end fw-bold">{dept.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="fw-bold mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-3">
                <button className="btn btn-outline-primary text-start px-3 py-2" onClick={() => window.location.href = '/employees'}>
                  <i className="bi bi-person-plus me-2"></i> Add New Employee
                </button>
                <button className="btn btn-outline-primary text-start px-3 py-2" onClick={() => window.location.href = '/leave'}>
                  <i className="bi bi-calendar-check me-2"></i> Review Leaves
                </button>
                <button className="btn btn-outline-primary text-start px-3 py-2" onClick={() => window.location.href = '/evaluations'}>
                  <i className="bi bi-clipboard-data me-2"></i> Active Evaluations
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const EmployeeDashboard = ({ data }: { data: any }) => {
  if (!data) return null;

  return (
    <Row className="g-4 mb-4">
      <Col md={4}>
        <Card className="h-100 border-0 shadow-sm bg-primary text-white">
          <Card.Body>
            <h5 className="fw-semibold mb-4 text-white-50">Today's Status</h5>
            <h2 className="fw-bold mb-1">{data.todayAttendance?.status || 'Not Punched In'}</h2>
            {data.todayAttendance?.firstPunchIn && (
              <p className="mb-0 text-white-50">In: {new Date(data.todayAttendance.firstPunchIn).toLocaleTimeString()}</p>
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="h-100 border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted mb-1 fw-medium">Pending Leaves</p>
                <h2 className="fw-bold mb-0">{data.pendingLeaveRequests || 0}</h2>
              </div>
              <div className="rounded-circle bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                <i className="bi bi-hourglass-split fs-4"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="h-100 border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted mb-1 fw-medium">Open Tasks</p>
                <h2 className="fw-bold mb-0">{data.openTasks || 0}</h2>
              </div>
              <div className="rounded-circle bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                <i className="bi bi-list-check fs-4"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Dashboard;
