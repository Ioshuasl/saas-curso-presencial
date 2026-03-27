import React, { useRef, useEffect, useState } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'checked'> {
  label?: string;
  description?: string;
  checked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean) => void;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, onCheckedChange, error, disabled, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [internalChecked, setInternalChecked] = useState<boolean>(false);
    const isControlled = checked !== undefined;
    const resolvedChecked = isControlled ? checked : internalChecked;

    // Sync indeterminate state manually as it is not an HTML attribute
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = resolvedChecked === 'indeterminate';
      }
    }, [resolvedChecked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
    };

    const isChecked = resolvedChecked === true || resolvedChecked === 'indeterminate';

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
            ref={(node) => {
              // Handle both local ref and forwarded ref
              inputRef.current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
            }}
            checked={resolvedChecked === true}
            onChange={handleChange}
            disabled={disabled}
            {...props}
          />
          
          <div
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all duration-200 shadow-sm",
              // Base State
              "bg-white border-slate-300 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2 dark:bg-slate-900 dark:border-slate-600 dark:peer-focus-visible:ring-offset-slate-900",
              // Checked/Indeterminate State
              isChecked 
                ? "bg-indigo-600 border-indigo-600 text-white dark:bg-primary-500 dark:border-primary-500" 
                : "hover:border-primary-400 hover:bg-slate-50 dark:hover:border-primary-400 dark:hover:bg-slate-800",
              // Error State
              error && !isChecked && "border-red-500 peer-focus-visible:ring-red-500",
              error && isChecked && "bg-red-600 border-red-600"
            )}
          >
            {resolvedChecked === true && (
              <Check
                size={14}
                strokeWidth={3}
                className="shrink-0 text-white opacity-100 transition-opacity duration-150"
              />
            )}
            {resolvedChecked === 'indeterminate' && (
              <Minus
                size={14}
                strokeWidth={3}
                className="shrink-0 text-white opacity-100 transition-opacity duration-150"
              />
            )}
          </div>
        </div>

        {(label || description) && (
          <div className="grid gap-1 leading-none">
            {label && (
              <span className={cn(
                "text-sm font-medium transition-colors", 
                error ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200",
                disabled && "text-slate-400 dark:text-slate-500"
              )}>
                {label}
              </span>
            )}
            {description && (
              <p className={cn("text-[0.8rem]", error ? "text-red-500 dark:text-red-400" : "text-slate-500 dark:text-slate-400")}>
                {description}
              </p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";