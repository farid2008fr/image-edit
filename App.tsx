
import React, { useState, useCallback, useMemo } from 'react';
import { editImageWithGemini } from './services/geminiService';
import { fileToGenerativePart } from './utils/fileUtils';
import { UploadIcon, SparklesIcon, AlertTriangleIcon, DownloadIcon } from './components/icons';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const originalImageUrl = useMemo(() => {
    if (originalImage) {
      return URL.createObjectURL(originalImage);
    }
    return null;
  }, [originalImage]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalImage(file);
      setEditedImage(null);
      setError(null);
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!originalImage || !prompt.trim()) {
      setError('Please upload an image and enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const imagePart = await fileToGenerativePart(originalImage);
      const editedImageUrl = await editImageWithGemini(imagePart, prompt);
      
      if (editedImageUrl) {
        setEditedImage(editedImageUrl);
      } else {
        throw new Error('The API did not return an image. Please try a different prompt.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt]);
  
  const handleDownload = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    const mimeType = editedImage.match(/data:([^;]+);/)?.[1] || 'image/png';
    const extension = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1] || 'png';
    link.download = `edited-image.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ImageDisplay: React.FC<{ src: string; alt: string; title: string }> = ({ src, alt, title }) => (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-center mb-2 text-gray-300">{title}</h3>
      <div className="aspect-square w-full bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg">
        <img src={src} alt={alt} className="w-full h-full object-contain" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
          Gemini Image Editor
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Bring your creative visions to life with AI-powered image editing.</p>
      </header>

      <main className="w-full max-w-5xl flex flex-col lg:flex-row gap-8">
        {/* Controls Column */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 p-6 bg-gray-800/50 rounded-xl border border-gray-700 shadow-2xl">
          <div>
            <label htmlFor="image-upload" className="text-xl font-semibold text-gray-200 mb-2 block">1. Upload Image</label>
            <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-gray-600 px-6 py-10 hover:border-blue-400 transition-colors">
              <div className="text-center">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                <div className="mt-4 flex text-sm leading-6 text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-blue-300">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-500">PNG, JPG, WEBP up to 10MB</p>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="prompt" className="text-xl font-semibold text-gray-200 mb-2 block">2. Describe Your Edit</label>
            <textarea
              id="prompt"
              rows={4}
              className="w-full p-3 bg-gray-700 border-2 border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white placeholder-gray-400"
              placeholder="e.g., 'Add a retro cinematic filter' or 'Make the sky look like a galaxy'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={!originalImage}
            />
          </div>

          <button
            onClick={handleGenerateClick}
            disabled={isLoading || !originalImage || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100 shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" />
                Generate
              </>
            )}
          </button>
        </div>

        {/* Display Column */}
        <div className="w-full lg:w-2/3 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {originalImageUrl ? (
              <ImageDisplay src={originalImageUrl} alt="Original image" title="Original" />
            ) : (
                <div className="aspect-square w-full bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                    <p className="text-gray-500">Upload an image to start</p>
                </div>
            )}

            <div className="w-full flex flex-col gap-4">
              <div className="aspect-square w-full bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 relative">
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 rounded-lg">
                    <div className="w-12 h-12 border-4 border-t-transparent border-blue-400 rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg font-semibold">Editing your image...</p>
                  </div>
                )}
                {error && (
                  <div className="p-4 text-center text-red-300">
                      <AlertTriangleIcon className="w-12 h-12 mx-auto text-brand-danger mb-2" />
                      <p className="font-semibold">Oops! Something went wrong.</p>
                      <p className="text-sm">{error}</p>
                  </div>
                )}
                {editedImage && !isLoading && !error && (
                  <ImageDisplay src={editedImage} alt="Edited image" title="Edited" />
                )}
                {!editedImage && !isLoading && !error && (
                  <div className="text-center text-gray-500 p-4">
                      <SparklesIcon className="w-12 h-12 mx-auto mb-2" />
                      <p>Your edited image will appear here.</p>
                  </div>
                )}
              </div>
              
              {editedImage && !isLoading && !error && (
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-secondary text-white font-bold rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  aria-label="Download edited image"
                >
                  <DownloadIcon className="w-5 h-5" />
                  Download Image
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
