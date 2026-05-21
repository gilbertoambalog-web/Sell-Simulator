/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import * as XLSX from 'xlsx';
import { CATEGORIES } from '../constants';
import { PromoRule } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractPricesFromFile(file: File): Promise<Record<string, number>> {
  let textContent = '';
  let inlineData: any = null;

  const mimeType = file.type;
  
  if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType === 'application/vnd.ms-excel') {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    textContent = XLSX.utils.sheet_to_csv(worksheet);
  } else if (mimeType.startsWith('text/') || file.name.endsWith('.csv')) {
    textContent = await file.text();
  } else if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
    const base64String = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    inlineData = {
      data: base64String,
      mimeType: mimeType
    };
  } else {
    throw new Error('Formato de archivo no soportado. Sube un archivo de Excel, CSV, Texto, PDF o Imagen.');
  }

  const allProducts = Object.values(CATEGORIES).flat().map(c => ({ id: c.id, name: c.name }));
  
  const systemInstruction = `Eres un experto asistente de base de datos de precios.
Te enviaré un archivo (texto, imagen, PDF o CSV) que contiene una lista de precios actualizada de productos.
A continuación, tienes nuestra base de datos actual de productos en el sistema, en formato JSON con su ID y Nombre correspondientes:
${JSON.stringify(allProducts)}

Tu tarea:
1. Extrae los nombres de los productos y sus precios correspondientes del archivo enviado (el usuario subio este archivo o sus datos).
2. Compara cada producto extraído con los productos de nuestra base de datos proporcionada. Match inteligente.
3. Devuelve los precios actualizados (en formato numérico, solo el número, sin símbolos de moneda ni separadores de miles que no sean decimales) emparejándolos con el ID correspondiente de nuestra base de datos.
4. IGNORA productos que no logres emparejar con nuestra base de datos con confianza.
5. DEBES responder ÚNICAMENTE con un JSON válido en este preciso formato de diccionario (clave=id, valor=precio), SIN NINGÚN OTRO TEXTO.
Ejemplo de formato estricto:
{"v1": 3500, "v2": 4120}
`;

  try {
    const parts: any[] = [];
    if (textContent) {
      parts.push({ text: "Contenido del archivo de precios:\n" + textContent });
    }
    if (inlineData) {
      parts.push({ inlineData });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text || "{}";
    const prices = JSON.parse(resultText);
    return prices;
  } catch (error: any) {
    console.error("Gemini Price Extraction Error:", error);
    throw new Error("No se pudo extraer la información del archivo. Asegúrate de que tenga precios legibles y vuelve a intentar.");
  }
}

export async function extractPromotionsFromFile(file: File): Promise<PromoRule[]> {
  let textContent = '';
  let inlineData: any = null;

  const mimeType = file.type;
  
  if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType === 'application/vnd.ms-excel') {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    textContent = XLSX.utils.sheet_to_csv(worksheet);
  } else if (mimeType.startsWith('text/') || file.name.endsWith('.csv')) {
    textContent = await file.text();
  } else if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
    const base64String = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    inlineData = {
      data: base64String,
      mimeType: mimeType
    };
  } else {
    throw new Error('Formato de archivo no soportado. Sube un archivo de Excel, CSV, Texto, PDF o Imagen.');
  }

  const allCategories = Object.keys(CATEGORIES);
  const allProducts = Object.values(CATEGORIES).flat().map(c => ({ id: c.id, name: c.name }));
  
  const systemInstruction = `Eres un experto asistente en análisis de precios y promociones.
Te enviaré un cuadro explicativo o tabla (texto, imagen, PDF o CSV) que contiene reglas de descuentos (promociones) para productos o familias de productos.

A continuación, tienes nuestra base de datos actual de Categorías y Productos en el sistema:
Categorías: ${JSON.stringify(allCategories)}
Productos: ${JSON.stringify(allProducts)}

Tu tarea:
1. Extrae las reglas de promoción: nombre o descripción, productos a los que aplica, cantidad mínima requerida y porcentaje de descuento.
2. Identifica si la promoción aplica a una familia de productos ("Mix & Match" o agrupada), permitiendo que la suma de cajas de esos productos cumplan la escala. Ej: "Vinos de Guarda 8% a partir de 1 caja".
3. Identifica a qué producto específico o a qué categoría completa aplica cada regla extraída. El documento podría referirse al nombre de la categoría (ej. "VINOS DE GUARDA") o a los nombres de los productos (ej. "ALARIS COSECHA DULCE").
4. Asegúrate exhaustivamente de usar TODA la tabla de categorías para emparejar. Si el texto menciona "VDA" es "VINOS DEL AÑO", "VDG"  es "VINOS DE GUARDA". Un producto es un ID como "v5" o "p2".
5. Si encuentras reglas escalonadas para el mismo grupo (ej. 1 caja 8%, 5 cajas 10%), agrúpalas en el array "tiers" de la misma regla.
6. Devuelve ÚNICAMENTE un JSON válido que sea un array de objetos "PromoRule", con la siguiente estructura:
[
  {
    "id": "promo_1", // un ID único de tu creación
    "description": "Descuento en VINOS DE GUARDA", 
    "targetCategory": "VINOS DE GUARDA", // opcional, si aplica a toda una categoría. O el string null.
    "targetProductIds": ["p1", "p2", "p3", ...], // IDs de los productos a los que aplica. Si es toda una familia, pon tódos los IDs de la familia, o si no son de familia, pon los que correspondan.
    "tiers": [
      { "minQty": 6, "discount": 8 }, // 1 caja = 6 unid
      { "minQty": 30, "discount": 10 } // 5 cajas = 30 unid
    ],
    "isMixAndMatch": true // true si la suma de cualquier targetProductIds cuenta para el minQty. false si cada uno debe ser por separado. Siempre asume mix and match para familias, o en su defecto ponlo true si dice "vinos blancos".
  }
]
Nota: 1 caja = 6 unidades. El array targetProductIds DEBE contener los IDs referenciados según nuestra base de datos.
`;

  try {
    const parts: any[] = [];
    if (textContent) {
      parts.push({ text: "Contenido del archivo de promociones:\n" + textContent });
    }
    if (inlineData) {
      parts.push({ inlineData });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text || "{}";
    const promos = JSON.parse(resultText) as PromoRule[];
    return promos;
  } catch (error: any) {
    console.error("Gemini Promos Extraction Error:", error);
    throw new Error("No se pudo extraer la información del documento de promociones al emparejar con los productos.");
  }
}

