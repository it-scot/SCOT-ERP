import React from 'react';
import { Card, Row, Col, Table, Badge, Button, ProgressBar } from 'react-bootstrap';
import { format } from 'date-fns';

const dummyPendingTasks = [
  { id: '1', targetName: 'Kamal Perera', pillar: 'Peer', dueAt: '2026-10-15T00:00:00.000Z', department: 'Engineering' },
  { id: '2', targetName: 'Nimal Silva', pillar: 'Peer', dueAt: '2026-10-18T00:00:00.000Z', department: 'Marketing' },
  { id: '3', targetName: 'Oshan Weerasinghe', pillar: 'Subordinate', dueAt: '2026-10-20T00:00:00.000Z', department: 'Engineering' }
];

const dummyResults = [
  { cycleId: '2025-Q4', selfScore: 4.2, peerScore: 4.0, superiorScore: 4.5, finalScore: 4.3, band: 'A', status: 'Completed' },
  { cycleId: '2025-Q2', selfScore: 4.0, peerScore: 3.8, superiorScore: 4.1, finalScore: 4.0, band: 'B+', status: 'Completed' },
  { cycleId: '2024-Q4', selfScore: 3.8, peerScore: 3.9, superiorScore: 3.7, finalScore: 3.8, band: 'B', status: 'Completed' }
];

const EvaluationsPage = () => {
  return (
    <div className="evaluations-page pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#2c3e50' }}>360° Evaluations</h2>
          <p className="text-muted mb-0">Complete your pending reviews and view past feedback reports.</p>
        </div>
        <Button variant="primary" className="rounded-pill px-4 shadow-sm fw-semibold" style={{ background: 'linear-gradient(135deg, #0d6efd, #0b5ed7)', border: 'none' }}>
          <i className="bi bi-file-earmark-pdf me-2"></i> Download Guidelines
        </Button>
      </div>

      <Row className="g-4 mb-5">
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Card.Header className="bg-white border-0 pt-4 pb-3 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Pending Evaluations</h5>
              <Badge bg="danger" pill className="px-3 py-2 shadow-sm">{dummyPendingTasks.length} Pending</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="align-middle mb-0">
                <thead className="bg-light text-muted">
                  <tr>
                    <th className="ps-4 fw-semibold border-0">Reviewee</th>
                    <th className="fw-semibold border-0">Department</th>
                    <th className="fw-semibold border-0">Type</th>
                    <th className="fw-semibold border-0">Deadline</th>
                    <th className="text-end pe-4 fw-semibold border-0">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyPendingTasks.map((task) => (
                    <tr key={task.id} style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold" style={{ width: 40, height: 40 }}>
                            {task.targetName.charAt(0)}
                          </div>
                          <span className="fw-semibold text-dark">{task.targetName}</span>
                        </div>
                      </td>
                      <td className="text-muted">{task.department}</td>
                      <td>
                        <Badge bg={task.pillar === 'Peer' ? 'info' : 'secondary'} className="px-2 py-1 rounded-pill fw-normal">
                          {task.pillar} Review
                        </Badge>
                      </td>
                      <td>
                        <span className="text-danger fw-semibold bg-danger bg-opacity-10 px-2 py-1 rounded-3">
                          <i className="bi bi-clock me-1"></i> {format(new Date(task.dueAt), 'MMM dd, yyyy')}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <Button variant="outline-primary" size="sm" className="rounded-pill px-3 fw-semibold">
                          Start Review <i className="bi bi-arrow-right ms-1"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100 position-relative overflow-hidden" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '10rem', opacity: 0.1, transform: 'rotate(-15deg)' }}>
              <i className="bi bi-star-fill"></i>
            </div>
            <Card.Body className="d-flex flex-column justify-content-center p-5 position-relative z-index-1">
              <h6 className="text-uppercase fw-semibold mb-3" style={{ letterSpacing: '1px', opacity: 0.9 }}>Last Cycle Performance</h6>
              <div className="d-flex align-items-end mb-2">
                <h1 className="display-3 fw-bold mb-0 me-2">{dummyResults[0].finalScore.toFixed(1)}</h1>
                <span className="fs-5 opacity-75 mb-2">/ 5.0</span>
              </div>
              <div className="d-flex align-items-center gap-2 mb-4">
                <Badge bg="white" text="primary" className="px-3 py-2 rounded-pill fw-bold fs-6 shadow-sm">Band {dummyResults[0].band}</Badge>
                <span className="opacity-75 fs-7"><i className="bi bi-graph-up-arrow me-1"></i> Top 15%</span>
              </div>
              <Button variant="light" className="w-100 rounded-pill py-2 fw-bold text-primary shadow-sm" style={{ transition: 'all 0.3s' }}>
                View Full Report
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Card.Header className="bg-white border-0 pt-4 pb-3 px-4 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">Evaluation History</h5>
          <div className="d-flex gap-2">
             <Button variant="light" size="sm" className="rounded-pill px-3 border"><i className="bi bi-funnel me-1"></i> Filter</Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="align-middle mb-0">
            <thead className="bg-light text-muted">
              <tr>
                <th className="ps-4 fw-semibold border-0">Cycle</th>
                <th className="fw-semibold border-0">Self (10%)</th>
                <th className="fw-semibold border-0">Peer (30%)</th>
                <th className="fw-semibold border-0">Superior (60%)</th>
                <th className="fw-semibold border-0">Final Score</th>
                <th className="fw-semibold border-0">Band</th>
                <th className="text-end pe-4 fw-semibold border-0">Report</th>
              </tr>
            </thead>
            <tbody>
              {dummyResults.map((result, idx) => (
                <tr key={idx} style={{ transition: 'all 0.2s' }}>
                  <td className="ps-4 fw-bold text-dark">
                    <div className="d-flex align-items-center">
                      <div className="bg-secondary bg-opacity-10 rounded p-2 me-3">
                        <i className="bi bi-calendar-check text-secondary fs-5"></i>
                      </div>
                      {result.cycleId}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-dark">{result.selfScore.toFixed(1)}</span>
                      <ProgressBar now={(result.selfScore / 5) * 100} style={{ width: '80px', height: '6px', backgroundColor: '#e9ecef' }} variant="info" />
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-dark">{result.peerScore.toFixed(1)}</span>
                      <ProgressBar now={(result.peerScore / 5) * 100} style={{ width: '80px', height: '6px', backgroundColor: '#e9ecef' }} variant="warning" />
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-dark">{result.superiorScore.toFixed(1)}</span>
                      <ProgressBar now={(result.superiorScore / 5) * 100} style={{ width: '80px', height: '6px', backgroundColor: '#e9ecef' }} variant="success" />
                    </div>
                  </td>
                  <td>
                    <span className="fw-bold fs-5 text-primary bg-primary bg-opacity-10 px-3 py-1 rounded-pill">{result.finalScore.toFixed(2)}</span>
                  </td>
                  <td>
                    <Badge bg={result.band === 'A' ? 'success' : 'primary'} className="px-3 py-2 rounded-pill fs-7 shadow-sm">
                      {result.band}
                    </Badge>
                  </td>
                  <td className="text-end pe-4">
                    <Button variant="light" size="sm" className="rounded-circle btn-icon shadow-sm" style={{ width: '35px', height: '35px' }}>
                      <i className="bi bi-download text-primary"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EvaluationsPage;
