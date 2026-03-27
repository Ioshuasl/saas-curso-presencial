import React from 'react';
import { cn } from '../../utils/cn';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  label?: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  thumbIcon?: React.ReactNode;
  activeColor?: string; // Optional custom color class override
  inactiveColor?: string; // Optional custom color class override
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ 
    className, 
    label, 
    description, 
    checked, 
    onCheckedChange, 
    size = 'md', 
    error, 
    thumbIcon, 
    disabled,
    activeColor,
    inactiveColor,
    ...props 
  }, ref) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange(e.target.checked);
    };

    // Size Configurations
    const sizes = {
      sm: {
        track: "w-8 h-4",
        thumb: "h-3 w-3",
        translate: "translate-x-4",
        label: "text-xs"
      },
      md: {
        track: "w-11 h-6",
        thumb: "h-5 w-5",
        translate: "translate-x-5",
        label: "text-sm"
      },
      lg: {
        track: "w-14 h-7",
        thumb: "h-6 w-6",
        translate: "translate-x-7",
        label: "text-base"
      }
    };

    const currentSize = sizes[size];

    return (
      <label 
        className={cn(
          "group flex items-start gap-3 relative select-none", 
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className
        )}
      >
        <div className="relative flex items-center pt-0.5">
           <input
            type="checkbox"
            className="peer sr-only"
            ref={ref}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            {...props}
          />
          
          <div 
            className={cn(
                "rounded-full transition-colors duration-200 border-2 border-transparent peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2",
                currentSize.track,
                checked 
                    ? (activeColor || "bg-indigo-600") 
                    : (inactiveColor || "bg-slate-200 group-hover:bg-slate-300"),
                error && !checked && "bg-red-200",
                error && checked && "bg-red-600"
            )}
          >
             <div 
                className={cn(
                    "bg-white rounded-full shadow-sm ring-0 transition-transform duration-200 flex items-center justify-center",
                    currentSize.thumb,
                    checked ? currentSize.translate : "translate-x-0"
                )}
             >
                 {thumbIcon && (
                     <div className={cn("text-current transition-colors duration-200", checked ? "text-indigo-600" : "text-slate-400")}>
                         {thumbIcon}
                     </div>
                 )}
             </div>
          </div>
        </div>

        {(label || description) && (
          <div className="grid gap-0.5 leading-none">
            {label && (
              <span className={cn(
                "font-medium transition-colors",
                currentSize.label,
                error ? "text-red-600" : "text-slate-700",
                disabled && "text-slate-400"
              )}>
                {label}
              </span>
            )}
            {description && (
              <p className={cn("text-[0.8rem]", error ? "text-red-500" : "text-slate-500")}>
                {description}
              </p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = "Switch";