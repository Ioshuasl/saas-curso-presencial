import { Check, Copy, Eraser } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  autoResize?: boolean;
  showCount?: boolean;
  maxLength?: number;
  allowCopy?: boolean;
  allowClear?: boolean;
  onClear?: () => void;
  bottomContent?: React.ReactNode; // Slot for custom bottom actions (e.g. attachments)
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    label,
    helperText,
    error,
    fullWidth = true,
    required,
    readOnly,
    disabled,
    autoResize = false,
    showCount = false,
    maxLength,
    allowCopy = false,
    allowClear = false,
    onClear,
    value,
    onChange,
    bottomContent,
    ...props
  }, ref) => {

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [copied, setCopied] = useState(false);
    // Internal state to track length if uncontrolled, though controlled is recommended
    const [textLength, setTextLength] = useState(0);

    // Handle Ref merging
    useEffect(() => {
        if (!ref) return;
        if (typeof ref === 'function') {
            ref(textareaRef.current);
        } else {
            (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = textareaRef.current;
        }
    }, [ref]);

    // Auto Resize Logic
    useEffect(() => {
        if (!autoResize || !textareaRef.current) return;

        const adjustHeight = () => {
            const el = textareaRef.current;
            if (el) {
                el.style.height = 'auto'; // Reset to calculate shrink
                el.style.height = `${el.scrollHeight + 2}px`; // +2 for border
            }
        };

        adjustHeight();
    }, [value, autoResize]);

    // Update length for uncontrolled inputs
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextLength(e.target.value.length);
        if (onChange) onChange(e);
    };

    // Calculate current length based on controlled value or internal state
    const currentLength = typeof value === 'string' ? value.length : textLength;

    // Copy Handler
    const handleCopy = async () => {
        if (textareaRef.current) {
            await navigator.clipboard.writeText(textareaRef.current.value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Clear Handler
    const handleClear = () => {
        if (textareaRef.current) {
            // Trigger a native change event for React controlled inputs
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
            nativeInputValueSetter?.call(textareaRef.current, '');

            const event = new Event('input', { bubbles: true });
            textareaRef.current.dispatchEvent(event);

            // Also call onChange manually if provided (simulating the event)
            if (onChange) {
               const syntheticEvent = {
                   ...event,
                   target: textareaRef.current,
                   currentTarget: textareaRef.current
               } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
               onChange(syntheticEvent);
            }

            if (onClear) onClear();
            setTextLength(0);
        }
    };

    const readOnlyStyles = readOnly
    ? "bg-slate-50 border-slate-200 text-slate-600 focus-visible:ring-0 cursor-default dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
    : "";

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "w-auto", className)}>
        {/* Header Label */}
        {label && (
          <label
             htmlFor={props.id}
             className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1",
              error ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200"
            )}
          >
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative group">
            <textarea
              ref={textareaRef}
              className={cn(
                "flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 transition-all duration-200 resize-y",
                "dark:bg-slate-900 dark:ring-offset-slate-900 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800 dark:text-slate-100",
                error
                  ? "border-red-500 focus-visible:ring-red-500/30 text-red-900 dark:text-red-300"
                  : "border-slate-300 focus-visible:ring-primary-500/30 focus-visible:border-primary-500 hover:border-slate-400 text-slate-900 dark:border-slate-700 dark:hover:border-slate-600 dark:text-slate-100",
                autoResize && "overflow-hidden resize-none",
                (allowCopy || allowClear) && "pr-16", // Space for buttons
                readOnlyStyles
              )}
              maxLength={maxLength}
              value={value}
              onChange={handleChange}
              readOnly={readOnly}
              disabled={disabled}
              required={required}
              {...props}
            />

            {/* Top Right Actions */}
            {(allowCopy || allowClear) && !disabled && !readOnly && (
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-md border border-slate-100 shadow-sm p-0.5 dark:bg-slate-900/80 dark:border-slate-700">
                    {allowCopy && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors dark:text-slate-500 dark:hover:bg-primary-900/30"
                            title="Copiar"
                        >
                            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                        </button>
                    )}
                    {allowClear && (currentLength > 0) && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors dark:text-slate-500 dark:hover:bg-red-900/30"
                            title="Limpar texto"
                        >
                            <Eraser size={14} />
                        </button>
                    )}
                </div>
            )}
        </div>

        {/* Footer Info (Helper Text, Bottom Content, Counter) */}
        <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
                {(helperText || error) && (
                  <p className={cn("text-[0.8rem]", error ? "text-red-600 dark:text-red-400 font-medium" : "text-slate-500 dark:text-slate-400")}>
                    {error || helperText}
                  </p>
                )}
                {bottomContent}
            </div>

            {showCount && maxLength && (
                 <span className={cn(
                     "text-[0.7rem] font-mono shrink-0 pt-0.5",
                     currentLength >= maxLength ? "text-red-600 dark:text-red-400 font-bold" :
                     currentLength >= maxLength * 0.9 ? "text-orange-500 dark:text-orange-400" : "text-slate-400 dark:text-slate-500"
                 )}>
                     {currentLength}/{maxLength}
                 </span>
            )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
