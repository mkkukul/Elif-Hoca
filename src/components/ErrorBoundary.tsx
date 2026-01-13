import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, XCircle, Code } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden border border-red-200">
            {/* Header */}
            <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="text-red-600 w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Uygulama Hatası (Debug Modu)</h1>
                <p className="text-red-700 font-medium mt-1">
                  Beklenmedik bir hata oluştu ve uygulama durduruldu.
                </p>
              </div>
            </div>

            {/* Error Details */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <XCircle size={16} /> Hata Mesajı
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-lg font-mono text-red-900 font-bold break-words">
                    {this.state.error?.toString()}
                  </p>
                </div>
              </div>

              {this.state.errorInfo && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Code size={16} /> Stack Trace (Teknik Detay)
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96 shadow-inner">
                    <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap leading-relaxed">
                      {this.state.errorInfo.componentStack}
                    </pre>
                    <div className="h-px bg-gray-700 my-4"></div>
                    <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap leading-relaxed">
                       {this.state.error?.stack}
                    </pre>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 flex gap-4">
                <button
                  onClick={this.handleReload}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Sayfayı Yenile
                </button>
                <button
                  onClick={() => { localStorage.clear(); window.location.reload(); }}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  Önbelleği Temizle ve Yenile
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;