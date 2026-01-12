import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, BrainCircuit, ChevronRight, Copy, Check } from 'lucide-react';
import { AnalysisResult } from '../types';
import { chatWithElifHoca } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ChatInterfaceProps {
  data: AnalysisResult;
}

const QUICK_QUESTIONS = [
  "📅 Bana özel haftalık çalışma planı yap",
  "📈 YKS 2026 sıralama tahminim nedir?",
  "🧪 Fen netlerimi nasıl artırabilirim?",
  "⚠️ En kritik konu eksiklerim neler?",
  "🧠 Matematik boşlarım için strateji ver"
];

// Basit Markdown İşleyici
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  // Satırları ayır
  const lines = content.split('\n');
  
  return (
    <div className="text-sm leading-relaxed space-y-2">
      {lines.map((line, idx) => {
        // Boş satırlar
        if (line.trim() === '') return <div key={idx} className="h-2" />;

        // Kalın yazı (**text**) işleme
        const parts = line.split(/(\*\*.*?\*\*)/g);
        
        // Liste elemanları (- item veya * item)
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <div key={idx} className="flex gap-2 ml-2">
              <span className="text-indigo-500 mt-1.5">•</span>
              <span>
                {parts.map((part, pIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={pIdx} className="font-bold text-indigo-900 dark:text-indigo-200">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </span>
            </div>
          );
        }

        // Normal paragraflar
        return (
          <p key={idx}>
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={pIdx} className="font-bold text-indigo-900 dark:text-indigo-200">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ data }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      content: `Merhaba ${data.ogrenci_bilgi.ad_soyad?.split(' ')[0] || 'Şampiyon'}! 👋\n\nKarneni inceledim ve senin için çok detaylı bir analiz raporu hazırladım. Netlerin üzerinde konuşalım mı? Nereden başlamak istersin? 👇` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const responseText = await chatWithElifHoca(history, text, data);
      
      const botMessage: Message = { role: 'model', content: responseText };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'model', content: "Bağlantıda küçük bir kopukluk oldu. Lütfen tekrar sorar mısın?" };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-indigo-100 dark:border-slate-700 overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-4 bg-indigo-600 dark:bg-indigo-900 flex items-center gap-3 text-white shadow-md z-10">
        <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
          <BrainCircuit size={24} className="text-indigo-100" />
        </div>
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            Elif Hoca AI
            <span className="px-2 py-0.5 bg-indigo-500/50 rounded-full text-[10px] font-medium tracking-wider uppercase">Beta</span>
          </h3>
          <p className="text-xs text-indigo-200">Kişisel YKS Koçun & Analistin</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-slate-600">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex items-end gap-2 group ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-teal-500 text-white' 
                : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] p-4 shadow-sm relative ${
              msg.role === 'user'
                ? 'bg-teal-600 text-white rounded-2xl rounded-tr-none'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-none'
            }`}>
              {msg.role === 'user' ? (
                <p className="text-sm">{msg.content}</p>
              ) : (
                <>
                  <div className="pr-6">
                    <FormattedMessage content={msg.content} />
                  </div>
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                    title="Metni Kopyala"
                    aria-label="Metni kopyala"
                  >
                    {copiedIndex === idx ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-indigo-600 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 w-fit">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 ml-1 font-medium animate-pulse">Elif Hoca yazıyor...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Chips */}
      <div className="px-4 py-2 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex gap-2 pb-1">
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {q} <ChevronRight size={12} />
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Elif Hoca'ya bir soru sor..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;