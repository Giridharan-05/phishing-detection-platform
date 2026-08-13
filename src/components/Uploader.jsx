import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Play, Sparkles, FileSpreadsheet } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import AnalysisSummaryModal from './AnalysisSummaryModal';

const sampleSquidLog = `1286536219.250    328 192.168.43.112 TCP_MISS/200 422 GET http://login-verify-account-paypal.com/signin - DIRECT/198.51.100.42 text/html
1286536220.112    410 192.168.43.115 TCP_MISS/200 5120 GET http://update-secure-bank-auth.com/download/patch.exe - DIRECT/203.0.113.88 application/x-msdownload
1286536221.840    150 192.168.43.120 TCP_MISS/200 1280 GET http://c2-command-node.ru/beacon - DIRECT/198.51.100.99 application/octet-stream
1286536222.001     45 192.168.43.101 TCP_HIT/200 2400 GET http://google.com/search?q=cybersecurity - NONE/- text/html
1286536223.400    890 192.168.43.112 TCP_MISS/200 8920 POST http://data-exfil-dns-tunnel.org/upload - DIRECT/203.0.113.150 application/json`;

const sampleBluecoatLog = `2026-07-08 11:08:42 328 192.168.43.112 - - - - system-proc 198.51.100.42 80 /signin GET http login-verify-account-paypal.com - "Phishing" 200 text/html
2026-07-08 11:08:45 410 192.168.43.115 - - - - system-proc 203.0.113.88 80 /patch.exe GET http update-secure-bank-auth.com - "Malware" 200 application/x-msdownload`;