export async function analyzePortfolioMap(customQuery: string, clients: any[]) {
  const systemInstruction = `Eres un experto en ventas y análisis estratégico de rutas.
Recibirás información de clientes en formato JSON.
MUY IMPORTANTE: SIEMPRE utiliza la dirección ("direccion") para referirte a un Punto de Venta (PDV), NUNCA el nombre del cliente.

Por defecto, si no te piden nada específico, DEBES hacer lo siguiente:
1. Dar un listado de los PDV que son PLAN (propiedad "plan" no vacía) y que tengan mayor cantidad de CNC (Quiebres de stock / No compró) en el mes ("cncCount" > 0). ESTOS SON TU PRIMERA PRIORIDAD.
2. Seguido de los PDV que tengan mayor cantidad de CNC de la ruta en general.

En tu análisis:
- Mantén un tono serio, objetivo y estrictamente profesional. Cero frases motivacionales.
- El uso de emojis debe ser mínimo (nivel 2 de 5), solo para estructurar la lectura. 
- Para distinguir cada plan, usa ÚNICAMENTE estos íconos:
  - Plan GOLD: 🥇
  - Plan SILVER: 🥈
  - Plan INICIAL: 🥉
- Detalla SIEMPRE cuáles son los titulares CNC específicos de cada PDV mencionado.
- Cuantifica el impacto o los quiebres de forma clara y directa.

Si el usuario hace una pregunta específica, responde directamente esa pregunta, manteniendo este mismo nivel de profesionalidad y refiriéndote a los clientes por su "direccion".

Devuelve tu respuesta DIRECTAMENTE EN TEXTO PLANO con viñetas o listas claras. No devuelvas JSON.`;

  const TITULARES = ['A.M', 'Alaris', 'Dadá', 'T. Reserva', 'F. las Moras', 'L. Arboles', 'A.M Rva', 'G Flavor', 'Antares', 'Frizze', 'Smf Flavors'];

  const processedClients = clients.map(c => {
    const cncList: string[] = [];
    let cncCount = 0;
    if (c.plans) {
      TITULARES.forEach((titular, i) => {
        if (c.plans[i] !== 'CCC') {
          cncCount++;
          cncList.push(titular);
        }
      });
    }
    return {
      direccion: c.address,
      facturacion: c.billing,
      plan: c.plan || 'Ninguno',
      cncCount,
      titularesEnQuiebreDeStock_CNC: cncList
    };
  });

  const inputContent = `
Datos de la Ruta (Clientes procesados resolviendo los 11 titulares):
${JSON.stringify(processedClients, null, 2)}

Solicitud adicional del usuario: ${customQuery || "Ninguna, dame el análisis por defecto y prioriza PLAN con mayor CNC seguido de mayor CNC en general."}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: inputContent }] }
      ],
      config: {
        systemInstruction,
      }
    });

    return { response: response.text };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Error al procesar con IA");
  }
}
