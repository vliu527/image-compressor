'use client';

interface CompressionSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function CompressionSlider({ value, onChange, disabled = false }: CompressionSliderProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-red-500">High Compression (Smaller Size)</span>
        <span className="text-green-500">High Quality (Larger Size)</span>
      </div>
      <div className="relative group">
        <input
          type="range"
          min="0.01"
          max="1"
          step="0.01"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-blue-500
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-200
            group-hover:[&::-webkit-slider-thumb]:scale-125
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-sm font-semibold">{Math.round(value * 100)}% Quality</div>
          <div className="text-xs text-gray-500">
            {value < 0.3 ? 'Low Quality' : value < 0.7 ? 'Medium Quality' : 'High Quality'}
          </div>
        </div>
      </div>
    </div>
  );
} 