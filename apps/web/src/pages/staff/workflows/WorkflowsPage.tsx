import React, { useState } from 'react';
import { Card, Table, Badge, Button, Form, Tab, Nav, Row, Col, ProgressBar } from 'react-bootstrap';
import { format } from 'date-fns';

import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

const WorkflowsPage = () => {
  const [activeTab, setActiveTab] = useState('onboarding');

  const { data: onboardingData } = useQuery({
    queryKey: ['onboarding', 'active'],
    queryFn: async () => {
      const res = await api.get('/onboarding/active');
      return res.data.data;
    }
  });

  const { data: resignationData } = useQuery({
    queryKey: ['resignation', 'active'],
    queryFn: async () => {
      const res = await api.get('/resignation/active');
      return res.data.data;
    }
  });

  const onboardingFlows = onboardingData || [];
  
  // Map resignation to steps
  const offboardingFlows = (resignationData || []).map((r: any) => ({
    ...r,
    steps: [
      { name: 'Resignation Accepted', owner: 'HOD', status: r.hodStatus === 'Approved' ? 'Done' : 'Pending', completedAt: r.hodRespondedAt, slaMet: true },
      { name: 'IT Asset Return', owner: 'IT', status: r.itHandoverCompleted ? 'Done' : 'Pending', completedAt: r.itHandoverAt, dueDate: r.proposedLastWorkingDate, isOverdue: false },
      { name: 'Company Evaluation', owner: 'Employee', status: r.exitEvaluationSubmitted ? 'Done' : 'Pending', completedAt: r.exitEvaluationAt, dueDate: r.proposedLastWorkingDate, isOverdue: false },
      { name: 'Service Letter Upload', owner: 'HR', status: r.serviceLetterUploadedAt ? 'Done' : 'Pending', completedAt: r.serviceLetterUploadedAt, dueDate: r.proposedLastWorkingDate, isOverdue: false }
    ]
  }));

  const renderStatusBadge = (status: string, isOverdue: boolean = false) => {
    if (status === 'Done') return <Badge bg="success"><i className="bi bi-check-circle me-1"></i>Done</Badge>;
    if (isOverdue) return <Badge bg="danger"><i className="bi bi-exclamation-triangle me-1"></i>Overdue</Badge>;
    return <Badge bg="warning" text="dark"><i className="bi bi-clock me-1"></i>Pending</Badge>;
  };

  const getProgress = (steps: any[]) => {
    const done = steps.filter(s => s.status === 'Done').length;
    return (done / steps.length) * 100;
  };

  return (
    <div className="workflows-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">SLA Workflows</h2>
          <p className="text-muted mb-0">Manage Employee Onboarding & Offboarding Pipelines</p>
        </div>
        <Button variant="primary"><i className="bi bi-person-plus me-2"></i>Initiate Onboarding</Button>
      </div>

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'onboarding')}>
        <Nav variant="pills" className="mb-4 gap-2">
          <Nav.Item>
            <Nav.Link eventKey="onboarding" className="rounded-pill px-4 fw-medium">Onboarding Pipeline</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="offboarding" className="rounded-pill px-4 fw-medium">Offboarding Pipeline</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="onboarding">
            {onboardingFlows.map((flow: any) => (
              <Card key={flow.id} className="border-0 shadow-sm mb-4 overflow-hidden">
                <Card.Header className="bg-white border-bottom p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">{flow.employeeName}</h5>
                      <span className="text-muted">{flow.designation} • {flow.departmentCode} Dept • Joining: {format(new Date(flow.joinDate), 'd MMM yyyy')}</span>
                    </div>
                    <Badge bg="primary" className="fs-6">{flow.status}</Badge>
                  </div>
                  <ProgressBar now={getProgress(flow.steps || [])} style={{ height: '6px' }} />
                </Card.Header>
                <Card.Body className="p-0">
                  <Table hover className="align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Step</th>
                        <th>Owner</th>
                        <th>Status / SLA</th>
                        <th className="text-end pe-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flow.steps?.map((step: any, idx: number) => (
                        <tr key={idx}>
                          <td className="ps-4 fw-medium text-dark">{idx + 1}. {step.type || step.name}</td>
                          <td><span className="text-muted">{step.assigneeDepartment || step.owner}</span></td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {renderStatusBadge(step.status, step.isOverdue)}
                                {step.status === 'Completed' || step.status === 'Done' ? (
                                  <small className={step.slaMet !== false ? 'text-success' : 'text-danger'}>
                                    {step.slaMet !== false ? '(SLA Met)' : '(SLA Breached)'}
                                  </small>
                                ) : step.dueAt || step.dueDate ? (
                                  <small className="text-muted">Due: {format(new Date(step.dueAt || step.dueDate), 'MMM d, HH:mm')}</small>
                                ) : (
                                  <small className="text-muted">No Due Date</small>
                                )}
                            </div>
                          </td>
                          <td className="text-end pe-4">
                            {step.status === 'Pending' && <Button variant="outline-primary" size="sm" onClick={() => window.location.href = '/tasks'}>View Task</Button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            ))}
          </Tab.Pane>

          <Tab.Pane eventKey="offboarding">
             {offboardingFlows.map((flow: any) => (
              <Card key={flow.id} className="border-0 shadow-sm mb-4 overflow-hidden">
                <Card.Header className="bg-white border-bottom p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">{flow.employeeName}</h5>
                      <span className="text-muted">{flow.designation} • {flow.departmentCode} Dept • Last Day: {format(new Date(flow.proposedLastWorkingDate), 'd MMM yyyy')}</span>
                    </div>
                    <Badge bg="warning" text="dark" className="fs-6">{flow.status}</Badge>
                  </div>
                  <ProgressBar variant="warning" now={getProgress(flow.steps || [])} style={{ height: '6px' }} />
                </Card.Header>
                <Card.Body className="p-0">
                  <Table hover className="align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Step</th>
                        <th>Owner</th>
                        <th>Status / SLA</th>
                        <th className="text-end pe-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flow.steps?.map((step: any, idx: number) => (
                        <tr key={idx}>
                          <td className="ps-4 fw-medium text-dark">{idx + 1}. {step.name}</td>
                          <td><span className="text-muted">{step.owner}</span></td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {renderStatusBadge(step.status, step.isOverdue)}
                              {step.status === 'Done' ? (
                                <small className={step.slaMet !== false ? 'text-success' : 'text-danger'}>
                                  {step.slaMet !== false ? '(SLA Met)' : '(SLA Breached)'}
                                </small>
                              ) : step.dueAt || step.dueDate ? (
                                <small className="text-muted">Due: {format(new Date(step.dueAt || step.dueDate), 'MMM d, HH:mm')}</small>
                              ) : (
                                <small className="text-muted">No Due Date</small>
                              )}
                            </div>
                          </td>
                          <td className="text-end pe-4">
                            {step.status === 'Pending' && <Button variant="outline-primary" size="sm" onClick={() => window.location.href = '/tasks'}>View Task</Button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            ))}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default WorkflowsPage;
