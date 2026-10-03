import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/staff/Dashboard';
import EmployeeList from './pages/staff/employees/EmployeeList';
import EmployeeProfile from './pages/staff/employees/EmployeeProfile';
import AttendancePage from './pages/staff/attendance/AttendancePage';
import LeavePage from './pages/staff/leave/LeavePage';
import EvaluationsPage from './pages/staff/evaluations/EvaluationsPage';
import KpiPage from './pages/staff/kpi/KpiPage';
import InventoryPage from './pages/staff/inventory/InventoryPage';
import TasksPage from './pages/staff/tasks/TasksPage';
import WorkflowsPage from './pages/staff/workflows/WorkflowsPage';
import StudentLayout from './components/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import UnderConstruction from './components/common/UnderConstruction';
import ThemeSettingsPage from './pages/admin/ThemeSettingsPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const ProfileRedirect = () => {
  const { user } = useAuth();
  if (!user) return null;
  return <Navigate to={`/employees/${user.id}`} replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Placeholder Routes for other modules */}
        <Route path="employees" element={<UnderConstruction />} />
        <Route path="employees/:id" element={<EmployeeProfile />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leave" element={<UnderConstruction />} />
        <Route path="requests" element={<UnderConstruction />} />
        <Route path="evaluations" element={<EvaluationsPage />} />
        <Route path="kpi" element={<UnderConstruction />} />
        <Route path="inventory" element={<UnderConstruction />} />
        <Route path="tasks" element={<UnderConstruction />} />
        <Route path="workflows" element={<UnderConstruction />} />
        <Route path="settings" element={<ThemeSettingsPage />} />
        <Route path="profile" element={<ProfileRedirect />} />
        
        {/* HOD Routes */}
        <Route path="hod/leaves" element={<UnderConstruction />} />
        <Route path="hod/requests" element={<UnderConstruction />} />
        <Route path="hod/evaluations" element={<UnderConstruction />} />
      </Route>

      {/* Student Portal Routes */}
      <Route path="/student" element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="courses" element={<div>Courses Module (TODO)</div>} />
        <Route path="results" element={<div>Results Module (TODO)</div>} />
        <Route path="fees" element={<div>Fees Module (TODO)</div>} />
        <Route path="timetable" element={<div>Timetable Module (TODO)</div>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
