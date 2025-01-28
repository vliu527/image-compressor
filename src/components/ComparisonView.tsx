'use client';

import { useState, useEffect } from 'react';
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

        {/* Loading State */}
        {isCompressing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Compressing...
            </div>
          </div>
        )}

        {/* Comparison Slider */}
        {!isCompressing && compressedPreview && (
          <div
            className="absolute inset-0"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
          >
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
              style={{ 
                left: `${sliderPosition}%`,
                transform: 'translateX(-50%)',
                boxShadow: '0 0 10px rgba(0,0,0,0.3)'
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                ⇄
              </div>
            </div>
          </div>
        )}
      </div>

      <CompressionSlider
        value={compressionRatio}
        onChange={setCompressionRatio}
        disabled={isCompressing}
      />

      <ImageStats
        originalSize={originalImage.size}
        compressedSize={compressedSize}
      />
    </div>
  );
} 