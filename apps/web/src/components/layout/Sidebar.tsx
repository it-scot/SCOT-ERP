import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    // Employee Tabs
    { name: 'Dashboard', path: '/dashboard', icon: 'icon-house_siding', roles: ['Employee'] },
    { name: 'Attendance', path: '/attendance', icon: 'icon-calendar', roles: ['Employee'] },
    { name: 'Leave Apply ⓘ', path: '/leave', icon: 'icon-event_note', roles: ['Employee'] },
    { name: 'Request ⓘ', path: '/requests', icon: 'icon-receipt_long', roles: ['Employee'] },
    { name: 'Evaluation', path: '/evaluations', icon: 'icon-clipboard', roles: ['Employee'] },

    // HOD & Supervisor Tabs
    { name: 'Team Leaves ⓘ', path: '/hod/leaves', icon: 'icon-fact_check', roles: ['HOD', 'Supervisor'] },
    { name: 'Team Requests ⓘ', path: '/hod/requests', icon: 'icon-rule', roles: ['HOD', 'Supervisor'] },
    { name: 'Team Evaluations ⓘ', path: '/hod/evaluations', icon: 'icon-star_rate', roles: ['HOD', 'Supervisor'] },
    { name: 'KPI Management ⓘ', path: '/kpi', icon: 'icon-show_chart', roles: ['HOD', 'Supervisor', 'HR'] },

    // Admin / HR / SystemAdmin Tabs
    { name: 'Employees ⓘ', path: '/employees', icon: 'icon-people_outline', roles: ['HR', 'SystemAdmin', 'Admin', 'COO'] },
    { name: 'Workflows ⓘ', path: '/workflows', icon: 'icon-account_tree', roles: ['HR', 'SystemAdmin', 'Admin', 'IT'] },
    { name: 'Inventory ⓘ', path: '/inventory', icon: 'icon-box', roles: ['IT', 'Admin', 'SystemAdmin', 'HR'] },
    { name: 'Theme Settings', path: '/settings', icon: 'icon-settings', roles: ['SystemAdmin', 'IT'] },
    
    // Bottom Tabs
    { name: 'Profile', path: '/profile', icon: 'icon-person_outline', roles: ['Employee'] },
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
            {isOpen && (
              <span style={{ letterSpacing: '1px' }}>
                SCOT<span style={{ 
                  background: 'linear-gradient(45deg, #ff6b6b, #feca57)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900,
                  fontSize: '1.2em',
                  marginLeft: '1px'
                }}>X</span>
              </span>
            )}
          </div>
        </a>
      </div>
      
      <div className="sidebarMenuScroll">
        <ul className="sidebar-menu">
          {filteredNav.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const isUnderDev = item.name.includes('ⓘ');
            
            const navLinkElement = (
              <li className={isActive ? 'active current-page' : ''} key={item.path}>
                <NavLink to={item.path}>
                  <i className={item.icon}></i>
                  <span className="menu-text">{item.name}</span>
                </NavLink>
              </li>
            );

            if (isUnderDev) {
              return (
                <OverlayTrigger
                  key={item.path}
                  placement="right"
                  overlay={
                    <Tooltip id={`tooltip-${item.path}`}>
                      <strong>Under Development</strong><br/>
                      This module is still being developed. We are building an awesome product for you. Please be patient!
                    </Tooltip>
                  }
                >
                  {navLinkElement}
                </OverlayTrigger>
              );
            }

            return navLinkElement;
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
