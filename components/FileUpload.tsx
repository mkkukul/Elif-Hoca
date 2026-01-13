import React, { useCallback, useState } from 'react';
import { UploadCloud, FileImage, Loader2, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
          ${isAnalyzing ? 'bg-slate-50 border-slate-300 cursor-wait' : 
            dragActive ? 'bg-teal-50 border-teal-500 scale-[1.02]' : 'bg-white border-slate-300 hover:border-teal-400 hover:bg-slate-50'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleChange}
          accept="image/*,application/pdf"
          disabled={isAnalyzing}
        />

        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          {isAnalyzing ? (
            <>
              <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
              <p className="text-lg font-semibold text-slate-700">Belge Analiz Ediliyor...</p>
              <p className="text-sm text-slate-500 mt-2">Yapay zeka verileri ayrıştırıyor. Lütfen bekleyin.</p>
            </>
          ) : (
            <>
              <div className={`flex gap-3 mb-4 transition-colors ${dragActive ? 'text-teal-600' : 'text-slate-500'}`}>
                <div className={`p-4 rounded-full ${dragActive ? 'bg-teal-100' : 'bg-slate-100'}`}>
                  <FileImage size={28} />
                </div>
                <div className={`p-4 rounded-full ${dragActive ? 'bg-teal-100' : 'bg-slate-100'}`}>
                  <FileText size={28} />
                </div>
              </div>
              <p className="mb-2 text-lg text-slate-700 font-medium">
                {dragActive ? "Dosyayı buraya bırakın" : "Sınav Sonucunu (Görsel veya PDF) Yükle"}
              </p>
              <p className="text-sm text-slate-400">Tıklayın veya dosyayı buraya sürükleyin</p>
            </>
          )}
        </div>
      </div>
      
      {!isAnalyzing && (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
           <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
             JPG / PNG Desteklenir
           </span>
           <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
             PDF (Çok Sayfalı) Desteklenir
           </span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;