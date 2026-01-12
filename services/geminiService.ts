import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `
Rolün: Sen hata toleransı yüksek, uzman bir OCR ve Veri Dönüştürme Motorusun. Özellikle çok sayfalı PDF dokümanlarını ve karmaşık sınav sonuç tablolarını analiz etmede ustasın.

GÖREVİN:
Verilen sınav sonuç belgesini (Görsel veya PDF) analiz et ve belirtilen JSON şemasına birebir uyan, geçerli bir JSON çıktısı üret.

KRİTİK KURALLAR (HATA ÖNLEME):
1. ÇOK SAYFALI DOKÜMANLAR: Eğer girdi bir PDF ise ve birden fazla sayfa içeriyorsa, TÜM sayfaları tara. Farklı sayfalara dağılmış olan dersleri, netleri ve konu analizlerini TEK BİR sınav sonucu olarak birleştir.
2. GELİŞİM ANALİZİ: Belgede "Önceki Sınavlar" veya "Gelişim Tablosu" varsa bunları 'topic_trends' ve 'exams_history' alanlarına kronolojik olarak işle. Eğer sadece mevcut sınav varsa, bu sınavdaki konu başarılarını baz alarak gerçekçi bir başlangıç noktası oluştur.
3. ASLA markdown kod blokları kullanma. Çıktın doğrudan "{" ile başlamalı ve "}" ile bitmelidir.
4. ASLA yorum satırı veya giriş/kapanış cümlesi ekleme. Sadece SAF JSON ver.
5. Eğer belgedeki bir sayı okunmuyorsa: Sayısal alanlar için 0, metin alanları için null değeri ata.
6. Ders İsimlerini Standardize Et: 
   - "TYT Türkçe", "TYT Matematik", "TYT Fen Bilimleri", "TYT Sosyal Bilimler"
   - "AYT Matematik", "AYT Fen Bilimleri", "AYT Edebiyat-Sosyal-1", "AYT Sosyal-2", "AYT Yabancı Dil"
7. JSON yapısını asla bozma.
8. Executive Summary 'mevcut_durum' alanı kısa HTML etiketleri (<b>, <ul>, <li> vb.) içerebilir.
`;

const CHAT_SYSTEM_INSTRUCTION = `
Sen Elif Hoca AI adında, YKS öğrencilerine rehberlik eden profesyonel, motive edici ve analitik bir eğitim koçusun. 
Asla sıkıcı veya sadece teknik konuşma. Emojiler kullan (📊, 🎯, 🟢, 🔴, 🚀, 💪 vb.). 
Öğrenciye ismiyle hitap et (Veri setinde isim yoksa "Şampiyon" diye hitap et).

Yanıtlarında (gerekli gördüğünde) şu formatı kullan: 
'Öğrenci Profili', 'Ders Bazlı Detaylı Analiz', 'Riskler', 'Koç Tavsiyesi' ve 'Haftalık Plan'. 

Olumsuz durumları bile 'Geliştirilebilir Alan' olarak yapıcı bir dille ifade et. 
Markdown formatında kalın başlıklar (**Başlık**) ve listeler kullan.
Cevapların çok uzun paragraflar olmasın, okunabilir ve maddeli olsun.
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
              },
              required: ["tarih", "basari_yuzdesi"]
            }
          }
        },
        required: ["ders", "konu", "history"]
      }
    }
  },
  required: ["ogrenci_bilgi", "exams_history", "konu_analizi", "executive_summary", "calisma_plani", "simulasyon", "topic_trends"],
};

// Hardcoded API Key as requested
const apiKey = "AIzaSyB1yvpbR7v437S0fV2hK1XhlmdqVr55BVI";

export const analyzeExamResult = async (file: File): Promise<AnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type,
            },
          },
          {
            text: "Bu sınav sonuç belgesindeki tüm verileri analiz et. Varsa önceki sınav sonuçlarını da çıkararak gelişim trendlerini belirle.",
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
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Geçerli bir JSON verisi oluşturulamadı.");
      }
      const cleanedJson = text.substring(jsonStart, jsonEnd + 1);
      return JSON.parse(cleanedJson) as AnalysisResult;
    } else {
      throw new Error("Analiz sonucu boş döndü.");
    }
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const chatWithElifHoca = async (
  history: { role: 'user' | 'model'; content: string }[],
  message: string,
  analysisData: AnalysisResult
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Veriyi string'e çevirip context olarak ekleyelim
    const contextPrompt = `İşte öğrencinin mevcut analiz verileri (Bunu referans alarak cevapla): ${JSON.stringify(analysisData)}`;
    
    const contents = [
      { role: 'user', parts: [{ text: contextPrompt }] }, 
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: contents,
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        temperature: 0.7, 
      },
    });

    return response.text || "Üzgünüm, şu an cevap veremiyorum.";
  } catch (error) {
    console.error("Chat error:", error);
    throw new Error("Elif Hoca şu an derste (API hatası). Lütfen tekrar dene.");
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