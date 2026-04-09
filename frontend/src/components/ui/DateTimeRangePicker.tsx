import { addMonths, endOfMonth, endOfWeek, format, isValid, setHours, setMinutes, startOfMonth, startOfWeek, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { Calendar } from './Calendar';
import { Input } from './Input';
import { TimePicker } from './TimePicker';

interface DateTimeRangePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
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
  use12HourFormat?: boolean;
}

export const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = ({
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
  placeholder = "Retirada - Devolução",
  use12HourFormat = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popoverSide, setPopoverSide] = useState<'bottom' | 'top'>('bottom');
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : false));

  // Controlled navigation state for calendar
  const [viewDate, setViewDate] = useState<Date>(() => startDate || new Date());

  // Internal state for times to allow independent manipulation before applying
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  // Sync internal time state when props change
  useEffect(() => {
    if (startDate) {
        const h = startDate.getHours().toString().padStart(2, '0');
        const m = startDate.getMinutes().toString().padStart(2, '0');
        setStartTime(`${h}:${m}`);
    } else {
        setStartTime(null);
    }

    if (endDate) {
        const h = endDate.getHours().toString().padStart(2, '0');
        const m = endDate.getMinutes().toString().padStart(2, '0');
        setEndTime(`${h}:${m}`);
    } else {
        setEndTime(null);
    }

    if (isOpen && startDate) {
        setViewDate(startDate);
    }
  }, [startDate, endDate, isOpen]);

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
        const requiredHeight = 520; // Approx height for this large component

        // Prefer bottom, switch to top if not enough space below AND more space above
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
      // When picking a date from calendar, try to preserve the existing time or default to current/start of day
      let newStart = start;
      let newEnd = end;

      if (newStart) {
          if (startTime) {
              const [h, m] = startTime.split(':').map(Number);
              newStart = setMinutes(setHours(newStart, h), m);
          } else {
              // Default start time: 10:00 as a standard rental start
              newStart = setMinutes(setHours(newStart, 10), 0);
          }
      }

      if (newEnd) {
          if (endTime) {
              const [h, m] = endTime.split(':').map(Number);
              newEnd = setMinutes(setHours(newEnd, h), m);
          } else {
              // Default end time: same as start time usually, or 10:00
              newEnd = setMinutes(setHours(newEnd, 10), 0);
          }
      }

      onChange(newStart, newEnd);
  };

  const handleTimeChange = (type: 'start' | 'end', timeStr: string | null) => {
      if (!timeStr) return; // Handle clearing logic if needed

      const [h, m] = timeStr.split(':').map(Number);

      if (type === 'start' && startDate) {
          const newDate = setMinutes(setHours(startDate, h), m);
          onChange(newDate, endDate ?? null);
      }

      if (type === 'end' && endDate) {
          const newDate = setMinutes(setHours(endDate, h), m);
          onChange(startDate ?? null, newDate);
      }
  };

  const handleClear = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      onChange(null, null);
  };

  const handlePreset = (preset: 'today' | 'weekend' | 'nextWeek' | 'thisMonth') => {
      const now = new Date();
      let start: Date;
      let end: Date;

      // Helper to set standard business hours (e.g. 09:00 to 18:00)
      const setBusinessTime = (d: Date, h: number) => setMinutes(setHours(d, h), 0);

      switch(preset) {
          case 'today':
              start = setBusinessTime(now, 9);
              end = setBusinessTime(now, 18);
              break;
          case 'weekend':
              // Simple "Next 3 Days" logic
              start = setBusinessTime(now, 10);
              end = setBusinessTime(subDays(now, -3), 10);
              break;
          case 'nextWeek':
              const nextWeekStart = startOfWeek(subDays(now, -7), { weekStartsOn: 1 });
              start = setBusinessTime(nextWeekStart, 9);
              end = setBusinessTime(endOfWeek(nextWeekStart, { weekStartsOn: 1 }), 18);
              break;
          case 'thisMonth':
              start = setBusinessTime(startOfMonth(now), 9);
              end = setBusinessTime(endOfMonth(now), 18);
              break;
          default:
              return;
      }
      onChange(start, end);
      setViewDate(start);
  };

  const getDisplayValue = () => {
    if (!startDate) return "";

    const timeFormat = use12HourFormat ? "hh:mm a" : "HH:mm";
    const startStr = isValid(startDate) ? format(startDate, `dd/MM/yyyy ${timeFormat}`, { locale: ptBR }) : "";

    if (!endDate) {
        return `${startStr} - ...`;
    }

    const endStr = isValid(endDate) ? format(endDate, `dd/MM/yyyy ${timeFormat}`, { locale: ptBR }) : "";
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
                "absolute left-0 z-50 w-[300px] sm:w-auto sm:min-w-[550px] lg:min-w-[750px] animate-in fade-in zoom-in-95 duration-100",
                popoverSide === 'bottom' ? "top-[calc(100%+4px)] origin-top" : "bottom-[calc(100%+4px)] origin-bottom"
            )}
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col sm:flex-row">

             {/* Presets Sidebar */}
             <div className="bg-slate-50 border-b sm:border-b-0 sm:border-r border-slate-200 p-2 sm:p-3 sm:w-[140px] flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-visible">
                <button type="button" onClick={() => handlePreset('today')} className="text-left px-3 py-2 text-sm text-slate-600 hover:bg-white hover:text-primary-600 hover:shadow-sm rounded-md transition-all whitespace-nowrap">
                    Hoje (Comercial)
                </button>
                <button type="button" onClick={() => handlePreset('weekend')} className="text-left px-3 py-2 text-sm text-slate-600 hover:bg-white hover:text-primary-600 hover:shadow-sm rounded-md transition-all whitespace-nowrap">
                    3 Diárias
                </button>
                <button type="button" onClick={() => handlePreset('nextWeek')} className="text-left px-3 py-2 text-sm text-slate-600 hover:bg-white hover:text-primary-600 hover:shadow-sm rounded-md transition-all whitespace-nowrap">
                    Próxima Semana
                </button>
                <button type="button" onClick={() => handlePreset('thisMonth')} className="text-left px-3 py-2 text-sm text-slate-600 hover:bg-white hover:text-primary-600 hover:shadow-sm rounded-md transition-all whitespace-nowrap">
                    Este Mês
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
                            hideNextButton={isDesktop}
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

                {/* Time Selection Row */}
                <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Retirada (Início)</label>
                        <TimePicker
                            value={startTime}
                            onChange={(val) => handleTimeChange('start', val)}
                            disabled={!startDate}
                            use12HourFormat={use12HourFormat}
                            placeholder="--:--"
                            className="bg-white"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Devolução (Fim)</label>
                        <TimePicker
                            value={endTime}
                            onChange={(val) => handleTimeChange('end', val)}
                            disabled={!endDate}
                            use12HourFormat={use12HourFormat}
                            placeholder="--:--"
                            className="bg-white"
                        />
                    </div>
                </div>

                {/* Footer with Info & Actions */}
                <div className="p-3 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500 hidden lg:flex">
                        {startDate && endDate ? (
                            <span>
                                Duração: <span className="font-semibold text-primary-700">{Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} dias</span>
                            </span>
                        ) : (
                            <span>Selecione o período</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
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
