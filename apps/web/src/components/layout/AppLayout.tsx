import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const SnowOverlay = () => (
  <>
    <style>{`
      .snow-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
      }
      .snowflake-main {
        color: rgba(255, 255, 255, 0.9);
        font-size: 1.2em;
        position: absolute;
        top: -30px;
        animation: fall-main linear infinite;
        text-shadow: 0 0 8px rgba(255,255,255,0.8);
      }
      @keyframes fall-main {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
      }
    `}</style>
    <div className="snow-overlay" aria-hidden="true">
      {[...Array(50)].map((_, i) => (
        <div 
          key={i} 
          className="snowflake-main" 
          style={{ 
            left: `${Math.random() * 100}%`, 
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
            fontSize: `${0.6 + Math.random() * 1.5}em`,
            opacity: 0.3 + Math.random() * 0.7
          }}
        >
          ❄
        </div>
      ))}
    </div>
  </>
);

const VesakOverlay = () => (
  <div 
    className="vesak-overlay" 
    style={{
      position: 'fixed',
      top: 0, 
      right: 0, 
      bottom: 0,
      width: '100%',
      pointerEvents: 'none',
      zIndex: 0, // Render behind the main content text
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'flex-end',
    }}
    aria-hidden="true"
  >
    <img 
      src="/wesak.png" 
      alt="Vesak Theme" 
      style={{
        height: '100%',
        width: '450px',
        objectFit: 'cover',
        objectPosition: 'left center',
        opacity: 0.85,
        maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
      }} 
    />
  </div>
);

const RainOverlay = () => (
  <>
    <style>{`
      .rain-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
      }
      .lightning-flash {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: rgba(255, 255, 255, 0);
        pointer-events: none;
        animation: lightning 12s infinite;
      }
      @keyframes lightning {
        0%, 91%, 94%, 96%, 100% { background-color: rgba(255, 255, 255, 0); }
        92%, 95% { background-color: rgba(255, 255, 255, 0.4); }
      }
      .raindrop {
        position: absolute;
        top: -50px;
        width: 2px;
        height: 60px;
        background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(150, 200, 255, 0.8));
        animation: rain-fall linear infinite;
      }
      @keyframes rain-fall {
        0% { transform: translateY(0) translateX(0) scaleY(1); opacity: 1; }
        100% { transform: translateY(110vh) translateX(-15vh) scaleY(1.5); opacity: 0; }
      }
      /* Splash Effects */
      .splash-ripple {
        position: absolute;
        bottom: 0;
        left: -10px;
        width: 20px;
        height: 5px;
        border: 1px solid rgba(150, 200, 255, 0.8);
        border-radius: 50%;
        animation: ripple-anim linear infinite;
      }
      @keyframes ripple-anim {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      .splash-jump {
        position: absolute;
        bottom: 0;
        left: -1px;
        width: 2px;
        height: 5px;
        background: rgba(200, 230, 255, 0.9);
        border-radius: 2px;
        animation: jump-anim cubic-bezier(0.2, 1, 0.3, 1) infinite;
      }
      @keyframes jump-anim {
        0% { transform: translateY(0) scaleY(1); opacity: 1; }
        40% { transform: translateY(-12px) scaleY(0.5); opacity: 1; }
        100% { transform: translateY(5px) scaleY(0); opacity: 0; }
      }
    `}</style>
    <div className="rain-overlay" aria-hidden="true">
      <div className="lightning-flash"></div>
      
      {/* Falling Raindrops */}
      {[...Array(60)].map((_, i) => (
        <div 
          key={`drop-${i}`} 
          className="raindrop" 
          style={{ 
            left: `${Math.random() * 110}%`, 
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${0.4 + Math.random() * 0.3}s`,
            opacity: 0.3 + Math.random() * 0.5
          }}
        />
      ))}

      {/* Splashes on the floor */}
      {[...Array(40)].map((_, i) => {
        const dur = 0.4 + Math.random() * 0.3;
        const del = Math.random() * 2;
        return (
          <div 
            key={`splash-${i}`} 
            style={{ 
              position: 'absolute',
              bottom: 0,
              left: `${Math.random() * 100}%`,
              opacity: 0.4 + Math.random() * 0.6
            }}
          >
            <div className="splash-ripple" style={{ animationDelay: `${del}s`, animationDuration: `${dur}s` }} />
            <div className="splash-jump" style={{ animationDelay: `${del}s`, animationDuration: `${dur}s` }} />
          </div>
        );
      })}
    </div>
  </>
);

const IndependenceOverlay = () => (
  <div 
    style={{
      position: 'fixed',
      bottom: '30px', 
      right: '30px', 
      zIndex: 9998,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      border: '4px solid white',
      width: '220px',
      pointerEvents: 'none'
    }}
    aria-hidden="true"
  >
    <video 
      autoPlay 
      loop 
      muted 
      playsInline
      src="/independent.mp4" 
      style={{ width: '100%', display: 'block', objectFit: 'cover' }}
    />
  </div>
);

const AvuruduOverlay = () => {
  const flowers = ['🌺', '🌼', '🌻', '🌸'];
  
  return (
    <>
      <style>{`
        .avurudu-flower {
          position: fixed;
          top: -40px;
          pointer-events: none;
          z-index: 9997;
          animation: flower-fall linear infinite;
          filter: drop-shadow(0 5px 5px rgba(0,0,0,0.15));
        }
        @keyframes flower-fall {
          0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg) translateX(50px); opacity: 0; }
        }
      `}</style>

      {/* Falling Flowers Animation */}
      <div aria-hidden="true">
        {[...Array(25)].map((_, i) => (
          <div 
            key={`flower-${i}`} 
            className="avurudu-flower"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 12}s`,
              fontSize: `${1 + Math.random() * 1.5}em`,
              opacity: 0.7 + Math.random() * 0.3
            }}
          >
            {flowers[i % flowers.length]}
          </div>
        ))}
      </div>

      {/* Static Image on the Right */}
      <div 
        style={{
          position: 'fixed',
          top: '80px', 
          right: '-25px', 
          zIndex: 9998,
          pointerEvents: 'none',
          width: '280px', 
          opacity: 0.95,
          filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.1))'
        }}
        aria-hidden="true"
      >
        <img 
          src="/sinhala-tami.png" 
          alt="Sinhala & Tamil New Year Theme" 
          style={{
            width: '100%',
            display: 'block',
            objectFit: 'contain',
            objectPosition: 'right top' 
          }} 
        />
      </div>
    </>
  );
};

