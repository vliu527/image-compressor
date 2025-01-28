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
        <span>High Compression</span>
        <span>High Quality</span>
      </div>
      <div className="relative group">
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            dark:bg-gray-700
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-blue-500
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-200
            group-hover:[&::-webkit-slider-thumb]:scale-125
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <span className="text-sm">{Math.round(value * 100)}%</span>
        </div>
      </div>
    </div>
  );
} 