'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import CompressionSlider from './CompressionSlider';
import ImageStats from './ImageStats';
import { compressImage } from '@/utils/imageCompression';

// Add type definition for the File System Access API
interface FileSystemFileHandle {
  createWritable: () => Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
  write: (data: Blob) => Promise<void>;
  close: () => Promise<void>;
}

interface ShowSaveFilePickerOptions {
  suggestedName?: string;
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}

// Add type guard for window.showSaveFilePicker
function hasShowSaveFilePicker(window: Window): window is Window & {
  showSaveFilePicker: (options: ShowSaveFilePickerOptions) => Promise<FileSystemFileHandle>;
} {
  return 'showSaveFilePicker' in window;
}

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
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);

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
          setCompressedBlob(compressedBlob);
        }
      } catch (error) {
        console.error('Compression failed:', error);
        if (isMounted) {
          setCompressedPreview(null);
          setCompressedSize(0);
          setCompressedBlob(null);
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

  const handleDownload = useCallback(async () => {
    if (!compressedBlob) return;

    // Create quality suffix for filename
    const quality = Math.round(compressionRatio * 100);
    const originalName = originalImage.name;
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(`.${extension}`, '');
    const newFileName = `${baseName}-compressed-${quality}pct.jpg`;

    try {
      // Use type guard to check for File System Access API
      if (typeof window !== 'undefined' && hasShowSaveFilePicker(window)) {
        const handle = await window.showSaveFilePicker({
          suggestedName: newFileName,
          types: [{
            description: 'JPEG Image',
            accept: {
              'image/jpeg': ['.jpg', '.jpeg'],
            },
          }],
        });

        const writableStream = await handle.createWritable();
        await writableStream.write(compressedBlob);
        await writableStream.close();
      } else {
        // Fallback for browsers without File System Access API
        const blobUrl = URL.createObjectURL(compressedBlob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = newFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Clean up the blob URL
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Failed to save file:', err);
        alert('Failed to save the compressed image. Please try again.');
      }
    }
  }, [compressedBlob, originalImage.name, compressionRatio]);

  return (
    <div className="w-full space-y-6">
      <div className="relative h-[500px] w-full border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
        {/* Original Image */}
        <div className="absolute inset-0">
          {originalPreview && (
            <div className="relative w-full h-full">
              <Image
                src={originalPreview}
                alt="Original"
                fill
                className="object-contain"
                unoptimized // Important for data URLs
              />
            </div>
          )}
        </div>

        {/* Compressed Image */}
        {!isCompressing && compressedPreview && (
          <div 
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <div className="relative w-full h-full">
              <Image
                src={compressedPreview}
                alt="Compressed"
                fill
                className="object-contain"
                unoptimized // Important for data URLs
              />
            </div>
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