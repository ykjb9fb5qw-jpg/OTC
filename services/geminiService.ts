
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

export const fetchLiveOTCRates = async () => {
  const prompt = `
    請幫我檢查以下兩個網址嘅最新價格：
    1. https://otcrate.com/slab (呢個係 HKD 換 USDT 嘅價，即係我哋要「買入」嘅參考)
    2. https://otcrate.com/grp.html (呢個係 USDT 換 HKD 嘅價，即係我哋要「賣出」嘅參考)
    
    我只需要 "Tether 泰达币 (BSC/TRX)" 呢一欄嘅價格。
    請以 JSON 格式回覆：
    {
      "slab_rate": 數字,
      "grp_rate": 數字,
      "summary": "一句廣東話總結市場情況"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" // Note: Search grounding might not always support strict JSON mode in all versions, we'll parse text if needed.
      },
    });

    const text = response.text || "";
    // Attempt to extract JSON from the text response
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        ...data,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    }
    
    // Fallback if parsing fails (simulated for dev)
    return { slab_rate: 7.82, grp_rate: 7.79, summary: "無法即時抓取，使用模擬數據", sources: [] };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { slab_rate: 7.82, grp_rate: 7.79, summary: "抓取失敗", sources: [] };
  }
};
