import React from 'react';
import { Shield, KeyRound, Bug, Radio, FileOutput } from 'lucide-react';

export default function ThreatDistributionChart({ stats }) {
  const {
    benign = 0,
    phishing = 0,
    malware = 0,
    c2 = 0,
    exfiltration = 0,
    totalUrls = 1
  } = stats || {};

  const totalThreats = phishing + malware + c2 + exfiltration;
  const denominator = totalUrls || 1;

  const categories = [
    { name: 'Phishing', count: phishing, color: 'bg-cyber-yellow', textColor: 'text-cyber-yellow', borderColor: 'border-cyber-yellow/30', icon: KeyRound },
    { name: 'Malware Distribution', count: malware, color: 'bg-cyber-orange', textColor: 'text-cyber-orange', borderColor: 'border-cyber-orange/30', icon: Bug },
    { name: 'Command & Control', count: c2, color: 'bg-cyber-red', textColor: 'text-cyber-red', borderColor: 'border-cyber-red/30', icon: Radio },
    { name: 'Data Exfiltration', count: exfiltration, color: 'bg-purple-500', textColor: 'text-purple-400', borderColor: 'border-purple-500/30', icon: FileOutput },
  ];

  return (
    <div className="cyber-glass rounded-xl p-4 border border-slate-900 flex flex-col gap-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-900">
        <h4 className="text-xs font-bold font-cyber text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyber-blue" />
          Threat Vector Breakdown
        </h4>
        <span className="text-[10px] font-cyber text-slate-400">
          Total Threats: <strong className="text-slate-200">{totalThreats.toLocaleString()}</strong>
        </span>
      </div>

      {/* Visual Stacked Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-900 p-0.5 gap-0.5">
          {categories.map((cat, idx) => {
            const width = ((cat.count / denominator) * 100).toFixed(1);
            if (cat.count <= 0) return null;
            return (
              <div
                key={idx}
                className={`h-full ${cat.color} rounded-sm transition-all duration-500`}
                style={{ width: `${Math.max(parseFloat(width), 2)}%` }}
                title={`${cat.name}: ${cat.count} (${width}%)`}
              />
            );
          })}
          {benign > 0 && (
            <div
              className="h-full bg-cyber-green/40 rounded-sm transition-all duration-500"
              style={{ width: `${((benign / denominator) * 100).toFixed(1)}%` }}
              title={`Benign: ${benign}`}
            />
          )}
        </div>
      </div>

      {/* Detailed Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          const pct = totalThreats > 0 ? ((cat.count / totalThreats) * 100).toFixed(1) : 0;
          return (
            <div key={idx} className={`p-2.5 rounded-xl border ${cat.borderColor} bg-slate-950/50 flex flex-col gap-1`}>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Icon className={`w-3.5 h-3.5 ${cat.textColor}`} />
                <span className="text-[10px] font-cyber truncate">{cat.name}</span>
              </div>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-sm font-bold font-cyber text-slate-100">
                  {cat.count.toLocaleString()}
                </span>
                <span className={`text-[9px] font-cyber ${cat.textColor} font-semibold`}>
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
