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
  kayip_puan: number;
  durum: string;
}

export interface AnalysisResult {
  ogrenci_bilgi: StudentInfo;
  exams_history: ExamRecord[];
  konu_analizi: TopicAnalysis[];
}

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'success' | 'error';
  data: AnalysisResult | null;
  error: string | null;
}
