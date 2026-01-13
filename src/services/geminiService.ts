import { GoogleGenAI, Type, Schema, Content } from "@google/genai";
import { AnalysisResult, ChatMessage } from "../types";

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

const ELIF_HOCA_SYSTEM_INSTRUCTION = `
Sen Elif Hoca adında, YKS öğrencilerine rehberlik eden profesyonel, yapıcı ve motive edici bir eğitim koçusun. 

Kişiliğin:
- Asla sadece teknik veya robotik konuşma.
- Bol bol emoji kullan (📊, 🎯, 🟢, 🔴, 🚀, 💪).
- Öğrenciye ismiyle hitap et.
- Cevaplarını Markdown formatında düzenle (Liste, kalın yazı vb. kullan).
- Samimi, abla/koç tavrında ol ama ciddiyeti koru.

Görevin:
- Sana öğrencinin sınav sonuç verileri JSON formatında verilecek.
- Öğrencinin netlerini, boşlarını ve konu eksiklerini analiz ederek stratejik tavsiyeler ver.
- Olumsuz netleri veya düşük başarıyı "Gelişim Alanı" olarak adlandır, asla "Kötü" deme.
- Amacın net artırmak. Somut, uygulanabilir tavsiyeler ver (örn: "Paragraf çözmeye ağırlık ver" yerine "Her sabah 20 paragrafı süre tutarak çöz").

Bağlam:
Aşağıda öğrencinin son sınav analizi bulunmaktadır. Tüm cevaplarını bu veriye dayandır:
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

/**
 * Lazy Initialization Helper
 * Bu fonksiyon, API anahtarının ve istemcinin sadece ihtiyaç duyulduğunda oluşturulmasını sağlar.
 * Bu sayede "build time" sırasında env değişkeni yoksa uygulama çökmez.
 */
const getGenAI = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Anahtarı bulunamadı. Lütfen Vercel ortam değişkenlerinde API_KEY tanımlı olduğundan emin olun.");
  }
  return new GoogleGenAI({ apiKey });
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

export const analyzeExamResult = async (file: File): Promise<AnalysisResult> => {
  try {
    // Client'ı lazy load yapıyoruz
    const ai = getGenAI();
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
    
    if (!text) {
      throw new Error("Analiz sonucu boş döndü (API yanıtı boş).");
    }

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("Ham Yanıt:", text);
      throw new Error("Geçerli bir JSON verisi bulunamadı. Model yanıtı formatı hatalı.");
    }

    const jsonStr = text.substring(jsonStart, jsonEnd + 1);

    try {
      const parsedData = JSON.parse(jsonStr) as AnalysisResult;
      return parsedData;
    } catch (parseError) {
      console.error("JSON Parse Hatası:", parseError);
      throw new Error("Veri ayrıştırılamadı. Model bozuk bir JSON üretti.");
    }

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

/**
 * Elif Hoca Chatbot Fonksiyonu
 */
export const chatWithElifHoca = async (
  history: ChatMessage[],
  newMessage: string,
  analysisData: AnalysisResult
): Promise<string> => {
  try {
    // Client'ı lazy load yapıyoruz
    const ai = getGenAI();
    
    const contextData = JSON.stringify(analysisData, null, 2);
    const fullSystemInstruction = `${ELIF_HOCA_SYSTEM_INSTRUCTION}\n\n${contextData}`;

    const formattedHistory: Content[] = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: fullSystemInstruction,
      },
      history: formattedHistory
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "Üzgünüm, şu an cevap veremiyorum. Lütfen tekrar dene.";

  } catch (error) {
    console.error("Chat error:", error);
    throw new Error("Elif Hoca şu an müsait değil. Bağlantını kontrol et.");
  }
};