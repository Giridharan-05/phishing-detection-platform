import React, { useState, useEffect } from 'react';
import { ShieldCheck, Ban, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function IncidentsPage() {
  const { addToast } = useToast();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.getThreats();
      if (res.data && Array.isArray(res.data.threats)) {
        setIncidents(res.data.threats);
      }
    } catch (err) {
      console.warn("Failed to load incidents from backend:", err);
      addToast("Failed to fetch active incidents from backend.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleContain = async (id, target) => {
    try {
      await api.mitigateThreat(id, 'Block & Isolate Host');
      setActionMessage(`Incident ${id} successfully contained! Block rule broadcasted to gateway firewalls for target ${target}`);
      addToast(`Action executed on ${id}`, 'success');
      fetchIncidents();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      addToast(`Containment error: ${err.message}`, 'error');
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.mitigateThreat(id, 'Mark Resolved');
      setActionMessage(`Incident ${id} marked as RESOLVED.`);
      addToast(`Incident ${id} updated to Resolved`, 'info');
      fetchIncidents();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      addToast(`Resolution error: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-cyber font-bold text-white tracking-wide">Incident Response & Active Containment</h1>
            <p className="text-sm text-slate-400">Block malicious URLs/IPs, isolate compromised hosts, and remediate security incidents dynamically from MySQL</p>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{actionMessage}</span>
        </div>
      )}

      {/* Incidents Table */}
      <div className="cyber-glass rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-cyber-blue animate-spin" />
            <span className="text-xs font-cyber text-slate-400">QUERYING INCIDENTS FROM DATABASE...</span>
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-2">
            <AlertCircle className="w-10 h-10 text-slate-500" />
            <h3 className="text-base font-semibold text-slate-200">No Incidents Recorded in Database</h3>
            <p className="text-xs text-slate-400">Upload a SQUID or Bluecoat proxy log file on the Log Ingestion page to run threat detection analysis.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-cyber text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Incident ID</th>
                  <th className="py-4 px-6">Target Domain / IP</th>
                  <th className="py-4 px-6">Classification</th>
                  <th className="py-4 px-6">Severity</th>
                  <th className="py-4 px-6">Containment Status</th>
                  <th className="py-4 px-6 text-right">Response Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-200">{inc.id}</td>
                    <td className="py-4 px-6 font-mono text-xs text-cyber-blue">{inc.domain || inc.url || inc.clientIp}</td>
                    <td className="py-4 px-6 text-slate-300">{inc.category || 'Threat'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-cyber ${
                        inc.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        inc.status === 'Contained' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        inc.status === 'Resolved' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                        'bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse'
                      }`}>
                        {inc.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {inc.status !== 'Contained' && (
                        <button
                          onClick={() => handleContain(inc.id, inc.domain || inc.clientIp)}
                          className="px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-300 text-xs font-medium cursor-pointer inline-flex items-center gap-1"
                        >
                          <Ban className="w-3.5 h-3.5" /> Block & Isolate
                        </button>
                      )}
                      {inc.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolve(inc.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
