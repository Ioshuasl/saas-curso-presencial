import React, { useState, useRef, useEffect, useId } from 'react';
import { Calendar as CalendarIcon, Clock, X, Check } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../utils/cn';
import { Calendar } from './Calendar';
import { Input } from './Input';

interface DateTimePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label?: string;
  value?: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  helperText?: string;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  disabled?: boolean;
  use12HourFormat?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  className,
  minDate,
  maxDate,
  required,
  disabled,
  use12HourFormat = false,
  fullWidth = true,
  placeholder = "Selecione data e hora"
}) => {
  const instanceId = useId().replace(/:/g, '');
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'date' | 'time'>('date');
  const containerRef = useRef<HTMLDivElement>(null);
  const [popoverSide, setPopoverSide] = useState<'bottom' | 'top'>('bottom');
  
  // Time scrolling refs
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

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

  // Reset view when opening
  useEffect(() => {
    if (isOpen) {
      setView('date');
    }
  }, [isOpen]);

  // Handle auto-positioning
  useEffect(() => {
    if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const requiredHeight = 400; 

        if (spaceBelow < requiredHeight && spaceAbove > spaceBelow) {
            setPopoverSide('top');
        } else {
            setPopoverSide('bottom');
        }
    }
  }, [isOpen]);

  // Scroll to time when view changes to time
  useEffect(() => {
    if (isOpen && view === 'time' && value) {
        setTimeout(() => {
            const hStr = value.getHours().toString().padStart(2, '0');
            const mStr = value.getMinutes().toString().padStart(2, '0');
            
            // Logic for 12h scroll target
            let scrollH = hStr;
            let period = 'AM';
            if (use12HourFormat) {
                const h = parseInt(hStr);
                period = h >= 12 ? 'PM' : 'AM';
                let h12 = h;
                if (h > 12) h12 -= 12;
                if (h === 0) h12 = 12;
                scrollH = h12.toString().padStart(2, '0');
            }

            if (hoursRef.current) {
                const el = containerRef.current?.querySelector(`[data-dt-id="${instanceId}-hour-${scrollH}"]`);
                if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
            if (minutesRef.current) {
                const el = containerRef.current?.querySelector(`[data-dt-id="${instanceId}-minute-${mStr}"]`);
                if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
            if (use12HourFormat && periodRef.current) {
                 const el = containerRef.current?.querySelector(`[data-dt-id="${instanceId}-period-${period}"]`);
                 if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
        }, 10);
    }
  }, [isOpen, view, value, use12HourFormat, instanceId]);

  const handleDateSelect = (newDate: Date) => {
    // Preserve time if exists, otherwise set default time (e.g. 09:00 or current)
    const currentHours = value ? value.getHours() : 9;
    const currentMinutes = value ? value.getMinutes() : 0;
    
    const updatedDate = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
        currentHours,
        currentMinutes
    );
    
    onChange(updatedDate);
    setView('time'); // Auto-switch to time view for better UX
  };

  const handleTimeChange = (type: 'hour' | 'minute' | 'period', val: string) => {
      let baseDate = value || new Date(); // If no date selected yet, assume today
      
      let newH = baseDate.getHours();
      let newM = baseDate.getMinutes();

      if (type === 'hour') {
          let h = parseInt(val);
          if (use12HourFormat) {
              const currentPeriod = newH >= 12 ? 'PM' : 'AM';
              if (currentPeriod === 'PM' && h !== 12) h += 12;
              if (currentPeriod === 'AM' && h === 12) h = 0;
          }
          newH = h;
      } else if (type === 'minute') {
          newM = parseInt(val);
      } else if (type === 'period') {
          // Switching AM/PM
          if (val === 'AM' && newH >= 12) newH -= 12;
          if (val === 'PM' && newH < 12) newH += 12;
      }

      const updatedDate = new Date(baseDate);
      updatedDate.setHours(newH);
      updatedDate.setMinutes(newM);
      onChange(updatedDate);
  };

  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
  };

  const getDisplayValue = () => {
    if (!value || !isValid(value)) return "";
    const dateFormat = "dd 'de' MMM, yyyy";
    const timeFormat = use12HourFormat ? "hh:mm a" : "HH:mm";
    return format(value, `${dateFormat} 'às' ${timeFormat}`, { locale: ptBR });
  };

  // Time Generation
  const hours24 = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const hours12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  
  const currentHoursList = use12HourFormat ? hours12 : hours24;

  const getSelectedTimeParts = () => {
      if (!value) return { h: null, m: null, p: null };
      const hRaw = value.getHours();
      const mRaw = value.getMinutes();
      
      let hStr = hRaw.toString().padStart(2, '0');
      let pStr = hRaw >= 12 ? 'PM' : 'AM';
      
      if (use12HourFormat) {
          let h12 = hRaw;
          if (h12 > 12) h12 -= 12;
          if (h12 === 0) h12 = 12;
          hStr = h12.toString().padStart(2, '0');
      }

      return {
          h: hStr,
          m: mRaw.toString().padStart(2, '0'),
          p: pStr
      };
  };

  const { h: selectedH, m: selectedM, p: selectedP } = getSelectedTimeParts();

  const hideScrollbarStyle = {
      scrollbarWidth: 'none' as const,
      msOverflowStyle: 'none' as const,
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
            endIcon={value && !disabled ? (
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
                  "absolute left-0 z-50 w-full sm:w-[320px] bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100",
                  popoverSide === 'bottom' ? "top-[calc(100%+4px)] origin-top" : "bottom-[calc(100%+4px)] origin-bottom"
              )}
          >
             
             {/* Tabs Header */}
             <div className="flex border-b border-slate-100">
                 <button
                    type="button"
                    onClick={() => setView('date')}
                    className={cn(
                        "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                        view === 'date' 
                            ? "text-primary-600 bg-primary-50/50 border-b-2 border-primary-600" 
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    )}
                 >
                     <CalendarIcon size={14} />
                     Data
                 </button>
                 <div className="w-[1px] bg-slate-100" />
                 <button
                    type="button"
                    onClick={() => setView('time')}
                    disabled={!value} // Optional: disable time if no date selected? keeping enabled is more flexible
                    className={cn(
                        "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                        view === 'time' 
                            ? "text-primary-600 bg-primary-50/50 border-b-2 border-primary-600" 
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
                        !value && "opacity-50 cursor-not-allowed"
                    )}
                 >
                     <Clock size={14} />
                     Hora
                 </button>
             </div>

             {/* Content */}
             <div className="bg-white">
                 {view === 'date' ? (
                     <Calendar
                        selectedDate={value}
                        onSelect={handleDateSelect}
                        minDate={minDate}
                        maxDate={maxDate}
                        className="border-0 shadow-none rounded-none"
                     />
                 ) : (
                     /* Time View Re-implementation */
                     <div className="h-[320px] flex flex-col">
                        <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50 text-slate-500 shrink-0">
                            <div className="py-2 text-center text-[10px] font-bold uppercase tracking-wider">Hora</div>
                            <div className={cn("py-2 text-center text-[10px] font-bold uppercase tracking-wider", use12HourFormat && "col-span-2 grid grid-cols-2 divide-x divide-slate-100")}>
                                {!use12HourFormat && "Minuto"}
                                {use12HourFormat && (
                                    <>
                                        <div>Minuto</div>
                                        <div>Period</div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 relative flex overflow-hidden">
                             {/* Hours */}
                            <div ref={hoursRef} className="flex-1 overflow-y-auto scroll-smooth py-24" style={hideScrollbarStyle}>
                                <div className="space-y-1 px-2">
                                    {currentHoursList.map(h => (
                                        <button
                                            key={h}
                                            data-dt-id={`${instanceId}-hour-${h}`}
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); handleTimeChange('hour', h); }}
                                            className={cn(
                                                "w-full text-center py-1 rounded-md text-sm transition-all duration-200",
                                                selectedH === h ? "bg-primary-50 text-primary-700 font-bold scale-110" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                            )}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="w-[1px] bg-slate-100 h-full" />

                            {/* Minutes */}
                            <div ref={minutesRef} className="flex-1 overflow-y-auto scroll-smooth py-24" style={hideScrollbarStyle}>
                                <div className="space-y-1 px-2">
                                    {minutes.map(m => (
                                        <button
                                            key={m}
                                            data-dt-id={`${instanceId}-minute-${m}`}
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); handleTimeChange('minute', m); }}
                                            className={cn(
                                                "w-full text-center py-1 rounded-md text-sm transition-all duration-200",
                                                selectedM === m ? "bg-primary-50 text-primary-700 font-bold scale-110" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                            )}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* AM/PM */}
                            {use12HourFormat && (
                                <>
                                <div className="w-[1px] bg-slate-100 h-full" />
                                <div ref={periodRef} className="flex-1 overflow-y-auto scroll-smooth py-24" style={hideScrollbarStyle}>
                                    <div className="space-y-1 px-2">
                                        {['AM', 'PM'].map(p => (
                                            <button
                                                key={p}
                                                data-dt-id={`${instanceId}-period-${p}`}
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); handleTimeChange('period', p); }}
                                                className={cn(
                                                    "w-full text-center py-1 rounded-md text-sm transition-all duration-200",
                                                    selectedP === p ? "bg-primary-50 text-primary-700 font-bold scale-110" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                                )}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                </>
                            )}
                             <div className="absolute top-1/2 left-2 right-2 -translate-y-1/2 h-8 rounded-lg border border-primary-200 pointer-events-none opacity-50" />
                        </div>
                     </div>
                 )}
             </div>

             {/* Footer Actions */}
             <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                 <button
                    type="button"
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1 hover:bg-slate-100 rounded"
                    onClick={() => setIsOpen(false)}
                 >
                     Cancelar
                 </button>
                 <button
                    type="button"
                    className="text-xs bg-primary-600 text-white hover:bg-primary-700 font-medium px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-colors shadow-sm"
                    onClick={() => setIsOpen(false)}
                 >
                     <Check size={12} />
                     Pronto
                 </button>
             </div>
          </div>
      )}
    </div>
  );
};