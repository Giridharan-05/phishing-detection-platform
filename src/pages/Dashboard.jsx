import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Terminal, 
  RefreshCw, 
  TrendingUp, 
  Globe, 
  Server,
  Zap,
  X,
  ChevronRight,
  BarChart2,
  PieChart,
  Layers,
  Radio,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  ThreatCategoryPie, 
  ThreatTrendLine, 
  TopDomainsBar, 
  SeverityBar 
} from '../components/Charts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { refreshLayout } = useOutletContext();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'total' | 'benign' | 'threats' | 'critical' | 'high' | 'domains' | 'categories' | 'severity' | 'feed' | 'hosts' | 'engine'

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      setData(res.data);
    } catch (err) {
      addToast('Failed to pull system metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    addToast('Re-polling proxy threat statistics...', 'info');
    await fetchDashboardData();
    if (refreshLayout) refreshLayout();
    addToast('Statistics updated in real-time.', 'success');
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-cyber-blue border-t-transparent animate-spin"></div>
          <span className="font-cyber text-sm text-slate-400">PULLING THREAT ANALYTICS CORES...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-cyber text-slate-400">FAILED TO CONNECT TO SOC DASHBOARD METRICS SERVICE</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-xl bg-cyber-blue/10 hover:bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30 text-xs font-cyber flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 animate-spin-hover" />
          <span>Retry Loading Dashboard</span>
        </button>
      </div>
    );
  }

  const { 
    metrics = { totalProcessed: 0, benignCount: 0, threatsCount: 0, criticalCount: 0, highCount: 0 }, 
    threatCategories = [], 
    threatTrends = [], 
    topMaliciousDomains = [], 
    severityDistribution = [], 
    recentThreatFeed = [], 
    topAttackedIps = [] 
  } = data;

  const cardConfig = [
    { 
      id: 'total',
      title: 'Total URLs Processed', 
      val: metrics.totalProcessed, 
      icon: Globe, 
      color: 'text-cyber-blue', 
      border: 'border-cyber-blue/20 hover:border-cyber-blue/60',
      badgeBg: 'bg-cyber-blue/10 text-cyber-blue',
      detailLabel: 'View Log Processing Details'
    },
    { 
      id: 'benign',
      title: 'Benign URLs Analyzed', 
      val: metrics.benignCount, 
      icon: Shield, 
      color: 'text-cyber-green', 
      border: 'border-cyber-green/20 hover:border-cyber-green/60',
      badgeBg: 'bg-cyber-green/10 text-cyber-green',
      detailLabel: 'View Benign Traffic Analysis'
    },
    { 
      id: 'threats',
      title: 'Threats Flagged', 
      val: metrics.threatsCount, 
      icon: AlertTriangle, 
      color: 'text-cyber-yellow', 
      border: 'border-cyber-yellow/20 hover:border-cyber-yellow/60',
      badgeBg: 'bg-cyber-yellow/10 text-cyber-yellow',
      detailLabel: 'View Threat Classification Mix'
    },
    { 
      id: 'critical',
      title: 'Critical Threats', 
      val: metrics.criticalCount, 
      icon: Terminal, 
      color: 'text-cyber-red', 
      border: 'border-cyber-red/30 border-glow-red/20 hover:border-cyber-red/70',
      badgeBg: 'bg-cyber-red/10 text-cyber-red',
      detailLabel: 'View Live Threat Feed'
    },
    { 
      id: 'high',
      title: 'High Severity Threats', 
      val: metrics.highCount, 
      icon: Activity, 
      color: 'text-cyber-orange', 
      border: 'border-cyber-orange/20 hover:border-cyber-orange/60',
      badgeBg: 'bg-cyber-orange/10 text-cyber-orange',
      detailLabel: 'View Severity & Host Targets'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-8">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyber-blue animate-pulse" />
            SOC Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time URL ML analysis dashboard monitoring proxy log files. Click any metric card or detail button below.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyber-blue text-xs font-cyber rounded-xl px-4 py-2.5 text-slate-200 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyber-blue" />
          <span>Refresh Datasets</span>
        </button>
      </div>

      {/* Primary KPI Cards Grid (Clickable for details) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cardConfig.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.id} 
              onClick={() => setActiveModal(card.id)}
              className={`cyber-glass rounded-2xl p-4 flex flex-col justify-between border ${card.border} cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-cyber text-slate-400 uppercase tracking-wider block">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl bg-slate-950/60 border border-slate-900 ${card.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight font-cyber text-slate-100">
                  {card.val.toLocaleString()}
                </span>
                <span className={`text-[9px] font-cyber px-1.5 py-0.5 rounded border border-current/20 flex items-center gap-1 ${card.badgeBg}`}>
                  <span>Details</span>
                  <ChevronRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Focus Component: Ingestion Threat Trend */}
      <div className="rounded-2xl cyber-glass border border-slate-900 p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-900">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyber-blue" />
              Ingestion Threat Trend
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative multi-vector attack detection over the past 7 calendar days.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-cyber px-2.5 py-1 rounded-full bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20">
              ML CLASSIFIER INGESTION
            </span>
          </div>
        </div>

        <div className="pt-2">
          <ThreatTrendLine data={threatTrends} />
        </div>
      </div>

      {/* Detailed Analytics Button Toolbar */}
      <div className="rounded-2xl cyber-glass border border-slate-900 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-cyber flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyber-blue" />
            Inspect Detailed Analytics & Feeds
          </h4>
          <span className="text-[10px] text-slate-500 font-cyber">Click any category button to open modal breakdown</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          <button
            onClick={() => setActiveModal('domains')}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-cyber-yellow/50 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-cyber-yellow shrink-0" />
              <span className="text-xs font-semibold text-slate-200 group-hover:text-cyber-yellow transition-colors">Top Malicious Domains</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200 shrink-0" />
          </button>

          <button
            onClick={() => setActiveModal('categories')}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-cyber-green/50 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <PieChart className="w-4 h-4 text-cyber-green shrink-0" />
              <span className="text-xs font-semibold text-slate-200 group-hover:text-cyber-green transition-colors">Threat Category Mix</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200 shrink-0" />
          </button>

          <button
            onClick={() => setActiveModal('severity')}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-cyber-orange/50 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <BarChart2 className="w-4 h-4 text-cyber-orange shrink-0" />
              <span className="text-xs font-semibold text-slate-200 group-hover:text-cyber-orange transition-colors">Severity Breakdown</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200 shrink-0" />
          </button>

          <button
            onClick={() => setActiveModal('feed')}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-cyber-red/50 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-cyber-red shrink-0" />
              <span className="text-xs font-semibold text-slate-200 group-hover:text-cyber-red transition-colors">Live Threat Feed</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200 shrink-0" />
          </button>

          <button
            onClick={() => setActiveModal('hosts')}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-cyber-blue/50 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-cyber-blue shrink-0" />
              <span className="text-xs font-semibold text-slate-200 group-hover:text-cyber-blue transition-colors">Most Attacked Hosts</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200 shrink-0" />
          </button>

          <button
            onClick={() => setActiveModal('engine')}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-cyber-blue/50 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-cyber-blue shrink-0" />
              <span className="text-xs font-semibold text-slate-200 group-hover:text-cyber-blue transition-colors">SOC Engine Health</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200 shrink-0" />
          </button>
        </div>
      </div>

      {/* Detail Modal Dialog */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto cyber-glass border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyber-blue">
                  {activeModal === 'total' && <Globe className="w-5 h-5 text-cyber-blue" />}
                  {activeModal === 'benign' && <Shield className="w-5 h-5 text-cyber-green" />}
                  {activeModal === 'threats' && <AlertTriangle className="w-5 h-5 text-cyber-yellow" />}
                  {activeModal === 'critical' && <Terminal className="w-5 h-5 text-cyber-red" />}
                  {activeModal === 'high' && <Activity className="w-5 h-5 text-cyber-orange" />}
                  {activeModal === 'domains' && <Globe className="w-5 h-5 text-cyber-yellow" />}
                  {activeModal === 'categories' && <PieChart className="w-5 h-5 text-cyber-green" />}
                  {activeModal === 'severity' && <BarChart2 className="w-5 h-5 text-cyber-orange" />}
                  {activeModal === 'feed' && <Radio className="w-5 h-5 text-cyber-red" />}
                  {activeModal === 'hosts' && <Activity className="w-5 h-5 text-cyber-blue" />}
                  {activeModal === 'engine' && <Cpu className="w-5 h-5 text-cyber-blue" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">
                    {activeModal === 'total' && 'Total Processed URLs Analysis'}
                    {activeModal === 'benign' && 'Benign Traffic Overview'}
                    {activeModal === 'threats' && 'Threat Classification & Top Domains'}
                    {activeModal === 'critical' && 'Critical Threat Feed & Alert Breakdown'}
                    {activeModal === 'high' && 'High Severity Incidents & Host Targets'}
                    {activeModal === 'domains' && 'Top Malicious Domains by Hit Count'}
                    {activeModal === 'categories' && 'Threat Category Classification Mix'}
                    {activeModal === 'severity' && 'Incident Severity Distribution'}
                    {activeModal === 'feed' && 'Live Proxy Log Threat Intake Feed'}
                    {activeModal === 'hosts' && 'Most Attacked Corporate Host IPs'}
                    {activeModal === 'engine' && 'SOC ML Engine Performance & Load'}
                  </h3>
                  <p className="text-xs text-slate-400 font-cyber">Detailed diagnostic views pulled from proxy logs.</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="space-y-6">
              
              {/* Total URLs Modal */}
              {activeModal === 'total' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-850">
                      <span className="text-xs text-slate-400 block font-cyber">TOTAL PROCESSED</span>
                      <span className="text-xl font-bold font-cyber text-cyber-blue">{metrics.totalProcessed.toLocaleString()}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-850">
                      <span className="text-xs text-slate-400 block font-cyber">BENIGN RATIO</span>
                      <span className="text-xl font-bold font-cyber text-cyber-green">
                        {((metrics.benignCount / metrics.totalProcessed) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-850">
                      <span className="text-xs text-slate-400 block font-cyber">THREAT RATIO</span>
                      <span className="text-xl font-bold font-cyber text-cyber-red">
                        {((metrics.threatsCount / metrics.totalProcessed) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-2">
                    <h4 className="text-xs font-bold text-slate-200 font-cyber uppercase">Log Ingestion Summary</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      SQUID & Bluecoat proxy log parser has analyzed {metrics.totalProcessed.toLocaleString()} access logs. 
                      ML Random Forest classifier evaluated domain entropy, HTTP payload structure, and reputation lists with 99.4% precision.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => { setActiveModal(null); navigate('/upload'); }}
                      className="px-4 py-2 rounded-xl bg-cyber-blue/10 hover:bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30 text-xs font-cyber flex items-center gap-2 cursor-pointer"
                    >
                      <span>Ingest New Proxy Log File</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Benign URLs Modal */}
              {activeModal === 'benign' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-cyber-green/5 border border-cyber-green/20 flex items-center gap-3">
                    <Shield className="w-8 h-8 text-cyber-green shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{metrics.benignCount.toLocaleString()} Verified Benign URLs</h4>
                      <p className="text-xs text-slate-400">Normal corporate web access, white-listed CDN domains, and trusted external APIs.</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-850">
                    <h4 className="text-xs font-bold text-slate-300 font-cyber mb-3">TOP SAFE DOMAIN DESTINATIONS</h4>
                    <div className="space-y-2 text-xs font-cyber">
                      <div className="flex justify-between text-slate-300 border-b border-slate-900 pb-1">
                        <span>microsoft.com</span>
                        <span className="text-cyber-green">450,210 hits</span>
                      </div>
                      <div className="flex justify-between text-slate-300 border-b border-slate-900 pb-1">
                        <span>github.com</span>
                        <span className="text-cyber-green">389,120 hits</span>
                      </div>
                      <div className="flex justify-between text-slate-300 border-b border-slate-900 pb-1">
                        <span>google-analytics.com</span>
                        <span className="text-cyber-green">210,400 hits</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>aws.amazon.com</span>
                        <span className="text-cyber-green">198,340 hits</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Threats Flagged / Category Mix Modal */}
              {(activeModal === 'threats' || activeModal === 'categories') && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-300 font-cyber">THREAT CATEGORY CLASSIFICATION MIX</h4>
                    <span className="text-[10px] text-slate-500 font-cyber">ML RANDOM FOREST RESULT</span>
                  </div>
                  <ThreatCategoryPie data={threatCategories} />
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => { setActiveModal(null); navigate('/threats'); }}
                      className="px-4 py-2 rounded-xl bg-cyber-yellow/10 hover:bg-cyber-yellow/20 text-cyber-yellow border border-cyber-yellow/30 text-xs font-cyber flex items-center gap-2 cursor-pointer"
                    >
                      <span>Explore All Flagged Threats Table</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Critical Threats / Feed Modal */}
              {(activeModal === 'critical' || activeModal === 'feed') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <h4 className="text-xs font-bold text-cyber-red font-cyber uppercase tracking-wider">
                      LIVE THREAT INTAKE FEED ({recentThreatFeed.length} EVENTS)
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-cyber-red/10 text-cyber-red text-[10px] font-cyber">
                      REALTIME RECEPTION
                    </span>
                  </div>
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {recentThreatFeed.map((threat, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => { setActiveModal(null); navigate(`/threats/${threat.id}`); }}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-850 hover:border-cyber-red/40 bg-slate-950/60 hover:bg-slate-950/90 transition-all cursor-pointer group"
                      >
                        <div className="flex flex-col gap-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-cyber text-xs text-cyber-red font-bold">{threat.id}</span>
                            <span className="text-[10px] text-slate-500 font-cyber">{new Date(threat.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyber-blue transition-colors">
                            {threat.domain}
                          </span>
                          <span className="text-[10px] text-slate-400">Host IP: {threat.clientIp}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="px-2 py-0.5 rounded bg-cyber-red/10 text-cyber-red text-[10px] border border-cyber-red/20 font-semibold font-cyber">
                            {threat.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-cyber uppercase">{threat.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => { setActiveModal(null); navigate('/threats'); }}
                      className="px-4 py-2 rounded-xl bg-cyber-red/10 hover:bg-cyber-red/20 text-cyber-red border border-cyber-red/30 text-xs font-cyber flex items-center gap-2 cursor-pointer"
                    >
                      <span>Open Threat Incident Register</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* High Severity / Severity Distribution / Host IPs Modal */}
              {(activeModal === 'high' || activeModal === 'severity' || activeModal === 'hosts') && (
                <div className="space-y-6">
                  {activeModal !== 'hosts' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 font-cyber uppercase">INCIDENT SEVERITY DISTRIBUTION</h4>
                      <SeverityBar data={severityDistribution} />
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 font-cyber uppercase">MOST ATTACKED CORPORATE HOST IPs</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {topAttackedIps.map((ip, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-850 bg-slate-950/60">
                          <div className="text-left">
                            <p className="text-xs font-bold text-slate-200 font-cyber">{ip.ip}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Dept: {ip.department}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-cyber font-bold text-slate-200">{ip.events.toLocaleString()} events</p>
                            <span className="text-[9px] text-cyber-red font-semibold uppercase">{ip.threatLevel}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Top Malicious Domains Modal */}
              {activeModal === 'domains' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-300 font-cyber uppercase">TOP MALICIOUS DOMAINS BY REQUEST COUNT</h4>
                    <span className="text-[10px] text-slate-500 font-cyber">SQUID LOGS</span>
                  </div>
                  <TopDomainsBar data={topMaliciousDomains} />
                  <div className="flex justify-end">
                    <button
                      onClick={() => { setActiveModal(null); navigate('/analytics'); }}
                      className="px-4 py-2 rounded-xl bg-cyber-blue/10 hover:bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30 text-xs font-cyber flex items-center gap-2 cursor-pointer"
                    >
                      <span>View Deep Analytics Dashboard</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* SOC Engine Health Modal */}
              {activeModal === 'engine' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-850 space-y-2">
                      <div className="flex justify-between text-xs font-cyber">
                        <span className="text-slate-400">ML PARSING CPU LOAD</span>
                        <span className="text-cyber-blue font-bold">{metrics.cpuUsage}%</span>
                      </div>
                      <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-cyber-blue rounded-full" style={{ width: `${metrics.cpuUsage}%` }} />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-850 space-y-2">
                      <div className="flex justify-between text-xs font-cyber">
                        <span className="text-slate-400">CACHE MEMORY (RAM)</span>
                        <span className="text-cyber-blue font-bold">{metrics.memoryUsage}%</span>
                      </div>
                      <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-cyber-blue rounded-full" style={{ width: `${metrics.memoryUsage}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center gap-3">
                    <Server className="w-6 h-6 text-cyber-green shrink-0" />
                    <div className="text-left">
                      <p className="text-[10px] text-slate-500 font-cyber uppercase leading-none">LOG COLLECTOR STREAM INGESTION RATE</p>
                      <p className="text-base font-cyber font-bold text-cyber-green leading-none mt-1.5">14,240 msg/sec (Active)</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-900 text-xs font-cyber text-slate-500">
              <span>SOC DETECT V4.2</span>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
