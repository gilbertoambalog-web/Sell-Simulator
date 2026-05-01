/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzePortfolioMap(content: string | { mimeType: string; data: string }) {
  const isImage = typeof content !== 'string';
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: "Analiza este mapa de penetración de portafolio para vendedores en ruta. Identifica los puntos de venta con mayor potencial de crecimiento, sugiere 3 acciones inmediatas para aumentar la penetración y resume el estado actual del portafolio en un formato estructurado." },
        isImage ? { inlineData: content } : { text: content as string }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Resumen ejecutivo del estado del portafolio." },
          topInsights: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Principales hallazgos."
          },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Acciones recomendadas."
          },
          targetPDVs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                analysis: { type: Type.STRING }
              }
            }
          }
        },
        required: ["summary", "topInsights", "recommendations"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Error parsing Gemini response", e);
    return { summary: response.text };
  }
}
