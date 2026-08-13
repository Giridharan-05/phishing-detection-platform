import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UploadCloud, History, Trash2, Calendar, FileCheck, ShieldAlert } from 'lucide-react';
import Uploader from '../components/Uploader';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function UploadLogs() {
  const { addToast } = useToast();
  const { refreshLayout } = useOutletContext();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUploadHistory = async () => {
    try {
      const res = await api.getHistoryLogs();
      setUploads(res.data.uploads);
    } catch (err) {
      console.error('Failed to load uploads history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploadHistory();
  }, []);

  const handleUploadSuccess = async () => {
    await fetchUploadHistory();
    if (refreshLayout) refreshLayout(); // Sync global notification bubble counts
  };

  const handleDeleteHistory = async (id) => {
    try {
      const res = await api.deleteHistoryRecord(id);
      setUploads(res.data.uploads);
      addToast(`History log item ${id} deleted successfully.`, 'success');
      if (refreshLayout) refreshLayout();
    } catch (err) {
      addToast('Failed to delete history record.', 'error');
    }
  };

  const safeUploads = Array.isArray(uploads) ? uploads : [];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-cyber-blue" />
          Upload Network Logs
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Ingest proxy transaction logs into the machine learning detection workflow to isolate URL attack indicators.
        </p>
      </div>

      {/* Main Uploader Layout */}
      <Uploader onUploadSuccess={handleUploadSuccess} />

      {/* Recent Uploads Section */}
      <div className="rounded-2xl cyber-glass border border-slate-900 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
          <History className="w-4 h-4 text-cyber-blue" />
          <h2 className="text-sm font-bold text-slate-100 font-sans tracking-wide">Recent Log Ingestions</h2>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs font-cyber text-slate-500 animate-pulse">
            RETRIEVING AUDIT ARCHIVE...
          </div>
        ) : safeUploads.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs font-cyber">
            No previous uploads found in current session context.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400 font-cyber text-[10px] tracking-wider uppercase select-none">
                  <th className="py-3 px-4 font-semibold">Upload ID</th>
                  <th className="py-3 px-4 font-semibold">Ingestion Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Log File Name</th>
                  <th className="py-3 px-4 font-semibold">Format</th>
                  <th className="py-3 px-4 font-semibold text-right">Records Parsed</th>
                  <th className="py-3 px-4 font-semibold text-right">Threats Identified</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Purge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-905 text-xs">
                {safeUploads.map((upload) => (
                  <tr key={upload.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-cyber text-cyber-blue font-bold tracking-wider">
                      {upload.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-cyber">
                      {upload.timestamp}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-medium">
                      {upload.fileName}
                      <span className="text-[10px] text-slate-500 font-cyber block mt-0.5">{upload.fileSize}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-cyber uppercase text-[10px]">
                      {upload.fileType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-cyber text-right">
                      {upload.processedLines.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {upload.detectedThreats > 0 ? (
                        <div className="inline-flex items-center gap-1.5 justify-end font-cyber font-bold text-cyber-red">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{upload.detectedThreats}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 justify-end font-cyber font-bold text-cyber-green">
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>0</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded border border-cyber-green/20 bg-cyber-green/5 text-cyber-green text-[10px] font-semibold">
                        {upload.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteHistory(upload.id)}
                        className="text-slate-500 hover:text-cyber-red p-1 rounded hover:bg-cyber-red/10 transition-all cursor-pointer"
                        title="Delete log record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
