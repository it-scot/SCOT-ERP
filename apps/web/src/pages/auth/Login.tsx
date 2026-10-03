import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';

const DEMO_ACCOUNTS = [
  { role: 'System Admin / COO', email: 'yohan@scot.lk' },
  { role: 'HR Manager', email: 'hr@scot.lk' },
  { role: 'IT Admin', email: 'it@scot.lk' },
  { role: 'Admin (Purchasing)', email: 'admin@scot.lk' },
  { role: 'HOD (BM)', email: 'chaminda@scot.lk' },
  { role: 'HOD (IT)', email: 'lakshmi@scot.lk' },
  { role: 'Normal Employee', email: 'hashini@scot.lk' }, 
  { role: 'Student', email: 'student1@student.scot.lk' },
];

const Login = () => {
  const [email, setEmail] = useState('hashini@scot.lk');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await login(email);
      // Determine where to route based on domain
      if (email.endsWith('@student.scot.lk')) {
        navigate('/student/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center mb-3">
                <img src="/scot-logo.png" alt="SCOTX Logo" style={{ width: 64, height: 64, objectFit: 'contain' }} />
              </div>
              <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '1px' }}>
                SCOT<span style={{ 
                  background: 'linear-gradient(45deg, #ff6b6b, #feca57)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900,
                  fontSize: '1.2em',
                  marginLeft: '2px'
                }}>X</span>
              </h2>
              <p className="text-muted">Staff Management & Performance System</p>
            </div>

            <Card className="shadow-sm border-0 mb-4">
              <Card.Body className="p-4 p-md-5">
                <h4 className="fw-bold mb-4 text-center">Sign In</h4>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4" controlId="email">
                    <Form.Label className="fw-medium">Email address</Form.Label>
                    <Form.Control 
                      type="email" 
                      placeholder="Enter your @scot.lk email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      size="lg"
                      disabled={isLoading}
                    />
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg" 
                    className="w-100 fw-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Signing in...</>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            {/* DEV MODE QUICK LOGIN */}
            <Card className="border-0 bg-white shadow-sm">
              <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                <h6 className="mb-0 fw-bold text-muted text-center text-uppercase fs-7"><i className="bi bi-tools me-2"></i>Dev Mode Quick Login</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {DEMO_ACCOUNTS.map((acc, i) => (
                    <Button 
                      key={i} 
                      variant="outline-secondary" 
                      size="sm" 
                      onClick={() => handleQuickLogin(acc.email)}
                      title={acc.role}
                    >
                      {acc.email}
                    </Button>
                  ))}
                </div>
              </Card.Body>
            </Card>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
