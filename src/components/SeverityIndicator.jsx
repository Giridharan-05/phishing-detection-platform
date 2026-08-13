import React from 'react';
import { AlertOctagon, AlertTriangle, AlertCircle, Info, ShieldCheck } from 'lucide-react';

export default function SeverityIndicator({ level, count, total, showPercentage = true }) {
  const getSeverityConfig = (sev) => {
    const key = (sev || '').toLowerCase();
    switch (key) {
      case 'critical':
        return {
          label: 'Critical',
          icon: AlertOctagon,
          textColor: 'text-cyber-red',
          bgColor: 'bg-cyber-red/10',
          borderColor: 'border-cyber-red/30',
          barColor: 'bg-cyber-red',
          glow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]'
        };
      case 'high':
        return {
          label: 'High',
          icon: AlertTriangle,
          textColor: 'text-cyber-orange',
          bgColor: 'bg-cyber-orange/10',
          borderColor: 'border-cyber-orange/30',
          barColor: 'bg-cyber-orange',
          glow: 'shadow-[0_0_10px_rgba(249,115,22,0.3)]'
        };
      case 'medium':
        return {
          label: 'Medium',
          icon: AlertCircle,
          textColor: 'text-cyber-yellow',
          bgColor: 'bg-cyber-yellow/10',
          borderColor: 'border-cyber-yellow/30',
          barColor: 'bg-cyber-yellow',
          glow: 'shadow-[0_0_8px_rgba(234,179,8,0.25)]'
        };
      case 'low':
        return {
          label: 'Low',
          icon: Info,
          textColor: 'text-cyber-blue',
          bgColor: 'bg-cyber-blue/10',
          borderColor: 'border-cyber-blue/30',
          barColor: 'bg-cyber-blue',
          glow: 'shadow-[0_0_8px_rgba(56,189,248,0.25)]'
        };
      default:
        return {
          label: 'Benign',
          icon: ShieldCheck,
          textColor: 'text-cyber-green',
          bgColor: 'bg-cyber-green/10',
          borderColor: 'border-cyber-green/30',
          barColor: 'bg-cyber-green',
          glow: 'shadow-[0_0_8px_rgba(34,197,94,0.25)]'
        };
    }
  };

  const config = getSeverityConfig(level);
  const Icon = config.icon;
  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;

  return (
    <div className={`p-3 rounded-xl border ${config.borderColor} ${config.bgColor} backdrop-blur-md flex flex-col gap-2 transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${config.bgColor} ${config.textColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className={`text-xs font-semibold font-cyber ${config.textColor}`}>
            {config.label}
          </span>
        </div>
        <span className={`text-sm font-bold font-cyber text-slate-100 ${config.glow}`}>
          {(count || 0).toLocaleString()}
        </span>
      </div>

      {showPercentage && (
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-cyber">
            <span>Share</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950/80 rounded-full overflow-hidden border border-slate-900">
            <div
              className={`h-full ${config.barColor} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
