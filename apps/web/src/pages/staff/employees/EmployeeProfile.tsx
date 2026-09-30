import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Nav, Tab, Row, Col, Badge, Button, Spinner, Table } from 'react-bootstrap';
import { format } from 'date-fns';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import type { Employee } from '@scot-erp/shared';

const EmployeeProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: employee, isLoading, isError } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const res = await api.get(`/employees/${id}`);
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="alert alert-danger">
        Failed to load employee profile.
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge bg="success">Active</Badge>;
      case 'Probation': return <Badge bg="info">Probation</Badge>;
      case 'Onboarding': return <Badge bg="warning" text="dark">Onboarding</Badge>;
      case 'Notice Period': return <Badge bg="warning" text="dark">Notice Period</Badge>;
      case 'Resigned': return <Badge bg="secondary">Resigned</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const isAdmin = user?.roles?.some(r => ['SystemAdmin', 'HR', 'COO'].includes(r));
  const isSelf = user?.id === employee.id;

  return (
    <div className="employee-profile-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item"><Link to="/employees" className="text-decoration-none">Employees</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{employee.preferredName}</li>
            </ol>
          </nav>
          <h2 className="fw-bold mb-0">Employee Profile</h2>
        </div>
        <div className="d-flex gap-2">
          {isAdmin && (
            <>
              <Button variant="outline-secondary"><i className="bi bi-pencil me-2"></i>Edit Profile</Button>
              <Button variant="outline-danger"><i className="bi bi-person-dash me-2"></i>Deactivate</Button>
            </>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="border-0 shadow-sm mb-4 overflow-hidden">
        <div className="bg-primary" style={{ height: '100px' }}></div>
        <Card.Body className="position-relative pt-0 px-4 pb-4">
          <div className="d-flex justify-content-between align-items-end mb-3" style={{ marginTop: '-40px' }}>
            <div className="d-flex align-items-end">
              <div 
                className="bg-white rounded-circle p-1 me-3 shadow-sm" 
                style={{ width: '100px', height: '100px' }}
              >
                <div 
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center h-100 w-100 fs-1 fw-bold"
                >
                  {employee.preferredName.charAt(0)}
                </div>
              </div>
              <div className="pb-1">
                <h3 className="fw-bold mb-1">{employee.title} {employee.nameInFull}</h3>
                <p className="text-muted mb-0 fs-5">{employee.designation} <span className="mx-2">•</span> {employee.departmentCode}</p>
              </div>
            </div>
            <div className="pb-2">
              {getStatusBadge(employee.status)}
            </div>
          </div>
          
          <Row className="g-3 mt-2">
            <Col sm={6} md={3}>
              <div className="text-muted small">Staff ID</div>
              <div className="fw-medium">{employee.staffId}</div>
            </Col>
            <Col sm={6} md={3}>
              <div className="text-muted small">Email</div>
              <div className="fw-medium">{employee.email}</div>
            </Col>
            <Col sm={6} md={3}>
              <div className="text-muted small">Contact Number</div>
              <div className="fw-medium">{employee.contactNumber || 'N/A'}</div>
            </Col>
            <Col sm={6} md={3}>
              <div className="text-muted small">Joined Date</div>
              <div className="fw-medium">{format(new Date(employee.dateJoined), 'd-MMM-yy')}</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Profile Tabs */}
      <Card className="border-0 shadow-sm">
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')}>
          <Card.Header className="bg-white border-bottom-0 pt-3 pb-0 px-4">
            <Nav variant="tabs" className="border-bottom-0 gap-3">
              <Nav.Item>
                <Nav.Link eventKey="overview" className={`border-0 pb-3 fw-medium ${activeTab === 'overview' ? 'text-primary border-bottom border-primary border-2 rounded-0' : 'text-muted'}`}>Overview</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="documents" className={`border-0 pb-3 fw-medium ${activeTab === 'documents' ? 'text-primary border-bottom border-primary border-2 rounded-0' : 'text-muted'}`}>Documents</Nav.Link>
              </Nav.Item>
              {(isAdmin || isSelf) && (
                <Nav.Item>
                  <Nav.Link eventKey="salary" className={`border-0 pb-3 fw-medium ${activeTab === 'salary' ? 'text-primary border-bottom border-primary border-2 rounded-0' : 'text-muted'}`}>Salary & Payslips</Nav.Link>
                </Nav.Item>
              )}
              <Nav.Item>
                <Nav.Link eventKey="attendance" className={`border-0 pb-3 fw-medium ${activeTab === 'attendance' ? 'text-primary border-bottom border-primary border-2 rounded-0' : 'text-muted'}`}>Attendance</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="leave" className={`border-0 pb-3 fw-medium ${activeTab === 'leave' ? 'text-primary border-bottom border-primary border-2 rounded-0' : 'text-muted'}`}>Leave & OT</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="evaluations" className={`border-0 pb-3 fw-medium ${activeTab === 'evaluations' ? 'text-primary border-bottom border-primary border-2 rounded-0' : 'text-muted'}`}>Evaluations</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="kpi" className={`border-0 pb-3 fw-medium ${activeTab === 'kpi' ? 'text-primary border-bottom border-primary border-2 rounded-0' : 'text-muted'}`}>KPI</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="assets" className={`border-0 pb-3 fw-medium ${activeTab === 'assets' ? 'text-primary border-bottom border-primary border-2 rounded-0' : 'text-muted'}`}>Assets</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body className="p-4 bg-light bg-opacity-50">
            <Tab.Content>
              <Tab.Pane eventKey="overview">
                <OverviewTab employee={employee} />
              </Tab.Pane>
              <Tab.Pane eventKey="documents">
                <div className="text-center py-5 text-muted">Documents Component (TODO)</div>
              </Tab.Pane>
              <Tab.Pane eventKey="salary">
                <div className="text-center py-5 text-muted">Salary & Payslips Component (TODO)</div>
              </Tab.Pane>
              <Tab.Pane eventKey="attendance">
                <AttendanceTab employee={employee} />
              </Tab.Pane>
              <Tab.Pane eventKey="leave">
                <LeaveTab employee={employee} />
              </Tab.Pane>
              <Tab.Pane eventKey="evaluations">
                <div className="text-center py-5 text-muted">Evaluations Component (TODO)</div>
              </Tab.Pane>
              <Tab.Pane eventKey="kpi">
                <div className="text-center py-5 text-muted">KPI Component (TODO)</div>
              </Tab.Pane>
              <Tab.Pane eventKey="assets">
                <AssetsTab employee={employee} />
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Tab.Container>
      </Card>
    </div>
  );
};

