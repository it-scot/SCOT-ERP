import React from 'react';
import { Card, Row, Col, Table, Badge, Button, ProgressBar } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths } from 'date-fns';
import api from '../../../services/api';

const EvaluationsPage = () => {
  const { data: pendingData } = useQuery({
    queryKey: ['evaluations', 'pending'],
    queryFn: async () => {
      const res = await api.get('/evaluations/assignments/my/pending');
      return res.data.data;
    }
  });

  const { data: resultsData } = useQuery({
    queryKey: ['evaluations', 'results'],
    queryFn: async () => {
      const res = await api.get('/evaluations/results/my');
      return res.data.data;
    }
  });

  const evalData = {
    pendingTasks: pendingData || [],
    pastResults: resultsData || []
  };

  const handleStartReview = async (taskId: string) => {
    try {
      await api.post('/evaluations/responses', {
        assignmentId: taskId,
        criterionScores: [] // Dummy response for now
      });
      alert('Review submitted successfully!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to submit review. You might have already submitted it.');
    }
  };

  return (
    <div className="evaluations-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">360° Evaluations</h2>
          <p className="text-muted mb-0">Complete pending reviews and view past feedback</p>
        </div>
      </div>

      <Row className="g-4 mb-4">
        <Col md={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="fw-bold mb-0">Pending Evaluations <Badge bg="danger" className="ms-2">{evalData?.pendingTasks.length}</Badge></h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover className="align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Reviewee</th>
                    <th>Type</th>
                    <th>Deadline</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {evalData?.pendingTasks.map((task: any) => (
                    <tr key={task.id}>
                      <td className="fw-medium">{task.targetName}</td>
                      <td><Badge bg="info" text="dark">{task.pillar} Review</Badge></td>
                      <td className="text-danger fw-semibold">{format(new Date(task.dueAt), 'MMM dd, yyyy')}</td>
                      <td className="text-end">
                        <Button variant="primary" size="sm" className="rounded-pill px-3" onClick={() => handleStartReview(task.id)}>Submit Default Review</Button>
                      </td>
                    </tr>
                  ))}
                  {(!evalData?.pendingTasks || evalData.pendingTasks.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted">No pending evaluations. Great job!</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 bg-primary text-white">
            <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center p-5">
              <i className="bi bi-star-fill text-warning mb-3" style={{ fontSize: '3rem' }}></i>
              <h3 className="fw-bold mb-1">{evalData?.pastResults?.[0]?.finalScore?.toFixed(2) || 'N/A'}</h3>
              <p className="mb-0 opacity-75">Your Score for Last Cycle</p>
              <Button variant="light" className="mt-4 rounded-pill px-4 fw-semibold text-primary">View Full Report</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 pt-4 pb-0">
          <h5 className="fw-bold mb-0">Evaluation History</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="align-middle mb-0 mt-3">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Cycle</th>
                <th>Self Score (10%)</th>
                <th>Peer Score (30%)</th>
                <th>Superior Score (60%)</th>
                <th>Final Score</th>
                <th>Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {evalData?.pastResults.map((result: any, idx: number) => (
                <tr key={idx}>
                  <td className="ps-4 fw-bold">{result.cycleId}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-medium">{result.selfScore?.toFixed(1) || '-'}</span>
                      <ProgressBar now={((result.selfScore || 0) / 5) * 100} style={{ width: '60px', height: '6px' }} variant="info" />
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-medium">{result.peerScore?.toFixed(1) || '-'}</span>
                      <ProgressBar now={((result.peerScore || 0) / 5) * 100} style={{ width: '60px', height: '6px' }} variant="warning" />
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-medium">{result.superiorScore?.toFixed(1) || '-'}</span>
                      <ProgressBar now={((result.superiorScore || 0) / 5) * 100} style={{ width: '60px', height: '6px' }} variant="success" />
                    </div>
                  </td>
                  <td className="fw-bold text-primary fs-5">{result.finalScore?.toFixed(2)}</td>
                  <td><Badge bg="success" className="status-badge approved">{result.band}</Badge></td>
                  <td className="text-end pe-4">
                    <Button variant="link" size="sm" className="text-decoration-none">Report</Button>
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
