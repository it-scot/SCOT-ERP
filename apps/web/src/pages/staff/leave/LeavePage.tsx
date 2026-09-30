import React, { useState } from 'react';
import { Card, Row, Col, Table, Badge, Button, Form, Modal } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

const LeavePage = () => {
  const { user } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const { data: balanceData } = useQuery({
    queryKey: ['leaveBalance', user?.id],
    queryFn: async () => {
      const res = await api.get('/leave/balance');
      return res.data.data;
    }
  });

  const { data: requestsData, refetch } = useQuery({
    queryKey: ['leaveRequests', user?.id],
    queryFn: async () => {
      const res = await api.get('/leave/my');
      return res.data.data;
    }
  });

  const handleApplyLeave = async () => {
    try {
      const days = Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 3600 * 24)) + 1;
      
      await api.post('/leave', {
        type: formData.type,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        days: days,
        reason: formData.reason
      });
      setShowApplyModal(false);
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to apply for leave');
    }
  };

  const handleCancelLeave = async (id: string) => {
    try {
      await api.put(`/leave/${id}/cancel`);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge bg="success" className="status-badge approved">Approved</Badge>;
      case 'Pending': return <Badge bg="warning" className="status-badge pending" text="dark">Pending</Badge>;
      case 'Declined': return <Badge bg="danger" className="status-badge declined">Declined</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="leave-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Leave & Overtime</h2>
          <p className="text-muted mb-0">Manage your time off, lieu leave, and WFH requests</p>
        </div>
        <Button variant="primary" onClick={() => setShowApplyModal(true)}>
          <i className="bi bi-calendar-plus me-2"></i> Apply Leave
        </Button>
      </div>

      <Row className="g-4 mb-4">
        <Col md={3} sm={6}>
          <div className="stat-card stat-primary h-100">
            <div className="d-flex justify-content-between">
              <div className="stat-label">Annual Leave</div>
              <div className="fw-bold fs-4">{balanceData?.annual?.remaining || 0} <small className="text-muted fs-6">/ {balanceData?.annual?.total || 14}</small></div>
            </div>
            <div className="mt-3 small text-muted">
              Used: {balanceData?.annual?.used || 0} | Pending: {balanceData?.annual?.pending || 0}
            </div>
          </div>
        </Col>
        <Col md={3} sm={6}>
          <div className="stat-card stat-success h-100">
            <div className="d-flex justify-content-between">
              <div className="stat-label">Casual Leave</div>
              <div className="fw-bold fs-4">{balanceData?.casual?.remaining || 0} <small className="text-muted fs-6">/ {balanceData?.casual?.total || 7}</small></div>
            </div>
            <div className="mt-3 small text-muted">
              Used: {balanceData?.casual?.used || 0} | Pending: {balanceData?.casual?.pending || 0}
            </div>
          </div>
        </Col>
        <Col md={3} sm={6}>
          <div className="stat-card stat-info h-100">
            <div className="d-flex justify-content-between">
              <div className="stat-label">Medical Leave</div>
              <div className="fw-bold fs-4">{balanceData?.medical?.remaining || 0} <small className="text-muted fs-6">/ {balanceData?.medical?.total || 14}</small></div>
            </div>
            <div className="mt-3 small text-muted">
              Used: {balanceData?.medical?.used || 0} | Pending: {balanceData?.medical?.pending || 0}
            </div>
          </div>
        </Col>
        <Col md={3} sm={6}>
          <div className="stat-card stat-purple h-100">
            <div className="d-flex justify-content-between">
              <div className="stat-label">Lieu Leave</div>
              <div className="fw-bold fs-4 text-purple">{balanceData?.lieu?.remaining || 0} <small className="text-muted fs-6">Accrued</small></div>
            </div>
            <div className="mt-3 small text-muted">
              Earned by working weekends/holidays
            </div>
          </div>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 pt-4 pb-3">
          <h5 className="fw-bold mb-0">Leave History</h5>
        </Card.Header>
        <Card.Body className="p-0 data-table">
          <Table responsive hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Applied On</th>
                <th>Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requestsData?.map((req: any) => (
                <tr key={req.id}>
                  <td className="ps-4 fw-medium">{req.type}</td>
                  <td>
                    <div className="text-dark">{format(new Date(req.startDate), 'MMM dd, yyyy')}</div>
                    {req.startDate !== req.endDate && (
                      <small className="text-muted">to {format(new Date(req.endDate), 'MMM dd, yyyy')}</small>
                    )}
                  </td>
                  <td>{req.days} Day(s)</td>
                  <td className="text-truncate" style={{ maxWidth: '200px' }}>{req.reason}</td>
                  <td><span className="text-muted">{format(new Date(req.createdAt || req.startDate), 'MMM dd')}</span></td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td className="text-end pe-4">
                    {req.status === 'Pending' && (
                      <Button variant="outline-danger" size="sm" className="me-2 py-0 px-2 rounded-pill" onClick={() => handleCancelLeave(req.id)}>Cancel</Button>
                    )}
                    <Button variant="link" size="sm" className="text-decoration-none">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Apply for Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Leave Type</Form.Label>
              <Form.Select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="Annual">Annual Leave</option>
                <option value="Casual">Casual Leave</option>
                <option value="Medical">Medical Leave</option>
                <option value="Lieu">Lieu Leave</option>
                <option value="WFH">Work From Home</option>
              </Form.Select>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Start Date</Form.Label>
                  <Form.Control type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">End Date</Form.Label>
                  <Form.Control type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Reason</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Briefly explain the reason for your leave..." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Handover Person (Optional)</Form.Label>
              <Form.Select>
                <option value="">Select colleague...</option>
                <option value="1">Nimal Perera</option>
                <option value="2">Kasun Rajapaksa</option>
              </Form.Select>
              <Form.Text className="text-muted">Who will handle urgent matters in your absence?</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowApplyModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleApplyLeave}>Submit Application</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LeavePage;
