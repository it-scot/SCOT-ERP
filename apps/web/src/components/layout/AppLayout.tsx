import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="page-wrapper">
      <div className="main-container">
        <Sidebar isOpen={sidebarOpen} />
        <div className="app-container">
          <TopNav toggleSidebar={toggleSidebar} />
          <div className="app-body">
            <div className="container-fluid">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
