import React from 'react';
import { AnalysisResult, TopicAnalysis } from '../types';
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
  LabelList
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
  ShieldAlert
} from 'lucide-react';

interface DashboardProps {
  data: AnalysisResult;
  onReset: () => void;
}

const COLORS = ['#0d9488', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#2dd4bf', '#14b8a6'];

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const exam = data.exams_history?.[0];
  const totalNet = exam?.ders_netleri.reduce((acc, curr) => acc + curr.net, 0) || 0;
  
  if (!exam) return null;

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('kritik')) return 'bg-red-100 text-red-700 border-red-200';
    if (s.includes('geliş')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (s.includes('iyi')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s.includes('mükemmel')) return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-20 animate-fade-in space-y-8">
      {/* Header Profile Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mt-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="flex-grow">
          <div className="flex items-center space-x-3 text-slate-400 mb-2">
            <User size={20} className="text-teal-500" />
            <span className="text-sm font-semibold uppercase tracking-widest">
              {data.ogrenci_bilgi.sube || 'ŞUBE BELİRTİLMEMİŞ'} • NO: {data.ogrenci_bilgi.numara || '-'}
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {data.ogrenci_bilgi.ad_soyad || "İsimsiz Öğrenci"}
          </h2>
          <div className="flex flex-wrap items-center mt-4 gap-3">
             <span className="px-4 py-1.5 rounded-2xl text-sm font-bold bg-teal-600 text-white shadow-md shadow-teal-100">
               {exam.sinav_adi}
             </span>
             <span className="text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-xl text-sm">
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
            <div key={i} className={`bg-${stat.color}-50 px-5 py-5 rounded-2xl border border-${stat.color}-100 flex flex-col justify-center min-w-[140px]`}>
              <div className={`flex items-center space-x-2 text-${stat.color}-600 mb-1`}>
                {stat.icon}
                <span className="font-bold text-xs uppercase">{stat.label}</span>
              </div>
              <p className={`text-2xl font-black text-${stat.color}-800`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Analysis Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Charts Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-8 uppercase tracking-tight">
              <Zap className="text-yellow-500" size={24} fill="currentColor" />
              Ders Bazlı Net Analizi
            </h3>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exam.ders_netleri} margin={{ top: 30, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="ders" 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#475569' }} 
                    axisLine={false} 
                    tickLine={false} 
                    interval={0}
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fontWeight: 500, fill: '#94a3b8' }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar dataKey="net" name="Net Sayısı" radius={[6, 6, 0, 0]} barSize={45}>
                    {exam.ders_netleri.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <LabelList dataKey="net" position="top" style={{ fill: '#0f172a', fontSize: '12px', fontWeight: '800' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-6 uppercase tracking-wider text-indigo-300">
              <Compass size={24} />
              Stratejik Özet
            </h3>
            <div 
              className="text-lg leading-relaxed text-slate-100 mb-8 font-medium"
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

          {/* Detailed Topic Analysis */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                <BookOpen className="text-teal-600" size={24} />
                Konu Analiz Detayları
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50/80">
                  <tr>
                    <th className="px-8 py-4 font-bold">Ders / Konu</th>
                    <th className="px-4 py-4 font-bold text-center">D/Y/B</th>
                    <th className="px-4 py-4 font-bold text-center">Başarı %</th>
                    <th className="px-8 py-4 font-bold text-center">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.konu_analizi.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-800 mb-0.5">{item.ders}</p>
                        <p className="text-slate-500 text-xs font-medium">{item.konu}</p>
                      </td>
                      <td className="px-4 py-5 text-center font-mono font-bold text-slate-600">
                        <span className="text-emerald-600">{item.dogru}</span>
                        <span className="text-slate-300 mx-1">/</span>
                        <span className="text-rose-600">{item.yanlis}</span>
                        <span className="text-slate-300 mx-1">/</span>
                        <span className="text-slate-400">{item.bos}</span>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${item.basari_yuzdesi > 70 ? 'bg-emerald-500' : item.basari_yuzdesi > 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                              style={{ width: `${item.basari_yuzdesi}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-black text-slate-400">%{item.basari_yuzdesi}</span>
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

        {/* Sidebar / Plan Column */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Simulation Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Target size={120} />
            </div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
              <Target className="text-orange-500" size={24} />
              Gelişim Simülasyonu
            </h3>
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6">
              <p className="text-sm text-orange-800 font-semibold leading-relaxed">
                {data.simulasyon.senaryo}
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <span className="text-slate-500 font-bold text-xs uppercase">Hedef Puan</span>
                <span className="text-xl font-black text-slate-800">{data.simulasyon.hedef_puan}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <span className="text-slate-500 font-bold text-xs uppercase">Gerekli Artış</span>
                <span className="text-md font-black text-emerald-600">+{data.simulasyon.gerekli_net_artisi}</span>
              </div>
              <div className="pt-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Adım Adım Gelişim</h4>
                <div className="space-y-3">
                  {data.simulasyon.gelisim_adimlari.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                      <ArrowRightCircle size={16} className="text-orange-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Study Plan Section */}
          <div className="bg-teal-900 p-8 rounded-3xl shadow-xl text-white">
            <h3 className="text-lg font-black flex items-center gap-3 mb-8 uppercase tracking-widest text-teal-300">
              <ListChecks size={24} />
              Eylem Planı
            </h3>
            <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-teal-800/50">
              {data.calisma_plani.map((plan, i) => (
                <div key={i} className="relative pl-10 group">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-teal-500 border-4 border-teal-900 flex items-center justify-center font-black text-[10px] group-hover:scale-110 transition-transform">
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
              className="mt-12 w-full py-4 bg-white text-teal-900 font-black rounded-2xl hover:bg-teal-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20"
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