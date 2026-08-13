import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldAlert, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import ThreatTable from '../components/ThreatTable';
import { useToast } from '../context/ToastContext';

export default function ThreatDetection() {
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Load state from URL parameters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    severity: searchParams.get('severity') || '',
    status: searchParams.get('status') || '',
    page: parseInt(searchParams.get('page') || '1'),
    sortBy: searchParams.get('sortBy') || 'timestamp',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({
    threats: [],
    total: 0,
    page: 1,
    totalPages: 0
  });

  const fetchThreats = async () => {
    setLoading(true);
    try {
      const res = await api.getThreats(filters);
      setResult(res.data || { threats: [], total: 0, page: 1, totalPages: 0 });
    } catch (err) {
      addToast('Failed to retrieve incident logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();

    // Update query params to mirror active filters (supporting bookmarking & history)
    const newParams = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        newParams[key] = String(filters[key]);
      }
    });
    setSearchParams(newParams);
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    addToast('Polling incident logs database...', 'info');
    fetchThreats();
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-cyber-red" />
            Threat Incident Database
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Query classified malicious URLs, analyze ML predictions, and invoke network response playbooks.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyber-blue text-xs font-cyber rounded-xl px-4 py-2.5 text-slate-200 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyber-blue animate-spin-hover" />
          <span>Sync Database</span>
        </button>
      </div>

      {/* Main Table Wrapper */}
      {loading && result.threats.length === 0 ? (
        <div className="h-[50vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-cyber-blue border-t-transparent animate-spin"></div>
            <span className="font-cyber text-sm text-slate-400">QUERYING SECURITY EVENTS DATABASES...</span>
          </div>
        </div>
      ) : (
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-xs flex items-center justify-center z-10 rounded-2xl">
              <span className="font-cyber text-xs text-cyber-blue tracking-widest bg-slate-950 px-4 py-2 rounded-xl border border-slate-900 animate-pulse">REFRESHING ENTRIES...</span>
            </div>
          )}
          <ThreatTable
            threats={result.threats}
            total={result.total}
            page={result.page}
            totalPages={result.totalPages}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

    </div>
  );
}
