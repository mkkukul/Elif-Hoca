import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { AnalysisState } from './types';
import { analyzeExamResult } from './services/geminiService';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    data: null,
    error: null,
  });

  const handleFileSelect = async (file: File) => {
    setAnalysisState({ status: 'analyzing', data: null, error: null });

    try {
      const result = await analyzeExamResult(file);
      setAnalysisState({ status: 'success', data: result, error: null });
    } catch (err: any) {
      setAnalysisState({ 
        status: 'error', 
        data: null, 
        error: err.message || "Bir hata oluştu. Lütfen tekrar deneyin." 
      });
    }
  };

  const handleReset = () => {
    setAnalysisState({ status: 'idle', data: null, error: null });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />
      
      <main className="flex-grow flex flex-col items-center">
        {analysisState.status === 'idle' && (
          <div className="w-full max-w-4xl px-4 py-12 flex flex-col items-center animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-slate-800 dark:text-slate-100 mb-4">
              Deneme Sonuçlarını <span className="text-teal-600 dark:text-teal-400">Saniyeler İçinde</span> Analiz Et
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 text-center max-w-2xl mb-8 leading-relaxed">
              Sınav sonucunun fotoğrafını yükle, yapay zeka senin için konu analizlerini yapsın ve eksiklerini göstersin.
            </p>
            
            <FileUpload 
              onFileSelect={handleFileSelect} 
              isAnalyzing={false} 
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full text-center">
               <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                 <div className="bg-teal-100 dark:bg-teal-900/50 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 text-teal-700 dark:text-teal-400 font-bold text-xl">1</div>
                 <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Fotoğraf Çek</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Sonuç belgenin net bir fotoğrafını çek veya ekran görüntüsü al.</p>
               </div>
               <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                 <div className="bg-teal-100 dark:bg-teal-900/50 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 text-teal-700 dark:text-teal-400 font-bold text-xl">2</div>
                 <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Sisteme Yükle</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Görüntüyü yükleme alanına sürükle veya dosya seç.</p>
               </div>
               <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                 <div className="bg-teal-100 dark:bg-teal-900/50 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 text-teal-700 dark:text-teal-400 font-bold text-xl">3</div>
                 <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Detaylı Analiz</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Ders netleri, puanlar ve detaylı konu eksik analizi parmaklarının ucunda.</p>
               </div>
            </div>
          </div>
        )}

        {analysisState.status === 'analyzing' && (
           <div className="w-full max-w-4xl px-4 py-12 flex flex-col items-center animate-fade-in">
             <FileUpload onFileSelect={() => {}} isAnalyzing={true} />
           </div>
        )}

        {analysisState.status === 'success' && analysisState.data && (
          <Dashboard data={analysisState.data} onReset={handleReset} />
        )}

        {analysisState.status === 'error' && (
          <div className="w-full max-w-lg mx-auto mt-12 px-4 animate-shake">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full mb-4">
                <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">Hata Oluştu</h3>
              <p className="text-red-600 dark:text-red-400 mb-6 font-medium">{analysisState.error}</p>
              <button 
                onClick={handleReset}
                className="px-6 py-2 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-auto transition-colors duration-300">
        <div className="container mx-auto px-4 text-center text-slate-400 dark:text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} ElifHocaYKS. Gemini API ile güçlendirilmiştir.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;