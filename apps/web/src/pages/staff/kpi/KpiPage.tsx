import React, { useState } from 'react';
import { Card, Row, Col, Table, Badge, Button, ProgressBar } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths } from 'date-fns';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

const KpiPage = () => {
  const { user } = useAuth();
  const [month, setMonth] = useState(format(subMonths(new Date(), 1), 'yyyy-MM'));

  const { data: kpiData } = useQuery({
    queryKey: ['kpi', user?.id],
    queryFn: async () => {
      const res = await api.get('/kpi/my');
      const snapshots = res.data.data;
      
      if (!snapshots || snapshots.length === 0) return null;
      
      // Sort by period descending
      snapshots.sort((a: any, b: any) => b.period.localeCompare(a.period));
      
      const latest = snapshots[0];
      
      return {
        overallScore: latest.compositeScore,
        components: [
          { name: `Attendance (${latest.weights.attendance}%)`, score: latest.attendanceScore, points: latest.attendanceScore * (latest.weights.attendance/100), maxPoints: latest.weights.attendance, color: 'success' },
          { name: `Evaluation (${latest.weights.evaluation}%)`, score: latest.evaluationScore, points: latest.evaluationScore * (latest.weights.evaluation/100), maxPoints: latest.weights.evaluation, color: 'info' },
          { name: `Responsiveness (${latest.weights.responsiveness}%)`, score: latest.responsivenessScore, points: latest.responsivenessScore * (latest.weights.responsiveness/100), maxPoints: latest.weights.responsiveness, color: 'warning' },
          { name: `Evaluator Reliability (${latest.weights.evaluatorReliability}%)`, score: latest.evaluatorReliabilityScore, points: latest.evaluatorReliabilityScore * (latest.weights.evaluatorReliability/100), maxPoints: latest.weights.evaluatorReliability, color: 'primary' },
        ],
        history: snapshots.map((s: any) => ({
          month: s.period,
          score: s.compositeScore,
          grade: s.band,
          attendance: s.attendanceScore,
          eval: s.evaluationScore,
          response: s.responsivenessScore,
          reliability: s.evaluatorReliabilityScore
        }))
      };
    }
  });

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A': return <Badge bg="success" className="fs-6 px-3 py-2 rounded-pill">Grade A (Excellent)</Badge>;
      case 'B': return <Badge bg="info" className="fs-6 px-3 py-2 rounded-pill text-dark">Grade B (Good)</Badge>;
      case 'C': return <Badge bg="warning" className="fs-6 px-3 py-2 rounded-pill text-dark">Grade C (Average)</Badge>;
      default: return <Badge bg="danger" className="fs-6 px-3 py-2 rounded-pill">Grade D (Needs Improvement)</Badge>;
    }
  };

  return (
    <div className="kpi-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Key Performance Indicators (KPI)</h2>
          <p className="text-muted mb-0">System-generated performance metrics based on your activity</p>
        </div>
      </div>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 bg-dark text-white">
            <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center p-5">
              <h5 className="text-white-50 mb-3 text-uppercase letter-spacing-1">Overall KPI Score</h5>
              <div className="display-3 fw-bold mb-3">{kpiData?.overallScore?.toFixed(1) || '0.0'}%</div>
              {getGradeBadge((kpiData?.overallScore || 0) >= 85 ? 'A' : (kpiData?.overallScore || 0) >= 75 ? 'B' : (kpiData?.overallScore || 0) >= 60 ? 'C' : 'D')}
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="fw-bold mb-0">Score Breakdown</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-4 mt-2">
                {kpiData?.components.map((comp, idx) => (
                  <div key={idx}>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-medium text-dark">{comp.name}</span>
                      <span className="fw-bold text-dark">{comp.points.toFixed(1)} <small className="text-muted fw-normal">/ {comp.maxPoints}</small></span>
                    </div>
                    <ProgressBar now={(comp.points / comp.maxPoints) * 100} variant={comp.color} style={{ height: '8px' }} />
                    <div className="text-muted small mt-1">Component Score: {comp.score.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 pt-4 pb-0">
          <h5 className="fw-bold mb-0">Historical Performance</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="align-middle mb-0 mt-3">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Month</th>
                <th>Overall Score</th>
                <th>Grade</th>
                <th>Attendance</th>
                <th>Evaluations</th>
                <th>Responsiveness</th>
                <th>Reliability</th>
              </tr>
            </thead>
            <tbody>
              {kpiData?.history.map((hist: any, idx: number) => (
                <tr key={idx}>
                  <td className="ps-4 fw-bold">{hist.month}</td>
                  <td className="fw-bold fs-5">{hist.score.toFixed(1)}%</td>
                  <td>{getGradeBadge(hist.grade)}</td>
                  <td>{hist.attendance.toFixed(1)}%</td>
                  <td>{hist.eval.toFixed(1)}%</td>
                  <td>{hist.response.toFixed(1)}%</td>
                  <td>{hist.reliability.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default KpiPage;
