
/**
 * Resizes an image from a data URL to the specified dimensions using a canvas.
 * @param imageUrl The data URL of the image to resize.
 * @param newWidth The target width for the new image.
 * @param newHeight The target height for the new image.
 * @returns A promise that resolves with the data URL of the resized image.
 */
export function resizeImage(imageUrl: string, newWidth: number, newHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Preserve original image format if possible (jpeg or png)
      const mimeType = imageUrl.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png';
      resolve(canvas.toDataURL(mimeType));
    };
    img.onerror = (err) => {
      console.error("Error loading image for resizing:", err);
      reject(new Error("Failed to load image for resizing."));
    };
    img.src = imageUrl;
  });
}

/**
 * Applies a CSS filter to an image from a data URL using a canvas.
 * @param imageUrl The data URL of the image to apply the filter to.
 * @param filter The CSS filter string (e.g., 'contrast(150%)', 'brightness(1.2)').
 * @returns A promise that resolves with the data URL of the filtered image.
 */
export function applyCanvasFilter(imageUrl: string, filter: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      
      ctx.filter = filter;
      ctx.drawImage(img, 0, 0);

      const mimeType = imageUrl.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png';
      resolve(canvas.toDataURL(mimeType));
    };
    img.onerror = (err) => {
      console.error("Error loading image for filtering:", err);
      reject(new Error("Failed to load image for applying filter."));
    };
    img.src = imageUrl;
  });
}
