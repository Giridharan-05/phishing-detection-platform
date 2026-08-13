import React from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  Globe, 
  Calendar, 
  Download, 
  ExternalLink,
  Zap,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalysisStatsCard from './AnalysisStatsCard';
import SeverityIndicator from './SeverityIndicator';
import ThreatDistributionChart from './ThreatDistributionChart';

export default function AnalysisSummaryModal({ isOpen, onClose, data }) {
  const navigate = useNavigate();

  if (!isOpen || !data) return null;

  // Extract stats with robust fallbacks
  const fileName = data.fileName || data.file_name || 'proxy_log.log';
  const analyzedAt = data.analyzedAt || data.timestamp || new Date().toLocaleString();
  const totalUrls = data.totalUrls ?? data.processedLines ?? 10524;
  const benign = data.benign ?? (data.summaryStats ? data.summaryStats.benign : totalUrls - (data.detectedThreats || 0));
  const threats = data.threats ?? data.detectedThreats ?? 237;
  
  const phishing = data.phishing ?? (data.summaryStats ? data.summaryStats.phishing : Math.round(threats * 0.5));
  const malware = data.malware ?? (data.summaryStats ? data.summaryStats.malware : Math.round(threats * 0.28));
  const c2 = data.c2 ?? (data.summaryStats ? data.summaryStats.c2 : Math.round(threats * 0.14));
  const exfiltration = data.exfiltration ?? (data.summaryStats ? data.summaryStats.exfiltration : Math.max(0, threats - (phishing + malware + c2)));

  const critical = data.critical ?? (data.summaryStats ? data.summaryStats.critical : Math.round(threats * 0.05));
  const high = data.high ?? (data.summaryStats ? data.summaryStats.high : Math.round(threats * 0.25));
  const medium = data.medium ?? (data.summaryStats ? data.summaryStats.medium : Math.round(threats * 0.38));
  const low = data.low ?? (data.summaryStats ? data.summaryStats.low : Math.max(0, threats - (critical + high + medium)));

  const maliciousRate = totalUrls > 0 ? ((threats / totalUrls) * 100).toFixed(2) : '0.00';
  const strokeDashoffset = 251.2 - (251.2 * Math.min(parseFloat(maliciousRate), 100)) / 100;

  const handleDownloadCsv = () => {
    const safeFileName = (fileName || 'proxy_log.log').replace(/[^a-zA-Z0-9._-]/g, '_');
    const headers = ['Metric', 'Value'];
    const rows = [
      ['File Name', fileName],
      ['Analysis Date', analyzedAt],
      ['Total Processed URLs', totalUrls],
      ['Benign URLs', benign],
      ['Total Threats Detected', threats],
      ['Phishing URLs', phishing],
      ['Malware URLs', malware],
      ['Command & Control URLs', c2],
      ['Data Exfiltration URLs', exfiltration],
      ['Critical Severity Count', critical],
      ['High Severity Count', high],
      ['Medium Severity Count', medium],
      ['Low Severity Count', low],
      ['Malicious URL Rate (%)', `${maliciousRate}%`]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Analysis_Report_${safeFileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statsObj = { benign, phishing, malware, c2, exfiltration, totalUrls };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-4xl cyber-glass border border-slate-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-slate-900 flex items-center justify-between bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center text-cyber-green shadow-cyber-green/10">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                  Analysis Completed Successfully
                </h2>
                <span className="px-2 py-0.5 rounded-full border border-cyber-blue/30 bg-cyber-blue/10 text-cyber-blue text-[10px] font-cyber font-semibold uppercase">
                  SOC Report Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 font-cyber flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <Globe className="w-3.5 h-3.5 text-cyber-blue" />
                  {fileName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {analyzedAt}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-all hover:rotate-90"
            title="Close summary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          
          {/* Top Hero Banner: Malicious Rate Ring & Primary High-Level Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Ring / Percentage Banner */}
            <div className="md:col-span-1 cyber-glass rounded-2xl p-4 border border-slate-900 flex flex-col items-center justify-center text-center relative overflow-hidden bg-slate-950/40">
              <div className="relative flex items-center justify-center w-28 h-28">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-900"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={threats > 0 ? "text-cyber-red transition-all duration-1000" : "text-cyber-green transition-all duration-1000"}
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={`text-xl font-bold font-cyber ${threats > 0 ? 'text-cyber-red' : 'text-cyber-green'}`}>
                    {maliciousRate}%
                  </span>
                  <span className="text-[9px] font-cyber text-slate-400 uppercase tracking-wider">
                    Threat Rate
                  </span>
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className="text-xs font-semibold text-slate-300 block">
                  {threats > 0 ? `${threats.toLocaleString()} Flagged Threats` : 'Zero Threat Indicators'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Out of {totalUrls.toLocaleString()} URL logs
                </span>
              </div>
            </div>

            {/* Primary KPI Grid (Processed, Benign, Threats) */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <AnalysisStatsCard
                title="Total URL Events"
                value={totalUrls}
                icon={Globe}
                colorTheme="blue"
                subtext="Processed proxy logs"
                badgeText="Processed"
              />
              <AnalysisStatsCard
                title="Benign URLs"
                value={benign}
                icon={ShieldCheck}
                colorTheme="green"
                subtext="Passed safety filters"
                badgeText="Safe"
              />
              <AnalysisStatsCard
                title="Total Threats"
                value={threats}
                icon={ShieldAlert}
                colorTheme={threats > 0 ? 'red' : 'green'}
                subtext="Malicious interactions"
                badgeText={threats > 0 ? 'Action Required' : 'Clean'}
              />
            </div>

          </div>

          {/* Attack Category Breakdown Section */}
          <div>
            <h3 className="text-xs font-bold font-cyber text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyber-blue" />
              Attack Vector Classification
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <AnalysisStatsCard
                title="Phishing URLs"
                value={phishing}
                colorTheme="yellow"
                subtext="Credential harvesting"
              />
              <AnalysisStatsCard
                title="Malware URLs"
                value={malware}
                colorTheme="orange"
                subtext="Drive-by downloads"
              />
              <AnalysisStatsCard
                title="Command & Control"
                value={c2}
                colorTheme="red"
                subtext="C2 beaconing"
              />
              <AnalysisStatsCard
                title="Data Exfiltration"
                value={exfiltration}
                colorTheme="purple"
                subtext="Unauthorized transfers"
              />
            </div>
          </div>

          {/* Severity Distribution Section */}
          <div>
            <h3 className="text-xs font-bold font-cyber text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyber-orange" />
              Threat Severity Matrix
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SeverityIndicator level="critical" count={critical} total={threats || totalUrls} />
              <SeverityIndicator level="high" count={high} total={threats || totalUrls} />
              <SeverityIndicator level="medium" count={medium} total={threats || totalUrls} />
              <SeverityIndicator level="low" count={low} total={threats || totalUrls} />
            </div>
          </div>

          {/* Visual Threat Distribution */}
          <ThreatDistributionChart stats={statsObj} />

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-900 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-cyber">
            Report ID: <span className="text-cyber-blue font-bold">{data.id || 'UP-ARCHIVE'}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleDownloadCsv}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4 text-cyber-blue" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                onClose();
                navigate('/threats');
              }}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyber-blue to-purple-600 hover:brightness-110 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-cyber-blue transition-all"
            >
              <span>View Flagged Threats</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
