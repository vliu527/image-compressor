'use client';

import { useState, useEffect, useCallback } from 'react';
import CompressionSlider from './CompressionSlider';
import ImageStats from './ImageStats';
import { compressImage } from '@/utils/imageCompression';

interface ComparisonViewProps {
  originalImage: File;
  originalPreview: string;
}

export default function ComparisonView({ originalImage, originalPreview }: ComparisonViewProps) {
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null);
  const [compressionRatio, setCompressionRatio] = useState<number>(0.7);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsCompressing(true);

    const compress = async () => {
      try {
        const { compressedBlob, dataUrl } = await compressImage(
          originalImage,
          compressionRatio
        );
        
        if (isMounted) {
          setCompressedPreview(dataUrl);
          setCompressedSize(compressedBlob.size);
        }
      } catch (error) {
        console.error('Compression failed:', error);
        if (isMounted) {
          setCompressedPreview(null);
          setCompressedSize(0);
        }
      } finally {
        if (isMounted) {
          setIsCompressing(false);
        }
      }
    };

    compress();

    return () => {
      isMounted = false;
    };
  }, [originalImage, compressionRatio]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handleDownload = useCallback(() => {
    if (!compressedPreview) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = compressedPreview;
    
    // Get original filename and add suffix
    const originalName = originalImage.name;
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(`.${extension}`, '');
    const quality = Math.round(compressionRatio * 100);
    const newFileName = `${baseName}-compressed-${quality}pct.jpg`;
    
    link.download = newFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [compressedPreview, originalImage.name, compressionRatio]);

  return (
    <div className="w-full space-y-6">
      <div className="relative h-[500px] w-full border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
        {/* Original Image */}
        <div className="absolute inset-0">
          {originalPreview && (
            <img
              src={originalPreview}
              alt="Original"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Compressed Image */}
        {!isCompressing && compressedPreview && (
          <div 
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={compressedPreview}
              alt="Compressed"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Labels for comparison */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          Original
        </div>
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          Compressed
        </div>

        {/* Comparison Slider with better visibility */}
        {!isCompressing && compressedPreview && (
          <div
            className="absolute inset-0"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
          >
            <div
              className="absolute top-0 bottom-0 w-1 bg-blue-500 cursor-ew-resize"
              style={{ 
                left: `${sliderPosition}%`,
                transform: 'translateX(-50%)',
                boxShadow: '0 0 10px rgba(0,0,0,0.3)'
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500">
                <span className="text-blue-500">⇄</span>
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-blue-500 text-white px-2 py-1 rounded text-xs">
                Drag to Compare
              </div>
            </div>
          </div>
        )}

        {/* Loading State with more info */}
        {isCompressing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
              <div className="text-blue-500 mb-2">Compressing...</div>
              <div className="text-sm text-gray-500">
                Quality: {Math.round(compressionRatio * 100)}%
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <CompressionSlider
          value={compressionRatio}
          onChange={setCompressionRatio}
          disabled={isCompressing}
        />
        
        {!isCompressing && compressedPreview && (
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 whitespace-nowrap"
            title="Download compressed image"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
        )}
      </div>

      <ImageStats
        originalSize={originalImage.size}
        compressedSize={compressedSize}
      />
    </div>
  );
} 