import React from 'react';
import { Card, Table } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const StudentProfile = () => {
  const { user } = useAuth();

  return (
    <div className="student-profile">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">My Profile</h2>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center mb-4 pb-4 border-bottom">
            <div className="avatar bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-4 shadow-sm" style={{ width: 80, height: 80, fontSize: '2rem' }}>
              {user?.preferredName?.charAt(0) || 'S'}
            </div>
            <div>
              <h4 className="fw-bold mb-1">{user?.preferredName || 'Student Name'}</h4>
              <p className="text-muted mb-0">{user?.email}</p>
            </div>
          </div>
          
          <h6 className="fw-bold text-uppercase text-muted mb-3 fs-7">Academic Information</h6>
          <Table borderless size="sm" className="mb-4">
            <tbody>
              <tr>
                <td className="text-muted w-25">Student ID</td>
                <td className="fw-medium">STU-2026-001</td>
              </tr>
              <tr>
                <td className="text-muted">Program</td>
                <td className="fw-medium">BSc in Information Technology</td>
              </tr>
              <tr>
                <td className="text-muted">Batch</td>
                <td className="fw-medium">2026 Intake</td>
              </tr>
              <tr>
                <td className="text-muted">Status</td>
                <td className="fw-medium"><span className="badge bg-success">Active</span></td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StudentProfile;
