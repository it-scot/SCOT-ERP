import React from 'react';
import { Card, Container } from 'react-bootstrap';

const UnderConstruction = () => {
  return (
    <Container className="d-flex flex-column justify-content-center align-items-center w-100" style={{ minHeight: '80vh' }}>
      <Card className="border-0 shadow text-center p-4 p-md-5 w-100" style={{ borderRadius: '20px', maxWidth: '550px' }}>
        <Card.Body className="p-0">
          <div className="mb-4 rounded-4 overflow-hidden shadow-sm bg-light">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              src="/notfound.mp4" 
              style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: '300px' }}
            />
          </div>
          <h4 className="fw-bold text-primary mb-3" style={{ letterSpacing: '0.5px' }}>
            Please wait IT is working on that...
          </h4>
          <p className="text-muted mb-0">
            This module is currently under development. We're building something awesome for you!
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UnderConstruction;
