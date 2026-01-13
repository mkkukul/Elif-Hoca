export interface StudentInfo {
  ad_soyad: string | null;
  sube: string | null;
  numara: string | null;
}

export interface LessonNet {
  ders: string;
  net: number;
}

export interface ExamRecord {
  sinav_adi: string | null;
  tarih: string | null;
  toplam_puan: number;
  genel_yuzdelik: number;
  ders_netleri: LessonNet[];
}

export interface TopicAnalysis {
  ders: string;
  konu: string;
  dogru: number;
  yanlis: number;
  bos: number;
  basari_yuzdesi: number;
  kayip_puan: number;
  durum: string;
}

export interface ExecutiveSummary {
  mevcut_durum: string;
  guclu_yonler: string[];
  zayif_yonler: string[];
  yks_tahmini_siralama: number;
}

export interface Simulasyon {
  senaryo: string;
  hedef_yuzdelik: number;
  hedef_puan: number;
  puan_araligi: string;
  gerekli_net_artisi: string;
  gelisim_adimlari: string[];
}

export interface TopicTrend {
  ders: string;
  konu: string;
  history: {
    tarih: string;
    basari_yuzdesi: number;
  }[];
}

export interface AnalysisResult {
  ogrenci_bilgi: StudentInfo;
  exams_history: ExamRecord[];
  konu_analizi: TopicAnalysis[];
  executive_summary: ExecutiveSummary;
  calisma_plani: string[];
  simulasyon: Simulasyon;
  topic_trends: TopicTrend[];
}

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'success' | 'error';
  data: AnalysisResult | null;
  error: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}