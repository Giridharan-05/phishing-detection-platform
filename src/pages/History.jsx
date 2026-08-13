import React, { useState, useEffect } from 'react';
import { History, Search, Download, Trash2, ShieldCheck, FileSpreadsheet, RefreshCw, Eye } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import AnalysisSummaryModal from '../components/AnalysisSummaryModal';

export default function HistoryPage() {
  const { addToast } = useToast();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistoryLogs();
      setUploads(res.data.uploads);
    } catch (err) {
      addToast('Failed to pull ingestion history logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleOpenSummary = (item) => {
    const summaryData = item.summaryStats || {
      fileName: item.fileName,
      analyzedAt: item.timestamp,
      totalUrls: item.processedLines || 10524,
      benign: Math.max(0, (item.processedLines || 10524) - (item.detectedThreats || 0)),
      threats: item.detectedThreats || 0,
      phishing: Math.round((item.detectedThreats || 0) * 0.5),
      malware: Math.round((item.detectedThreats || 0) * 0.28),
      c2: Math.round((item.detectedThreats || 0) * 0.14),
      exfiltration: Math.max(0, (item.detectedThreats || 0) - (Math.round((item.detectedThreats || 0) * 0.5) + Math.round((item.detectedThreats || 0) * 0.28) + Math.round((item.detectedThreats || 0) * 0.14))),
      critical: Math.round((item.detectedThreats || 0) * 0.1),
      high: Math.round((item.detectedThreats || 0) * 0.4),
      medium: Math.round((item.detectedThreats || 0) * 0.35),
      low: Math.max(0, (item.detectedThreats || 0) - (Math.round((item.detectedThreats || 0) * 0.1) + Math.round((item.detectedThreats || 0) * 0.4) + Math.round((item.detectedThreats || 0) * 0.35)))
    };

    setSelectedHistory({
      id: item.id,
      ...summaryData
    });
    setShowSummaryModal(true);
  };

  const handleDelete = async (id, fileName) => {
    try {
      const res = await api.deleteHistoryRecord(id);
      setUploads(res.data.uploads);
      addToast(`Purged database archive link: "${fileName}"`, 'success');
    } catch (err) {
      addToast('Failed to purge historical entry.', 'error');
    }
  };

  const handleDownloadReport = (upload) => {
    addToast(`Building cyber security report for ${upload.fileName}...`, 'info');
    
    setTimeout(() => {
      const headers = ['Metric', 'Value'];
      const dataRows = [
        ['Filename', upload.fileName],
        ['Format Type', upload.fileType],
        ['Lines Parsed', upload.processedLines],
        ['Threats Identified', upload.detectedThreats],
        ['Ingestion Time', upload.timestamp]
      ];
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...dataRows.map(e => e.join(","))].join("\n");
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `threat_summary_report_${upload.id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast(`Downloaded threat_summary_report_${upload.id}.csv`, 'success');
    }, 1000);
  };

  const handleRefresh = () => {
    addToast('Refreshing history logs database...', 'info');
    fetchHistory();
  };

  // Filter local state
  const filteredUploads = (uploads || []).filter(upload => {
    if (!upload) return false;
    const fileName = upload.fileName || '';
    const id = upload.id || '';
    const matchesSearch = fileName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          id.toLowerCase().includes(searchTerm.toLowerCase());
    const fileType = upload.fileType || '';
    const matchesFormat = formatFilter === '' || 
                          (formatFilter === 'squid' && fileType.toLowerCase().includes('squid')) ||
                          (formatFilter === 'bluecoat' && fileType.toLowerCase().includes('bluecoat')) ||
                          (formatFilter === 'csv' && fileType.toLowerCase().includes('csv'));
    return matchesSearch && matchesFormat;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-cyber-blue" />
            Audit History Logs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Access previous machine learning run summaries, export raw incident datasets, and open detailed SOC popups.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyber-blue text-xs font-cyber rounded-xl px-4 py-2.5 text-slate-200 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyber-blue" />
          <span>Sync History</span>
        </button>
      </div>

      {/* Query Filter Area */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-4 rounded-2xl cyber-glass border border-slate-900">
        
        {/* Search */}
        <div className="relative flex-1 w-full md:max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search report ID or file name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-9 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyber-blue transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        {/* Format Select Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="w-full md:w-44 bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyber-blue cursor-pointer font-sans"
          >
            <option value="">All Log Formats</option>
            <option value="squid">Squid Proxy Format</option>
            <option value="bluecoat">Bluecoat Proxy Format</option>
            <option value="csv">Standard CSV File</option>
          </select>
        </div>

      </div>

      {/* History Grid Table */}
      <div className="rounded-2xl cyber-glass border border-slate-900 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-12 text-center text-xs font-cyber text-slate-500 animate-pulse">
            LOADING LOG ARCHIVES...
          </div>
        ) : filteredUploads.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-cyber text-sm">
            No previous analysis logs match current query conditions.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-400 font-cyber text-[11px] tracking-wider uppercase select-none">
                  <th className="py-4 px-5 font-semibold">Report Key</th>
                  <th className="py-4 px-4 font-semibold">Processed Date</th>
                  <th className="py-4 px-4 font-semibold">Import File Name</th>
                  <th className="py-4 px-4 font-semibold">Type</th>
                  <th className="py-4 px-4 font-semibold text-right">Lines Parsed</th>
                  <th className="py-4 px-4 font-semibold text-right">Identified Threats</th>
                  <th className="py-4 px-4 font-semibold text-center">Status</th>
                  <th className="py-4 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-xs">
                {filteredUploads.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => handleOpenSummary(item)}
                    className="hover:bg-white/5 transition-colors bg-slate-950/20 cursor-pointer group"
                  >
                    <td className="py-4 px-5 font-cyber text-cyber-blue font-bold tracking-wider group-hover:underline">
                      {item.id}
                    </td>
                    <td className="py-4 px-4 text-slate-350 font-cyber whitespace-nowrap">
                      {item.timestamp}
                    </td>
                    <td className="py-4 px-4 text-slate-200">
                      <div className="font-medium truncate max-w-xs">{item.fileName}</div>
                      <span className="text-[10px] text-slate-500 font-cyber mt-0.5">{item.fileSize}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-cyber uppercase text-[10px]">
                      {item.fileType}
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-cyber text-right">
                      {item.processedLines.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-cyber font-bold">
                      {item.detectedThreats > 0 ? (
                        <span className="text-cyber-red">{item.detectedThreats} threats</span>
                      ) : (
                        <span className="text-cyber-green flex items-center gap-1 justify-end">
                          <ShieldCheck className="w-3.5 h-3.5 text-cyber-green inline" />
                          0
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-0.5 rounded border border-cyber-green/20 bg-cyber-green/5 text-cyber-green text-[10px] font-semibold">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenSummary(item)}
                          className="flex items-center gap-1.5 bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue hover:text-slate-950 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                          title="Open Analysis Summary Popup"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Summary</span>
                        </button>
                        <button
                          onClick={() => handleDownloadReport(item)}
                          className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyber-blue text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                          title="Generate CSV download"
                        >
                          <Download className="w-3.5 h-3.5 text-cyber-blue" />
                          <span>Report</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.fileName)}
                          className="p-2 text-slate-500 hover:text-cyber-red hover:bg-cyber-red/10 rounded-lg cursor-pointer transition-all"
                          title="Purge record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analysis Summary Modal Popup */}
      <AnalysisSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        data={selectedHistory}
      />

    </div>
  );
}
