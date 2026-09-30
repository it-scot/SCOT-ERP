import React, { useState } from 'react';
import { Card, Row, Col, Table, Badge, Button, Form } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

const AttendancePage = () => {
  const { user } = useAuth();
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', user?.id, month],
    queryFn: async () => {
      const res = await api.get(`/attendance/my/${month}`);
      const days = res.data.data;
      
      const summary = {
        presentDays: days.filter((d: any) => ['Present', 'Late', 'Half Day'].includes(d.status)).length,
        absentDays: days.filter((d: any) => d.status === 'Absent').length,
        lateDays: days.filter((d: any) => d.lateMinutes > 0).length,
        halfDays: days.filter((d: any) => d.status === 'Half Day').length,
        totalOtHours: days.reduce((sum: number, d: any) => sum + (d.otMinutes || 0), 0) / 60,
        totalLateMinutes: days.reduce((sum: number, d: any) => sum + (d.lateMinutes || 0), 0)
      };

      return { summary, records: days };
    }
  });

  const attendanceData = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present': return <Badge bg="success" className="status-badge present">Present</Badge>;
      case 'Late': return <Badge bg="warning" className="status-badge late" text="dark">Late</Badge>;
      case 'Absent': return <Badge bg="danger" className="status-badge absent">Absent</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="attendance-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Attendance</h2>
          <p className="text-muted mb-0">View your daily punches, late marks, and overtime</p>
        </div>
        <div className="d-flex gap-2">
          <Form.Control 
            type="month" 
            value={month} 
            onChange={(e) => setMonth(e.target.value)} 
          />
          <Button variant="primary" className="text-nowrap">
            <i className="bi bi-download me-2"></i> Export
          </Button>
        </div>
      </div>

      <Row className="g-4 mb-4">
        <Col md={2} sm={4} xs={6}>
          <div className="stat-card stat-success">
            <div className="stat-label">Present</div>
            <div className="stat-value text-success mt-2">{attendanceData?.summary.presentDays || 0}</div>
          </div>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <div className="stat-card stat-danger">
            <div className="stat-label">Absent</div>
            <div className="stat-value text-danger mt-2">{attendanceData?.summary.absentDays || 0}</div>
          </div>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <div className="stat-card stat-warning">
            <div className="stat-label">Late Days</div>
            <div className="stat-value text-warning mt-2">{attendanceData?.summary.lateDays || 0}</div>
          </div>
        </Col>
        <Col md={3} sm={6} xs={6}>
          <div className="stat-card stat-info">
            <div className="stat-label">Total Late (Mins)</div>
            <div className="stat-value text-info mt-2">{attendanceData?.summary.totalLateMinutes || 0}</div>
          </div>
        </Col>
        <Col md={3} sm={6} xs={12}>
          <div className="stat-card stat-primary">
            <div className="stat-label">OT Hours</div>
            <div className="stat-value text-primary mt-2">{attendanceData?.summary.totalOtHours || 0}</div>
          </div>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0 data-table">
          <Table responsive hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Date</th>
                <th>Assigned Shift</th>
                <th>In Time</th>
                <th>Out Time</th>
                <th>Late (Mins)</th>
                <th>OT (Hrs)</th>
                <th>Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData?.records?.map((record: any) => (
                <tr key={record.id}>
                  <td className="ps-4 fw-medium">{format(new Date(record.date), 'EEE, dd MMM yyyy')}</td>
                  <td><span className="text-muted">{record.expectedShiftPatternId || '-'}</span></td>
                  <td className={record.lateMinutes > 0 ? 'text-danger fw-semibold' : ''}>
                    {record.firstPunchIn ? format(new Date(record.firstPunchIn), 'hh:mm a') : '-'}
                  </td>
                  <td>{record.lastPunchOut ? format(new Date(record.lastPunchOut), 'hh:mm a') : '-'}</td>
                  <td>
                    {record.lateMinutes > 0 ? (
                      <span className="text-danger">+{record.lateMinutes}m</span>
                    ) : '-'}
                  </td>
                  <td>
                    {record.otMinutes > 0 ? (
                      <span className="text-primary">+{(record.otMinutes / 60).toFixed(1)}h</span>
                    ) : '-'}
                  </td>
                  <td>{getStatusBadge(record.status)}</td>
                  <td className="text-end pe-4">
                    <Button variant="link" size="sm" className="text-decoration-none">
                      Details
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

export default AttendancePage;
