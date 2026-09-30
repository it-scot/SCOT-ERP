import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const TopNav = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user, logout } = useAuth();

  return (
    <div className="app-header d-flex align-items-center">
      <div className="d-flex">
        <button type="button" className="btn btn-primary toggle-sidebar" onClick={toggleSidebar}>
          <i className="icon-menu"></i>
        </button>
      </div>

      <div className="search-container d-xl-block d-none mx-3">
        <input type="text" className="form-control" placeholder="Search" />
        <i className="icon-search"></i>
      </div>

      <div className="header-actions">
        <Dropdown className="ms-3">
          <Dropdown.Toggle as="a" className="dropdown-toggle d-flex align-items-center" role="button" style={{ cursor: 'pointer' }}>
            <div className="icons-box md bg-primary rounded-circle m-2 fw-semibold text-white">
              {user?.preferredName?.charAt(0) || 'U'}
            </div>
            <div className="d-md-flex d-none flex-column text-dark">
              <span>{user?.preferredName}</span>
              <small>{user?.designation}</small>
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu align="end" className="dropdown-menu-sm shadow-sm gap-3">
            <Dropdown.Item href="/profile" className="d-flex align-items-center py-2">
              <i className="icon-user fs-5 me-3"></i>User Profile
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={logout} className="d-flex align-items-center py-2 text-danger">
              <i className="icon-log-out fs-5 me-3"></i>Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default TopNav;
