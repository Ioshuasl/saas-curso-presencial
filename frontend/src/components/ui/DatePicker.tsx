import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../utils/cn';
import { Calendar } from './Calendar';
import { Input } from './Input';

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size'> {
  label?: string;
  value?: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  helperText?: string;
  minDate?: Date;
  maxDate?: Date;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  className,
  minDate,
  maxDate,
  fullWidth = true,
  disabled,
  placeholder = "Selecione uma data",
  required,
  size,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverSide, setPopoverSide] = useState<'bottom' | 'top'>('bottom');
  const [isMobile, setIsMobile] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  // Handle auto-positioning for inline popover/mobile
  useEffect(() => {
    if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const requiredHeight = 350; // Approximate Calendar height

        if (spaceBelow < requiredHeight && spaceAbove > spaceBelow) {
            setPopoverSide('top');
        } else {
            setPopoverSide('bottom');
        }
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!popoverRef.current || !popoverRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || isMobile || !containerRef.current) return;

    const updatePosition = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const requiredHeight = 350;
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldOpenTop = spaceBelow < requiredHeight && rect.top > spaceBelow;
      const width = Math.max(rect.width, 320);
      const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);

      setPopoverStyle({
        position: 'fixed',
        top: shouldOpenTop ? rect.top - 4 : rect.bottom + 4,
        left,
        width,
        zIndex: 90,
        transform: shouldOpenTop ? 'translateY(-100%)' : undefined,
      });
      setPopoverSide(shouldOpenTop ? 'top' : 'bottom');
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, isMobile]);

  const handleSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const displayValue = value && isValid(value) 
    ? format(value, "dd 'de' MMMM, yyyy", { locale: ptBR }) 
    : "";

  return (
    <div className={cn("relative", fullWidth ? "w-full" : "w-auto", className)} ref={containerRef}>
      <div onClick={() => !disabled && setIsOpen(!isOpen)}>
        <Input
          label={label}
          placeholder={placeholder}
          value={displayValue}
          readOnly
          error={error}
          helperText={helperText}
          startIcon={<CalendarIcon size={16} />}
          endIcon={value && !disabled ? (
            <button 
                type="button" 
                onClick={handleClear} 
                className="hover:bg-slate-100 p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X size={14} />
            </button>
          ) : undefined}
          className={cn("cursor-pointer", isOpen && "border-primary-500")}
          disabled={disabled}
          required={required}
          size={size}
          {...props}
        />
      </div>

      {isOpen && !disabled && (
        isMobile ? (
          <div className="fixed inset-0 z-[70] flex items-end bg-slate-900/50 p-3 sm:items-center sm:justify-center">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
              <div className="mb-2 flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-slate-700">Selecionar data</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>
              <Calendar
                selectedDate={value}
                onSelect={handleSelect}
                minDate={minDate}
                maxDate={maxDate}
                className="shadow-none ring-0 border-slate-200"
              />
            </div>
          </div>
        ) : createPortal(
          <div
            ref={popoverRef}
            style={popoverStyle}
            className={cn(
              "animate-in fade-in zoom-in-95 duration-100",
              popoverSide === 'bottom' ? 'origin-top' : 'origin-bottom',
            )}
          >
            <Calendar
              selectedDate={value}
              onSelect={handleSelect}
              minDate={minDate}
              maxDate={maxDate}
              className="shadow-xl ring-0 border-slate-200"
            />
          </div>,
          document.body,
        )
      )}
    </div>
  );
};