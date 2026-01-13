import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ElifHocaYKS Kritik Hata:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    // State'i sıfırla ve ana sayfaya yönlendir (url değişimi gerekiyorsa)
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-slate-200">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50">
              <AlertTriangle className="text-red-500 w-10 h-10" />
            </div>
            
            <h1 className="text-2xl font-black text-slate-800 mb-2">
              Bir şeyler ters gitti
            </h1>
            
            <p className="text-slate-500 mb-8 font-medium leading-relaxed">
              Uygulama beklenmedik bir hatayla karşılaştı. Bu durum genellikle geçici bir bağlantı sorunundan kaynaklanır.
            </p>

            {this.state.error && (
              <div className="bg-slate-100 p-4 rounded-xl text-left mb-8 overflow-auto max-h-40 border border-slate-200">
                <p className="text-[10px] font-mono text-slate-600 break-words">
                  <span className="font-bold text-red-500">Error:</span> {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5"
              >
                <RefreshCw size={18} />
                Sayfayı Yenile
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200"
              >
                <Home size={18} />
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;