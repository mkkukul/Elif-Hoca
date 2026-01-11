import React from 'react';
import { BookOpenCheck, GraduationCap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-white p-2 rounded-full text-teal-600">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ElifHocaYKS</h1>
            <p className="text-xs text-teal-100 font-medium opacity-90">Akıllı Sınav Analiz Asistanı</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-sm font-medium">
          <span className="flex items-center space-x-1 opacity-90 hover:opacity-100 transition">
            <BookOpenCheck size={16} />
            <span>Sonuçlarım</span>
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
