import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const { user } = useAuth();
  
  const dummyAttendanceData = [
    { day: 'Mon', hours: 8, fill: '#0d6efd' },
    { day: 'Tue', hours: 8.5, fill: '#0d6efd' },
    { day: 'Wed', hours: 7.5, fill: '#feca57' },
    { day: 'Thu', hours: 9, fill: '#0d6efd' },
    { day: 'Fri', hours: 8, fill: '#0d6efd' },
    { day: 'Sat', hours: 4, fill: '#48dbfb' },
    { day: 'Sun', hours: 0, fill: '#c8d6e5' },
  ];

  const dummyNews = [
    { id: 1, title: 'Annual General Meeting 2026', date: 'Oct 10, 2026', type: 'Announcement', color: 'primary', icon: 'bi-megaphone' },
    { id: 2, title: 'System Maintenance Scheduled', date: 'Oct 15, 2026', type: 'IT Alert', color: 'warning', icon: 'bi-hdd-network' },
    { id: 3, title: 'New Employee Benefits Policy', date: 'Oct 01, 2026', type: 'HR Update', color: 'success', icon: 'bi-people' },
  ];

  return (
    <>
      <Row className="g-4 mb-4">
        {/* Basic Details */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="bg-primary bg-gradient p-4 text-white d-flex align-items-center gap-4">
              <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow" style={{ width: 80, height: 80, fontSize: '2.5rem', fontWeight: 'bold' }}>
                {user?.preferredName?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="fw-bold mb-1">{user?.nameInFull || user?.preferredName || 'Employee Name'}</h3>
                <p className="mb-0 text-white-50 fs-5">{user?.designation || 'Staff Member'}</p>
              </div>
            </div>
            <Card.Body className="p-4">
              <Row className="g-4">
                <Col sm={6}>
                  <p className="text-muted mb-1 fs-7 text-uppercase fw-bold"><i className="bi bi-person-badge me-2"></i>Employee ID</p>
                  <p className="fw-semibold mb-0 fs-5">{user?.staffId || 'EMP-000'}</p>
                </Col>
                <Col sm={6}>
                  <p className="text-muted mb-1 fs-7 text-uppercase fw-bold"><i className="bi bi-building me-2"></i>Department</p>
                  <p className="fw-semibold mb-0 fs-5">{user?.departmentCode || 'N/A'}</p>
                </Col>
                <Col sm={6}>
                  <p className="text-muted mb-1 fs-7 text-uppercase fw-bold"><i className="bi bi-envelope me-2"></i>Email Address</p>
                  <p className="fw-semibold mb-0 fs-6">{user?.email || 'N/A'}</p>
                </Col>
                <Col sm={6}>
                  <p className="text-muted mb-1 fs-7 text-uppercase fw-bold"><i className="bi bi-circle-fill text-success me-2" style={{ fontSize: '10px' }}></i>Status</p>
                  <p className="fw-semibold mb-0 fs-5 text-success">Active</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Working Schedule */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Working Schedule</h5>
                <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary">
                  <i className="bi bi-calendar-week fs-5"></i>
                </div>
              </div>
              
              <div className="p-4 bg-light rounded-4 mb-4 border border-light shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold text-primary"><i className="bi bi-clock-history me-2"></i>Current Shift</span>
                  <span className="badge bg-white text-dark border">Regular</span>
                </div>
                <h3 className="fw-bold text-dark mb-1">08:30 AM <span className="text-muted fs-4 mx-2">-</span> 05:30 PM</h3>
                <p className="text-muted fs-6 mb-0">Monday to Friday</p>
              </div>

              <div className="mt-auto">
                <p className="text-muted mb-2 fw-bold fs-7 text-uppercase">Upcoming Holiday</p>
                <div className="d-flex align-items-center p-3 border rounded-4 border-start border-4 border-warning bg-warning bg-opacity-10 shadow-sm">
                  <div className="me-3 text-center border-end border-warning pe-3">
                    <h4 className="fw-bold mb-0 text-dark">14</h4>
                    <span className="text-muted fs-7 text-uppercase fw-bold">Oct</span>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Poya Day Holiday</h6>
                    <span className="badge bg-warning text-dark">Public Holiday</span>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Attendance Graph */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Weekly Attendance</h5>
                <span className="badge bg-light text-dark border">This Week</span>
              </div>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={dummyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6c757d', fontSize: 13, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6c757d', fontSize: 13 }} />
                    <Tooltip 
                      cursor={{ fill: '#f8f9fa' }} 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} 
                    />
                    <Bar dataKey="hours" radius={[6, 6, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* SCOT News */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">SCOT News</h5>
                <div className="bg-success bg-opacity-10 p-2 rounded-circle text-success">
                  <i className="bi bi-newspaper fs-5"></i>
                </div>
              </div>
              
              <div className="d-flex flex-column gap-3">
                {dummyNews.map(news => (
                  <div key={news.id} className="d-flex p-3 rounded-4 border align-items-center" style={{ transition: 'all 0.2s ease', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.classList.add('shadow-sm')} onMouseOut={(e) => e.currentTarget.classList.remove('shadow-sm')}>
                    <div className={`bg-${news.color} bg-opacity-10 p-3 rounded-circle me-3 text-${news.color} shadow-sm d-flex align-items-center justify-content-center`} style={{ width: 50, height: 50 }}>
                      <i className={`bi ${news.icon} fs-4`}></i>
                    </div>
                    <div>
                      <span className={`badge bg-${news.color} bg-opacity-10 text-${news.color} mb-1 border border-${news.color} border-opacity-25`}>{news.type}</span>
                      <h6 className="fw-bold mb-1 text-dark" style={{ lineHeight: '1.4' }}>{news.title}</h6>
                      <p className="text-muted fs-7 mb-0 fw-medium"><i className="bi bi-clock me-1"></i> {news.date}</p>
                    </div>
                    <i className="bi bi-chevron-right ms-auto text-muted opacity-50"></i>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;
