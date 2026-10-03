import React, { useState } from 'react';
import { Card, Row, Col, Table, Badge, Button, Form } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';

const AttendancePage = () => {
  const [month, setMonth] = useState('2026-10');

  // Dummy Data for Summary & Table
  const summary = {
    workingDays: 22,
    casualLeaves: 1,
    annualLeaves: 2,
    otCountHours: 12.5,
  };

  const dummyRecords = [
    { id: 1, date: '2026-10-01', shift: '08:30 AM - 05:30 PM', inTime: '08:25 AM', outTime: '05:30 PM', lateMins: 0, otHrs: 0, status: 'Present' },
    { id: 2, date: '2026-10-02', shift: '08:30 AM - 05:30 PM', inTime: '08:45 AM', outTime: '06:00 PM', lateMins: 15, otHrs: 0.5, status: 'Late' },
    { id: 3, date: '2026-10-03', shift: '08:30 AM - 05:30 PM', inTime: '-', outTime: '-', lateMins: 0, otHrs: 0, status: 'Casual Leave' },
    { id: 4, date: '2026-10-04', shift: '08:30 AM - 05:30 PM', inTime: '08:15 AM', outTime: '07:30 PM', lateMins: 0, otHrs: 2, status: 'Present' },
    { id: 5, date: '2026-10-05', shift: '08:30 AM - 05:30 PM', inTime: '-', outTime: '-', lateMins: 0, otHrs: 0, status: 'Annual Leave' },
    { id: 6, date: '2026-10-06', shift: '08:30 AM - 05:30 PM', inTime: '08:30 AM', outTime: '05:30 PM', lateMins: 0, otHrs: 0, status: 'Present' },
    { id: 7, date: '2026-10-07', shift: '08:30 AM - 05:30 PM', inTime: '08:20 AM', outTime: '08:30 PM', lateMins: 0, otHrs: 3, status: 'Present' },
  ];

  // Dummy Data for the Graph (Decimal hours)
  const graphData = [
    { day: '01', expectedIn: 8.5, actualIn: 8.4, expectedOut: 17.5, actualOut: 17.5 },
    { day: '02', expectedIn: 8.5, actualIn: 8.75, expectedOut: 17.5, actualOut: 18.0 },
    { day: '03', expectedIn: 8.5, actualIn: null, expectedOut: 17.5, actualOut: null },
    { day: '04', expectedIn: 8.5, actualIn: 8.25, expectedOut: 17.5, actualOut: 19.5 },
    { day: '05', expectedIn: 8.5, actualIn: null, expectedOut: 17.5, actualOut: null },
    { day: '06', expectedIn: 8.5, actualIn: 8.5, expectedOut: 17.5, actualOut: 17.5 },
    { day: '07', expectedIn: 8.5, actualIn: 8.3, expectedOut: 17.5, actualOut: 20.5 },
    { day: '08', expectedIn: 8.5, actualIn: 8.4, expectedOut: 17.5, actualOut: 17.6 },
    { day: '09', expectedIn: 8.5, actualIn: 8.9, expectedOut: 17.5, actualOut: 17.5 }, // Late
    { day: '10', expectedIn: 8.5, actualIn: 8.5, expectedOut: 17.5, actualOut: 17.5 },
  ];

  const formatTime = (decimalTime: number) => {
    if (!decimalTime) return '-';
    const hrs = Math.floor(decimalTime);
    const mins = Math.round((decimalTime - hrs) * 60);
    const period = hrs >= 12 ? 'PM' : 'AM';
    const displayHrs = hrs > 12 ? hrs - 12 : (hrs === 0 ? 12 : hrs);
    return `${displayHrs}:${mins < 10 ? '0' : ''}${mins} ${period}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-3 shadow-sm">
          <p className="fw-bold mb-2 text-dark border-bottom pb-2">Date: {label} Oct</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="d-flex align-items-center mb-1" style={{ color: entry.color }}>
              <span className="me-2 fw-semibold">{entry.name}:</span>
              <span>{formatTime(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present': return <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">Present</Badge>;
      case 'Late': return <Badge bg="warning" className="bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-1">Late</Badge>;
      case 'Casual Leave': return <Badge bg="info" className="bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1">Casual Leave</Badge>;
      case 'Annual Leave': return <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">Annual Leave</Badge>;
      default: return <Badge bg="secondary" className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1">{status}</Badge>;
    }
  };

  return (
    <div className="attendance-page pb-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Attendance</h2>
          <p className="text-muted mb-0">View your working days, leaves, and OT for the selected month</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center bg-white rounded-3 shadow-sm px-3 py-2 border">
            <i className="bi bi-calendar3 text-primary me-2"></i>
            <Form.Control 
              type="month" 
              value={month} 
              onChange={(e) => setMonth(e.target.value)} 
              className="border-0 shadow-none p-0 fw-semibold text-dark cursor-pointer bg-transparent"
              style={{ width: '130px', outline: 'none' }}
            />
          </div>
          <Button variant="primary" className="rounded-3 shadow-sm px-4 fw-medium">
            <i className="bi bi-download me-2"></i> Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <Row className="g-4 mb-4">
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4 d-flex align-items-center">
              <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 60, height: 60 }}>
                <i className="bi bi-calendar-check fs-3"></i>
              </div>
              <div>
                <p className="text-muted mb-1 fw-bold fs-7 text-uppercase">Working Days</p>
                <h2 className="fw-bold mb-0 text-dark">{summary.workingDays}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4 d-flex align-items-center">
              <div className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 60, height: 60 }}>
                <i className="bi bi-cup-hot fs-3"></i>
              </div>
              <div>
                <p className="text-muted mb-1 fw-bold fs-7 text-uppercase">Casual Leaves</p>
                <h2 className="fw-bold mb-0 text-dark">{summary.casualLeaves}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4 d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 60, height: 60 }}>
                <i className="bi bi-airplane fs-3"></i>
              </div>
              <div>
                <p className="text-muted mb-1 fw-bold fs-7 text-uppercase">Annual Leaves</p>
                <h2 className="fw-bold mb-0 text-dark">{summary.annualLeaves}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4 d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 60, height: 60 }}>
                <i className="bi bi-clock-history fs-3"></i>
              </div>
              <div>
                <p className="text-muted mb-1 fw-bold fs-7 text-uppercase">Total OT (Hrs)</p>
                <h2 className="fw-bold mb-0 text-dark">{summary.otCountHours}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Visual Analysis Graph */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
        <Card.Header className="bg-white border-bottom-0 p-4 pb-0">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-1">Time Variance Analysis</h5>
              <p className="text-muted fs-7 mb-0">Compare actual clock-in/out times against your allocated shift (08:30 AM - 05:30 PM)</p>
            </div>
            <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary">
              <i className="bi bi-graph-up fs-5"></i>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-4 pt-2">
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={graphData} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f5" />
                <XAxis dataKey="day" tick={{ fill: '#6c757d', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis 
                  domain={[7, 21]} 
                  ticks={[7, 9, 11, 13, 15, 17, 19, 21]} 
                  tickFormatter={formatTime} 
                  tick={{ fill: '#6c757d', fontSize: 13 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                
                {/* Expected Shift Region Background */}
                <ReferenceArea y1={8.5} y2={17.5} fill="#e9ecef" fillOpacity={0.4} />

                {/* Lines */}
                <Line type="monotone" dataKey="expectedIn" name="Allocated Shift Start" stroke="#adb5bd" strokeDasharray="5 5" strokeWidth={2} dot={false} activeDot={false} />
                <Line type="monotone" dataKey="actualIn" name="Actual Present Time" stroke="#dc3545" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                
                <Line type="monotone" dataKey="expectedOut" name="Allocated Shift End" stroke="#adb5bd" strokeDasharray="5 5" strokeWidth={2} dot={false} activeDot={false} />
                <Line type="monotone" dataKey="actualOut" name="Actual Leave Time" stroke="#198754" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>

      {/* Attendance Table */}
      <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
        <Card.Header className="bg-white border-bottom p-4">
          <h5 className="fw-bold mb-0">Detailed Attendance Record</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4 text-muted fw-semibold py-3 border-0">Date</th>
                <th className="text-muted fw-semibold py-3 border-0">Shift</th>
                <th className="text-muted fw-semibold py-3 border-0">In Time</th>
                <th className="text-muted fw-semibold py-3 border-0">Out Time</th>
                <th className="text-muted fw-semibold py-3 border-0">Late (Mins)</th>
                <th className="text-muted fw-semibold py-3 border-0">OT (Hrs)</th>
                <th className="text-muted fw-semibold py-3 border-0">Status</th>
              </tr>
            </thead>
            <tbody>
              {dummyRecords.map((record) => (
                <tr key={record.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                  <td className="ps-4 fw-bold text-dark py-3">{record.date}</td>
                  <td><span className="text-muted fs-7">{record.shift}</span></td>
                  <td className={record.lateMins > 0 ? 'text-danger fw-bold' : 'fw-medium text-dark'}>{record.inTime}</td>
                  <td className="fw-medium text-dark">{record.outTime}</td>
                  <td>
                    {record.lateMins > 0 ? (
                      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1">+{record.lateMins}m</span>
                    ) : <span className="text-muted opacity-50">-</span>}
                  </td>
                  <td>
                    {record.otHrs > 0 ? (
                      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-1 fw-bold">+{record.otHrs}h</span>
                    ) : <span className="text-muted opacity-50">-</span>}
                  </td>
                  <td>{getStatusBadge(record.status)}</td>
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
