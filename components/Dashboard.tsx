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
  Cell 
} from 'recharts';
import { CheckCircle2, XCircle, TrendingUp, User, Award, UploadCloud, Percent, AlertCircle, BookOpen } from 'lucide-react';

interface DashboardProps {
  data: AnalysisResult;
  onReset: () => void;
}

const COLORS = ['#0d9488', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#2dd4bf', '#14b8a6'];

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  // Use the most recent exam (first in list usually)
  const exam = data.exams_history && data.exams_history.length > 0 ? data.exams_history[0] : null;
  const totalNet = exam ? exam.ders_netleri.reduce((acc, curr) => acc + curr.net, 0) : 0;
  
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
    <div className="w-full max-w-6xl mx-auto px-4 pb-12 animate-fade-in">
      {/* Summary Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 mt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-grow">
            <div className="flex items-center space-x-2 text-slate-500 mb-2">
              <User size={18} />
              <span className="text-sm font-medium uppercase tracking-wider">
                {data.ogrenci_bilgi.sube || 'Sınıf Yok'} • {data.ogrenci_bilgi.numara || 'No Yok'}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-slate-800">
              {data.ogrenci_bilgi.ad_soyad || "Öğrenci Adı Bulunamadı"}
            </h2>
            <div className="flex flex-wrap items-center mt-3 gap-2">
               <span className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                 {exam.sinav_adi || 'Sınav Adı Yok'}
               </span>
               {exam.tarih && (
                 <span className="text-slate-400 text-sm flex items-center">
                   • {exam.tarih}
                 </span>
               )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
            <div className="bg-teal-50 px-5 py-4 rounded-xl border border-teal-100 min-w-[130px]">
              <div className="flex items-center space-x-2 text-teal-600 mb-1">
                <TrendingUp size={18} />
                <span className="font-semibold text-sm">Toplam Net</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-teal-800">{totalNet.toFixed(2)}</p>
            </div>
            
            <div className="bg-blue-50 px-5 py-4 rounded-xl border border-blue-100 min-w-[130px]">
              <div className="flex items-center space-x-2 text-blue-600 mb-1">
                <Award size={18} />
                <span className="font-semibold text-sm">Puan</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-blue-800">{exam.toplam_puan.toFixed(2)}</p>
            </div>

            <div className="col-span-2 md:col-span-1 bg-purple-50 px-5 py-4 rounded-xl border border-purple-100 min-w-[130px]">
              <div className="flex items-center space-x-2 text-purple-600 mb-1">
                <Percent size={18} />
                <span className="font-semibold text-sm">Genel %</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-purple-800">%{exam.genel_yuzdelik.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Net Performance Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="text-teal-500" size={20} />
              Ders Bazlı Net Dağılımı
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exam.ders_netleri} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="ders" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="net" name="Net" radius={[4, 4, 0, 0]}>
                  {exam.ders_netleri.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Analysis Table */}
        {data.konu_analizi.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <BookOpen className="text-blue-500" size={20} />
                 Detaylı Konu Analizi
               </h3>
               <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-white rounded border border-slate-200">
                 {data.konu_analizi.length} Konu İncelendi
               </span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                   <tr>
                     <th className="px-6 py-3 font-semibold">Ders</th>
                     <th className="px-4 py-3 font-semibold">Konu</th>
                     <th className="px-3 py-3 font-semibold text-center text-green-600">D</th>
                     <th className="px-3 py-3 font-semibold text-center text-red-600">Y</th>
                     <th className="px-3 py-3 font-semibold text-center text-slate-400">B</th>
                     <th className="px-4 py-3 font-semibold text-center text-orange-600">Kayıp</th>
                     <th className="px-6 py-3 font-semibold text-center">Durum</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {data.konu_analizi.map((item: TopicAnalysis, idx: number) => (
                     <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                       <td className="px-6 py-3 font-medium text-slate-700 group-hover:text-teal-700">{item.ders}</td>
                       <td className="px-4 py-3 text-slate-600">{item.konu}</td>
                       <td className="px-3 py-3 text-center text-slate-600 font-medium">{item.dogru}</td>
                       <td className="px-3 py-3 text-center text-slate-600">{item.yanlis}</td>
                       <td className="px-3 py-3 text-center text-slate-400">{item.bos}</td>
                       <td className="px-4 py-3 text-center text-slate-500 font-medium">-{item.kayip_puan.toFixed(2)}</td>
                       <td className="px-6 py-3 text-center">
                         <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(item.durum)}`}>
                           {item.durum}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        <button 
          onClick={onReset}
          className="w-full md:w-auto md:mx-auto py-3 px-8 bg-white border-2 border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all flex items-center justify-center gap-2"
        >
          <UploadCloud size={18} />
          Yeni Belge Yükle
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
