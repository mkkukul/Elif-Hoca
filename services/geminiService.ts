import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `
Rolün: Sen hata toleransı yüksek, uzman bir OCR ve Veri Dönüştürme Motorusun.

GÖREVİN:
Verilen sınav sonuç belgesi görüntüsünü (veya metnini) analiz et ve belirtilen JSON şemasına birebir uyan, geçerli bir JSON çıktısı üret.

KRİTİK KURALLAR (HATA ÖNLEME):
1. ASLA markdown kod blokları kullanma. Çıktın doğrudan "{" ile başlamalı ve "}" ile bitmelidir.
2. ASLA yorum satırı veya giriş/kapanış cümlesi ekleme. Sadece SAF JSON ver.
3. Eğer belgedeki bir sayı okunmuyorsa: Sayısal alanlar için 0, metin alanları için null değeri ata.
4. Ders İsimlerini Standardize Et: 
   - "TYT Türkçe", "TYT Matematik", "TYT Fen Bilimleri", "TYT Sosyal Bilimler"
   - "AYT Matematik", "AYT Fen Bilimleri", "AYT Edebiyat-Sosyal-1", "AYT Sosyal-2", "AYT Yabancı Dil"
5. JSON yapısını asla bozma.
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
          basari_yuzdesi: { type: Type.NUMBER },
          kayip_puan: { type: Type.NUMBER },
          durum: { type: Type.STRING },
        },
        required: ["ders", "konu", "dogru", "yanlis", "bos", "basari_yuzdesi", "kayip_puan", "durum"],
      },
    },
    executive_summary: {
      type: Type.OBJECT,
      properties: {
        mevcut_durum: { type: Type.STRING, description: "HTML içerikli özet" },
        guclu_yonler: { type: Type.ARRAY, items: { type: Type.STRING } },
        zayif_yonler: { type: Type.ARRAY, items: { type: Type.STRING } },
        yks_tahmini_siralama: { type: Type.NUMBER },
      },
      required: ["mevcut_durum", "guclu_yonler", "zayif_yonler", "yks_tahmini_siralama"],
    },
    calisma_plani: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    simulasyon: {
      type: Type.OBJECT,
      properties: {
        senaryo: { type: Type.STRING },
        hedef_yuzdelik: { type: Type.NUMBER },
        hedef_puan: { type: Type.NUMBER },
        puan_araligi: { type: Type.STRING },
        gerekli_net_artisi: { type: Type.STRING },
        gelisim_adimlari: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["senaryo", "hedef_yuzdelik", "hedef_puan", "puan_araligi", "gerekli_net_artisi", "gelisim_adimlari"],
    },
  },
  required: ["ogrenci_bilgi", "exams_history", "konu_analizi", "executive_summary", "calisma_plani", "simulasyon"],
};

export const analyzeExamResult = async (file: File): Promise<AnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Anahtarı bulunamadı.");
    }

    const ai = new GoogleGenAI({ apiKey });
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
            text: "Bu sınav sonuç belgesini analiz et. Öğrenci bilgilerini, netleri, konu eksiklerini çıkar. Mevcut verilere dayanarak gerçekçi bir YKS simülasyonu ve haftalık çalışma planı önerisi oluştur.",
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

    const text = response.text;
    if (text) {
      const cleanedJson = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      return JSON.parse(cleanedJson) as AnalysisResult;
    } else {
      throw new Error("Analiz sonucu boş döndü.");
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
