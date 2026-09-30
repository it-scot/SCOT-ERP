import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'icon-house_siding', roles: ['Employee'] },
    { name: 'My Profile', path: '/profile', icon: 'icon-person_outline', roles: ['Employee'] },
    { name: 'Attendance', path: '/attendance', icon: 'icon-calendar', roles: ['Employee'] },
    { name: 'Leave & OT', path: '/leave', icon: 'icon-calendar', roles: ['Employee'] },
    { name: 'KPIs', path: '/kpi', icon: 'icon-show_chart', roles: ['Employee'] },
    { name: 'Evaluations', path: '/evaluations', icon: 'icon-clipboard', roles: ['Employee'] },
    { name: 'Team Requests', path: '/tasks', icon: 'icon-add_task', roles: ['Supervisor', 'HOD'] },
    { name: 'Employees', path: '/employees', icon: 'icon-people_outline', roles: ['HR', 'SystemAdmin', 'COO'] },
    { name: 'Workflows', path: '/workflows', icon: 'icon-account_tree', roles: ['HR', 'SystemAdmin', 'COO', 'IT'] },
    { name: 'Inventory', path: '/inventory', icon: 'icon-box', roles: ['IT', 'Admin', 'SystemAdmin', 'HR', 'COO'] },
  ];

  const filteredNav = navItems.filter(item => 
    item.roles.some(role => user?.roles?.includes(role as any))
  );

  return (
    <nav id="sidebar" className={`sidebar-wrapper ${!isOpen ? 'toggled' : ''}`}>
      <div className="app-brand px-3 py-2 d-flex align-items-center">
        <a href="/">
          <div className="d-flex align-items-center text-white fw-bold fs-4">
            <img src="/scot-logo.png" alt="Logo" className="me-2" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            {isOpen && <span>SCoT ERP</span>}
          </div>
        </a>
      </div>
      
      <div className="sidebarMenuScroll">
        <ul className="sidebar-menu">
          {filteredNav.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li className={isActive ? 'active current-page' : ''} key={item.path}>
                <NavLink to={item.path}>
                  <i className={item.icon}></i>
                  <span className="menu-text">{item.name}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
