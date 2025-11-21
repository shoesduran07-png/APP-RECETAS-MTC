import { GoogleGenAI, Modality, Type, Schema } from "@google/genai";
import { Recipe } from "../types";

// Initialize the client
// Using process.env.API_KEY as strictly required
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for Recipe Generation
const recipeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Nombre creativo de la receta TCM" },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de ingredientes utilizados"
    },
    steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Pasos detallados de preparación"
    },
    benefits: {
      type: Type.STRING,
      description: "Explicación de beneficios según medicina tradicional china (Qi, Yin/Yang, Propiedades térmicas)"
    }
  },
  required: ["title", "ingredients", "steps", "benefits"]
};

/**
 * Generates a TCM recipe based on ingredients using Gemini 2.5 Flash Lite for speed.
 */
export const generateTCMRecipe = async (ingredients: string[]): Promise<Omit<Recipe, 'id' | 'createdAt'>> => {
  const prompt = `
    Eres un experto maestro de cocina y practicante de Medicina Tradicional China.
    Crea una receta saludable y equilibrada utilizando principalmente estos ingredientes: ${ingredients.join(', ')}.
    Puedes añadir condimentos básicos o complementos comunes si es necesario.
    Explica los beneficios energéticos (Qi, Yin/Yang, propiedades térmicas de los alimentos).
    Responde SOLO en JSON válido.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite', // Explicitly requested for low-latency
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        systemInstruction: "Eres un experto en nutrición TCM. Tu objetivo es sanar a través de la comida.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text generated");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw error;
  }
};

/**
 * Generates an image of the dish using Gemini 2.5 Flash Image.
 */
export const generateRecipeImage = async (recipeTitle: string, description: string): Promise<string | null> => {
  try {
    const prompt = `Fotografía gastronómica profesional, alta resolución, estilo editorial de: ${recipeTitle}. ${description}. Iluminación natural, estética minimalista y elegante.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Explicitly requested for Nano Banana features
      contents: prompt,
      config: {
        // Nano banana models don't support responseMimeType, just standard generation
      }
    });

    // Iterate through parts to find the image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

/**
 * Edits an existing image using Gemini 2.5 Flash Image based on a text prompt.
 * Fulfills the "Nano banana" editing requirement.
 */
export const editRecipeImage = async (base64Image: string, instruction: string): Promise<string | null> => {
  try {
    // Extract base64 data and mimeType
    const match = base64Image.match(/^data:(image\/[a-z]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid base64 image format");
    
    const mimeType = match[1];
    const data = match[2];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data
            }
          },
          {
            text: `Edita esta imagen: ${instruction}`
          }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
}

/**
 * Generates TTS audio for the recipe instructions.
 */
export const generateRecipeAudio = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts', // Explicitly requested for TTS
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is a good clear voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Error generating audio:", error);
    return null;
  }
};
