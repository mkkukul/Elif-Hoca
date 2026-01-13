import React, { useState, useRef, useEffect } from 'react';
import { Send, GraduationCap, Loader2, Sparkles, ChevronRight, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResult, ChatMessage } from '../types';
import { chatWithElifHoca } from '../services/geminiService';

interface ChatInterfaceProps {
  analysisData: AnalysisResult;
}

const QUICK_ACTIONS = [
  "📅 Bana özel haftalık çalışma planı yap",
  "📈 YKS 2026 sıralama tahminim nedir?",
  "🧪 Fen netlerimi nasıl artırabilirim?",
  "⚠️ En kritik konu eksiklerim neler?",
  "🧠 Matematik boşlarım için strateji ver"
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ analysisData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Merhaba ${analysisData.ogrenci_bilgi?.ad_soyad?.split(' ')[0] || 'Öğrencim'}! 👋\n\nKarneni detaylıca inceledim. Eksiklerini ve güçlü yönlerini belirledim. Senin için harika bir strateji planım var. Nereden başlayalım? 👇`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Model'e geçmiş mesajları gönder (son mesaj hariç, çünkü servise yeni mesaj ayrıca gidiyor)
      const responseText = await chatWithElifHoca(
        messages, // Geçmişi olduğu gibi gönderiyoruz
        text,
        analysisData
      );

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "😔 Üzgünüm, bir bağlantı hatası oluştu. Lütfen tekrar dene.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center gap-3 shadow-md z-10">
        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
          <GraduationCap className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            Elif Hoca AI
            <span className="bg-green-400 w-2.5 h-2.5 rounded-full animate-pulse border-2 border-indigo-600"></span>
          </h3>
          <p className="text-indigo-100 text-xs">Kişisel Eğitim Koçun • <span className="opacity-75">Çevrimiçi</span></p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-300">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}
            >
              {msg.role === 'model' ? (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed">
                   <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              )}
              <span className={`text-[10px] block mt-1 opacity-70 ${msg.role === 'user' ? 'text-indigo-100 text-right' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 border border-slate-100 shadow-sm flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Elif Hoca yazıyor</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-50 border-t border-slate-200 p-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex gap-2 px-2">
          {QUICK_ACTIONS.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(action)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 bg-white border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 px-3 py-1.5 rounded-full text-xs font-medium text-indigo-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={12} className="text-indigo-500" />
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 border-t border-slate-200">
        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 border border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Bir şeyler sor..."
            disabled={isLoading}
            className="flex-grow bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
          />
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;