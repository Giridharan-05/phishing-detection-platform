import React, { useState } from 'react';
import { Settings, User, Key, Bell, SunMoon, ShieldAlert, Cpu, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  // User states
  const [name, setName] = useState(user?.name || 'SOC Analyst Alpha');
  const [role, setRole] = useState(user?.role || 'Tier-2 Incident Responder');
  const [department, setDepartment] = useState('Security Operations');
  
  // API states
  const [vtKey, setVtKey] = useState('••••••••••••••••••••••••••••••••');
  const [tcKey, setTcKey] = useState('••••••••••••••••••••••••••••••••');
  const [isEditingKeys, setIsEditingKeys] = useState(false);

  // Theme states
  const [activeTheme, setActiveTheme] = useState('cyber-dark');

  // Notifications thresholds
  const [notifyThreshold, setNotifyThreshold] = useState('High');
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile({ name, role });
    addToast('Incident responder profile parameters updated.', 'success');
  };

  const handleKeysSave = (e) => {
    e.preventDefault();
    setIsEditingKeys(false);
    addToast('Threat intelligence API configurations stored.', 'success');
  };

  const handleThemeChange = (themeId, themeName) => {
    setActiveTheme(themeId);
    addToast(`UI Theme adjusted to: ${themeName}`, 'success');
  };

  const handleNotificationSave = (e) => {
    e.preventDefault();
    addToast('Incident alert thresholds re-configured.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyber-blue" />
          SOC Configurations
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure security credentials, notifications thresholds, active themes, and threat intelligence integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <div className="rounded-2xl cyber-glass border border-slate-900 p-6 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-2">
            <User className="w-4 h-4 text-cyber-blue" />
            Responder Profile Identity
          </h2>

          <form onSubmit={handleProfileSave} className="space-y-4">
            
            {/* Avatar Row */}
            <div className="flex items-center gap-4 py-2">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyber-blue/30"
              />
              <div className="text-left">
                <p className="text-xs text-slate-400 font-cyber">SESSION RANK</p>
                <p className="text-sm font-bold text-slate-200 mt-1">SOC incident Analyst Level-2</p>
                <button
                  type="button"
                  onClick={() => addToast('Avatar upload is managed by active directory service.', 'info')}
                  className="text-xs text-cyber-blue hover:underline mt-1 cursor-pointer"
                >
                  Change Profile Photo
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-cyber text-slate-500 uppercase block">Responder Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyber-blue transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-cyber text-slate-500 uppercase block">Active Directory Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyber-blue transition-all"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-cyber text-slate-500 uppercase block">Assigned Unit</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyber-blue transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyber-blue text-xs font-cyber font-bold rounded-xl px-4 py-2 text-slate-200 cursor-pointer transition-colors"
            >
              Update Profile Details
            </button>

          </form>
        </div>

        {/* API configs */}
        <div className="rounded-2xl cyber-glass border border-slate-900 p-6 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-2">
            <Key className="w-4 h-4 text-cyber-yellow" />
            Threat Intelligence Integrations
          </h2>

          <form onSubmit={handleKeysSave} className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-cyber text-slate-500 uppercase block">VirusTotal V3 URL API Key</label>
                <input
                  type={isEditingKeys ? 'text' : 'password'}
                  value={vtKey}
                  disabled={!isEditingKeys}
                  onChange={(e) => setVtKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyber-blue transition-all font-mono disabled:opacity-70"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-cyber text-slate-500 uppercase block">ThreatConnect Ingestion Token</label>
                <input
                  type={isEditingKeys ? 'text' : 'password'}
                  value={tcKey}
                  disabled={!isEditingKeys}
                  onChange={(e) => setTcKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyber-blue transition-all font-mono disabled:opacity-70"
                />
              </div>
            </div>

            <div className="flex gap-3">
              {isEditingKeys ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditingKeys(false)}
                    className="py-2 px-4 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-xs font-cyber text-slate-300 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-cyber-blue to-purple-600 hover:brightness-110 text-white hover:text-white py-2 px-4 rounded-xl text-xs font-cyber font-bold cursor-pointer transition-all shadow-cyber-blue"
                  >
                    Save API Keys
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingKeys(true)}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-cyber-blue text-xs font-cyber font-bold rounded-xl px-4 py-2 text-slate-200 cursor-pointer transition-colors"
                >
                  Configure API Keys
                </button>
              )}
            </div>

          </form>
        </div>

        {/* Notifications Setting */}
        <div className="rounded-2xl cyber-glass border border-slate-900 p-6 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-2">
            <Bell className="w-4 h-4 text-cyber-orange" />
            Alert Threshold Configurations
          </h2>

          <form onSubmit={handleNotificationSave} className="space-y-4">
            
            {/* Notify Threshold */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-cyber text-slate-500 uppercase block">Log Alarm Severity Threshold</label>
              <div className="grid grid-cols-4 gap-2">
                {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setNotifyThreshold(level)}
                    className={`py-2 rounded-xl border text-xs font-semibold uppercase font-cyber cursor-pointer transition-all
                      ${notifyThreshold === level 
                        ? 'border-cyber-red bg-cyber-red/10 text-cyber-red shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                        : 'border-slate-805 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }
                    `}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                The SOC system will trigger loud toaster alarms only for log URLs matching or exceeding the selected severity limit.
              </p>
            </div>

            {/* Email reports */}
            <div className="flex items-center justify-between py-2 border-t border-slate-900 mt-2">
              <div className="text-left pr-4">
                <p className="text-xs font-bold text-slate-200">Transmit Incidents to Email</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Relay detected critical attacks directly to security mailing groups.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={emailAlerts} 
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="sr-only peer cursor-pointer" 
                />
                <div className="w-9 h-5 bg-slate-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyber-blue peer-checked:after:bg-white border border-slate-800"></div>
              </label>
            </div>

            <button
              type="submit"
              className="bg-slate-950 hover:bg-slate-900 border border-slate-805 hover:border-cyber-blue text-xs font-cyber font-bold rounded-xl px-4 py-2 text-slate-200 cursor-pointer transition-colors"
            >
              Commit Notifications Configuration
            </button>

          </form>
        </div>

        {/* Theme Settings */}
        <div className="rounded-2xl cyber-glass border border-slate-900 p-6 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-2">
            <SunMoon className="w-4 h-4 text-cyber-green" />
            Console Theme Selection
          </h2>

          <div className="flex-1 flex flex-col gap-3 justify-center">
            
            {[
              { id: 'cyber-dark', name: 'Cyber-SOC Dark (Default)', desc: 'Electric blue and neon accents with slate transparency gradients.', bg: 'bg-[#0B101E]' },
              { id: 'high-contrast', name: 'Defender High Contrast', desc: 'Sleek black backgrounds with bright terminal outline triggers.', bg: 'bg-black border border-slate-700' },
              { id: 'slate-theme', name: 'QRadar Classic Slate', desc: 'Deep corporate gray styling with traditional information density.', bg: 'bg-[#1E293B]' }
            ].map((theme) => (
              <div
                key={theme.id}
                onClick={() => handleThemeChange(theme.id, theme.name)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:bg-white/5
                  ${activeTheme === theme.id 
                    ? 'border-cyber-blue bg-cyber-blue/5' 
                    : 'border-slate-850 bg-slate-950/40'
                  }
                `}
              >
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-200">{theme.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{theme.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg ${theme.bg} shrink-0 border border-slate-800`}></div>
                  {activeTheme === theme.id && <Check className="w-4 h-4 text-cyber-blue shrink-0" />}
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>

    </div>
  );
}
