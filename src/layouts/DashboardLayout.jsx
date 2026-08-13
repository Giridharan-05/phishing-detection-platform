import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { api } from '../services/api';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [metrics, setMetrics] = useState({
    systemHealth: 'OPTIMAL',
    activeAlerts: 0
  });

  const refreshGlobalMetrics = async () => {
    try {
      const res = await api.getDashboardStats();
      if (res.data && res.data.metrics) {
        setMetrics({
          systemHealth: res.data.metrics.systemHealth,
          activeAlerts: res.data.metrics.activeAlerts
        });
      }
    } catch (err) {
      console.error('Failed to update dashboard layout metrics', err);
    }
  };

  useEffect(() => {
    refreshGlobalMetrics();
    // Refresh every 10 seconds to simulate real-time ingestion
    const interval = setInterval(refreshGlobalMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-cyber-bg-darker text-slate-100 cyber-grid-overlay overflow-hidden">
      
      {/* Sidebar navigation */}
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        activeAlerts={metrics.activeAlerts} 
      />

      {/* Main dashboard view port */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <Navbar 
          systemHealth={metrics.systemHealth} 
          activeAlerts={metrics.activeAlerts} 
        />

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto px-6 pb-6 relative">
          {/* Scanning line indicator */}
          <div className="cyber-scanner"></div>
          
          <ErrorBoundary>
            <Outlet context={{ refreshLayout: refreshGlobalMetrics }} />
          </ErrorBoundary>
        </main>
      </div>

    </div>
  );
}
