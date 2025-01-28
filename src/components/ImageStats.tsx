interface ImageStatsProps {
  originalSize: number;
  compressedSize: number;
}

export default function ImageStats({ originalSize, compressedSize }: ImageStatsProps) {
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const savings = ((originalSize - compressedSize) / originalSize) * 100;

  return (
    <div className="flex justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Original Size</div>
        <div className="font-semibold">{formatSize(originalSize)}</div>
      </div>
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Compressed Size</div>
        <div className="font-semibold">{formatSize(compressedSize)}</div>
      </div>
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Savings</div>
        <div className="font-semibold text-green-500">
          {compressedSize ? `${savings.toFixed(1)}%` : '-'}
        </div>
      </div>
    </div>
  );
} 