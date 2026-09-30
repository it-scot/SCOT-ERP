import React, { useState } from 'react';
import { Card, Table, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import type { Employee } from '@scot-erp/shared';

const EmployeeList = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deptFilter, setDeptFilter] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['employees', page, search, deptFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
        ...(deptFilter && { departmentCode: deptFilter }),
      });
      const res = await api.get(`/employees?${params}`);
      return res.data;
    }
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments');
      return res.data.data;
    }
  });

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

  return (
    <div className="employee-list-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Employees</h2>
          <p className="text-muted mb-0">Manage staff directory and profiles</p>
        </div>
        <Button variant="primary">
          <i className="bi bi-person-plus me-2"></i> Add Employee
        </Button>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="row g-3">
            <div className="col-md-4">
              <Form.Group>
                <Form.Control 
                  type="search" 
                  placeholder="Search by name, email, ID..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                <option value="">All Departments</option>
                {departments?.map((d: any) => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </Form.Select>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Employee</th>
                    <th>Staff ID</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((emp: Employee) => (
                    <tr key={emp.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40 }}>
                            {emp.preferredName.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark">{emp.nameInFull}</div>
                            <small className="text-muted">{emp.email}</small>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge bg-light text-dark border">{emp.staffId}</span></td>
                      <td>{emp.designation}</td>
                      <td>{emp.departmentCode}</td>
                      <td>{getStatusBadge(emp.status)}</td>
                      <td className="text-end pe-4">
                        <Link to={`/employees/${emp.id}`} className="btn btn-sm btn-light border">
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                  
                  {data?.data?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        No employees found matching the criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
        
        {data?.totalPages > 1 && (
          <Card.Footer className="bg-white border-0 py-3">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted small">
                Showing {data.data.length} of {data.total} employees
              </span>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  disabled={page === data.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
};

export default EmployeeList;
