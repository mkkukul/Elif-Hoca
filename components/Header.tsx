import React from 'react';
import { BookOpenCheck, GraduationCap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-900 dark:to-emerald-900 text-white shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-white/10 dark:bg-black/20 p-2 rounded-full text-white backdrop-blur-sm">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ElifHocaYKS</h1>
            <p className="text-xs text-teal-100 font-medium opacity-90">Akıllı Sınav Analiz Asistanı</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-4 text-sm font-medium">
            <span className="flex items-center space-x-1 opacity-90 hover:opacity-100 transition cursor-pointer">
              <BookOpenCheck size={16} />
              <span>Sonuçlarım</span>
            </span>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={theme === 'dark' ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
            title={theme === 'dark' ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;