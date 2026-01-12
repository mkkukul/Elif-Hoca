import React, { useState } from 'react';
import { AnalysisResult, TopicAnalysis, TopicTrend } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend,
  LabelList,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  User, 
  Award, 
  UploadCloud, 
  Percent, 
  BookOpen, 
  Zap, 
  Target,
  ListChecks,
  Compass,
  ArrowRightCircle,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  History,
  Calendar
} from 'lucide-react';

interface DashboardProps {
  data: AnalysisResult;
  onReset: () => void;
}

const COLORS = ['#0d9488', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#2dd4bf', '#14b8a6'];
const TREND_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState<'perf' | 'trend'>('perf');
  const [selectedTrendIndex, setSelectedTrendIndex] = useState(0);

  const exam = data.exams_history?.[0];
  const totalNet = exam?.ders_netleri.reduce((acc, curr) => acc + curr.net, 0) || 0;
  
  if (!exam) return null;

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('kritik')) return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    if (s.includes('geliş')) return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
    if (s.includes('iyi')) return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    if (s.includes('mükemmel')) return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  const getProgressBarGradient = (percentage: number) => {
    if (percentage >= 90) return 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
    if (percentage >= 70) return 'bg-gradient-to-r from-teal-400 to-teal-600 shadow-[0_0_8px_rgba(20,184,166,0.3)]';
    if (percentage >= 40) return 'bg-gradient-to-r from-orange-400 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]';
    return 'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_8px_rgba(239,68,68,0.3)]';
  };

  const currentTrend = data.topic_trends[selectedTrendIndex] || data.topic_trends[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-20 animate-fade-in space-y-8">
      {/* Header Profile Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mt-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 transition-colors">
        <div className="flex-grow">
          <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500 mb-2">
            <User size={20} className="text-teal-500 dark:text-teal-400" />
            <span className="text-sm font-semibold uppercase tracking-widest">
              {data.ogrenci_bilgi.sube || 'ŞUBE BELİRTİLMEMİŞ'} • NO: {data.ogrenci_bilgi.numara || '-'}
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {data.ogrenci_bilgi.ad_soyad || "İsimsiz Öğrenci"}
          </h2>
          <div className="flex flex-wrap items-center mt-4 gap-3">
             <span className="px-4 py-1.5 rounded-2xl text-sm font-bold bg-teal-600 text-white shadow-md shadow-teal-100 dark:shadow-none">
               {exam.sinav_adi}
             </span>
             <span className="text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-xl text-sm">
               {exam.tarih}
             </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
          {[
            { label: 'Toplam Net', value: totalNet.toFixed(2), icon: <TrendingUp size={18} />, color: 'teal' },
            { label: 'Puan', value: exam.toplam_puan.toFixed(1), icon: <Award size={18} />, color: 'blue' },
            { label: 'Genel %', value: `%${exam.genel_yuzdelik.toFixed(2)}`, icon: <Percent size={18} />, color: 'purple' },
            { label: 'Tahmini Sıra', value: `#${data.executive_summary.yks_tahmini_siralama.toLocaleString()}`, icon: <Target size={18} />, color: 'orange' },
          ].map((stat, i) => (
            <div key={i} className={`bg-white dark:bg-slate-900 px-5 py-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-center min-w-[140px]`}>
              <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 mb-1">
                {stat.icon}
                <span className="font-bold text-[10px] uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className={`text-2xl font-black text-slate-800 dark:text-slate-100`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Analysis Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Tab Navigation */}
          <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800 rounded-2xl w-fit border border-transparent dark:border-slate-700">
            <button 
              onClick={() => setActiveTab('perf')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'perf' ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <Zap size={18} /> Performans Özeti
            </button>
            <button 
              onClick={() => setActiveTab('trend')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'trend' ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <History size={18} /> Gelişim Yolculuğu
            </button>
          </div>

          {activeTab === 'perf' ? (
            <div className="space-y-8 animate-fade-in">
              {/* Bar Chart Card */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3 mb-8 uppercase tracking-tight">
                  <Zap className="text-yellow-500" size={24} fill="currentColor" />
                  Ders Bazlı Net Analizi
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={exam.ders_netleri} margin={{ top: 30, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="ders" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} interval={0} height={40} />
                      <YAxis tick={{ fontSize: 12, fontWeight: 500, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc', opacity: 0.1 }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', backgroundColor: '#1e293b', color: '#f8fafc' }}
                      />
                      <Bar dataKey="net" name="Net" radius={[6, 6, 0, 0]} barSize={45}>
                        {exam.ders_netleri.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        <LabelList dataKey="net" position="top" style={{ fill: '#94a3b8', fontSize: '11px', fontWeight: '800' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Topic Table */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-3 uppercase tracking-tight">
                    <BookOpen className="text-teal-600 dark:text-teal-400" size={24} />
                    Konu Analiz Detayları
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 dark:text-slate-500 uppercase bg-slate-50/80 dark:bg-slate-800/80">
                      <tr>
                        <th className="px-8 py-4 font-bold">Ders / Konu</th>
                        <th className="px-4 py-4 font-bold text-center">D/Y/B</th>
                        <th className="px-4 py-4 font-bold text-center">Başarı %</th>
                        <th className="px-8 py-4 font-bold text-center">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {data.konu_analizi.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-8 py-5">
                            <p className="font-bold text-slate-800 dark:text-slate-200 mb-0.5">{item.ders}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{item.konu}</p>
                          </td>
                          <td className="px-4 py-5 text-center font-mono font-bold text-slate-600 dark:text-slate-300">
                            <span className="text-emerald-600 dark:text-emerald-400">{item.dogru}</span>
                            <span className="text-slate-300 dark:text-slate-600 mx-0.5">/</span>
                            <span className="text-rose-600 dark:text-rose-400">{item.yanlis}</span>
                            <span className="text-slate-300 dark:text-slate-600 mx-0.5">/</span>
                            <span className="text-slate-400 dark:text-slate-500">{item.bos}</span>
                          </td>
                          <td className="px-4 py-5 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-700 ${getProgressBarGradient(item.basari_yuzdesi)}`}
                                  style={{ width: `${item.basari_yuzdesi}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">%{item.basari_yuzdesi}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest ${getStatusColor(item.durum)}`}>
                              {item.durum}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              {/* Trend Chart Card */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3 uppercase tracking-tight">
                    <History className="text-blue-500" size={24} />
                    Konu Gelişim Trendi
                  </h3>
                  <select 
                    className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                    value={selectedTrendIndex}
                    onChange={(e) => setSelectedTrendIndex(parseInt(e.target.value))}
                  >
                    {data.topic_trends.map((trend, i) => (
                      <option key={i} value={i}>{trend.ders}: {trend.konu}</option>
                    ))}
                  </select>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentTrend.history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="tarih" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} domain={[0, 100]} unit="%" />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#f8fafc' }}
                      />
                      <Area type="monotone" dataKey="basari_yuzdesi" name="Başarı Oranı" stroke="#0d9488" strokeWidth={4} fillOpacity={1} fill="url(#colorTrend)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                  <TrendingUp className="text-blue-600 dark:text-blue-400" size={20} />
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold">
                    {currentTrend.konu} konusundaki son başarı oranınız %{currentTrend.history[currentTrend.history.length - 1].basari_yuzdesi}. 
                    Hedeften %{100 - currentTrend.history[currentTrend.history.length - 1].basari_yuzdesi} uzaktasınız.
                  </p>
                </div>
              </div>

              {/* All Trends Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.topic_trends.slice(0, 4).map((trend, i) => (
                   <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{trend.ders}</p>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100">{trend.konu}</h4>
                        </div>
                        <div className={`p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400`}>
                           <TrendingUp size={16} />
                        </div>
                      </div>
                      <div className="h-20 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trend.history}>
                            <Line type="monotone" dataKey="basari_yuzdesi" stroke={TREND_COLORS[i % TREND_COLORS.length]} strokeWidth={3} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                ))}
              </div>

              {/* Exam History Table */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-3 uppercase tracking-tight">
                    <Calendar className="text-purple-600 dark:text-purple-400" size={24} />
                    Sınav Geçmişi
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 dark:text-slate-500 uppercase bg-slate-50/80 dark:bg-slate-800/80">
                      <tr>
                        <th className="px-6 py-4 font-bold">Sınav Adı</th>
                        <th className="px-6 py-4 font-bold">Tarih</th>
                        <th className="px-6 py-4 font-bold text-center">Toplam Puan</th>
                        <th className="px-6 py-4 font-bold text-center">Genel %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {data.exams_history.map((hExam, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                           <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{hExam.sinav_adi || 'Sınav Adı Yok'}</td>
                           <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{hExam.tarih || '-'}</td>
                           <td className="px-6 py-4 text-center font-black text-slate-800 dark:text-slate-200">{hExam.toplam_puan.toFixed(2)}</td>
                           <td className="px-6 py-4 text-center">
                             <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg font-bold text-xs">
                               %{hExam.genel_yuzdelik.toFixed(2)}
                             </span>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Strategic Summary Overlay */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-indigo-950 dark:to-black rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-6 uppercase tracking-wider text-indigo-300">
              <Compass size={24} />
              Stratejik Özet
            </h3>
            <div 
              className="text-lg leading-relaxed text-slate-100 mb-8 font-medium prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: data.executive_summary.mevcut_durum }}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h4 className="flex items-center gap-2 text-emerald-400 font-bold mb-4 uppercase text-xs tracking-widest">
                  <ShieldCheck size={18} /> Güçlü Kaleler
                </h4>
                <ul className="space-y-3">
                  {data.executive_summary.guclu_yonler.map((y, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      {y}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h4 className="flex items-center gap-2 text-rose-400 font-bold mb-4 uppercase text-xs tracking-widest">
                  <ShieldAlert size={18} /> Riskli Bölgeler
                </h4>
                <ul className="space-y-3">
                  {data.executive_summary.zayif_yonler.map((y, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      {y}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Plan Column */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Simulation Section */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border-2 border-orange-100 dark:border-orange-900/30 relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 dark:text-orange-500">
              <Target size={120} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 mb-6 uppercase tracking-tight">
              <Target className="text-orange-500" size={24} />
              Gelişim Simülasyonu
            </h3>
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-5 mb-6">
              <p className="text-sm text-orange-800 dark:text-orange-200 font-semibold leading-relaxed">
                {data.simulasyon.senaryo}
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700 pb-4">
                <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase">Hedef Puan</span>
                <span className="text-xl font-black text-slate-800 dark:text-slate-100">{data.simulasyon.hedef_puan}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700 pb-4">
                <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase">Gerekli Artış</span>
                <span className="text-md font-black text-emerald-600 dark:text-emerald-400">+{data.simulasyon.gerekli_net_artisi}</span>
              </div>
              <div className="pt-2">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Adım Adım Gelişim</h4>
                <div className="space-y-3">
                  {data.simulasyon.gelisim_adimlari.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                      <ArrowRightCircle size={16} className="text-orange-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Study Plan Section */}
          <div className="bg-teal-900 dark:bg-teal-950 p-8 rounded-3xl shadow-xl text-white transition-colors">
            <h3 className="text-lg font-black flex items-center gap-3 mb-8 uppercase tracking-widest text-teal-300">
              <ListChecks size={24} />
              Eylem Planı
            </h3>
            <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-teal-800/50 dark:before:bg-teal-800/30">
              {data.calisma_plani.map((plan, i) => (
                <div key={i} className="relative pl-10 group">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-teal-500 border-4 border-teal-900 dark:border-teal-950 flex items-center justify-center font-black text-[10px] group-hover:scale-110 transition-transform">
                    {i+1}
                  </div>
                  <p className="text-sm font-bold text-teal-50 leading-relaxed">
                    {plan}
                  </p>
                </div>
              ))}
            </div>
            <button 
              onClick={onReset}
              className="mt-12 w-full py-4 bg-white text-teal-900 dark:bg-teal-200 dark:text-teal-900 font-black rounded-2xl hover:bg-teal-50 dark:hover:bg-teal-100 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20"
            >
              <UploadCloud size={20} />
              YENİ ANALİZ BAŞLAT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;