import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Login from '../pages/Login';
import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import UploadLogs from '../pages/UploadLogs';
import ThreatDetection from '../pages/ThreatDetection';
import ThreatDetails from '../pages/ThreatDetails';
import Analytics from '../pages/Analytics';
import HistoryPage from '../pages/History';
import SettingsPage from '../pages/Settings';
import UsersPage from '../pages/UsersPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import IocSearchPage from '../pages/IocSearchPage';
import IncidentsPage from '../pages/IncidentsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Entry Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Base SOC Command Center Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadLogs />} />
          <Route path="threats" element={<ThreatDetection />} />
          <Route path="threats/:id" element={<ThreatDetails />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Role & Permission Sensitive Routes */}
      <Route element={<ProtectedRoute requiredPermission="VIEW_USERS" />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute requiredPermission="VIEW_AUDIT_LOG" />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="audit-logs" element={<AuditLogsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute requiredPermission="INVESTIGATE_IOC" />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="ioc-search" element={<IocSearchPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute requiredPermission="MANAGE_INCIDENT" />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="incidents" element={<IncidentsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
