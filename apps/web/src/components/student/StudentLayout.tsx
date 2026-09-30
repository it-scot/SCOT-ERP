import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: 'bi-grid' },
    { name: 'My Profile', path: '/student/profile', icon: 'bi-person' },
    // Placeholder for future student modules as requested
    { name: 'Courses', path: '/student/courses', icon: 'bi-book' },
    { name: 'Results', path: '/student/results', icon: 'bi-award' },
    { name: 'Fees', path: '/student/fees', icon: 'bi-cash-coin' },
    { name: 'Timetable', path: '/student/timetable', icon: 'bi-calendar3' },
  ];

  return (
    <div className={`app-wrapper ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Student Sidebar (Slightly different styling to distinguish from Staff) */}
      <aside className={`sidebar bg-dark ${sidebarOpen ? 'show' : ''}`}>
        <div className="sidebar-header d-flex align-items-center px-4 py-3 border-bottom border-light border-opacity-10">
          <div className="brand-icon me-2 rounded bg-info text-white d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, fontWeight: 'bold' }}>
            S
          </div>
          {sidebarOpen && <h5 className="mb-0 text-white fw-bold">Student Portal</h5>}
        </div>
        
        <div className="sidebar-menu p-3">
          <ul className="nav flex-column">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li className="nav-item mb-1" key={item.path}>
                  <NavLink 
                    to={item.path} 
                    className={`nav-link rounded px-3 py-2 d-flex align-items-center ${isActive ? 'active bg-info text-white' : 'text-white-50'}`}
                  >
                    <i className={`bi ${item.icon} me-3 fs-5`}></i>
                    {sidebarOpen && <span>{item.name}</span>}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>

      <div className="main-content">
        {/* Top Nav */}
        <nav className="navbar navbar-expand bg-white border-bottom px-4 shadow-sm" style={{ height: '64px' }}>
          <button className="btn btn-link text-dark p-0 me-3 fs-5" onClick={toggleSidebar}>
            <i className="bi bi-list"></i>
          </button>

          <div className="d-flex align-items-center ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" className="text-decoration-none text-dark d-flex align-items-center p-0" id="user-dropdown">
                <div className="avatar bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold" style={{ width: 36, height: 36 }}>
                  {user?.preferredName?.charAt(0) || 'S'}
                </div>
                <div className="d-none d-md-block text-start">
                  <div className="fw-semibold lh-1">{user?.preferredName || 'Student'}</div>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>Student</small>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow border-0 mt-2">
                <Dropdown.Item href="/student/profile"><i className="bi bi-person me-2"></i> Profile</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={logout} className="text-danger">
                  <i className="bi bi-box-arrow-right me-2"></i> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </nav>

        {/* Page Content */}
        <div className="page-content p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
