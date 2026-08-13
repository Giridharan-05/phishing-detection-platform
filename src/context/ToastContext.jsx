import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldAlert, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Render Portlet */}
      <div className="fixed top-6 right-6 z-100 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl cyber-glass border shadow-lg transition-all duration-300 transform translate-x-0 animate-slide-in
              ${toast.type === 'success' ? 'border-cyber-green/50 bg-cyber-green-glow/20' : ''}
              ${toast.type === 'warning' ? 'border-cyber-yellow/50 bg-cyber-yellow-glow/20' : ''}
              ${toast.type === 'error' ? 'border-cyber-red/50 bg-cyber-red-glow/20' : ''}
              ${toast.type === 'info' ? 'border-cyber-blue/50 bg-cyber-blue-glow/20' : ''}
            `}
          >
            <div className="mt-0.5">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-cyber-green" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-cyber-yellow" />}
              {toast.type === 'error' && <ShieldAlert className="w-5 h-5 text-cyber-red" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-cyber-blue" />}
            </div>
            <div className="flex-1 text-sm font-medium text-slate-100">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
