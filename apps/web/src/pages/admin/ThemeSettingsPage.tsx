import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ThemeSettingsPage = () => {
  const { user } = useAuth();
  
  const [isGlobalSnowEnabled, setIsGlobalSnowEnabled] = useState(
    localStorage.getItem('snowThemeEnabled') === 'true'
  );

  const [isGlobalVesakEnabled, setIsGlobalVesakEnabled] = useState(
    localStorage.getItem('vesakThemeEnabled') === 'true'
  );

  const [isGlobalRainEnabled, setIsGlobalRainEnabled] = useState(
    localStorage.getItem('rainThemeEnabled') === 'true'
  );

  const [isGlobalIndependenceEnabled, setIsGlobalIndependenceEnabled] = useState(
    localStorage.getItem('independenceThemeEnabled') === 'true'
  );

  const [isGlobalAvuruduEnabled, setIsGlobalAvuruduEnabled] = useState(
    localStorage.getItem('avuruduThemeEnabled') === 'true'
  );

  const [isGlobalKiteEnabled, setIsGlobalKiteEnabled] = useState(
    localStorage.getItem('kiteThemeEnabled') === 'true'
  );

  // If not IT user, redirect
  if (user?.email !== 'it@scot.lk') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleToggleSnow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setIsGlobalSnowEnabled(newValue);
    localStorage.setItem('snowThemeEnabled', newValue.toString());
    window.dispatchEvent(new Event('theme-changed'));
  };

  const handleToggleVesak = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setIsGlobalVesakEnabled(newValue);
    localStorage.setItem('vesakThemeEnabled', newValue.toString());
    window.dispatchEvent(new Event('theme-changed'));
  };

  const handleToggleRain = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setIsGlobalRainEnabled(newValue);
    localStorage.setItem('rainThemeEnabled', newValue.toString());
    window.dispatchEvent(new Event('theme-changed'));
  };

  const handleToggleIndependence = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setIsGlobalIndependenceEnabled(newValue);
    localStorage.setItem('independenceThemeEnabled', newValue.toString());
    window.dispatchEvent(new Event('theme-changed'));
  };

  const handleToggleAvurudu = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setIsGlobalAvuruduEnabled(newValue);
    localStorage.setItem('avuruduThemeEnabled', newValue.toString());
    window.dispatchEvent(new Event('theme-changed'));
  };

  const handleToggleKite = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setIsGlobalKiteEnabled(newValue);
    localStorage.setItem('kiteThemeEnabled', newValue.toString());
    window.dispatchEvent(new Event('theme-changed'));
  };

  return (
    <div className="theme-settings-page pb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Theme Settings</h2>
          <p className="text-muted mb-0">Manage global UI themes and seasonal effects</p>
        </div>
      </div>

      <Row>
        <Col md={6}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-snow2 fs-4"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-1">Winter Theme (Snowfall Effect)</h5>
                  <p className="text-muted mb-0 fs-7">Enables a falling snow effect across the main screens during November & December.</p>
                </div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border">
                <div>
                  <h6 className="fw-semibold mb-1">Enable globally for all users</h6>
                  <span className="text-muted fs-7">This effect will automatically appear in the active months.</span>
                </div>
                <Form.Check 
                  type="switch"
                  id="snow-theme-switch"
                  checked={isGlobalSnowEnabled}
                  onChange={handleToggleSnow}
                  style={{ transform: 'scale(1.5)', marginRight: '10px' }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-moon-stars fs-4"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-1">Vesak Theme (Lantern Effect)</h5>
                  <p className="text-muted mb-0 fs-7">Enables glowing floating lanterns across the main screens during May.</p>
                </div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border">
                <div>
                  <h6 className="fw-semibold mb-1">Enable globally for all users</h6>
                  <span className="text-muted fs-7">This effect will automatically appear in the active months.</span>
                </div>
                <Form.Check 
                  type="switch"
                  id="vesak-theme-switch"
                  checked={isGlobalVesakEnabled}
                  onChange={handleToggleVesak}
                  style={{ transform: 'scale(1.5)', marginRight: '10px' }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mt-4">
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                <div className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-cloud-rain fs-4"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-1">Rainy Theme (Thunderstorm Effect)</h5>
                  <p className="text-muted mb-0 fs-7">Enables a heavy rain and lightning animation across the main screens.</p>
                </div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border">
                <div>
                  <h6 className="fw-semibold mb-1">Enable globally for all users</h6>
                  <span className="text-muted fs-7">Activate during monsoon or rainy seasons.</span>
                </div>
                <Form.Check 
                  type="switch"
                  id="rain-theme-switch"
                  checked={isGlobalRainEnabled}
                  onChange={handleToggleRain}
                  style={{ transform: 'scale(1.5)', marginRight: '10px' }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mt-4">
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-flag fs-4"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-1">Independence Day Theme</h5>
                  <p className="text-muted mb-0 fs-7">Displays a beautifully placed animated National Flag video during February.</p>
                </div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border">
                <div>
                  <h6 className="fw-semibold mb-1">Enable globally for all users</h6>
                  <span className="text-muted fs-7">This widget will automatically appear in February.</span>
                </div>
                <Form.Check 
                  type="switch"
                  id="independence-theme-switch"
                  checked={isGlobalIndependenceEnabled}
                  onChange={handleToggleIndependence}
                  style={{ transform: 'scale(1.5)', marginRight: '10px' }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mt-4">
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-flower1 fs-4"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-1">Sinhala & Tamil New Year Theme</h5>
                  <p className="text-muted mb-0 fs-7">Displays beautiful New Year decorations gracefully positioned on the screen during April.</p>
                </div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border">
                <div>
                  <h6 className="fw-semibold mb-1">Enable globally for all users</h6>
                  <span className="text-muted fs-7">This theme will automatically appear in April.</span>
                </div>
                <Form.Check 
                  type="switch"
                  id="avurudu-theme-switch"
                  checked={isGlobalAvuruduEnabled}
                  onChange={handleToggleAvurudu}
                  style={{ transform: 'scale(1.5)', marginRight: '10px' }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mt-4">
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-wind fs-4"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-1">August Kite Festival Theme</h5>
                  <p className="text-muted mb-0 fs-7">Displays beautifully animated colorful kites flying across the screen during August.</p>
                </div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border">
                <div>
                  <h6 className="fw-semibold mb-1">Enable globally for all users</h6>
                  <span className="text-muted fs-7">This theme will automatically appear in August.</span>
                </div>
                <Form.Check 
                  type="switch"
                  id="kite-theme-switch"
                  checked={isGlobalKiteEnabled}
                  onChange={handleToggleKite}
                  style={{ transform: 'scale(1.5)', marginRight: '10px' }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ThemeSettingsPage;
