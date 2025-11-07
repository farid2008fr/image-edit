import { Part } from "@google/genai";

// Converts a File object to a GoogleGenerativeAI.Part object.
export function fileToGenerativePart(file: File): Promise<Part> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(',')[1];
      if (base64Data) {
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      } else {
        reject(new Error("Failed to read file as base64."));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
}

/**
 * Converts a data URL string to a GoogleGenerativeAI.Part object.
 * @param dataUrl The data URL of the image.
 * @returns A Part object for the Gemini API.
 */
export function dataUrlToGenerativePart(dataUrl: string): Part {
  const mimeType = dataUrl.match(/data:(.*?);/)?.[1] ?? 'image/png';
  const base64Data = dataUrl.split(',')[1];

  if (!base64Data) {
    throw new Error("Invalid data URL for conversion.");
  }
  
  return {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };
}
