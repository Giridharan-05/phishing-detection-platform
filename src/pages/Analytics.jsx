import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Map, 
  FileSpreadsheet, 
  Globe2, 
  Cpu, 
  RefreshCw, 
  Download, 
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  ThreatCategoryPie, 
  ThreatTrendLine, 
  TopDomainsBar, 
  SeverityBar 
} from '../components/Charts';

export default function Analytics() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  // Report generation state
  const [reportType, setReportType] = useState('weekly');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      setData(res.data);
    } catch (err) {
      addToast('Failed to pull analytics metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    addToast(`Compiling ${reportType} SOC summary report in ${reportFormat.toUpperCase()} format...`, 'info');

    setTimeout(() => {
      setIsGenerating(false);
      addToast(`Report "${reportType}_incident_report.${reportFormat}" compiled and downloaded successfully.`, 'success');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-cyber-blue border-t-transparent animate-spin"></div>
          <span className="font-cyber text-sm text-slate-400">HYDRATING DEEP ANALYTICAL CORES...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-cyber text-slate-400">FAILED TO HYDRATE ANALYTICS METRICS FROM SOC CLUSTER</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-xl bg-cyber-blue/10 hover:bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30 text-xs font-cyber flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 animate-spin-hover" />
          <span>Retry Metrics Load</span>
        </button>
      </div>
    );
  }

  const { 
    threatCategories = [], 
    threatTrends = [], 
    topMaliciousDomains = [], 
    severityDistribution = [],
    topAttackedIps = []
  } = data;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyber-blue" />
            Security Analytics Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep statistical correlation of malicious traffic events, vector frequencies, and geographic patterns.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyber-blue text-xs font-cyber rounded-xl px-4 py-2.5 text-slate-200 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyber-blue" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Trend */}
        <div className="xl:col-span-2 rounded-2xl cyber-glass border border-slate-900 p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-2">
            <Sparkles className="w-4 h-4 text-cyber-blue animate-pulse" />
            Attack Classification Trends Over Time
          </h3>
          <ThreatTrendLine data={threatTrends} />
        </div>

        {/* Categories Mix */}
        <div className="rounded-2xl cyber-glass border border-slate-900 p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-2">
            <Cpu className="w-4 h-4 text-cyber-green" />
            Attack Vector Frequency (Volume)
          </h3>
          <ThreatCategoryPie data={threatCategories} />
        </div>

      </div>

      {/* Map and Domain Analysis Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Geographic Threat Map Simulator */}
        <div className="xl:col-span-2 rounded-2xl cyber-glass border border-slate-900 p-5 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Map className="w-4 h-4 text-cyber-blue" />
              Global Threat Source Geo-Map Tracker
            </h3>
            <span className="text-[10px] font-cyber text-cyber-red animate-pulse">LIVE SENSOR MATCHES</span>
          </div>

          <div className="flex-1 min-h-[300px] border border-slate-900 bg-slate-950/80 rounded-xl flex items-center justify-center p-6 relative overflow-hidden">
            {/* World Map SVG representation */}
            <svg 
              className="w-full h-full max-h-72 opacity-25 text-cyber-blue" 
              viewBox="0 0 1000 500" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.8"
            >
              {/* Dummy continents outlines */}
              <path d="M150,150 C180,130 220,120 250,140 C280,160 270,220 250,250 C230,280 180,300 150,280 C120,260 110,180 150,150 Z" />
              <path d="M400,100 C450,70 520,80 570,110 C620,140 650,200 630,260 C610,320 540,360 480,340 C420,320 380,240 400,100 Z" />
              <path d="M480,340 C520,340 550,380 570,420 C590,460 550,480 500,480 C450,480 430,440 430,400 C430,360 460,340 480,340 Z" />
              <path d="M750,120 C800,100 850,120 880,160 C910,200 890,260 860,290 C830,320 780,300 750,280 C720,260 720,180 750,120 Z" />
              <path d="M780,330 C800,320 820,330 830,350 C840,370 830,390 810,400 C790,410 770,390 770,370 C770,350 775,335 780,330 Z" />
            </svg>

            {/* Glowing active attack coordinates dots */}
            {/* Dot 1: USA East Coast */}
            <div className="absolute top-[32%] left-[23%] flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyber-red border border-white/20"></span>
            </div>
            
            {/* Dot 2: Western Europe */}
            <div className="absolute top-[28%] left-[48%] flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyber-orange border border-white/20"></span>
            </div>

            {/* Dot 3: East Asia */}
            <div className="absolute top-[35%] left-[81%] flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyber-red border border-white/20"></span>
            </div>

            {/* Map Overlay Text Indicators */}
            <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-slate-900 rounded-xl p-3 font-cyber text-[10px] space-y-1">
              <p className="text-slate-400 uppercase">ACTIVE GEOGRAPHIC SENSORS</p>
              <p className="text-cyber-blue font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue inline-block"></span>
                Node-1: Washington DC (Active)
              </p>
              <p className="text-cyber-red font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-red inline-block"></span>
                Node-2: Beijing CN (Traffic Block)
              </p>
              <p className="text-cyber-green font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-green inline-block"></span>
                Node-3: Frankfurt DE (Normal)
              </p>
            </div>
          </div>
        </div>

        {/* Report builder */}
        <div className="rounded-2xl cyber-glass border border-slate-900 p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-2">
            <FileSpreadsheet className="w-4 h-4 text-cyber-blue" />
            SOC Historical Reports Builder
          </h3>

          <form onSubmit={handleGenerateReport} className="flex-1 flex flex-col gap-4 justify-center">
            
            {/* Interval */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-cyber text-slate-400 uppercase block">Report Interval</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyber-blue cursor-pointer font-sans"
              >
                <option value="weekly">Weekly Threat Audit</option>
                <option value="monthly">Monthly Incident Summary</option>
                <option value="mitre">MITRE ATT&CK Mapping Report</option>
              </select>
            </div>

            {/* Format */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-cyber text-slate-400 uppercase block">Export Format</label>
              <div className="grid grid-cols-2 gap-2.5">
                {['pdf', 'csv'].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setReportFormat(fmt)}
                    className={`py-2 rounded-xl border text-xs font-semibold uppercase font-cyber cursor-pointer transition-all
                      ${reportFormat === fmt 
                        ? 'border-cyber-blue bg-cyber-blue/15 text-cyber-blue shadow-cyber-blue/5' 
                        : 'border-slate-805 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }
                    `}
                  >
                    {fmt} document
                  </button>
                ))}
              </div>
            </div>

            {/* Action */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full mt-2 bg-gradient-to-r from-cyber-blue to-purple-600 hover:brightness-110 text-white rounded-xl py-3 text-xs font-cyber font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-cyber-blue transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>COMPILING REPORT DATA...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD INCIDENT REPORT</span>
                </>
              )}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}
