import React from 'react';

export default function AnalysisStatsCard({ title, value, icon: Icon, colorTheme = 'blue', subtext, badgeText }) {
  const getThemeStyles = (theme) => {
    switch (theme) {
      case 'green':
        return {
          textColor: 'text-cyber-green',
          bgColor: 'bg-cyber-green/10',
          borderColor: 'border-cyber-green/20 hover:border-cyber-green/50',
          badgeBg: 'bg-cyber-green/10 text-cyber-green border-cyber-green/30'
        };
      case 'red':
        return {
          textColor: 'text-cyber-red',
          bgColor: 'bg-cyber-red/10',
          borderColor: 'border-cyber-red/30 hover:border-cyber-red/60',
          badgeBg: 'bg-cyber-red/10 text-cyber-red border-cyber-red/30'
        };
      case 'orange':
        return {
          textColor: 'text-cyber-orange',
          bgColor: 'bg-cyber-orange/10',
          borderColor: 'border-cyber-orange/20 hover:border-cyber-orange/50',
          badgeBg: 'bg-cyber-orange/10 text-cyber-orange border-cyber-orange/30'
        };
      case 'yellow':
        return {
          textColor: 'text-cyber-yellow',
          bgColor: 'bg-cyber-yellow/10',
          borderColor: 'border-cyber-yellow/20 hover:border-cyber-yellow/50',
          badgeBg: 'bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/30'
        };
      case 'purple':
        return {
          textColor: 'text-purple-400',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/20 hover:border-purple-500/50',
          badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
        };
      default: // blue
        return {
          textColor: 'text-cyber-blue',
          bgColor: 'bg-cyber-blue/10',
          borderColor: 'border-cyber-blue/20 hover:border-cyber-blue/50',
          badgeBg: 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30'
        };
    }
  };

  const style = getThemeStyles(colorTheme);

  return (
    <div className={`cyber-glass rounded-xl p-4 border ${style.borderColor} transition-all duration-200 flex flex-col justify-between group`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-cyber text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border border-slate-900 ${style.bgColor} ${style.textColor} group-hover:scale-110 transition-transform`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-xl font-bold font-cyber text-slate-100 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {badgeText && (
          <span className={`text-[10px] font-cyber px-2 py-0.5 rounded border ${style.badgeBg} font-semibold`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-[10px] text-slate-400 mt-1 font-sans">
          {subtext}
        </p>
      )}
    </div>
  );
}
