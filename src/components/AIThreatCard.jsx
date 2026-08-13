import React, { useState } from 'react';
import { Bot, ShieldAlert, Cpu, ServerCrash, Check, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function AIThreatCard({ threatId, aiSummary, currentStatus, onActionSuccess }) {
  const { addToast } = useToast();
  const [loadingAction, setLoadingAction] = useState(null); // 'block' | 'isolate' | 'reset' | 'investigate'

  const handleMitigation = async (actionType, actionName) => {
    setLoadingAction(actionType);
    addToast(`Executing mitigation playbook: "${actionName}" on incident ${threatId}...`, 'info');
    
    try {
      const res = await api.mitigateThreat(threatId, actionName);
      setTimeout(() => {
        setLoadingAction(null);
        addToast(res.data?.msg || 'Mitigation playbook executed successfully.', 'success');
        if (onActionSuccess) {
          onActionSuccess();
        }
      }, 1000);
    } catch (err) {
      setLoadingAction(null);
      addToast('Playbook execution failed.', 'error');
    }
  };

  const mitigationButtons = [
    { type: 'block', name: 'Block URL in Proxy', icon: ShieldAlert, color: 'hover:bg-cyber-orange-glow/10 hover:border-cyber-orange hover:text-cyber-orange' },
    { type: 'isolate', name: 'Isolate Client IP', icon: ServerCrash, color: 'hover:bg-cyber-red-glow/10 hover:border-cyber-red hover:text-cyber-red' },
    { type: 'reset', name: 'Reset User Credentials', icon: Cpu, color: 'hover:bg-cyber-yellow-glow/10 hover:border-cyber-yellow hover:text-cyber-yellow' },
    { type: 'investigate', name: 'Endpoint Deep Scan', icon: Bot, color: 'hover:bg-cyber-blue-glow/10 hover:border-cyber-blue hover:text-cyber-blue' }
  ];

  const isMitigated = currentStatus === 'Mitigated' || currentStatus === 'Resolved';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-fade-in">
      
      {/* AI Agent Analysis Card */}
      <div className="rounded-2xl cyber-glass border border-slate-900 p-6 flex flex-col gap-4 relative overflow-hidden">
        {/* Glow behind Bot icon */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyber-blue/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyber-blue/15 border border-cyber-blue/30 flex items-center justify-center text-cyber-blue">
              <Bot className="w-4.5 h-4.5 text-cyber-blue animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-sans tracking-wide">AI Threat Analyst Assessment</h3>
          </div>
          <span className="px-2 py-0.5 rounded border border-cyber-blue/20 bg-cyber-blue-glow/5 text-[9px] font-cyber text-cyber-blue font-bold tracking-wider uppercase select-none">
            GPT-4o ThreatAgent
          </span>
        </div>

        <div className="flex-1 text-xs text-slate-300 leading-relaxed font-sans mt-2 bg-slate-950/60 p-4 rounded-xl border border-slate-900 shadow-inner">
          <p className="whitespace-pre-line">
            {aiSummary}
          </p>
        </div>
      </div>

      {/* Recommended Playbooks Action Card */}
      <div className="rounded-2xl cyber-glass border border-slate-900 p-6 flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-sans tracking-wide">SOC Mitigation Playbooks</h3>
          </div>
          <span className={`px-2 py-0.5 rounded text-[9px] font-cyber font-bold tracking-wider uppercase border
            ${isMitigated ? 'border-cyber-green/30 bg-cyber-green/5 text-cyber-green' : 'border-cyber-red/30 bg-cyber-red/5 text-cyber-red animate-pulse'}
          `}>
            {currentStatus}
          </span>
        </div>

        {isMitigated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-cyber-green/10 bg-cyber-green-glow/5 rounded-xl gap-2.5">
            <Check className="w-8 h-8 text-cyber-green bg-cyber-green-glow/20 rounded-full p-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
            <div>
              <p className="text-sm font-semibold text-slate-200">Incident Isolate Protocol Successful</p>
              <p className="text-xs text-slate-400 mt-0.5">Threat agent has marked this entry as mitigated. Client host isolated in VLAN segment.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-3 justify-center">
            <p className="text-[11px] text-slate-400 mb-1">
              Select an automated security protocol to neutralize this attack vector immediately:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {mitigationButtons.map((btn) => {
                const Icon = btn.icon;
                const isLoading = loadingAction === btn.type;
                
                return (
                  <button
                    key={btn.type}
                    onClick={() => handleMitigation(btn.type, btn.name)}
                    disabled={loadingAction !== null}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-xs text-slate-200 text-left font-medium cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed
                      ${btn.color}
                    `}
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-white animate-spin shrink-0"></span>
                    ) : (
                      <Icon className="w-4 h-4 shrink-0" />
                    )}
                    <span className="truncate">{btn.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
