import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Terminal, 
  Globe, 
  Cpu, 
  Percent, 
  Server, 
  ExternalLink,
  Lock,
  CheckCircle,
  Copy
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import AIThreatCard from '../components/AIThreatCard';

export default function ThreatDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchDetails = async () => {
    try {
      const res = await api.getThreatDetails(id);
      setData(res.data);
    } catch (err) {
      addToast('Failed to retrieve threat dossier.', 'error');
      navigate('/threats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const copyUrl = () => {
    if (data?.threat?.url) {
      navigator.clipboard.writeText(data.threat.url);
      addToast('Full URL copied to clipboard.', 'success');
    }
  };

  if (loading || !data) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-cyber-blue border-t-transparent animate-spin"></div>
          <span className="font-cyber text-sm text-slate-400">RETRIEVING THREAT DOSSIER...</span>
        </div>
      </div>
    );
  }

  const { threat = {}, mitre = {}, aiSummary = '' } = data || {};

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'Critical': return 'border-cyber-red bg-cyber-red/10 text-cyber-red shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse';
      case 'High': return 'border-cyber-orange bg-cyber-orange/10 text-cyber-orange';
      case 'Medium': return 'border-cyber-yellow bg-cyber-yellow/10 text-cyber-yellow';
      default: return 'border-cyber-green bg-cyber-green/10 text-cyber-green';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Back navigation */}
      <button
        onClick={() => navigate('/threats')}
        className="flex items-center gap-2 text-xs font-cyber text-slate-400 hover:text-cyber-blue transition-colors cursor-pointer select-none group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Return to Incident Database</span>
      </button>

      {/* Dossier Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl cyber-glass border border-slate-900">
        <div className="text-left">
          <div className="flex items-center gap-3">
            <span className="font-cyber text-lg font-bold text-cyber-red tracking-wider">{threat.id}</span>
            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold select-none ${getSeverityStyles(threat.severity)}`}>
              {threat.severity} Severity
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 truncate mt-1">
            Target Host: {threat.clientIp}
          </h1>
          <p className="text-xs text-slate-400 font-cyber mt-0.5">
            Log Intake: {threat.timestamp}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-cyber uppercase">INCIDENT CATEGORY:</span>
          <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200">
            {threat.category}
          </span>
        </div>
      </div>

      {/* Threat Dossier Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core metrics box */}
        <div className="lg:col-span-2 rounded-2xl cyber-glass border border-slate-900 p-6 flex flex-col gap-5">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-2">
            <Globe className="w-4 h-4 text-cyber-blue" />
            URL Request Dossier
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Domain */}
            <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
              <span className="text-[10px] font-cyber text-slate-500 uppercase block">MALICIOUS DOMAIN MATCHED</span>
              <span className="text-xs font-bold text-slate-200 font-cyber break-all block mt-1">{threat.domain}</span>
            </div>

            {/* Confidence */}
            <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
              <span className="text-[10px] font-cyber text-slate-500 uppercase block">ML CLASSIFICATION CONFIDENCE</span>
              <div className="flex items-center gap-2 mt-1">
                <Percent className="w-4 h-4 text-cyber-blue" />
                <span className="text-xs font-cyber font-bold text-slate-200">{(threat.confidenceScore * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Reputation */}
            <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
              <span className="text-[10px] font-cyber text-slate-500 uppercase block">THREAT INTEL REPUTATION</span>
              <span className="text-xs font-semibold text-cyber-red block mt-1">{threat.domainReputation}</span>
            </div>

            {/* Endpoint */}
            <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
              <span className="text-[10px] font-cyber text-slate-500 uppercase block">ENDPOINT PROFILE DATA</span>
              <span className="text-xs font-medium text-slate-305 block mt-1 truncate">{threat.endpointDetails}</span>
            </div>

          </div>

          {/* Full URL Address with Copy Button */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-cyber text-slate-500 uppercase block">FULL REQUESTED URL INTERACTION</span>
            <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-900 rounded-xl w-full">
              <span className="font-mono text-xs text-slate-300 break-all flex-1 select-all">{threat.url}</span>
              <button
                onClick={copyUrl}
                className="p-1.5 rounded hover:bg-slate-900 hover:text-white text-slate-400 cursor-pointer shrink-0 transition-colors"
                title="Copy Full URL"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* MITRE ATT&CK Matrix Card */}
        <div className="rounded-2xl cyber-glass border border-slate-900 p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyber-red/5 rounded-full blur-2xl pointer-events-none" />
          
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-2">
            <Terminal className="w-4 h-4 text-cyber-red" />
            MITRE ATT&CK Alignment
          </h2>

          <div className="flex-1 flex flex-col gap-3 justify-center">
            <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">
              <span className="text-[10px] font-cyber text-slate-400">TECHNIQUE IDENTIFIER</span>
              <span className="font-cyber text-xs text-cyber-red font-bold tracking-wider">{mitre.techniqueId || mitre.id || 'T1071.001'}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">
              <span className="text-[10px] font-cyber text-slate-400">TECHNIQUE NAME</span>
              <span className="text-xs font-semibold text-slate-200">{mitre.techniqueName || mitre.name || 'Web Protocols'}</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-[11px] text-slate-400 leading-relaxed shadow-inner">
              <p>{mitre.description}</p>
            </div>
          </div>
        </div>

      </div>

      {/* AI assessment & SOC Playbooks actions section */}
      <AIThreatCard
        threatId={threat.id}
        aiSummary={aiSummary}
        currentStatus={threat.status}
        onActionSuccess={fetchDetails}
      />

    </div>
  );
}
