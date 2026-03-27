import React from 'react';
import { cn } from '../../utils/cn';

interface RadioOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'cards' | 'segmented';
  className?: string;
  required?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  error,
  orientation = 'vertical',
  variant = 'default',
  className,
  required,
}) => {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <label className={cn("text-sm font-medium leading-none flex items-center gap-1", error ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200")}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* Segmented Control Style */}
      {variant === 'segmented' && (
        <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          {options.map((option) => {
             const isSelected = value === option.value;
             return (
               <label 
                 key={option.value}
                 className={cn(
                   "flex-1 flex items-center justify-center py-1.5 px-3 text-sm font-medium rounded-md cursor-pointer transition-all duration-200 select-none",
                  isSelected ? "bg-white text-primary-700 shadow-sm dark:bg-slate-900 dark:text-primary-300" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-700/50",
                   option.disabled && "opacity-50 cursor-not-allowed"
                 )}
               >
                 <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  disabled={option.disabled}
                  onChange={() => onChange(option.value)}
                  className="sr-only"
                />
                {option.label}
               </label>
             )
          })}
        </div>
      )}

      {/* Default & Card Styles */}
      {variant !== 'segmented' && (
        <div className={cn("flex gap-3", orientation === 'vertical' ? "flex-col" : "flex-row flex-wrap")}>
          {options.map((option) => {
            const isSelected = value === option.value;
            const isCard = variant === 'cards';
            
            return (
              <label
                key={option.value}
                className={cn(
                  "relative flex cursor-pointer transition-all duration-200",
                  isCard 
                    ? cn(
                        "items-start gap-3 rounded-lg border p-4 hover:bg-slate-50",
                        isSelected ? "border-primary-600 bg-primary-50 ring-1 ring-primary-600 dark:border-primary-500 dark:bg-primary-900/20 dark:ring-primary-500" : "border-slate-200 dark:border-slate-700 dark:hover:bg-slate-800/60"
                      )
                    : "items-center gap-2"
                  ,
                  option.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                )}
              >
                <div className={cn("flex items-center", isCard ? "h-5" : "h-5")}>
                  <input
                    type="radio"
                    name={name}
                    value={option.value}
                    checked={isSelected}
                    disabled={option.disabled}
                    onChange={() => onChange(option.value)}
                    className={cn(
                      "border-slate-300 text-primary-600 focus:ring-primary-500",
                      "dark:border-slate-600 dark:bg-slate-900 dark:text-primary-400 dark:focus:ring-primary-400",
                      isCard ? "h-4 w-4" : "h-4 w-4"
                    )}
                  />
                </div>
                <div className="grid gap-1.5 leading-none">
                  <span className={cn("text-sm font-medium", isSelected ? "text-primary-900 dark:text-primary-300" : "text-slate-900 dark:text-slate-100")}>
                    {option.label}
                  </span>
                  {option.description && isCard && (
                    <span className={cn("text-xs", isSelected ? "text-primary-700 dark:text-primary-300/90" : "text-slate-500 dark:text-slate-400")}>
                      {option.description}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}
      
      {error && <p className="text-[0.8rem] text-red-600 dark:text-red-400 font-medium">{error}</p>}
    </div>
  );
};