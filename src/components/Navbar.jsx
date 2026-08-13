import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Shield, User, Power, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function Navbar({ systemHealth, activeAlerts }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recentThreats, setRecentThreats] = useState([]);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    async function loadRecentFeed() {
      try {
        const res = await api.getRecentThreatFeed();
        if (res.data && Array.isArray(res.data)) {
          setRecentThreats(res.data);
        }
      } catch (err) {
        console.warn("Could not load notification feed:", err);
      }
    }
    loadRecentFeed();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    addToast(`Scanning database for query: "${searchQuery}"`, 'info');
    
    setTimeout(() => {
      setIsSearching(false);
      navigate(`/threats?search=${encodeURIComponent(searchQuery)}`);
      addToast(`Filter applied for: "${searchQuery}"`, 'success');
    }, 400);
  };

  const handleNotifClick = (threatId) => {
    setShowNotifications(false);
    navigate(`/threats/${threatId}`);
  };

  return (
    <header className="h-20 px-6 flex items-center justify-between border-b border-slate-900 bg-cyber-bg-darker/30 backdrop-blur-md sticky top-0 z-30">
      
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-96 max-w-lg hidden md:block">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Query Client IP, malicious URL, hash or threat ID..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyber-blue focus:shadow-cyber-blue/15 transition-all font-sans"
        />
        <div className="absolute left-3.5 top-3 text-slate-400">
          {isSearching ? (
            <Loader2 className="w-4.5 h-4.5 text-cyber-blue animate-spin" />
          ) : (
            <Search className="w-4.5 h-4.5" />
          )}
        </div>
      </form>

      {/* Nav Controls */}
      <div className="flex items-center gap-5 ml-auto">
        
        {/* SOC System Health Status Badge */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-cyber-green/20 bg-cyber-green-glow/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
          </span>
          <span className="text-[11px] font-cyber tracking-wider text-cyber-green uppercase">
            SOC STATUS: {systemHealth || 'OPTIMAL'}
          </span>
        </div>

        {/* Notifications Alert Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer relative
              ${showNotifications 
                ? 'border-cyber-blue bg-cyber-blue/10 text-cyber-blue' 
                : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }
            `}
          >
            <Bell className="w-5 h-5" />
            {activeAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyber-red border-2 border-cyber-bg-darker flex items-center justify-center text-[9px] font-bold text-white leading-none">
                {activeAlerts}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl z-50 animate-fade-in">
              <div className="px-3.5 py-2.5 border-b border-slate-900 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-200 tracking-wide">Threat Ingestion Alerts</span>
                <span className="text-[10px] font-cyber text-cyber-red animate-pulse">{activeAlerts} ALERTS</span>
              </div>
              <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-900">
                {recentThreats.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No recent threats recorded in database</div>
                ) : (
                  recentThreats.map((threat) => (
                    <div
                      key={threat.id}
                      onClick={() => handleNotifClick(`TR-${threat.id}`)}
                      className="p-3 hover:bg-white/5 cursor-pointer rounded-lg transition-colors flex flex-col gap-1 text-left"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-cyber text-cyber-red font-semibold">TR-{threat.id}</span>
                        <span className="text-[10px] text-slate-400">
                          {threat.timestamp || 'N/A'}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-200 truncate">{threat.domain}</span>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{threat.clientIp}</span>
                        <span className="px-1.5 py-0.5 rounded bg-cyber-red/10 text-cyber-red font-medium border border-cyber-red/20">{threat.prediction || 'Threat'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-900">
                <button
                  onClick={() => { setShowNotifications(false); navigate('/threats'); }}
                  className="w-full text-center text-xs text-cyber-blue hover:underline py-1 cursor-pointer font-medium"
                >
                  View Incident Database
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-slate-700 transition-all cursor-pointer"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-800"
            />
            <div className="text-left hidden lg:block">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.name || 'Analyst'}</p>
              <p className="text-[10px] text-slate-400 leading-none">{user?.role || 'SOC Tier-2'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block shrink-0" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl z-50 animate-fade-in">
              <div className="p-3 border-b border-slate-900">
                <p className="text-xs text-slate-400 font-cyber">SESSION IDENTITY</p>
                <p className="text-sm font-semibold text-slate-200 truncate mt-1">{user?.email || 'analyst@soc.net'}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setShowProfile(false); navigate('/settings'); }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Profile Configuration
                </button>
                <button
                  onClick={() => { setShowProfile(false); navigate('/threats'); }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  My Incidents
                </button>
              </div>
              <div className="p-1 border-t border-slate-900">
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-xs text-cyber-red hover:bg-cyber-red/10 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Power className="w-4 h-4" />
                  Shut Down Session
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
