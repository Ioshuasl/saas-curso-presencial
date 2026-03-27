import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface RangeSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  showValue?: boolean;
  error?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  showValue = true,
  error,
  className,
  disabled,
  ...props
}) => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const p = ((value - min) / (max - min)) * 100;
    setPercentage(Math.min(Math.max(p, 0), 100));
  }, [value, min, max]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
       <div className="flex justify-between items-center">
        {label && (
          <label className={cn("text-sm font-medium leading-none", error ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200")}>
            {label}
          </label>
        )}
        {showValue && (
          <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded dark:text-slate-300 dark:bg-slate-800">
            {value}
          </span>
        )}
      </div>
      
      <div className="relative w-full h-6 flex items-center">
        {/* Track Background */}
        <div className="absolute w-full h-2 bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700">
          {/* Active Track */}
          <div 
            className={cn("h-full bg-primary-600 transition-all duration-75 dark:bg-primary-500", disabled && "bg-slate-400 dark:bg-slate-500")} 
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* The actual input range is invisible but sits on top to handle interactions */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "absolute w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10",
            className
          )}
          {...props}
        />

        {/* Custom Thumb - purely visual, positioned absolutely based on percentage */}
        <div 
          className={cn(
            "absolute h-5 w-5 bg-white border-2 border-primary-600 rounded-full shadow-md pointer-events-none transition-transform duration-75 transform -translate-x-1/2 dark:bg-slate-900 dark:border-primary-500",
            disabled ? "border-slate-400 bg-slate-100 dark:border-slate-500 dark:bg-slate-800" : "group-hover:scale-110"
          )}
          style={{ left: `${percentage}%` }}
        />
      </div>
       {error && <p className="text-[0.8rem] text-red-600 dark:text-red-400 font-medium">{error}</p>}
    </div>
  );
};