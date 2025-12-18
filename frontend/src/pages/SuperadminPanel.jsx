import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardView from './superadmin/views/DashboardView';
import AdminManagementView from './superadmin/views/AdminManagementView';
import AuditLogsView from './superadmin/views/AuditLogsView';
import ReportsView from './superadmin/views/ReportsView';
import SettingsView from './superadmin/views/SettingsView';
import Sidebar from '../components/Common/SuperadminSidebar';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const SuperadminPanel = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Verify user is SUPERADMIN
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || user.role !== 'SUPERADMIN') {
      navigate('/access-denied');
      return;
    }
    
    setUserRole(user.role);
    setIsLoading(false);
  }, [navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-lg">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Panel SUPERADMIN</h1>
              <p className="text-cyan-100 mt-1">Gestión Completa de la Plataforma</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-cyan-100">Conectado como: {JSON.parse(localStorage.getItem('user'))?.email}</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'admins' && <AdminManagementView />}
            {currentView === 'audit' && <AuditLogsView />}
            {currentView === 'reports' && <ReportsView />}
            {currentView === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperadminPanel;
