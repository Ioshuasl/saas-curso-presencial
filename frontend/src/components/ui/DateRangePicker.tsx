import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, X, Check, ArrowRight } from 'lucide-react';
import { format, isValid, addMonths, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../utils/cn';
import { Calendar } from './Calendar';
import { Input } from './Input';
import { Button } from './Button';

interface DateRangePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  error?: string;
  helperText?: string;
  minDate?: Date;
  maxDate?: Date;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label,
  startDate,
  endDate,
  onChange,
  error,
  helperText,
  className,
  minDate,
  maxDate,
  fullWidth = true,
  required,
  disabled,
  placeholder = "Selecione o período"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popoverSide, setPopoverSide] = useState<'bottom' | 'top'>('bottom');
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : false));
  
  // Controlled navigation state
  const [viewDate, setViewDate] = useState<Date>(() => startDate || new Date());

  // Reset view when opening
  useEffect(() => {
    if (isOpen) {
        setViewDate(startDate || new Date());
    }
  }, [isOpen, startDate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  // Handle auto-positioning
  useEffect(() => {
    if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const requiredHeight = 450; 

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
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRangeSelect = (start: Date | null, end: Date | null) => {
      onChange(start, end);
  };

  const handleClear = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      onChange(null, null);
  };

  const handlePreset = (preset: 'today' | 'yesterday' | 'last7' | 'thisWeek' | 'thisMonth' | 'lastMonth') => {
      const now = new Date();
      let start: Date;
      let end: Date;

      switch(preset) {
          case 'today':
              start = now;
              end = now;
              break;
          case 'yesterday':
              start = subDays(now, 1);
              end = subDays(now, 1);
              break;
          case 'thisWeek':
              start = startOfWeek(now, { weekStartsOn: 0 });
              end = endOfWeek(now, { weekStartsOn: 0 });
              break;
          case 'last7':
              start = subDays(now, 6); // 6 days ago + today = 7 days
              end = now;
              break;
          case 'thisMonth':
              start = startOfMonth(now);
              end = endOfMonth(now);
              break;
          case 'lastMonth':
              const lastMonth = subMonths(now, 1);
              start = startOfMonth(lastMonth);
              end = endOfMonth(lastMonth);
              break;
          default:
              return;
      }
      onChange(start, end);
      setViewDate(start);
  };

  const getDisplayValue = () => {
    if (!startDate) return "";
    
    const startStr = isValid(startDate) ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "";
    
    if (!endDate) {
        return `${startStr} - ...`;
    }

    const endStr = isValid(endDate) ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "";
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className={cn("relative flex flex-col gap-1.5", fullWidth ? "w-full" : "w-auto", className)} ref={containerRef}>
      <div onClick={() => !disabled && setIsOpen(!isOpen)}>
        <Input
            label={label}
            placeholder={placeholder}
            value={getDisplayValue()}
            readOnly
            error={error}
            helperText={helperText}
            startIcon={<CalendarIcon size={16} />}
            endIcon={startDate && !disabled ? (
                <button 
                    type="button" 
                    onClick={handleClear} 
                    className="hover:bg-slate-100 p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={14} />
                </button>
            ) : undefined}
            className={cn("cursor-pointer", isOpen && "ring-2 ring-primary-500 ring-offset-1 border-primary-500")}
            disabled={disabled}
            required={required}
        />
      </div>

      {isOpen && !disabled && (
        <div 
            className={cn(
                "absolute left-0 z-50 w-[300px] sm:w-auto sm:min-w-[550px] lg:min-w-[700px] animate-in fade-in zoom-in-95 duration-100",
                popoverSide === 'bottom' ? "top-[calc(100%+4px)] origin-top" : "bottom-[calc(100%+4px)] origin-bottom"
            )}
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col sm:flex-row">
             
             {/* Presets Sidebar */}
             <div className="bg-slate-50 border-b sm:border-b-0 sm:border-r border-slate-200 p-2 sm:p-3 sm:w-[140px] flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-visible">
                <button type="button" onClick={() => handlePreset('today')} className="text-left px-3 py-2 text-sm text-slate-600 hover:bg-white hover:text-primary-600 hover:shadow-sm rounded-md transition-all whitespace-nowrap">
                    Hoje
                </button>
                <button type="button" onClick={() => handlePreset('yesterday')} className="text-left px-3 py-2 text-sm text-slate-600 hover:bg-white hover:text-primary-600 hover:shadow-sm rounded-md transition-all whitespace-nowrap">
                    Ontem
                </button>
                <button type="button" onClick={() => handlePreset('thisWeek')} className="text-left px-3 py-2 text-sm text-slate-600 hover:bg-white hover:text-primary-600 hover:shadow-sm rounded-md transition-all whitespace-nowrap">
                    Esta semana
                </button>
                <button type="button" onClick={() => handlePreset('last7')} className="text-left px-3 py-2 text-sm text-slate-600 hover:bg-white hover:text-primary-600 hover:shadow-sm rounded-md transition-all whitespace-nowrap">
                    Últimos 7 dias
                </button>
                <button type="button" onClick={() => handlePreset('thisMonth')} className="text-left px-3 py-2 text-sm text-slate-600 hover:bg-white hover:text-primary-600 hover:shadow-sm rounded-md transition-all whitespace-nowrap">
                    Este mês
                </button>
                 <button type="button" onClick={() => handlePreset('lastMonth')} className="text-left px-3 py-2 text-sm text-slate-600 hover:bg-white hover:text-primary-600 hover:shadow-sm rounded-md transition-all whitespace-nowrap">
                    Mês passado
                </button>
             </div>

             {/* Main Content Area */}
             <div className="flex-1 flex flex-col">
                {/* Calendars Container */}
                <div className="flex flex-col md:flex-row p-4 gap-4 md:gap-8">
                    {/* Left Calendar */}
                    <div className="flex-1">
                        <Calendar
                            mode="range"
                            startDate={startDate}
                            endDate={endDate}
                            onRangeSelect={handleRangeSelect}
                            minDate={minDate}
                            maxDate={maxDate}
                            className="border-0 shadow-none p-0"
                            displayMonth={viewDate}
                            onMonthChange={setViewDate}
                            hideNextButton={isDesktop} // Hide next button on desktop to force use of right calendar
                        />
                    </div>
                    
                    {/* Right Calendar (Desktop Only) */}
                    <div className="hidden md:block flex-1 border-l border-slate-100 pl-8">
                        <Calendar
                            mode="range"
                            startDate={startDate}
                            endDate={endDate}
                            onRangeSelect={handleRangeSelect}
                            minDate={minDate}
                            maxDate={maxDate}
                            className="border-0 shadow-none p-0"
                            displayMonth={addMonths(viewDate, 1)}
                            onMonthChange={(date) => setViewDate(addMonths(date, -1))}
                            hidePrevButton
                        />
                    </div>
                </div>

                {/* Footer with Info & Actions */}
                <div className="p-3 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm">
                        <div className={cn("px-3 py-1.5 rounded-md border text-center min-w-[100px]", startDate ? "bg-white border-primary-200 text-primary-700 font-medium shadow-sm" : "bg-slate-100 border-slate-200 text-slate-400")}>
                            {startDate ? format(startDate, "dd/MM/yyyy") : "Início"}
                        </div>
                        <ArrowRight size={14} className="text-slate-400" />
                        <div className={cn("px-3 py-1.5 rounded-md border text-center min-w-[100px]", endDate ? "bg-white border-primary-200 text-primary-700 font-medium shadow-sm" : "bg-slate-100 border-slate-200 text-slate-400")}>
                            {endDate ? format(endDate, "dd/MM/yyyy") : "Fim"}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClear()}
                            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                        >
                            Limpar
                        </Button>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setIsOpen(false)}
                            className="flex-1 sm:flex-none"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            size="sm" 
                            onClick={() => setIsOpen(false)}
                            startIcon={<Check size={14} />}
                            disabled={!startDate || !endDate}
                            className="flex-1 sm:flex-none"
                        >
                            Aplicar
                        </Button>
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};