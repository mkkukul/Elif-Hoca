import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// API Key initialization according to guidelines.
// Assume process.env.API_KEY is pre-configured and available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-3-flash-preview as recommended for text/vision tasks.
const MODEL_NAME = "gemini-3-flash-preview"; 

const SYSTEM_INSTRUCTION = `
Rolün: Sen hata toleransı yüksek, uzman bir OCR ve Veri Dönüştürme Motorusun. 
GÖREVİN: Verilen sınav sonuç belgesini analiz et ve JSON çıktısı üret.
KRİTİK KURALLAR:
1. Sadece SAF JSON döndür. Markdown blokları (\`\`\`json) KULLANMA.
2. Sayısal olmayan değerler için null, okunamayan sayılar için 0 kullan.
3. Tüm sayfaları tek bir sınav sonucu olarak birleştir.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ogrenci_bilgi: { 
      type: Type.OBJECT, 
      properties: { 
        ad_soyad: { type: Type.STRING }, 
        sube: { type: Type.STRING }, 
        numara: { type: Type.STRING } 
      } 
    },
    exams_history: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT, 
        properties: { 
          sinav_adi: { type: Type.STRING }, 
          tarih: { type: Type.STRING }, 
          toplam_puan: { type: Type.NUMBER }, 
          genel_yuzdelik: { type: Type.NUMBER }, 
          ders_netleri: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                ders: { type: Type.STRING }, 
                net: { type: Type.NUMBER } 
              } 
            } 
          } 
        } 
      } 
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
          durum: { type: Type.STRING } 
        } 
      } 
    },
    executive_summary: { 
      type: Type.OBJECT, 
      properties: { 
        mevcut_durum: { type: Type.STRING }, 
        guclu_yonler: { type: Type.ARRAY, items: { type: Type.STRING } }, 
        zayif_yonler: { type: Type.ARRAY, items: { type: Type.STRING } }, 
        yks_tahmini_siralama: { type: Type.NUMBER } 
      } 
    },
    calisma_plani: { type: Type.ARRAY, items: { type: Type.STRING } },
    simulasyon: { 
      type: Type.OBJECT, 
      properties: { 
        senaryo: { type: Type.STRING }, 
        hedef_yuzdelik: { type: Type.NUMBER }, 
        hedef_puan: { type: Type.NUMBER }, 
        puan_araligi: { type: Type.STRING }, 
        gerekli_net_artisi: { type: Type.STRING }, 
        gelisim_adimlari: { type: Type.ARRAY, items: { type: Type.STRING } } 
      } 
    },
    topic_trends: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT, 
        properties: { 
          ders: { type: Type.STRING }, 
          konu: { type: Type.STRING }, 
          history: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                tarih: { type: Type.STRING }, 
                basari_yuzdesi: { type: Type.NUMBER } 
              } 
            } 
          } 
        } 
      } 
    }
  }
};

export const analyzeExamResult = async (file: File): Promise<AnalysisResult> => {
  try {
    const base64Data = await fileToGenerativePart(file);
    const prompt = "Bu sınav sonuç belgesindeki tüm verileri analiz et. Varsa önceki sınav sonuçlarını da çıkararak gelişim trendlerini belirle. Çıktı sadece JSON olmalı.";

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { text: prompt },
          { 
            inlineData: { 
              mimeType: file.type, 
              data: base64Data 
            } 
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.1,
      }
    });

    const text = response.text;
    
    if (!text) {
      throw new Error("API boş yanıt döndürdü.");
    }
    
    // Temizleme işlemi (Markdown bloklarını kaldırır)
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson) as AnalysisResult;

  } catch (error: any) {
    console.error("Analysis failed:", error);
    throw new Error("Analiz sırasında bir hata oluştu: " + error.message);
  }
};

export const chatWithElifHoca = async (
  history: { role: 'user' | 'model'; content: string }[],
  message: string,
  analysisData: AnalysisResult
): Promise<string> => {
  try {
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({ 
      model: MODEL_NAME,
      history: formattedHistory,
      config: {
        systemInstruction: `Sen Elif Hoca AI adında, YKS öğrencilerine rehberlik eden bir eğitim koçusun. Şu anki öğrenci verileri: ${JSON.stringify(analysisData)}`
      }
    });

    const result = await chat.sendMessage({ message: message });
    return result.text || "Cevap alınamadı.";
  } catch (error) {
    console.error("Chat error:", error);
    throw new Error("Elif Hoca şu an cevap veremiyor.");
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