// Sub-component for Overview Tab
const OverviewTab = ({ employee }: { employee: Employee }) => {
  return (
    <Row className="g-4">
      <Col md={6}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Header className="bg-white border-0 pt-4 pb-0">
            <h5 className="fw-bold mb-0">Personal Information</h5>
          </Card.Header>
          <Card.Body>
            <Table borderless size="sm">
              <tbody>
                <tr>
                  <td className="text-muted w-35">Date of Birth</td>
                  <td className="fw-medium">{employee.dateOfBirth ? format(new Date(employee.dateOfBirth), 'd-MMM-yy') : '-'}</td>
                </tr>
                <tr>
                  <td className="text-muted">NIC</td>
                  <td className="fw-medium">{employee.nic || '-'}</td>
                </tr>
                <tr>
                  <td className="text-muted">Marital Status</td>
                  <td className="fw-medium">{employee.maritalStatus || '-'}</td>
                </tr>
                <tr>
                  <td className="text-muted">Personal Email</td>
                  <td className="fw-medium">{employee.personalEmail || '-'}</td>
                </tr>
                <tr>
                  <td className="text-muted align-top">Address</td>
                  <td className="fw-medium">{employee.address || '-'}</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Header className="bg-white border-0 pt-4 pb-0">
            <h5 className="fw-bold mb-0">Employment Details</h5>
          </Card.Header>
          <Card.Body>
            <Table borderless size="sm">
              <tbody>
                <tr>
                  <td className="text-muted w-35">Employee Category</td>
                  <td className="fw-medium">{employee.employeeCategory || '-'}</td>
                </tr>
                <tr>
                  <td className="text-muted">Cadre Level</td>
                  <td className="fw-medium">{employee.cadreLevel || '-'}</td>
                </tr>
                <tr>
                  <td className="text-muted">User Roles</td>
                  <td className="fw-medium">
                    {employee.userRole?.map((role, i) => (
                      <Badge key={i} bg="light" text="dark" className="me-1 border">{role}</Badge>
                    ))}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">Supervisor</td>
                  <td className="fw-medium">{employee.supervisorStaffId || 'None'}</td>
                </tr>
                <tr>
                  <td className="text-muted">Leave Entitlement</td>
                  <td className="fw-medium">{employee.leaveEntitlementHours ? `${employee.leaveEntitlementHours / 8} Days` : '-'}</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
      <Col md={12}>
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0 pt-4 pb-0">
            <h5 className="fw-bold mb-0">Emergency Contact</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <div className="text-muted small">Name</div>
                <div className="fw-medium">{employee.emergencyContactName || '-'}</div>
              </Col>
              <Col md={3}>
                <div className="text-muted small">Relationship</div>
                <div className="fw-medium">{employee.emergencyContactRelationship || '-'}</div>
              </Col>
              <Col md={3}>
                <div className="text-muted small">Mobile</div>
                <div className="fw-medium">{employee.emergencyContactMobile || '-'}</div>
              </Col>
              <Col md={3}>
                <div className="text-muted small">Address</div>
                <div className="fw-medium">{employee.emergencyContactAddress || '-'}</div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

// Sub-component for Attendance Tab
const AttendanceTab = ({ employee }: { employee: Employee }) => {
  const { data: attendanceData } = useQuery({
    queryKey: ['attendance', employee.id],
    queryFn: async () => {
      const month = format(new Date(), 'yyyy-MM');
      const res = await api.get(`/attendance/employee/${employee.id}/${month}`);
      return res.data.data;
    }
  });

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-0 pt-4 pb-0">
        <h5 className="fw-bold mb-0">Recent Attendance</h5>
      </Card.Header>
      <Card.Body>
        <Table hover className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Shift</th>
              <th>First In</th>
              <th>Last Out</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData?.map((day: any) => (
              <tr key={day.id}>
                <td>{format(new Date(day.date), 'd MMM yyyy')}</td>
                <td>08:30 - 17:30</td>
                <td>{day.firstPunchIn ? format(new Date(day.firstPunchIn), 'hh:mm a') : '-'}</td>
                <td>{day.lastPunchOut ? format(new Date(day.lastPunchOut), 'hh:mm a') : '-'}</td>
                <td>
                  <Badge bg={day.status.includes('Present') ? 'success' : day.status === 'Absent' ? 'danger' : 'warning'}>
                    {day.status}
                  </Badge>
                </td>
                <td>{day.notes || '-'}</td>
              </tr>
            ))}
            {(!attendanceData || attendanceData.length === 0) && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">No attendance records for this month.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

// Sub-component for Leave Tab
const LeaveTab = ({ employee }: { employee: Employee }) => {
  const { data: leaveBalance } = useQuery({
    queryKey: ['leaveBalance', employee.id],
    queryFn: async () => {
      const year = new Date().getFullYear();
      const res = await api.get(`/leave/balance/${employee.id}/${year}`);
      return res.data.data;
    }
  });

  const { data: leaveRequests } = useQuery({
    queryKey: ['leaveRequests', employee.id],
    queryFn: async () => {
      const res = await api.get(`/leave/employee/${employee.id}`);
      return res.data.data;
    }
  });

  const total = leaveBalance?.allocatedHours ? leaveBalance.allocatedHours / 8 : (employee.leaveEntitlementHours ? employee.leaveEntitlementHours / 8 : 14);
  const used = leaveBalance?.usedHours ? leaveBalance.usedHours / 8 : 0;
  const pending = leaveBalance?.pendingHours ? leaveBalance.pendingHours / 8 : 0;
  const remaining = leaveBalance?.remainingHours ? leaveBalance.remainingHours / 8 : total;

  return (
    <Row className="g-4">
      <Col md={12}>
        <div className="d-flex gap-3 mb-2">
          <Card className="border-0 shadow-sm flex-fill bg-primary bg-opacity-10">
            <Card.Body className="text-center">
              <h3 className="fw-bold text-primary mb-0">{total}</h3>
              <div className="text-muted small fw-medium">Total Days</div>
            </Card.Body>
          </Card>
          <Card className="border-0 shadow-sm flex-fill bg-success bg-opacity-10">
            <Card.Body className="text-center">
              <h3 className="fw-bold text-success mb-0">{used}</h3>
              <div className="text-muted small fw-medium">Used Days</div>
            </Card.Body>
          </Card>
          <Card className="border-0 shadow-sm flex-fill bg-warning bg-opacity-10">
            <Card.Body className="text-center">
              <h3 className="fw-bold text-warning mb-0">{pending}</h3>
              <div className="text-muted small fw-medium">Pending</div>
            </Card.Body>
          </Card>
          <Card className="border-0 shadow-sm flex-fill bg-info bg-opacity-10">
            <Card.Body className="text-center">
              <h3 className="fw-bold text-info mb-0">{remaining}</h3>
              <div className="text-muted small fw-medium">Remaining</div>
            </Card.Body>
          </Card>
        </div>
      </Col>
      <Col md={12}>
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Leave History</h5>
          </Card.Header>
          <Card.Body>
            <Table hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests?.map((req: any) => (
                  <tr key={req.id}>
                    <td>{req.type}</td>
                    <td>{format(new Date(req.startDate), 'd MMM')} - {format(new Date(req.endDate), 'd MMM yyyy')}</td>
                    <td>{req.totalHours / 8}</td>
                    <td>{req.reason}</td>
                    <td><Badge bg={req.status === 'Approved' ? 'success' : req.status === 'Pending' ? 'warning' : 'danger'}>{req.status}</Badge></td>
                  </tr>
                ))}
                {(!leaveRequests || leaveRequests.length === 0) && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">No leave requests found.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

// Sub-component for Assets Tab
const AssetsTab = ({ employee }: { employee: Employee }) => {
  const { data: assets } = useQuery({
    queryKey: ['assets', employee.id],
    queryFn: async () => {
      const res = await api.get('/inventory/items');
      return res.data.data.filter((a: any) => a.assignedTo === employee.id);
    }
  });

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-0 pt-4 pb-0">
        <h5 className="fw-bold mb-0">Assigned Company Assets</h5>
      </Card.Header>
      <Card.Body>
        <Table hover className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Asset ID</th>
              <th>Category</th>
              <th>Description</th>
              <th>Assigned Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assets?.map((asset: any) => (
              <tr key={asset.id}>
                <td><Badge bg="light" text="dark" className="border">{asset.serialNumber}</Badge></td>
                <td>{asset.category}</td>
                <td>{asset.spec}</td>
                <td>{asset.assignedAt ? format(new Date(asset.assignedAt), 'd MMM yyyy') : '-'}</td>
                <td><Badge bg="success">Active</Badge></td>
              </tr>
            ))}
            {(!assets || assets.length === 0) && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted">No assets assigned.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default EmployeeProfile;
