import React, { useState } from 'react';
import { Eye, EyeOff, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  startIcon?: React.ReactNode;
  startIconGap?: 'tight' | 'normal' | 'wide';
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = "text", 
    label, 
    helperText, 
    error, 
    success, 
    startIcon, 
    endIcon, 
    fullWidth = true, 
    disabled, 
    readOnly,
    required,
    size = 'md',
    startIconGap = 'normal',
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    // Size configuration
    const sizeClasses = {
      sm: "h-8 text-xs px-2.5",
      md: "h-10 text-sm px-3",
      lg: "h-12 text-base px-4"
    };

    const baseStyles = "flex w-full rounded-md border bg-white text-slate-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 transition-all duration-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-offset-slate-900 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800";
    
    // ReadOnly style for CRM (often distinguishable from disabled)
    const readOnlyStyles = readOnly 
      ? "bg-slate-50 border-slate-200 text-slate-600 focus-visible:ring-0 cursor-default dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
      : "";

    const stateStyles = error
      ? "border-red-500 focus-visible:ring-red-500/30 text-red-900"
      : success
      ? "border-green-500 focus-visible:ring-green-500/30 text-green-900"
      : "border-slate-300 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 hover:border-slate-400 text-slate-900 dark:border-slate-700 dark:hover:border-slate-600 dark:text-slate-100";

    const startIconLayoutBySize = {
      sm: {
        tight: { icon: "left-2", inputPadding: "pl-7" },
        normal: { icon: "left-2.5", inputPadding: "pl-8" },
        wide: { icon: "left-2.5", inputPadding: "pl-9" },
      },
      md: {
        tight: { icon: "left-3", inputPadding: "pl-9" },
        normal: { icon: "left-3", inputPadding: "pl-10" },
        wide: { icon: "left-3", inputPadding: "pl-12" },
      },
      lg: {
        tight: { icon: "left-3.5", inputPadding: "pl-10" },
        normal: { icon: "left-4", inputPadding: "pl-12" },
        wide: { icon: "left-4", inputPadding: "pl-14" },
      },
    } as const;

    const startIconLayout = startIconLayoutBySize[size][startIconGap];

    const paddingLeft = startIcon ? startIconLayout.inputPadding : "";
    const paddingRight = (endIcon || isPassword || error || success) ? (size === 'sm' ? "pr-8" : "pr-10") : "";

    const iconSize = size === 'sm' ? 14 : 16;
    const iconPos = startIconLayout.icon;
    const iconPosRight = size === 'sm' ? "right-2.5" : "right-3";

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "w-auto", className)}>
        {label && (
          <label 
            htmlFor={props.id} 
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1",
              error ? "text-red-600" : "text-slate-700 dark:text-slate-200"
            )}
          >
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative group">
          {startIcon && (
            <div className={cn("absolute top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none transition-colors group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300", iconPos)}>
              {startIcon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(baseStyles, sizeClasses[size], stateStyles, readOnlyStyles, paddingLeft, paddingRight)}
            ref={ref}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors dark:text-slate-500 dark:hover:text-slate-300", iconPosRight)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={iconSize} /> : <Eye size={iconSize} />}
            </button>
          )}

          {!isPassword && endIcon && (
            <div className={cn("absolute top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none dark:text-slate-400", iconPosRight)}>
              {endIcon}
            </div>
          )}

          {!isPassword && !endIcon && error && (
            <div className={cn("absolute top-1/2 -translate-y-1/2 text-red-500 pointer-events-none animate-in fade-in zoom-in duration-200", iconPosRight)}>
              <AlertCircle size={iconSize} />
            </div>
          )}
           {!isPassword && !endIcon && success && !error && (
            <div className={cn("absolute top-1/2 -translate-y-1/2 text-green-500 pointer-events-none animate-in fade-in zoom-in duration-200", iconPosRight)}>
              <CheckCircle2 size={iconSize} />
            </div>
          )}
        </div>
        
        {(helperText || error) && (
          <p className={cn("text-[0.8rem] transition-all", error ? "text-red-600 font-medium" : "text-slate-500 dark:text-slate-400")}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";