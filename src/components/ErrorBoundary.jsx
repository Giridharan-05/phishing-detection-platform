import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary Caught An Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-6 bg-slate-950/90 border border-slate-900 rounded-2xl my-4 text-center">
          <div className="w-12 h-12 rounded-full bg-cyber-red/10 border border-cyber-red/30 flex items-center justify-center mb-4 text-cyber-red">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-base font-bold font-cyber text-slate-100 uppercase tracking-wide">
            Component Execution Exception
          </h2>
          <p className="text-xs text-slate-400 max-w-md mt-2 font-sans">
            An unexpected error occurred while rendering this view. The system caught the error safely to prevent platform disruption.
          </p>
          {this.state.error && (
            <div className="mt-4 p-3 bg-black/60 border border-slate-800 rounded-xl text-[11px] font-cyber text-cyber-red text-left max-w-xl overflow-x-auto">
              {this.state.error.toString()}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="mt-6 px-5 py-2.5 rounded-xl bg-cyber-blue hover:bg-blue-600 text-white text-xs font-cyber font-bold flex items-center gap-2 cursor-pointer shadow-cyber-blue transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload & Hydrate View</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
