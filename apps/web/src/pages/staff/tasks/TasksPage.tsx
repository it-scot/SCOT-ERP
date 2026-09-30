import React, { useState } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col } from 'react-bootstrap';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

const TasksPage = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      const res = await api.get('/task/my');
      return res.data.data;
    }
  });

  const allTasks = tasksData || [];
  const filteredTasks = filter === 'All' 
    ? allTasks 
    : allTasks.filter((t: any) => t.status === filter);

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'High': return <Badge bg="danger">High</Badge>;
      case 'Medium': return <Badge bg="warning" text="dark">Medium</Badge>;
      case 'Low': return <Badge bg="info">Low</Badge>;
      default: return <Badge bg="secondary">{p}</Badge>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Open': return <Badge bg="primary">Open</Badge>;
      case 'Overdue': return <Badge bg="danger">Overdue</Badge>;
      case 'Done': return <Badge bg="success">Done</Badge>;
      default: return <Badge bg="secondary">{s}</Badge>;
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await api.put(`/task/${taskId}/complete`);
      alert('Task completed successfully!');
      // Assuming a refetch is needed, let's reload the page since we don't have refetch destructured
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to complete task.');
    }
  };

  return (
    <div className="tasks-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Team Requests (Tasks)</h2>
          <p className="text-muted mb-0">Manage approvals and pending tasks</p>
        </div>
      </div>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 bg-primary text-white">
            <Card.Body>
              <h6 className="text-white-50 fw-medium mb-3">SLA Compliance</h6>
              <h2 className="fw-bold mb-1">92%</h2>
              <p className="mb-0 text-white-50 small">Target: 95%</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 bg-white">
            <Card.Body>
              <h6 className="text-muted fw-medium mb-3">Pending Tasks</h6>
              <h2 className="fw-bold text-dark mb-1">
                {allTasks.filter((t: any) => t.status === 'Open').length}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 bg-danger text-white">
            <Card.Body>
              <h6 className="text-white-50 fw-medium mb-3">Overdue</h6>
              <h2 className="fw-bold mb-1">
                {allTasks.filter((t: any) => t.status === 'Overdue').length}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom pt-4 pb-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">Inbox</h5>
          <Form.Select 
            style={{ width: '150px' }} 
            size="sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Tasks</option>
            <option value="Open">Open</option>
            <option value="Overdue">Overdue</option>
            <option value="Done">Done</option>
          </Form.Select>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Task</th>
                  <th>Requested By</th>
                  <th>Created</th>
                  <th>Deadline</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task: any) => {
                  const isOverdue = new Date(task.dueAt) < new Date() && task.status !== 'Done';
                  return (
                    <tr key={task.id} className={isOverdue ? 'table-danger table-opacity-10' : ''}>
                      <td className="ps-4">
                        <div className="fw-medium text-dark">{task.title}</div>
                        <small className="text-muted">{task.type}</small>
                      </td>
                      <td>{task.requestedBy}</td>
                      <td>
                        <div className="text-muted small">
                          {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                        </div>
                      </td>
                      <td>
                        <div className={`fw-medium small ${isOverdue ? 'text-danger' : 'text-dark'}`}>
                          {format(new Date(task.dueAt), 'd MMM yyyy, HH:mm')}
                        </div>
                      </td>
                      <td>{getPriorityBadge(task.priority)}</td>
                      <td>{getStatusBadge(isOverdue && task.status === 'Open' ? 'Overdue' : task.status)}</td>
                      <td className="text-end pe-4">
                        {task.status !== 'Done' ? (
                          <Button variant="primary" size="sm" onClick={() => handleCompleteTask(task.id)}>Complete</Button>
                        ) : (
                           <span className="text-muted small">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      No tasks found in this view. You're all caught up!
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TasksPage;
