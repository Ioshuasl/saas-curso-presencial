import React, { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { Clock, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Input } from './Input';

interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size'> {
  label?: string;
  value?: string | null; // Format "HH:mm" (Always 24h for data consistency)
  onChange: (time: string | null) => void;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  use12HourFormat?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  className,
  fullWidth = true,
  disabled,
  placeholder = "Select time",
  required,
  size,
  use12HourFormat = false,
  ...props
}) => {
  const instanceId = useId().replace(/:/g, '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);
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

  // Parse current value
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setSelectedHour(h);
      setSelectedMinute(m);
    } else {
        setSelectedHour(null);
        setSelectedMinute(null);
    }
  }, [value]);

  // Derived state for 12h format
  const period = selectedHour ? (parseInt(selectedHour) >= 12 ? 'PM' : 'AM') : 'AM';
  const displayHour12 = selectedHour ? (() => {
      let h = parseInt(selectedHour);
      if (h === 0) return '12';
      if (h > 12) return (h - 12).toString();
      return h.toString();
  })().padStart(2, '0') : null;

  // Handle auto-positioning
  useEffect(() => {
    if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const requiredHeight = 300; // Approximate TimePicker height

        if (spaceBelow < requiredHeight && spaceAbove > spaceBelow) {
            setPopoverSide('top');
        } else {
            setPopoverSide('bottom');
        }
    }
  }, [isOpen]);

  // Scroll to selected time when opening
  useEffect(() => {
    if (isOpen) {
        // Small timeout to ensure DOM is rendered
        setTimeout(() => {
            const hourToScroll = use12HourFormat ? displayHour12 : selectedHour;
            
            if (hourToScroll && hoursRef.current) {
                const el = containerRef.current?.querySelector(`[data-time-id="${instanceId}-hour-${hourToScroll}"]`);
                if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
            if (selectedMinute && minutesRef.current) {
                const el = containerRef.current?.querySelector(`[data-time-id="${instanceId}-minute-${selectedMinute}"]`);
                if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
            if (use12HourFormat && period && periodRef.current) {
                 const el = containerRef.current?.querySelector(`[data-time-id="${instanceId}-period-${period}"]`);
                 if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
        }, 10);
    }
  }, [isOpen, selectedHour, selectedMinute, use12HourFormat, displayHour12, period, instanceId]);

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
      const requiredHeight = 320;
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldOpenTop = spaceBelow < requiredHeight && rect.top > spaceBelow;
      const minWidth = use12HourFormat ? 280 : 200;
      const width = Math.max(rect.width, minWidth);
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
  }, [isOpen, isMobile, use12HourFormat]);

  const handleHourChange = (hStr: string) => {
      let newH = parseInt(hStr);

      if (use12HourFormat) {
          // logic to convert selected 12h hour back to 24h based on current period
          if (period === 'PM') {
              if (newH !== 12) newH += 12;
          } else { // AM
              if (newH === 12) newH = 0;
          }
      }

      const finalH = newH.toString().padStart(2, '0');
      const finalM = selectedMinute || '00';
      
      setSelectedHour(finalH);
      setSelectedMinute(finalM);
      onChange(`${finalH}:${finalM}`);
  }

  const handleMinuteChange = (m: string) => {
      // If no hour selected, default to something reasonable
      const currentH = selectedHour || (use12HourFormat ? (period === 'PM' ? '12' : '00') : '00');
      setSelectedHour(currentH);
      setSelectedMinute(m);
      onChange(`${currentH}:${m}`);
  }

  const handlePeriodChange = (p: 'AM' | 'PM') => {
      // If no hour selected, default to 12
      let h = selectedHour ? parseInt(selectedHour) : 0; // 0 is 12 AM
      
      if (p === 'AM' && h >= 12) {
          h -= 12;
      } else if (p === 'PM' && h < 12) {
          h += 12;
      }

      const finalH = h.toString().padStart(2, '0');
      const finalM = selectedMinute || '00';

      setSelectedHour(finalH);
      setSelectedMinute(finalM);
      onChange(`${finalH}:${finalM}`);
  }

  const handleNow = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setSelectedHour(h);
      setSelectedMinute(m);
      onChange(`${h}:${m}`);
  };

  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      setIsOpen(false);
  };
  
  // Format for input display
  const getDisplayValue = () => {
      if (!value) return "";
      if (!use12HourFormat) return value;
      
      const [h, m] = value.split(':');
      let hour = parseInt(h);
      const p = hour >= 12 ? 'PM' : 'AM';
      if (hour > 12) hour -= 12;
      if (hour === 0) hour = 12;
      
      return `${hour}:${m} ${p}`;
  }

  const displayValue = getDisplayValue();
  
  const hours24 = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const hours12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const periods = ['AM', 'PM'];

  const currentHoursList = use12HourFormat ? hours12 : hours24;

  // Custom style to hide scrollbar but keep functionality
  const hideScrollbarStyle = {
      scrollbarWidth: 'none' as const, // Firefox
      msOverflowStyle: 'none' as const, // IE 10+
  };

  return (
      <div className={cn("relative", fullWidth ? "w-full" : "w-auto", className)} ref={containerRef}>
          <div onClick={() => !disabled && setIsOpen(!isOpen)}>
              <Input
                label={label}
                placeholder={use12HourFormat ? "--:-- --" : "--:--"}
                value={displayValue}
                readOnly
                error={error}
                helperText={helperText}
                startIcon={<Clock size={16} />}
                endIcon={value && !disabled ? (
                    <button type="button" onClick={handleClear} className="hover:bg-slate-100 p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={14} />
                    </button>
                ) : undefined}
                className={cn("cursor-pointer", isOpen && "ring-2 ring-primary-500 ring-offset-1 border-primary-500")}
                disabled={disabled}
                required={required}
                size={size}
                {...props}
              />
          </div>

          {isOpen && !disabled && (
              (isMobile ? (
                <div className="fixed inset-0 z-[70] flex items-end bg-slate-900/50 p-3 sm:items-center sm:justify-center">
                  <div className={cn(
                    "w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl",
                    use12HourFormat ? "sm:max-w-lg" : "sm:max-w-md",
                  )}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-700">Selecionar horário</h3>
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="max-h-[70dvh] overflow-hidden">
                      <div className={cn(
                          "bg-white overflow-hidden flex flex-col",
                          use12HourFormat ? "w-full" : "w-full"
                      )}>
                       <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50 text-slate-500">
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
                       
                      <div className="flex h-52 relative">
                           <div 
                                ref={hoursRef} 
                                className="flex-1 overflow-y-auto scroll-smooth py-20"
                                style={hideScrollbarStyle}
                            >
                               <div className="space-y-1 px-2">
                                   {currentHoursList.map(h => {
                                       const isSelected = use12HourFormat ? displayHour12 === h : selectedHour === h;
                                       return (
                                           <button
                                              key={h}
                                              data-time-id={`${instanceId}-hour-${h}`}
                                              type="button"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleHourChange(h);
                                              }}
                                              className={cn(
                                                  "w-full text-center py-1 rounded-md text-sm transition-all duration-200",
                                                  isSelected
                                                    ? "bg-primary-50 text-primary-700 font-bold scale-110" 
                                                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                              )}
                                           >
                                               {h}
                                           </button>
                                       );
                                   })}
                               </div>
                           </div>
                           <div className="w-[1px] bg-slate-100 h-full" />
                           <div 
                                ref={minutesRef} 
                                className="flex-1 overflow-y-auto scroll-smooth py-20"
                                style={hideScrollbarStyle}
                           >
                               <div className="space-y-1 px-2">
                                   {minutes.map(m => (
                                       <button
                                          key={m}
                                          data-time-id={`${instanceId}-minute-${m}`}
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleMinuteChange(m);
                                          }}
                                          className={cn(
                                              "w-full text-center py-1 rounded-md text-sm transition-all duration-200",
                                              selectedMinute === m 
                                                ? "bg-primary-50 text-primary-700 font-bold scale-110" 
                                                : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                          )}
                                       >
                                           {m}
                                       </button>
                                   ))}
                               </div>
                           </div>
                           {use12HourFormat && (
                               <>
                               <div className="w-[1px] bg-slate-100 h-full" />
                               <div 
                                    ref={periodRef} 
                                    className="flex-1 overflow-y-auto scroll-smooth py-20"
                                    style={hideScrollbarStyle}
                                >
                                   <div className="space-y-1 px-2">
                                        {periods.map(p => (
                                            <button
                                                key={p}
                                                data-time-id={`${instanceId}-period-${p}`}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePeriodChange(p as 'AM' | 'PM');
                                                }}
                                                className={cn(
                                                    "w-full text-center py-1 rounded-md text-sm transition-all duration-200",
                                                    period === p
                                                      ? "bg-primary-50 text-primary-700 font-bold scale-110" 
                                                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
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
                      <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                          <button 
                            type="button"
                            onClick={handleNow}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                          >
                             <Clock size={12} />
                             Agora
                          </button>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              ) : createPortal(
              <div
                ref={popoverRef}
                style={popoverStyle}
                className={cn(
                  "bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col",
                  popoverSide === 'bottom' ? 'origin-top' : 'origin-bottom',
                )}
              >
                   <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50 text-slate-500">
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
                   
                  <div className="flex h-52 relative">
                       {/* Hours Column */}
                       <div 
                            ref={hoursRef} 
                            className="flex-1 overflow-y-auto scroll-smooth py-20"
                            style={hideScrollbarStyle}
                        >
                           <div className="space-y-1 px-2">
                               {currentHoursList.map(h => {
                                   const isSelected = use12HourFormat ? displayHour12 === h : selectedHour === h;
                                   return (
                                       <button
                                          key={h}
                                          data-time-id={`${instanceId}-hour-${h}`}
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleHourChange(h);
                                          }}
                                          className={cn(
                                              "w-full text-center py-1 rounded-md text-sm transition-all duration-200",
                                              isSelected
                                                ? "bg-primary-50 text-primary-700 font-bold scale-110" 
                                                : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                          )}
                                       >
                                           {h}
                                       </button>
                                   );
                               })}
                           </div>
                       </div>
                       
                       {/* Divider */}
                       <div className="w-[1px] bg-slate-100 h-full" />

                       {/* Minutes Column */}
                       <div 
                            ref={minutesRef} 
                            className="flex-1 overflow-y-auto scroll-smooth py-20"
                            style={hideScrollbarStyle}
                       >
                           <div className="space-y-1 px-2">
                               {minutes.map(m => (
                                   <button
                                      key={m}
                                      data-time-id={`${instanceId}-minute-${m}`}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleMinuteChange(m);
                                      }}
                                      className={cn(
                                          "w-full text-center py-1 rounded-md text-sm transition-all duration-200",
                                          selectedMinute === m 
                                            ? "bg-primary-50 text-primary-700 font-bold scale-110" 
                                            : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                      )}
                                   >
                                       {m}
                                   </button>
                               ))}
                           </div>
                       </div>

                       {/* AM/PM Column */}
                       {use12HourFormat && (
                           <>
                           <div className="w-[1px] bg-slate-100 h-full" />
                           <div 
                                ref={periodRef} 
                                className="flex-1 overflow-y-auto scroll-smooth py-20"
                                style={hideScrollbarStyle}
                            >
                               <div className="space-y-1 px-2">
                                    {periods.map(p => (
                                        <button
                                            key={p}
                                            data-time-id={`${instanceId}-period-${p}`}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePeriodChange(p as 'AM' | 'PM');
                                            }}
                                            className={cn(
                                                "w-full text-center py-1 rounded-md text-sm transition-all duration-200",
                                                period === p
                                                  ? "bg-primary-50 text-primary-700 font-bold scale-110" 
                                                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    ))}
                               </div>
                           </div>
                           </>
                       )}

                       {/* Selection Overlay Indicator (Visual Only) */}
                       <div className="absolute top-1/2 left-2 right-2 -translate-y-1/2 h-8 rounded-lg border border-primary-200 pointer-events-none opacity-50" />
                  </div>

                  {/* Footer */}
                  <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                      <button 
                        type="button"
                        onClick={handleNow}
                        className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                      >
                         <Clock size={12} />
                         Agora
                      </button>
                  </div>
              </div>,
              document.body,
              ))
          )}
      </div>
  );
};