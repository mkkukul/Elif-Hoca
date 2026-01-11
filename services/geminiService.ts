import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `
Rolün: Sen, YKS (TYT-AYT) sınav sonuçlarını analiz eden, OCR (Optik Karakter Tanıma) yeteneği gelişmiş uzman bir Veri Analistisin.

Hedefin: Girdi olarak verilen sınav sonuç belgesini (bu bir fotoğraf, ekran görüntüsü, PDF dokümanı veya kopyalanmış metin olabilir) okumak ve belirtilen JSON formatında hatasız bir veri seti üretmek.

Bağlam: Bu veriler "ElifHocaYKS" uygulamasında öğrenci performans takibi için kullanılacak. Veri bütünlüğü kritiktir.

Talimatlar:
1. GİRDİ ANALİZİ:
   - Girdi bir GÖRSEL veya PDF ise: Tüm metinleri ve sayısal değerleri dikkatlice oku. PDF çok sayfalı ise tüm sayfaları tara.
   - Girdi bir METİN ise: Doğrudan verileri ayrıştır.
   - Girdi PARÇALI (Çoklu Resim/Sayfa) ise: Tüm parçaları tek bir sınavın devamı olarak birleştir.

2. VERİ ÇIKARIMI VE DÜZELTME:
   - Ders İsimleri Standardizasyonu: Belgedeki ders adlarını şu standartlara dönüştür: "TYT Türkçe", "TYT Matematik", "TYT Fen Bilimleri", "TYT Sosyal Bilimler", "AYT Matematik", "AYT Fen Bilimleri", "AYT Edebiyat-Sosyal-1", "AYT Sosyal-2", "AYT Yabancı Dil".
   - (Örn: "Temel Mat" -> "TYT Matematik", "Fizik" -> "TYT Fen Bilimleri" veya "AYT Fen Bilimleri" bağlama göre karar ver).
   - Net Hesabı: Eğer belgede net sayısı yoksa: (Doğru - (Yanlış / 4)) formülünü uygula.
   - Boş Değerler: Okunamayan sayısal alanlara 0, metin alanlarına null yaz.

3. ÇIKTI FORMATI (JSON):
   - Asla sohbet etme.
   - Sadece istenen JSON şemasını doldur ve ver.
   - JSON dışında hiçbir açıklama metni ekleme.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    ogrenci_bilgi: {
      type: Type.OBJECT,
      properties: {
        ad_soyad: { type: Type.STRING, nullable: true },
        sube: { type: Type.STRING, nullable: true },
        numara: { type: Type.STRING, nullable: true },
      },
      required: ["ad_soyad"],
    },
    exams_history: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sinav_adi: { type: Type.STRING, nullable: true },
          tarih: { type: Type.STRING, nullable: true },
          toplam_puan: { type: Type.NUMBER },
          genel_yuzdelik: { type: Type.NUMBER },
          ders_netleri: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                ders: { type: Type.STRING },
                net: { type: Type.NUMBER },
              },
              required: ["ders", "net"],
            },
          },
        },
        required: ["sinav_adi", "tarih", "toplam_puan", "genel_yuzdelik", "ders_netleri"],
      },
    },
    konu_analizi: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          ders: { type: Type.STRING },
          konu: { type: Type.STRING },
          dogru: { type: Type.NUMBER },
          yanlis: { type: Type.NUMBER },
          bos: { type: Type.NUMBER },
          kayip_puan: { type: Type.NUMBER },
          durum: { type: Type.STRING },
        },
        required: ["ders", "konu", "dogru", "yanlis", "bos", "kayip_puan", "durum"],
      },
    },
  },
  required: ["ogrenci_bilgi", "exams_history", "konu_analizi"],
};

export const analyzeExamResult = async (file: File): Promise<AnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing. Please check your configuration.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Convert file to base64
    const base64Data = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type,
            },
          },
          {
            text: "Bu sınav sonuç belgesini (görsel veya doküman) analiz et. Konu konu analiz yaparak detaylı JSON çıktısı ver.",
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.1,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as AnalysisResult;
      return data;
    } else {
      throw new Error("No data returned from the analysis.");
    }
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

const fileToGenerativePart = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};