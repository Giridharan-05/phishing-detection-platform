import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileText, RefreshCw, AlertTriangle, ShieldCheck, Clock, UserCheck } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAuditLogs();
      if (res.data && Array.isArray(res.data)) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError(err.message || "Failed to load audit records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyber-blue/20 border border-cyber-blue/30 flex items-center justify-center text-cyber-blue shadow-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-cyber font-bold text-white tracking-wide">System Security Audit Trail</h1>
            <p className="text-sm text-slate-400">Immutable ledger of authorization events, privilege changes, and user status modifications</p>
          </div>
        </div>

        <button 
          onClick={fetchAuditLogs}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Audit Trail
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="cyber-glass rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-cyber text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Acting User (Actor)</th>
                <th className="py-4 px-6">Target User</th>
                <th className="py-4 px-6">Action / Event</th>
                <th className="py-4 px-6">Role Transition</th>
                <th className="py-4 px-6 text-right">Result Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyber-blue" />
                    Fetching audit trail events...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No security audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-200">
                      {log.actorUsername}
                    </td>

                    <td className="py-4 px-6 text-slate-300">
                      {log.targetUsername}
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-xs font-bold border border-slate-700">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs">
                      {log.previousRole && log.newRole ? (
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-400">{log.previousRole.replace('ROLE_', '')}</span>
                          <span className="text-cyber-blue">➔</span>
                          <span className="text-purple-400 font-bold">{log.newRole.replace('ROLE_', '')}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        log.result === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
