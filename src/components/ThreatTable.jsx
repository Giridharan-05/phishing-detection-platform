import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  SlidersHorizontal,
  ExternalLink,
  ClipboardCopy
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ThreatTable({ 
  threats, 
  total, 
  page, 
  totalPages, 
  filters, 
  onFilterChange 
}) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Sync search input with filter changes
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchTerm, page: 1 });
  };

  const handleSort = (field) => {
    const isAsc = filters.sortBy === field && filters.sortOrder === 'asc';
    onFilterChange({
      ...filters,
      sortBy: field,
      sortOrder: isAsc ? 'desc' : 'asc',
      page: 1
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onFilterChange({ ...filters, page: newPage });
    }
  };

  const safeThreats = Array.isArray(threats) ? threats : [];

  // Convert array to CSV file and trigger download
  const exportToCSV = () => {
    if (safeThreats.length === 0) {
      addToast('No data available to export', 'warning');
      return;
    }

    const headers = ['ID', 'Timestamp', 'Client IP', 'Target URL', 'Threat Category', 'ML Confidence', 'Severity', 'Status'];
    const rows = safeThreats.map(t => [
      t.id,
      t.timestamp,
      t.clientIp,
      t.url.replace(/"/g, '""'), // escape quotes
      t.category,
      t.confidenceScore,
      t.severity,
      t.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `soc_threat_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addToast('Threat incident logs exported to CSV successfully.', 'success');
  };

  const copyToClipboard = (text, e) => {
    e.stopPropagation(); // Prevent row click navigation
    navigator.clipboard.writeText(text);
    addToast('URL copied to clipboard', 'success');
  };

  // Get color styles based on severity
  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'border-cyber-red/20 bg-cyber-red-glow/10 text-cyber-red shadow-[0_0_10px_rgba(239,68,68,0.1)]';
      case 'High':
        return 'border-cyber-orange/20 bg-cyber-orange-glow/10 text-cyber-orange';
      case 'Medium':
        return 'border-cyber-yellow/20 bg-cyber-yellow-glow/10 text-cyber-yellow';
      default:
        return 'border-cyber-green/20 bg-cyber-green-glow/10 text-cyber-green';
    }
  };

  // Get row styling class based on severity
  const getRowSeverityClass = (severity) => {
    switch (severity) {
      case 'Critical': return 'hover:bg-cyber-red-glow/5 border-l-4 border-l-cyber-red';
      case 'High': return 'hover:bg-cyber-orange-glow/5 border-l-4 border-l-cyber-orange';
      case 'Medium': return 'hover:bg-cyber-yellow-glow/5 border-l-4 border-l-cyber-yellow';
      default: return 'hover:bg-cyber-green-glow/5 border-l-4 border-l-cyber-green';
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Investigating': return 'text-cyber-yellow border-cyber-yellow/30 bg-cyber-yellow/5';
      case 'Blocked': return 'text-cyber-orange border-cyber-orange/30 bg-cyber-orange/5';
      case 'Mitigated': return 'text-cyber-blue border-cyber-blue/30 bg-cyber-blue/5';
      case 'Resolved': return 'text-cyber-green border-cyber-green/30 bg-cyber-green/5';
      default: return 'text-slate-400 border-slate-700 bg-slate-800/10';
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in">
      
      {/* Filters Bar */}
      <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between p-4 rounded-2xl cyber-glass border border-slate-900">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search URL, IP address or ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-9 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyber-blue transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <button type="submit" className="hidden" />
        </form>

        {/* Filters dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyber-blue" />
            <span>Filters:</span>
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value, page: 1 })}
            className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyber-blue cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Phishing">Phishing</option>
            <option value="Malware Distribution">Malware</option>
            <option value="Command & Control">Command & Control</option>
            <option value="Data Exfiltration">Data Exfiltration</option>
            <option value="Benign">Benign</option>
          </select>

          {/* Severity Filter */}
          <select
            value={filters.severity}
            onChange={(e) => onFilterChange({ ...filters, severity: e.target.value, page: 1 })}
            className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyber-blue cursor-pointer"
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Benign">Benign</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value, page: 1 })}
            className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyber-blue cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Investigating">Investigating</option>
            <option value="Blocked">Blocked</option>
            <option value="Alerted">Alerted</option>
            <option value="Mitigated">Mitigated</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyber-blue text-xs rounded-xl px-3 py-2 text-slate-200 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyber-blue" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="w-full rounded-2xl cyber-glass border border-slate-900 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-400 font-cyber text-[11px] tracking-wider uppercase select-none">
                <th className="py-4 px-5 font-semibold">Incident ID</th>
                <th className="py-4 px-4 font-semibold cursor-pointer hover:text-slate-200" onClick={() => handleSort('timestamp')}>
                  <div className="flex items-center gap-1.5">
                    Timestamp <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-4 px-4 font-semibold">Client IP</th>
                <th className="py-4 px-4 font-semibold">Target URL Address</th>
                <th className="py-4 px-4 font-semibold">ML Category</th>
                <th className="py-4 px-4 font-semibold cursor-pointer hover:text-slate-200" onClick={() => handleSort('confidenceScore')}>
                  <div className="flex items-center gap-1.5">
                    Confidence <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-4 px-4 font-semibold">Severity</th>
                <th className="py-4 px-4 font-semibold">Resolution</th>
                <th className="py-4 px-5 font-semibold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-xs font-sans">
              {safeThreats.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-cyber text-sm">
                    No threat logs found matching the query.
                  </td>
                </tr>
              ) : (
                safeThreats.map((threat) => (
                  <tr 
                    key={threat.id} 
                    onClick={() => navigate(`/threats/${threat.id}`)}
                    className={`transition-colors cursor-pointer group bg-slate-950/20
                      ${getRowSeverityClass(threat.severity)}
                    `}
                  >
                    <td className="py-4 px-5 font-cyber text-cyber-blue font-bold tracking-wider">
                      {threat.id}
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-cyber whitespace-nowrap">
                      {threat.timestamp}
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-cyber">
                      {threat.clientIp}
                    </td>
                    <td className="py-4 px-4 max-w-xs xl:max-w-md">
                      <div className="flex items-center gap-2 group/url">
                        <span className="truncate text-slate-300 group-hover:text-cyber-blue transition-colors">
                          {threat.url}
                        </span>
                        <button
                          onClick={(e) => copyToClipboard(threat.url, e)}
                          className="opacity-0 group-hover/url:opacity-100 hover:text-white p-1 rounded hover:bg-white/5 transition-all text-slate-400 shrink-0 cursor-pointer"
                          title="Copy Full URL"
                        >
                          <ClipboardCopy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-200">
                      {threat.category}
                    </td>
                    <td className="py-4 px-4 font-cyber">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 w-8 text-right font-medium">
                          {(threat.confidenceScore * 100).toFixed(1)}%
                        </span>
                        <div className="w-12 h-1.5 bg-slate-900 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full rounded-full 
                              ${threat.severity === 'Critical' ? 'bg-cyber-red' : ''}
                              ${threat.severity === 'High' ? 'bg-cyber-orange' : ''}
                              ${threat.severity === 'Medium' ? 'bg-cyber-yellow' : ''}
                              ${threat.severity === 'Benign' ? 'bg-cyber-green' : ''}
                            `}
                            style={{ width: `${threat.confidenceScore * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold select-none
                        ${getSeverityStyles(threat.severity)}
                      `}>
                        {threat.severity}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-semibold whitespace-nowrap
                        ${getStatusStyles(threat.status)}
                      `}>
                        {threat.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/threats/${threat.id}`); }}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-cyber-blue transition-colors text-xs font-semibold cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 0 && (
          <div className="px-5 py-4 border-t border-slate-900 bg-slate-950/40 flex items-center justify-between flex-wrap gap-4 text-xs font-cyber text-slate-400 select-none">
            <div>
              Showing <span className="text-slate-200">{(page - 1) * 10 + 1}</span> to <span className="text-slate-200">{Math.min(page * 10, total)}</span> of <span className="text-slate-200">{total}</span> threat logs
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-1.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 disabled:opacity-30 disabled:hover:border-slate-800 text-slate-300 disabled:text-slate-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-cyber-blue font-extrabold">{page}</span>
                <span>/</span>
                <span className="text-slate-300">{totalPages}</span>
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-1.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 disabled:opacity-30 disabled:hover:border-slate-800 text-slate-300 disabled:text-slate-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
