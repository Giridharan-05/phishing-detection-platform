import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  ShieldAlert, 
  BarChart3, 
  History, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Users,
  FileText,
  Search,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ collapsed, setCollapsed, activeAlerts }) {
  const { logout, hasPermission, user } = useAuth();
  const location = useLocation();

  const allNavigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, perm: 'VIEW_DASHBOARD' },
    { name: 'Upload Logs', path: '/upload', icon: UploadCloud, perm: 'UPLOAD_LOG' },
    { name: 'Threat Detection', path: '/threats', icon: ShieldAlert, badge: activeAlerts > 0 ? activeAlerts : null, perm: 'VIEW_THREATS' },
    { name: 'IOC Investigation', path: '/ioc-search', icon: Search, perm: 'INVESTIGATE_IOC' },
    { name: 'Incidents & Containment', path: '/incidents', icon: ShieldCheck, perm: 'MANAGE_INCIDENT' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, perm: 'VIEW_ANALYTICS' },
    { name: 'History', path: '/history', icon: History, perm: 'VIEW_HISTORY' },
    { name: 'Team Management', path: '/users', icon: Users, perm: 'VIEW_USERS' },
    { name: 'Audit Logs', path: '/audit-logs', icon: FileText, perm: 'VIEW_AUDIT_LOG' },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Filter navigation items by permission
  const navigation = allNavigation.filter(item => {
    if (!item.perm) return true;
    return hasPermission(item.perm);
  });

  return (
    <aside 
      className={`cyber-glass h-[calc(100vh-2rem)] my-4 ml-4 rounded-2xl flex flex-col transition-all duration-300 z-40 relative group border-r border-slate-800
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Sidebar Header / Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-white/5 relative">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-blue to-purple-600 shadow-cyber-blue shrink-0">
          <Terminal className="w-5 h-5 text-white animate-pulse" />
        </div>
        {!collapsed && (
          <div className="flex flex-col animate-fade-in truncate">
            <span className="font-cyber text-sm tracking-wider font-bold text-cyber-blue">SEC-IP</span>
            <span className="text-[10px] text-slate-400 font-sans tracking-wide uppercase truncate">
              {user?.roles?.[0]?.replace('ROLE_', '') || 'SOC SYSTEM'}
            </span>
          </div>
        )}
        
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 hover:border-cyber-blue hover:text-cyber-blue flex items-center justify-center cursor-pointer transition-colors text-slate-400"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue shadow-cyber-blue/5' 
                  : 'text-slate-400 border border-transparent hover:bg-white/5 hover:text-slate-200'
                }
              `}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyber-blue' : 'text-slate-400 group-hover:text-slate-200'}`} />
              
              {!collapsed && (
                <span className="text-sm font-medium tracking-wide flex-1 whitespace-nowrap animate-fade-in truncate">
                  {item.name}
                </span>
              )}

              {/* Dynamic Badge */}
              {item.badge && (
                <span className={`flex items-center justify-center font-cyber text-[10px] font-bold rounded-full bg-cyber-red text-white leading-none
                  ${collapsed ? 'absolute top-1.5 right-1.5 w-4 h-4' : 'px-2 py-0.5 min-w-5 h-5'}
                `}>
                  {item.badge}
                </span>
              )}

              {/* Tooltip on Collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-xl z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 border border-transparent hover:bg-cyber-red/10 hover:border-cyber-red/20 hover:text-cyber-red transition-all duration-200 group relative cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-cyber-red" />
          {!collapsed && (
            <span className="text-sm font-medium tracking-wide whitespace-nowrap animate-fade-in">
              Logout System
            </span>
          )}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-cyber-red opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-xl z-50">
              Logout System
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
