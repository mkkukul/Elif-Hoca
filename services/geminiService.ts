import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "../types";

// API Key kontrolü
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API Key bulunamadı! .env dosyasını kontrol edin.");
}

// SDK Kurulumu
const genAI = new GoogleGenerativeAI(apiKey);

// Model Tanımı - KESİN ÇALIŞAN VERSİYON
const MODEL_NAME = "gemini-1.5-flash-001"; 

const RESPONSE_SCHEMA = {
  description: "Sınav Analiz Sonucu",
  type: "object",
  properties: {
    ogrenci_bilgi: { type: "object", properties: { ad_soyad: { type: "string" }, sube: { type: "string" }, numara: { type: "string" } } },
    exams_history: { type: "array", items: { type: "object", properties: { sinav_adi: { type: "string" }, tarih: { type: "string" }, toplam_puan: { type: "number" }, genel_yuzdelik: { type: "number" }, ders_netleri: { type: "array", items: { type: "object", properties: { ders: { type: "string" }, net: { type: "number" } } } } } } },
    konu_analizi: { type: "array", items: { type: "object", properties: { ders: { type: "string" }, konu: { type: "string" }, dogru: { type: "number" }, yanlis: { type: "number" }, bos: { type: "number" }, basari_yuzdesi: { type: "number" }, kayip_puan: { type: "number" }, durum: { type: "string" } } } },
    executive_summary: { type: "object", properties: { mevcut_durum: { type: "string" }, guclu_yonler: { type: "array", items: { type: "string" } }, zayif_yonler: { type: "array", items: { type: "string" } }, yks_tahmini_siralama: { type: "number" } } },
    calisma_plani: { type: "array", items: { type: "string" } },
    simulasyon: { type: "object", properties: { senaryo: { type: "string" }, hedef_yuzdelik: { type: "number" }, hedef_puan: { type: "number" }, puan_araligi: { type: "string" }, gerekli_net_artisi: { type: "string" }, gelisim_adimlari: { type: "array", items: { type: "string" } } } },
    topic_trends: { type: "array", items: { type: "object", properties: { ders: { type: "string" }, konu: { type: "string" }, history: { type: "array", items: { type: "object", properties: { tarih: { type: "string" }, basari_yuzdesi: { type: "number" } } } } } } }
  }
};

export const analyzeExamResult = async (file: File): Promise<AnalysisResult> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA as any, // Yeni SDK şemayı doğrudan destekler
        temperature: 0.1,
      }
    });

    const base64Data = await fileToGenerativePart(file);
    const prompt = "Bu sınav sonuç belgesindeki tüm verileri analiz et. Varsa önceki sınav sonuçlarını da çıkararak gelişim trendlerini belirle. Çıktı sadece JSON olmalı.";

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: file.type } }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Temizleme işlemi
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson) as AnalysisResult;

  } catch (error: any) {
    console.error("Analysis failed:", error);
    throw new Error("Analiz Hatası: " + (error.message || "Bilinmeyen hata"));
  }
};

export const chatWithElifHoca = async (
  history: { role: 'user' | 'model'; content: string }[],
  message: string,
  analysisData: AnalysisResult
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: `Sen Elif Hoca AI adında, YKS öğrencilerine rehberlik eden bir eğitim koçusun. Şu anki öğrenci verileri: ${JSON.stringify(analysisData)}`
    });

    // History formatını yeni SDK'ya uyarla
    const chatHistory = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Chat error:", error);
    return "Şu an bağlantıda bir sorun var, ancak seni duyuyorum. Birazdan tekrar dener misin?";
  }
};

const fileToGenerativePart = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};