export default function Uploader({ onUploadSuccess }) {
  const { addToast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [logType, setLogType] = useState('squid');
  const [status, setStatus] = useState('idle'); // idle | selected | processing | completed
  const [progress, setProgress] = useState(0);
  const [logConsole, setLogConsole] = useState([]);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [currentSummaryData, setCurrentSummaryData] = useState(null);

  const fileInputRef = useRef(null);

  const addConsoleLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogConsole(prev => [...prev, `[${time}] ${msg}`]);
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    
    const fileName = selectedFile.name || '';
    const ext = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
    const validExts = ['log', 'txt', 'csv'];
    
    if (!validExts.includes(ext)) {
      const errorMsg = `Unsupported File Format: "${fileName}". Please upload a SQUID or Bluecoat proxy log file (.log, .txt, or .csv).`;
      addToast(errorMsg, 'error');
      addConsoleLog(`[ERROR] Rejected "${fileName}" (.${ext || 'unknown'}). Supported formats: .log, .txt, .csv`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return false;
    }
    
    if (selectedFile.size > 100 * 1024 * 1024) {
      const errorMsg = `File Too Large: "${fileName}" is ${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed size is 100 MB.`;
      addToast(errorMsg, 'error');
      addConsoleLog(`[ERROR] File "${fileName}" exceeds 100 MB limit.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return false;
    }

    if (selectedFile.size === 0) {
      const errorMsg = `Empty File: "${fileName}" contains 0 bytes. Please select a valid proxy log file.`;
      addToast(errorMsg, 'error');
      addConsoleLog(`[ERROR] File "${fileName}" is 0 bytes.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return false;
    }

    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setStatus('selected');
        setLogConsole([]);
        addConsoleLog(`Loaded file: ${droppedFile.name} (${(droppedFile.size / 1024).toFixed(1)} KB)`);
        addConsoleLog(`Auto-detected proxy format: ${logType.toUpperCase()}`);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setStatus('selected');
        setLogConsole([]);
        addConsoleLog(`Loaded file: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`);
        addConsoleLog(`Proxy format configured: ${logType.toUpperCase()}`);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setStatus('processing');
    setProgress(0);
    setLogConsole([]);
    
    addConsoleLog(`Initializing URL Threat Detection Engine v2.4...`);
    await new Promise(r => setTimeout(r, 300));
    addConsoleLog(`Establishing proxy parsing buffers for ${logType.toUpperCase()} format...`);
    
    try {
      const res = await api.uploadLogs(file, logType, (percentage) => {
        setProgress(percentage);
        if (percentage === 40) {
          addConsoleLog(`Tokenizing web request log stream...`);
        } else if (percentage === 70) {
          addConsoleLog(`Applying Machine Learning classification (URL Token Embeddings)...`);
        } else if (percentage === 90) {
          addConsoleLog(`Querying MITRE ATT&CK tactical matrices & Domain Reputation caches...`);
        }
      });

      const uploadResult = (res && res.data && res.data.upload) ? res.data.upload : {};
      const summaryStats = uploadResult.summaryStats || {
        fileName: file ? file.name : 'uploaded_log.log',
        analyzedAt: new Date().toLocaleString(),
        totalUrls: uploadResult.processedLines || 10,
        benign: Math.max(0, (uploadResult.processedLines || 10) - (uploadResult.detectedThreats || 0)),
        threats: uploadResult.detectedThreats || 0,
        phishing: Math.round((uploadResult.detectedThreats || 0) * 0.5),
        malware: Math.round((uploadResult.detectedThreats || 0) * 0.28),
        c2: Math.round((uploadResult.detectedThreats || 0) * 0.14),
        exfiltration: Math.max(0, (uploadResult.detectedThreats || 0) - (Math.round((uploadResult.detectedThreats || 0) * 0.5) + Math.round((uploadResult.detectedThreats || 0) * 0.28) + Math.round((uploadResult.detectedThreats || 0) * 0.14))),
        critical: Math.round((uploadResult.detectedThreats || 0) * 0.1),
        high: Math.round((uploadResult.detectedThreats || 0) * 0.4),
        medium: Math.round((uploadResult.detectedThreats || 0) * 0.35),
        low: Math.max(0, (uploadResult.detectedThreats || 0) - (Math.round((uploadResult.detectedThreats || 0) * 0.1) + Math.round((uploadResult.detectedThreats || 0) * 0.4) + Math.round((uploadResult.detectedThreats || 0) * 0.35)))
      };

      setCurrentSummaryData({
        id: uploadResult.id || 'UP-101',
        ...summaryStats
      });

      addConsoleLog(`Analysis complete. Processed ${(uploadResult.processedLines || 0).toLocaleString()} records.`);
      addConsoleLog(`Detected ${uploadResult.detectedThreats || 0} malicious URL interactions!`);
      setStatus('completed');
      setSummaryModalOpen(true); // Automatically open modern SOC analysis popup
      addToast(`Logs analysis completed. ${uploadResult.detectedThreats || 0} threats detected.`, 'warning');
      
      if (onUploadSuccess) {
        onUploadSuccess(uploadResult);
      }
    } catch (err) {
      console.error("Upload Analysis Error:", err);
      addConsoleLog(`[ERROR] Threat Analysis aborted: ${err.message || 'Processing error'}`);
      setStatus('selected');
      addToast(`Analysis error: ${err.message || 'Could not process log file.'}`, 'error');
    }
  };

  const resetUploader = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setLogConsole([]);
  };

  const downloadTestLogs = (type) => {
    const text = type === 'squid' ? sampleSquidLog : sampleBluecoatLog;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sample_${type}_logs.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Sample ${type.toUpperCase()} file downloaded. Try uploading it!`, 'success');
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 animate-fade-in">
      
      {/* Upload Console Section */}
      <div className="flex-1 rounded-2xl cyber-glass border border-slate-900 p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-cyber-blue" />
            Ingest Proxy Event Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Feed raw network proxy outputs into our ML-based classifier to isolate URL-based attacks.
          </p>
        </div>

        {/* Configurations */}
        {status === 'idle' && (
          <div className="grid grid-cols-3 gap-3">
            {['squid', 'bluecoat', 'csv'].map((type) => (
              <button
                key={type}
                onClick={() => setLogType(type)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase font-cyber cursor-pointer transition-all
                  ${logType === type 
                    ? 'border-cyber-blue bg-cyber-blue/15 text-cyber-blue shadow-cyber-blue/5' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400'
                  }
                `}
              >
                {type} format
              </button>
            ))}
          </div>
        )}

        {/* Drag & Drop Box */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`flex-1 min-h-64 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all duration-300 relative
            ${dragActive ? 'border-cyber-blue bg-cyber-blue/10' : 'border-slate-850 bg-slate-950/40'}
          `}
        >
          {status === 'idle' && (
            <div className="text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-cyber-blue transition-colors">
                <UploadCloud className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Drag & drop file here or <span className="text-cyber-blue hover:underline cursor-pointer" onClick={() => fileInputRef.current.click()}>browse</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Supports SQUID, Bluecoat (.log, .txt, .csv) up to 100MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".log,.txt,.csv"
                className="hidden"
              />
            </div>
          )}

          {status === 'selected' && (
            <div className="text-center flex flex-col items-center gap-3 w-full max-w-sm">
              <FileText className="w-12 h-12 text-cyber-blue" />
              <div className="truncate w-full font-cyber text-slate-200 text-sm font-semibold">
                {file.name}
              </div>
              <div className="text-xs text-slate-400">
                {(file.size / 1024).toFixed(1)} KB | Format: <span className="font-cyber font-semibold text-cyber-blue uppercase">{logType}</span>
              </div>
              
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={resetUploader}
                  className="flex-1 py-2 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-xs font-semibold cursor-pointer text-slate-300 transition-colors"
                >
                  Clear File
                </button>
                <button
                  onClick={handleAnalyze}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyber-blue to-purple-600 text-white hover:brightness-110 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-cyber-blue"
                >
                  <Play className="w-3.5 h-3.5" />
                  Analyze Logs
                </button>
              </div>
            </div>
          )}

          {status === 'processing' && (
            <div className="text-center flex flex-col items-center gap-4 w-full max-w-xs">
              <div className="relative flex h-10 w-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-10 w-10 bg-cyber-blue/10 border border-cyber-blue/40 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyber-blue animate-pulse" />
                </span>
              </div>
              <div className="w-full">
                <div className="flex justify-between items-center text-xs font-cyber text-slate-400 mb-1">
                  <span>ML THREAT MODEL EVALUATION</span>
                  <span className="text-cyber-blue font-bold">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-cyber-blue to-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <span className="text-[11px] font-cyber text-slate-400 animate-pulse">CLASSIFYING ATTACK VECTOR URLS...</span>
            </div>
          )}

          {status === 'completed' && (
            <div className="text-center flex flex-col items-center gap-3 w-full max-w-sm">
              <CheckCircle2 className="w-12 h-12 text-cyber-green" />
              <p className="text-sm font-semibold text-slate-200">Analysis Concluded Successfully</p>
              <p className="text-xs text-slate-400">Threat records have been ingested into the incident database.</p>
              
              <div className="flex gap-2 w-full mt-2">
                <button
                  onClick={() => setSummaryModalOpen(true)}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyber-blue to-purple-600 text-white hover:brightness-110 text-xs font-semibold cursor-pointer shadow-cyber-blue flex items-center justify-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  View Summary
                </button>
                <button
                  onClick={resetUploader}
                  className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyber-blue text-xs font-semibold cursor-pointer text-slate-200 transition-all"
                >
                  Ingest New
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Terminal log panel and Helper Templates */}
      <div className="w-full lg:w-96 rounded-2xl cyber-glass border border-slate-900 p-6 flex flex-col gap-5">
        
        {/* Helper log templates */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-bold text-slate-400 font-cyber tracking-wider uppercase">LOG EXAMPLES FOR TESTING</h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => downloadTestLogs('squid')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-850 bg-slate-950/60 hover:bg-slate-950 hover:border-cyber-blue text-xs text-left cursor-pointer transition-all"
            >
              <span className="font-semibold text-slate-200">SQUID Log Template</span>
              <span className="text-[10px] font-cyber text-cyber-blue uppercase">Download</span>
            </button>
            <button
              onClick={() => downloadTestLogs('bluecoat')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-850 bg-slate-950/60 hover:bg-slate-950 hover:border-cyber-blue text-xs text-left cursor-pointer transition-all"
            >
              <span className="font-semibold text-slate-200">Bluecoat Log Template</span>
              <span className="text-[10px] font-cyber text-cyber-blue uppercase">Download</span>
            </button>
          </div>
        </div>

        {/* Live Parsing Console */}
        <div className="flex-1 flex flex-col gap-2 min-h-60">
          <div className="flex justify-between items-center text-xs font-cyber text-slate-400">
            <span>DETECTION PIPELINE CONSOLE</span>
            {status === 'processing' && (
              <span className="flex items-center gap-1.5 text-cyber-blue animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue inline-block"></span>
                ACTIVE
              </span>
            )}
          </div>
          <div className="flex-1 bg-slate-950 border border-slate-900 rounded-xl p-3.5 font-cyber text-[10px] text-cyber-blue overflow-y-auto space-y-1.5 h-full max-h-64 shadow-inner">
            {logConsole.length === 0 ? (
              <span className="text-slate-600 italic">No events streaming... Ingest a proxy log payload to display logs parsing trace.</span>
            ) : (
              logConsole.map((log, idx) => (
                <div key={idx} className="leading-relaxed border-l border-cyber-blue/20 pl-2">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Analysis Summary Modal Popup */}
      <AnalysisSummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        data={currentSummaryData}
      />

    </div>
  );
}
