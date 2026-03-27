import React from 'react';
import { cn } from '../../utils/cn';

interface ColorPickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const ColorPicker = React.forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ label, error, helperText, className, value, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1.5 w-full", className)}>
        {label && (
          <label className={cn("text-sm font-medium leading-none", error ? "text-red-600" : "text-slate-700")}>
            {label}
          </label>
        )}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <input
              type="color"
              ref={ref}
              value={value}
              className="h-10 w-10 cursor-pointer rounded-md border border-slate-200 p-1 bg-white hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
              {...props}
            />
          </div>
          <div className="flex-1">
             <div className="h-10 px-3 py-2 w-full rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-600 font-mono uppercase flex items-center">
                {String(value)}
             </div>
          </div>
        </div>
        {(helperText || error) && (
          <p className={cn("text-[0.8rem]", error ? "text-red-600 font-medium" : "text-slate-500")}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';