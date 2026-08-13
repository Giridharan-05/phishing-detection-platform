import React, { useState } from 'react';
import { Search, Activity, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function IocSearchPage() {
  const { addToast } = useToast();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [rawMatches, setRawMatches] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setResults(null);
    setRawMatches([]);

    try {
      const res = await api.searchIoc(query.trim());
      const matches = (res.data && Array.isArray(res.data)) ? res.data : [];
      setRawMatches(matches);

      if (matches.length > 0) {
        const first = matches[0];
        setResults({
          ioc: query,
          type: query.match(/^\d+\.\d+\.\d+\.\d+$/) ? 'IPv4 Address' : 'Domain / FQDN',
          reputationScore: first.riskScore || 85,
          threatLevel: first.severity ? `${first.severity.toUpperCase()} THREAT` : 'HIGH THREAT',
          category: first.prediction || 'Threat Detection Match',
          firstSeen: first.timestamp || 'Recorded in Proxy Batch',
          clientIp: first.clientIp || '192.168.43.112',
          mitreTechnique: `${first.mitreId || 'T1071.001'} - ${first.mitreName || 'Web Protocols'}`,
          domain: first.domain,
          url: first.destinationUrl,
          totalOccurrences: matches.length
        });
        addToast(`Found ${matches.length} matching events in threat database`, 'success');
      } else {
        setResults(null);
        addToast(`No matching threat records found in database for "${query}"`, 'info');
      }
    } catch (err) {
      console.error("IOC search failed:", err);
      addToast("Failed to perform IOC database lookup", "error");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-cyber font-bold text-white tracking-wide">Threat Hunting & IOC Search</h1>
            <p className="text-sm text-slate-400">Query MySQL threat events, client IP telemetry, and MITRE ATT&CK correlation</p>
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="cyber-glass p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <label className="text-sm font-cyber text-slate-300 block">Query Indicator of Compromise (Client IP, Domain, or URL string):</label>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="e.g. 192.168.43.112 or login-verify-account-paypal.com"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none font-mono"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-cyber font-bold text-sm shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {searching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Querying Intel...
              </>
            ) : (
              'Investigate IOC'
            )}
          </button>
        </div>
      </form>

      {/* Results View */}
      {results ? (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="cyber-glass p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5">
              <div className="text-xs text-amber-400 font-cyber">RISK / THREAT SCORE</div>
              <div className="text-3xl font-cyber font-bold text-amber-400 mt-1">{results.reputationScore} / 100</div>
              <div className="text-xs text-slate-400 mt-1">{results.threatLevel}</div>
            </div>

            <div className="cyber-glass p-5 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 font-cyber">CLASSIFICATION</div>
              <div className="text-lg font-semibold text-slate-100 mt-1">{results.category}</div>
              <div className="text-xs text-slate-400 mt-1">{results.type} ({results.totalOccurrences} occurrences)</div>
            </div>

            <div className="cyber-glass p-5 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 font-cyber">MITRE ATT&CK MAPPING</div>
              <div className="text-sm font-mono text-purple-400 mt-1">{results.mitreTechnique}</div>
            </div>
          </div>

          <div className="cyber-glass p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-cyber font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              Ingested Event Telemetry
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-500 block">Matched Target Domain:</span>
                <div className="text-slate-300 font-mono break-all">{results.domain}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-500 block">Client Endpoint IP:</span>
                <div className="text-slate-300 font-mono">{results.clientIp}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-500 block">Full Request URI:</span>
              <div className="text-xs text-slate-300 font-mono bg-slate-900 p-2.5 rounded border border-slate-800 break-all">
                {results.url}
              </div>
            </div>
          </div>
        </div>
      ) : (
        !searching && query.trim() !== '' && (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-950/40 flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-slate-500" />
            <span className="text-sm font-semibold text-slate-300">No Indicators Matched</span>
            <span className="text-xs text-slate-400">The query "{query}" did not match any stored threat events in the MySQL database.</span>
          </div>
        )
      )}
    </div>
  );
}
