import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="student-dashboard">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Student Dashboard</h2>
        <p className="text-muted mb-0">Welcome back, {user?.preferredName || 'Student'}!</p>
      </div>

      <Row className="g-4 mb-4">
        <Col md={12}>
          <Card className="border-0 shadow-sm bg-info text-white h-100">
            <Card.Body className="p-5 text-center">
              <i className="bi bi-mortarboard display-1 mb-3 opacity-50"></i>
              <h3 className="fw-bold">Welcome to SCoT Student Portal</h3>
              <p className="lead mb-0 opacity-75">
                The student modules are currently being developed. You will be able to access your courses, results, and fees here soon.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="g-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4 text-center">
              <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 80, height: 80 }}>
                <i className="bi bi-book fs-1 text-info"></i>
              </div>
              <h5 className="fw-bold">Courses & Materials</h5>
              <p className="text-muted">Access your enrolled course materials, lecture notes, and assignments.</p>
              <div className="badge bg-secondary">Coming Soon</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4 text-center">
              <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 80, height: 80 }}>
                <i className="bi bi-award fs-1 text-info"></i>
              </div>
              <h5 className="fw-bold">Results & Transcripts</h5>
              <p className="text-muted">View your grades, exam results, and request official transcripts.</p>
              <div className="badge bg-secondary">Coming Soon</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentDashboard;
