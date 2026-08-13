import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  UserPlus, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  Lock
} from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser, hasPermission, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('ROLE_SOC_ANALYST');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUsers();
      if (res.data && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err.message || "Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openPromoteModal = (u) => {
    setSelectedUser(u);
    const currentRole = u.roles && u.roles.length > 0 ? u.roles[0] : 'ROLE_SOC_ANALYST';
    setNewRole(currentRole);
    setModalOpen(true);
  };

  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.promoteUser(selectedUser.id, newRole);
      setSuccessMessage(`Successfully updated role for ${selectedUser.username} to ${newRole.replace('ROLE_', '')}`);
      setModalOpen(false);
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Promotion failed:", err);
      setError(err.message || "Promotion failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (u) => {
    try {
      await api.toggleUserStatus(u.id, !u.enabled);
      setSuccessMessage(`Account for ${u.username} ${u.enabled ? 'disabled' : 'enabled'}`);
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err.message || "Status toggle failed");
    }
  };

  const filteredUsers = (users || []).filter(u => {
    if (!u) return false;
    const name = u.username || '';
    const email = u.email || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || (u.roles && u.roles.includes(filterRole));
    return matchesSearch && matchesRole;
  });

  const isSelf = (u) => u.username === currentUser?.username;
  const isTargetAdmin = (u) => u.roles && u.roles.includes('ROLE_ADMIN');
  const canManageTarget = (u) => {
    if (isSelf(u)) return false;
    if (hasRole('ADMIN')) return true;
    if (hasRole('SOC_MANAGER') && !isTargetAdmin(u)) return true;
    return false;
  };

  const roleBadges = {
    ROLE_ADMIN: { bg: 'bg-red-500/10 text-red-400 border-red-500/30', label: 'ADMINISTRATOR' },
    ROLE_SOC_MANAGER: { bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30', label: 'SOC MANAGER' },
    ROLE_SOC_ANALYST: { bg: 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30', label: 'SOC ANALYST' },
    ROLE_THREAT_HUNTER: { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', label: 'THREAT HUNTER' },
    ROLE_INCIDENT_RESPONDER: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', label: 'INCIDENT RESPONDER' },
    ROLE_SECURITY_AUDITOR: { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30', label: 'SECURITY AUDITOR' }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-cyber font-bold text-white tracking-wide">SOC Team & Privilege Management</h1>
            <p className="text-sm text-slate-400">Hierarchical role promotion, team activity, and authorization governance</p>
          </div>
        </div>

        <button 
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-cyber-blue focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-400">Role Filter:</span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 focus:border-cyber-blue focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="ROLE_ADMIN">Administrator</option>
            <option value="ROLE_SOC_MANAGER">SOC Manager</option>
            <option value="ROLE_SOC_ANALYST">SOC Analyst</option>
            <option value="ROLE_THREAT_HUNTER">Threat Hunter</option>
            <option value="ROLE_INCIDENT_RESPONDER">Incident Responder</option>
            <option value="ROLE_SECURITY_AUDITOR">Security Auditor</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="cyber-glass rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-cyber text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">User / Identity</th>
                <th className="py-4 px-6">Assigned Role</th>
                <th className="py-4 px-6">Account Status</th>
                <th className="py-4 px-6 text-right">Hierarchical Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyber-blue" />
                    Loading SOC team members...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500">
                    No team members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const primaryRole = u.roles && u.roles.length > 0 ? u.roles[0] : 'ROLE_SOC_ANALYST';
                  const badge = roleBadges[primaryRole] || roleBadges.ROLE_SOC_ANALYST;
                  const canManage = canManageTarget(u);

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-cyber text-cyber-blue font-bold">
                            {u.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200 flex items-center gap-2">
                              {u.username}
                              {isSelf(u) && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30 font-sans">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-cyber font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.enabled ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                          {u.enabled ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        {canManage ? (
                          <>
                            <button
                              onClick={() => openPromoteModal(u)}
                              className="px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              Promote / Change Role
                            </button>

                            {(hasRole('ADMIN') || hasPermission('ENABLE_USER')) && (
                              <button
                                onClick={() => handleToggleStatus(u)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                  u.enabled 
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' 
                                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                }`}
                              >
                                {u.enabled ? 'Disable' : 'Enable'}
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-500 italic inline-flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Protected
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promotion Modal */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="cyber-glass w-full max-w-md p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-5 relative">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-cyber font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                Promote / Change Role
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePromoteSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Account:</label>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-semibold text-slate-200">
                  {selectedUser.username} ({selectedUser.email})
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Current Role:</label>
                <div className="text-xs text-purple-400 font-cyber font-bold">
                  {selectedUser.roles?.[0] || 'ROLE_SOC_ANALYST'}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Assign New Role:</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-medium focus:border-purple-500 focus:outline-none"
                >
                  {hasRole('ADMIN') && (
                    <option value="ROLE_ADMIN">ADMINISTRATOR (Full Platform Access)</option>
                  )}
                  {hasRole('ADMIN') && (
                    <option value="ROLE_SOC_MANAGER">SOC MANAGER (Team & Operations Manager)</option>
                  )}
                  <option value="ROLE_SOC_ANALYST">SOC ANALYST (Log Upload & Analysis)</option>
                  <option value="ROLE_THREAT_HUNTER">THREAT HUNTER (Advanced IOC Investigation)</option>
                  <option value="ROLE_INCIDENT_RESPONDER">INCIDENT RESPONDER (Containment & Response)</option>
                  <option value="ROLE_SECURITY_AUDITOR">SECURITY AUDITOR (Read-Only Compliance)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                ⚠️ Promotion will immediately update this user's operational capabilities and authorization claims.
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyber-blue hover:from-purple-500 hover:to-blue-500 text-white text-sm font-cyber font-bold shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Confirm Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