const KiteOverlay = () => (
  <>
    <style>{`
      .kite-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        z-index: 9997;
        overflow: hidden;
      }
      .kite-flyer {
        position: absolute;
        bottom: -100px;
        font-size: 2.5em;
        animation: kite-fly ease-in-out infinite;
        filter: drop-shadow(0 15px 10px rgba(0,0,0,0.2));
      }
      @keyframes kite-fly {
        0% { transform: translateY(0) translateX(0) rotate(-15deg); opacity: 0; }
        15% { opacity: 1; transform: translateY(-20vh) translateX(30px) rotate(10deg); }
        50% { transform: translateY(-60vh) translateX(-40px) rotate(-10deg); }
        85% { opacity: 1; transform: translateY(-100vh) translateX(20px) rotate(15deg); }
        100% { transform: translateY(-130vh) translateX(-20px) rotate(0deg); opacity: 0; }
      }
    `}</style>
    <div className="kite-overlay" aria-hidden="true">
      {[...Array(12)].map((_, i) => (
        <div 
          key={`kite-${i}`} 
          className="kite-flyer"
          style={{
            left: `${10 + Math.random() * 80}%`, // Keep them mostly in the middle 80% of screen
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${12 + Math.random() * 8}s`,
            fontSize: `${2 + Math.random() * 1.5}em`,
            opacity: 0.8 + Math.random() * 0.2
          }}
        >
          🪁
        </div>
      ))}
    </div>
  </>
);

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSnowEnabled, setIsSnowEnabled] = useState(
    localStorage.getItem('snowThemeEnabled') === 'true'
  );
  const [isVesakEnabled, setIsVesakEnabled] = useState(
    localStorage.getItem('vesakThemeEnabled') === 'true'
  );
  const [isRainEnabled, setIsRainEnabled] = useState(
    localStorage.getItem('rainThemeEnabled') === 'true'
  );
  const [isIndependenceEnabled, setIsIndependenceEnabled] = useState(
    localStorage.getItem('independenceThemeEnabled') === 'true'
  );
  const [isAvuruduEnabled, setIsAvuruduEnabled] = useState(
    localStorage.getItem('avuruduThemeEnabled') === 'true'
  );
  const [isKiteEnabled, setIsKiteEnabled] = useState(
    localStorage.getItem('kiteThemeEnabled') === 'true'
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setIsSnowEnabled(localStorage.getItem('snowThemeEnabled') === 'true');
      setIsVesakEnabled(localStorage.getItem('vesakThemeEnabled') === 'true');
      setIsRainEnabled(localStorage.getItem('rainThemeEnabled') === 'true');
      setIsIndependenceEnabled(localStorage.getItem('independenceThemeEnabled') === 'true');
      setIsAvuruduEnabled(localStorage.getItem('avuruduThemeEnabled') === 'true');
      setIsKiteEnabled(localStorage.getItem('kiteThemeEnabled') === 'true');
    };
    window.addEventListener('theme-changed', handleStorageChange);
    return () => window.removeEventListener('theme-changed', handleStorageChange);
  }, []);

  // Themes are now manually published/unpublished by the IT admin via the settings toggle.
  const showSnow = isSnowEnabled;
  const showVesak = isVesakEnabled; 
  const showIndependence = isIndependenceEnabled; 
  const showAvurudu = isAvuruduEnabled; 
  const showKite = isKiteEnabled; 
  const showRain = isRainEnabled; 

  return (
    <div className="page-wrapper">
      <div className="main-container">
        <Sidebar isOpen={sidebarOpen} />
        <div className="app-container">
          <TopNav toggleSidebar={toggleSidebar} />
          <div className="app-body d-flex flex-column" style={{ position: 'relative', minHeight: 'calc(100vh - 60px)' }}>
            {showSnow && <SnowOverlay />}
            {showVesak && <VesakOverlay />}
            {showRain && <RainOverlay />}
            {showIndependence && <IndependenceOverlay />}
            {showAvurudu && <AvuruduOverlay />}
            {showKite && <KiteOverlay />}
            <div className="container-fluid flex-grow-1" style={{ zIndex: 1, position: 'relative' }}>
              <Outlet />
            </div>
            
            {/* Global Footer */}
            <footer className="mt-auto py-4 text-center" style={{ zIndex: 1, position: 'relative', backgroundColor: 'transparent', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="text-muted fs-7 fw-medium mb-1">
                Designed and Developed by <span className="text-dark fw-bold">Digital Infrastructure Department</span>
              </div>
              <div className="text-muted fs-7">
                If you have any issues please contact us: <a href="mailto:it@scot.lk" className="text-primary text-decoration-none fw-semibold">it@scot.lk</a>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
