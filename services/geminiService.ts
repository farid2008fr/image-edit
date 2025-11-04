
import { GoogleGenAI, Modality, Part } from "@google/genai";

export async function editImageWithGemini(
  imagePart: Part,
  prompt: string
): Promise<string | null> {
  // Ensure the API key is available
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          imagePart,
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    // Find the image part in the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const { mimeType, data } = part.inlineData;
        // Construct the full data URL to be used directly in an <img> src
        return `data:${mimeType};base64,${data}`;
      }
    }
    
    // If no image is found in the response
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the Gemini API.");
  }
}
