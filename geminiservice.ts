
import { GoogleGenAI, Type } from "@google/genai";
import { Wine } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateWineDescription = async (wine: Partial<Wine>): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Générer une description professionnelle de sommelier pour ce vin : 
      Nom: ${wine.name}, Millésime: ${wine.vintage}, Type: ${wine.type}, Région: ${wine.region}. 
      La description doit être en français, élégante et faire environ 3 phrases.`,
    });
    return response.text || "Description non disponible.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erreur lors de la génération de la description.";
  }
};

export const suggestPairing = async (wine: Wine): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggérer 3 accords mets et vins parfaits pour ce vin : ${wine.name} (${wine.vintage}, ${wine.type}, ${wine.region}).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["Fromages affinés", "Viandes grillées", "Plats régionaux"];
  }
};

export const analyzeStockStatus = async (wines: Wine[]): Promise<string> => {
  try {
    const summary = wines.map(w => `${w.name}: ${w.stock} bouteilles`).join(', ');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Agis en tant que gestionnaire de cave. Voici mon stock actuel : ${summary}. 
      Donne-moi un court conseil stratégique (2 phrases) sur le réapprovisionnement ou les ventes prioritaires.`,
    });
    return response.text || "Analyse indisponible.";
  } catch (error) {
    return "Impossible d'analyser le stock actuellement.";
  }
};
