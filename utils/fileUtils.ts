
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
