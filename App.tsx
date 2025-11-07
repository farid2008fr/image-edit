import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { editImageWithGemini } from './services/geminiService';
import { fileToGenerativePart, dataUrlToGenerativePart } from './utils/fileUtils';
import { resizeImage, applyCanvasFilter } from './utils/imageUtils';
import { UploadIcon, SparklesIcon, AlertTriangleIcon, DownloadIcon, LockClosedIcon, LockOpenIcon, CropIcon, WandIcon } from './components/icons';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cropping state
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Resize state
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [resizeOptions, setResizeOptions] = useState({
    mode: 'percentage' as 'percentage' | 'dimensions',
    percentage: 100,
    width: 0,
    height: 0,
    isAspectRatioLocked: true,
  });

  // Adjustments state
  const [contrast, setContrast] = useState(100);

  const originalImageUrlForCropper = useMemo(() => {
    if (originalImage) return URL.createObjectURL(originalImage);
    return null;
  }, [originalImage]);

  const displayImageUrl = useMemo(() => {
    if (croppedImageUrl) return croppedImageUrl;
    if (originalImage) return URL.createObjectURL(originalImage);
    return null;
  }, [originalImage, croppedImageUrl]);

  useEffect(() => {
    if (!editedImage) {
      setFinalImage(null);
      return;
    }

    let isMounted = true;
    const applyAdjustments = async () => {
      try {
        let adjustedImage = editedImage;
        if (contrast !== 100) {
          adjustedImage = await applyCanvasFilter(adjustedImage, `contrast(${contrast}%)`);
        }
        // Future adjustments can be chained here, e.g., brightness, saturation.
        if (isMounted) {
          setFinalImage(adjustedImage);
        }
      } catch (err) {
        console.error("Failed to apply adjustments:", err);
        if (isMounted) {
          setFinalImage(editedImage); // Fallback to unadjusted image on error
        }
      }
    };

    applyAdjustments();

    return () => { isMounted = false; };
  }, [editedImage, contrast]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalImage(file);
      setEditedImage(null);
      setError(null);
      setCroppedImageUrl(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setContrast(100);
      
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setResizeOptions(prev => ({
          ...prev,
          width: img.width,
          height: img.height,
          percentage: 100,
        }));
      };
      img.src = URL.createObjectURL(file);
    }
  };
  
  const isResizingNeeded = useMemo(() => {
    if (!originalDimensions) return false;
    const sourceWidth = completedCrop?.width ?? originalDimensions.width;
    const sourceHeight = completedCrop?.height ?? originalDimensions.height;
    if (resizeOptions.mode === 'percentage' && resizeOptions.percentage !== 100) return true;
    if (resizeOptions.mode === 'dimensions' && (resizeOptions.width !== sourceWidth || resizeOptions.height !== sourceHeight)) return true;
    return false;
  }, [resizeOptions, originalDimensions, completedCrop]);

  const processAndSetImage = async (imageUrl: string) => {
    if (isResizingNeeded && originalDimensions) {
        let targetWidth: number;
        let targetHeight: number;

        if (resizeOptions.mode === 'percentage') {
          const scale = resizeOptions.percentage / 100;
          const sourceWidth = completedCrop?.width ?? originalDimensions.width;
          targetWidth = Math.round(sourceWidth * scale);
          targetHeight = Math.round((completedCrop?.height ?? originalDimensions.height) * scale);
        } else {
          targetWidth = resizeOptions.width;
          targetHeight = resizeOptions.height;
        }

        if (targetWidth > 0 && targetHeight > 0) {
          const finalImageUrl = await resizeImage(imageUrl, targetWidth, targetHeight);
          setEditedImage(finalImageUrl);
        } else {
          setEditedImage(imageUrl);
        }
    } else {
        setEditedImage(imageUrl);
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if ((!originalImage && !croppedImageUrl) || !prompt.trim()) {
      setError('Please upload an image and enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      let imagePart;
      if (croppedImageUrl) {
        imagePart = dataUrlToGenerativePart(croppedImageUrl);
      } else if (originalImage) {
        imagePart = await fileToGenerativePart(originalImage);
      } else {
        throw new Error("No image available to process.");
      }

      const editedImageUrl = await editImageWithGemini(imagePart, prompt);
      
      if (editedImageUrl) {
        await processAndSetImage(editedImageUrl);
      } else {
        throw new Error('The API did not return an image. Please try a different prompt.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, croppedImageUrl, prompt, isResizingNeeded, originalDimensions, resizeOptions, completedCrop]);

  const handleEnhanceClick = useCallback(async () => {
    if (!originalImage && !croppedImageUrl) {
      setError('Please upload an image first.');
      return;
    }

    setIsEnhancing(true);
    setError(null);
    setEditedImage(null);

    try {
      let imagePart;
      if (croppedImageUrl) {
        imagePart = dataUrlToGenerativePart(croppedImageUrl);
      } else if (originalImage) {
        imagePart = await fileToGenerativePart(originalImage);
      } else {
        throw new Error("No image available to process.");
      }

      const ENHANCE_PROMPT = 'Enhance the image quality, lighting, and colors to make it look professional and vibrant.';
      const editedImageUrl = await editImageWithGemini(imagePart, ENHANCE_PROMPT);
      
      if (editedImageUrl) {
        await processAndSetImage(editedImageUrl);
      } else {
        throw new Error('The API did not return an image. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsEnhancing(false);
    }
  }, [originalImage, croppedImageUrl, isResizingNeeded, originalDimensions, resizeOptions, completedCrop]);
  
  const handleDownload = () => {
    if (!finalImage) return;
    const link = document.createElement('a');
    link.href = finalImage;
    const mimeType = finalImage.match(/data:([^;]+);/)?.[1] || 'image/png';
    const extension = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1] || 'png';
    link.download = `edited-image.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyCrop = () => {
    if (!completedCrop || !imgRef.current) return;
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    setCroppedImageUrl(canvas.toDataURL('image/png'));
    setOriginalDimensions({ width: completedCrop.width, height: completedCrop.height });
    setResizeOptions(prev => ({...prev, width: completedCrop.width, height: completedCrop.height, percentage: 100 }));
    setIsCropModalOpen(false);
  };

  const handleResetCrop = () => {
      setCroppedImageUrl(null);
      const img = new Image();
      img.onload = () => setOriginalDimensions({ width: img.width, height: img.height });
      if(originalImage) img.src = URL.createObjectURL(originalImage);
  }

  // --- Resize Option Handlers ---
  const handleResizeModeChange = (mode: 'percentage' | 'dimensions') => setResizeOptions(prev => ({ ...prev, mode }));
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => setResizeOptions(prev => ({ ...prev, percentage: e.target.valueAsNumber }));
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = e.target.valueAsNumber || 0;
    const sourceDims = completedCrop ?? originalDimensions;
    setResizeOptions(prev => {
      if (prev.isAspectRatioLocked && sourceDims) {
        const aspectRatio = sourceDims.height / sourceDims.width;
        return { ...prev, width: newWidth, height: Math.round(newWidth * aspectRatio) };
      }
      return { ...prev, width: newWidth };
    });
  };
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = e.target.valueAsNumber || 0;
    const sourceDims = completedCrop ?? originalDimensions;
    setResizeOptions(prev => {
      if (prev.isAspectRatioLocked && sourceDims) {
        const aspectRatio = sourceDims.width / sourceDims.height;
        return { ...prev, height: newHeight, width: Math.round(newHeight * aspectRatio) };
      }
      return { ...prev, height: newHeight };
    });
  };
  const toggleAspectRatioLock = () => setResizeOptions(prev => ({ ...prev, isAspectRatioLocked: !prev.isAspectRatioLocked }));
  
  const ImageDisplay: React.FC<{ src: string; alt: string; title: string, showReset?: boolean }> = ({ src, alt, title, showReset }) => (
    <div className="w-full">
      <div className="flex items-center justify-center mb-2 relative">
        <h3 className="text-lg font-semibold text-center text-gray-300">{title}</h3>
        {showReset && (
            <button onClick={handleResetCrop} className="ml-2 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded">Reset</button>
        )}
      </div>
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
            <label className="text-xl font-semibold text-gray-200 mb-2 block">1. Upload Image</label>
            <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-gray-600 px-6 py-10 hover:border-blue-400 transition-colors">
              <div className="text-center">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                <div className="mt-4 flex text-sm leading-6 text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-blue-400 hover:text-blue-300">
                    <span>Upload a file</span>
                    <input id="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-500">PNG, JPG, WEBP</p>
              </div>
            </div>
          </div>
          
          <fieldset disabled={!originalImage} className="disabled:opacity-50 transition-opacity">
            <legend className="text-xl font-semibold text-gray-200 mb-2 block">2. Crop Image (Optional)</legend>
            <button onClick={() => setIsCropModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed">
                <CropIcon className="w-5 h-5" />
                Crop Image
            </button>
          </fieldset>
          
          <div>
            <label htmlFor="prompt" className="text-xl font-semibold text-gray-200 mb-2 block">3. Describe Your Edit</label>
            <textarea id="prompt" rows={4} className="w-full p-3 bg-gray-700 border-2 border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 transition" placeholder="e.g., 'Add a retro cinematic filter'" value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={!originalImage} />
          </div>

          <fieldset disabled={!originalImage} className="disabled:opacity-50 transition-opacity">
            <legend className="text-xl font-semibold text-gray-200 mb-2 block">4. Resize (Optional)</legend>
             <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center cursor-pointer"><input type="radio" name="resize-mode" value="percentage" checked={resizeOptions.mode === 'percentage'} onChange={() => handleResizeModeChange('percentage')} className="form-radio h-4 w-4 text-blue-500 bg-gray-700 border-gray-600" /><span className="ml-2">Percentage</span></label>
                <label className="flex items-center cursor-pointer"><input type="radio" name="resize-mode" value="dimensions" checked={resizeOptions.mode === 'dimensions'} onChange={() => handleResizeModeChange('dimensions')} className="form-radio h-4 w-4 text-blue-500 bg-gray-700 border-gray-600" /><span className="ml-2">Dimensions</span></label>
            </div>
            {resizeOptions.mode === 'percentage' ? (
                 <div className="flex items-center gap-3">
                    <input type="range" min="1" max="200" value={resizeOptions.percentage} onChange={handlePercentageChange} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                    <span className="text-sm font-mono bg-gray-700 py-1 px-2 rounded">{resizeOptions.percentage}%</span>
                 </div>
            ) : (
                <div className="flex items-center gap-2">
                    <input type="number" value={resizeOptions.width} onChange={handleWidthChange} className="w-full p-2 bg-gray-700 border-2 border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 transition" aria-label="Width" />
                    <button onClick={toggleAspectRatioLock} className="p-2 rounded-md hover:bg-gray-700 transition" aria-label="Toggle lock">
                      {resizeOptions.isAspectRatioLocked ? <LockClosedIcon className="w-5 h-5 text-blue-400" /> : <LockOpenIcon className="w-5 h-5 text-gray-400" />}
                    </button>
                    <input type="number" value={resizeOptions.height} onChange={handleHeightChange} className="w-full p-2 bg-gray-700 border-2 border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 transition" aria-label="Height" />
                </div>
            )}
          </fieldset>

          <fieldset disabled={!editedImage} className="disabled:opacity-50 transition-opacity">
            <legend className="text-xl font-semibold text-gray-200 mb-2 block">5. Adjustments (Optional)</legend>
            <label htmlFor="contrast" className="block text-sm font-medium text-gray-400 mb-1">Contrast</label>
            <div className="flex items-center gap-3">
                <input id="contrast" type="range" min="50" max="200" value={contrast} onChange={e => setContrast(e.target.valueAsNumber)} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                <span className="text-sm font-mono bg-gray-700 py-1 px-2 rounded">{contrast}%</span>
            </div>
          </fieldset>

          <div className="mt-auto pt-6 border-t border-gray-700/50 flex flex-col gap-4">
            <button 
              onClick={handleEnhanceClick} 
              disabled={isLoading || isEnhancing || !originalImage} 
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-secondary text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg transition-colors"
              aria-label="Automatically enhance image quality"
            >
              {isEnhancing ? (
                <><div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>Enhancing...</>
              ) : (
                <><WandIcon className="w-5 h-5" />Auto Enhance</>
              )}
            </button>
            <button 
              onClick={handleGenerateClick} 
              disabled={isLoading || isEnhancing || !originalImage || !prompt.trim()} 
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg transition-colors"
              aria-label="Generate edited image based on your prompt"
            >
              {isLoading ? (<><div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>Generating...</>) : (<><SparklesIcon className="w-5 h-5" />{isResizingNeeded ? 'Generate & Resize' : 'Generate'}</>)}
            </button>
          </div>
        </div>

        {/* Display Column */}
        <div className="w-full lg:w-2/3 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {displayImageUrl ? (
              <ImageDisplay src={displayImageUrl} alt="Original image" title="Original" showReset={!!croppedImageUrl} />
            ) : ( <div className="aspect-square w-full bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600"><p className="text-gray-500">Upload an image to start</p></div>)}

            <div className="w-full flex flex-col gap-4">
              <div className="aspect-square w-full bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 relative">
                {(isLoading || isEnhancing) && (<div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 rounded-lg"><div className="w-12 h-12 border-4 border-t-transparent border-blue-400 rounded-full animate-spin"></div><p className="mt-4 text-lg font-semibold">{isLoading ? 'Editing your image...' : 'Enhancing your image...'}</p></div>)}
                {error && (<div className="p-4 text-center text-red-300"><AlertTriangleIcon className="w-12 h-12 mx-auto text-brand-danger mb-2" /><p className="font-semibold">Oops! Something went wrong.</p><p className="text-sm">{error}</p></div>)}
                {finalImage && !isLoading && !isEnhancing && !error && (<ImageDisplay src={finalImage} alt="Edited image" title="Edited" />)}
                {!finalImage && !isLoading && !isEnhancing && !error && (<div className="text-center text-gray-500 p-4"><SparklesIcon className="w-12 h-12 mx-auto mb-2" /><p>Your edited image will appear here.</p></div>)}
              </div>
              
              {finalImage && !isLoading && !isEnhancing && !error && (<button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-secondary text-white font-bold rounded-lg hover:bg-green-600 transform hover:scale-105 shadow-lg"><DownloadIcon className="w-5 h-5" />Download Image</button>)}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="w-full max-w-5xl text-center mt-8 py-4 border-t border-gray-700/50">
        <div className="flex justify-center items-center gap-x-6 gap-y-2 flex-wrap">
          <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-blue-300 transition-colors">
            Terms & Conditions
          </a>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-blue-300 transition-colors">
            Privacy Policy
          </a>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <a href="/contact.html" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-blue-300 transition-colors">
            Contact Us
          </a>
        </div>
        <p className="text-xs text-gray-600 mt-4">© {new Date().getFullYear()} Gemini Image Editor. All rights reserved.</p>
      </footer>

      {isCropModalOpen && originalImageUrlForCropper && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-4xl">
                <h2 className="text-2xl font-bold mb-4">Crop Image</h2>
                <div className="max-h-[60vh] overflow-auto">
                    <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={undefined}>
                        <img ref={imgRef} src={originalImageUrlForCropper} alt="Image to crop" style={{ maxHeight: '60vh' }}/>
                    </ReactCrop>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={() => setIsCropModalOpen(false)} className="py-2 px-5 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-colors">Cancel</button>
                    <button onClick={handleApplyCrop} className="py-2 px-5 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors">Apply Crop</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
