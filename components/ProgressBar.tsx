import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  max, 
  label, 
  colorClass = "bg-amber-600" 
}) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  // Helper to format number to max 1 decimal place
  const formatNum = (num: number) => Number(num.toFixed(1));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-stone-400 mb-1">
          <span>{label}</span>
          <span>{formatNum(current)} / {formatNum(max)}</span>
        </div>
      )}
      <div className="h-3 w-full bg-stone-950 rounded-full border border-stone-800 overflow-hidden relative">
        <div 
          className={`h-full transition-all duration-300 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-[9px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] leading-none mt-[1px]">
                {percentage.toFixed(1)}%
            </span>
        </div>
      </div>
    </div>
  );
};