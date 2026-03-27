import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, isSameDay, setMonth, setYear, getYear, getMonth, isToday, isWithinInterval, isBefore, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../utils/cn';
import { Select } from './Select';

interface CalendarProps {
  selectedDate?: Date | null;
  onSelect?: (date: Date) => void;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  // Range Props
  mode?: 'single' | 'range';
  startDate?: Date | null;
  endDate?: Date | null;
  onRangeSelect?: (start: Date | null, end: Date | null) => void;
  // Controlled View Props
  displayMonth?: Date;
  onMonthChange?: (date: Date) => void;
  hidePrevButton?: boolean;
  hideNextButton?: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onSelect,
  className,
  minDate,
  maxDate,
  mode = 'single',
  startDate,
  endDate,
  onRangeSelect,
  displayMonth,
  onMonthChange,
  hidePrevButton,
  hideNextButton,
}) => {
  const isControlled = displayMonth !== undefined;
  const [monthAnimationDirection, setMonthAnimationDirection] = useState<'left' | 'right'>('right');

  // Initialize internal state only if not controlled
  const [internalMonth, setInternalMonth] = useState(() => {
    if (mode === 'range' && startDate) return startDate;
    return selectedDate || new Date();
  });

  // Drag state management
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<Date | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const prevMonthKeyRef = useRef<string | null>(null);

  const currentMonth = isControlled ? displayMonth : internalMonth;

  // Ensure we have a valid date object
  const validCurrentMonth = currentMonth instanceof Date && !isNaN(currentMonth.getTime()) ? currentMonth : new Date();

  // Global mouse up handler to stop dragging if user releases outside calendar
  useEffect(() => {
    const handleGlobalMouseUp = () => {
        setIsDragging(false);
        dragStartRef.current = null;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  useEffect(() => {
    const currentKey = `${getYear(validCurrentMonth)}-${getMonth(validCurrentMonth)}`;
    const previousKey = prevMonthKeyRef.current;
    prevMonthKeyRef.current = currentKey;

    // Skip first paint
    if (!previousKey) return;

    const el = gridRef.current;
    if (!el || typeof el.animate !== 'function') return;

    const fromX = monthAnimationDirection === 'left' ? -28 : 28;
    el.animate(
      [
        { opacity: 0.45, transform: `translateX(${fromX}px)` },
        { opacity: 1, transform: 'translateX(0px)' },
      ],
      {
        duration: 520,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    );
  }, [validCurrentMonth, monthAnimationDirection]);

  const handlePrevMonth = () => {
    setMonthAnimationDirection('left');
    const newDate = subMonths(validCurrentMonth, 1);
    if (!isControlled) setInternalMonth(newDate);
    onMonthChange?.(newDate);
  };

  const handleNextMonth = () => {
    setMonthAnimationDirection('right');
    const newDate = addMonths(validCurrentMonth, 1);
    if (!isControlled) setInternalMonth(newDate);
    onMonthChange?.(newDate);
  };

  const handleMonthChange = (value: string | number | null) => {
    if (value == null) return;
    const newMonth = parseInt(String(value), 10);
    if (Number.isNaN(newMonth)) return;
    const newDate = setMonth(validCurrentMonth, newMonth);
    const currentTs = validCurrentMonth.getFullYear() * 12 + validCurrentMonth.getMonth();
    const nextTs = newDate.getFullYear() * 12 + newDate.getMonth();
    setMonthAnimationDirection(nextTs < currentTs ? 'left' : 'right');
    if (!isControlled) setInternalMonth(newDate);
    onMonthChange?.(newDate);
  };

  const handleYearChange = (value: string | number | null) => {
    if (value == null) return;
    const newYear = parseInt(String(value), 10);
    if (Number.isNaN(newYear)) return;
    const newDate = setYear(validCurrentMonth, newYear);
    const currentTs = validCurrentMonth.getFullYear() * 12 + validCurrentMonth.getMonth();
    const nextTs = newDate.getFullYear() * 12 + newDate.getMonth();
    setMonthAnimationDirection(nextTs < currentTs ? 'left' : 'right');
    if (!isControlled) setInternalMonth(newDate);
    onMonthChange?.(newDate);
  };

  const handleJumpToToday = () => {
      const today = new Date();
      if (!isControlled) setInternalMonth(today);
      onMonthChange?.(today);

      if (mode === 'single' && onSelect) {
        onSelect(today);
      }
  };

  // Standard Click Logic (used for Single mode or Click-Click Range mode)
  const handleDateClick = (dateObj: Date) => {
    if (mode === 'single') {
        if (onSelect) onSelect(dateObj);
    } else if (mode === 'range' && onRangeSelect) {
        // Range Logic: Click-Click approach
        if (!startDate || (startDate && endDate)) {
            // Start new range
            onRangeSelect(dateObj, null);
        } else if (startDate && !endDate) {
            // If clicking the same start date again, unselect it (Toggle behavior)
            if (isSameDay(dateObj, startDate)) {
                onRangeSelect(null, null);
                return;
            }

            // Complete range
            if (isBefore(dateObj, startDate)) {
                onRangeSelect(dateObj, startDate);
            } else {
                onRangeSelect(startDate, dateObj);
            }
        }
    }
  };

  // Drag Handlers
  const handleMouseDown = (date: Date) => {
      if (mode !== 'range') return;
      setIsDragging(true);
      dragStartRef.current = date;
      // We do NOT select immediately here to allow "Click" logic to persist
      // if the user just clicks without dragging.
  };

  const handleMouseEnter = (date: Date) => {
      if (mode !== 'range' || !isDragging || !dragStartRef.current || !onRangeSelect) return;

      const startDrag = dragStartRef.current;
      let newStart: Date;
      let newEnd: Date;

      // Calculate potential new range
      if (isBefore(date, startDrag)) {
          newStart = date;
          newEnd = startDrag;
      } else {
          newStart = startDrag;
          newEnd = date;
      }

      // Optimization: Only fire update if the range is actually different from current
      // This prevents infinite render loops when mouse is stationary but re-renders occur
      const currentStart = startDate;
      const currentEnd = endDate;

      const isSameRange =
        currentStart && isSameDay(newStart, currentStart) &&
        currentEnd && isSameDay(newEnd, currentEnd);

      if (!isSameRange) {
        onRangeSelect(newStart, newEnd);
      }
  };

  const handleMouseUp = (date: Date) => {
      if (mode !== 'range') return;

      // If we were dragging but the start and end are the same (simple click)
      if (isDragging && dragStartRef.current && isSameDay(dragStartRef.current, date)) {
          handleDateClick(date);
      }

      setIsDragging(false);
      dragStartRef.current = null;
  };

  const isDateDisabled = (date: Date) => {
    if (minDate) {
      const minDateStart = new Date(minDate);
      minDateStart.setHours(0, 0, 0, 0);
      if (date < minDateStart) return true;
    }
    if (maxDate) {
      const maxDateEnd = new Date(maxDate);
      maxDateEnd.setHours(23, 59, 59, 999);
      if (date > maxDateEnd) return true;
    }
    return false;
  };

  const daysInMonth = getDaysInMonth(validCurrentMonth);
  const firstDayOfWeek = getDay(startOfMonth(validCurrentMonth)); // 0 = Sunday

  // Generate Month Options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    return {
      value: i,
      label: format(new Date(2000, i, 1), 'MMMM', { locale: ptBR })
    };
  });

  // Generate Year Options
  const currentYear = getYear(new Date());
  const minYear = minDate ? getYear(minDate) : currentYear - 10;
  const maxYear = maxDate ? getYear(maxDate) : currentYear + 10;
  const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  return (
    <div className={cn("w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm select-none", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={hidePrevButton}
          className={cn(
            "p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors",
            hidePrevButton && "opacity-0 pointer-events-none"
          )}
          title="Mês anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
            <Select
              value={getMonth(validCurrentMonth)}
              onChange={handleMonthChange}
              options={monthOptions}
              searchable={false}
              className="w-[148px]"
              placeholder="Mês"
            />

            <Select
              value={getYear(validCurrentMonth)}
              onChange={handleYearChange}
              options={yearOptions.map((y) => ({ value: y, label: String(y) }))}
              searchable={false}
              className="w-[100px]"
              placeholder="Ano"
            />
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          disabled={hideNextButton}
          className={cn(
            "p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors",
            hideNextButton && "opacity-0 pointer-events-none"
          )}
          title="Próximo mês"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        key={`${getYear(validCurrentMonth)}-${getMonth(validCurrentMonth)}`}
        className="grid grid-cols-7 gap-y-1 mb-2"
      >
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
            <div key={d} className="text-center text-[11px] font-semibold text-slate-400 uppercase py-2">
              {d}
            </div>
          ))}

          {/* Empty slots for start of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateObj = new Date(validCurrentMonth.getFullYear(), validCurrentMonth.getMonth(), day);
            const isTodayDate = isToday(dateObj);
            const disabled = isDateDisabled(dateObj);

          // Selection Logic
          let isSelected = false;
          let isRangeStart = false;
          let isRangeEnd = false;
          let isRangeMiddle = false;

          if (mode === 'single') {
              isSelected = selectedDate ? isSameDay(dateObj, selectedDate) : false;
          } else {
              if (startDate && isValid(startDate)) {
                isRangeStart = isSameDay(dateObj, startDate);
              }
              if (endDate && isValid(endDate)) {
                isRangeEnd = isSameDay(dateObj, endDate);
              }
              if (startDate && endDate && isValid(startDate) && isValid(endDate)) {
                  isRangeMiddle = isWithinInterval(dateObj, { start: startDate, end: endDate }) && !isRangeStart && !isRangeEnd;
              }
              isSelected = isRangeStart || isRangeEnd;
          }

            return (
              <button
                type="button"
                key={day}
                onMouseDown={(e) => {
                    if (e.button !== 0 || disabled) return; // Only Left Click
                    handleMouseDown(dateObj);
                }}
                onMouseEnter={() => {
                    if (!disabled) handleMouseEnter(dateObj);
                }}
                onMouseUp={() => {
                    if (!disabled) handleMouseUp(dateObj);
                }}
                onClick={() => {
                    // Prevent default onClick if we handled it via MouseUp/Down logic for ranges
                    if (mode === 'single' && !disabled) {
                        handleDateClick(dateObj);
                    }
                }}
                disabled={disabled}
                className={cn(
                  "relative aspect-square flex items-center justify-center text-sm transition-all focus:outline-none",

                  // Base Shape & Spacing
                  mode === 'single' && "rounded-md m-0.5",
                  mode === 'range' && "m-0 w-full h-full",

                  // Single Selection
                  mode === 'single' && isSelected && "bg-primary-600 text-white shadow-md shadow-primary-500/30 hover:bg-primary-700 font-bold",

                  // Range Selection: Start
                  isRangeStart && !isRangeEnd && "bg-primary-600 text-white rounded-l-md font-bold z-10",
                  isRangeStart && isRangeEnd && "bg-primary-600 text-white rounded-md font-bold z-10", // Start == End (Single day range)

                  // Range Selection: End
                  isRangeEnd && !isRangeStart && "bg-primary-600 text-white rounded-r-md font-bold z-10",

                  // Range Selection: Middle
                  isRangeMiddle && "bg-primary-100 text-primary-900 first:rounded-l-md last:rounded-r-md",

                  // Today State (Visual Only, if not selected)
                  !isSelected && !isRangeMiddle && isTodayDate && "text-primary-600 font-bold bg-primary-50",
                  mode === 'single' && !isSelected && isTodayDate && "border border-primary-200", // Border only for single mode today

                  // Default Hover State
                  !isSelected && !isRangeMiddle && !disabled && "hover:bg-slate-100 text-slate-700",
                  mode === 'range' && !isSelected && !isRangeMiddle && !disabled && "rounded-md", // Add roundness to hover in range mode for aesthetics

                  // Disabled State
                  disabled && "opacity-25 cursor-not-allowed hover:bg-transparent"
                )}
              >
                <span className="relative z-20">
                  {day}
                </span>

                {/* Optional indicator dot for single select mode */}
                {mode === 'single' && (isSelected || isTodayDate) && (
                   <div className={cn(
                       "w-1 h-1 rounded-full mt-1 absolute bottom-1",
                       isSelected ? "bg-white/50" : "bg-primary-500"
                   )} />
                )}
              </button>
            );
          })}
      </div>

      {/* Footer / Actions - Only show in Single mode or uncontrolled range mode if needed */}
      {!isControlled && (
        <div className="pt-3 border-t border-slate-100 mt-2 flex justify-center">
            <button
                type="button"
                onClick={handleJumpToToday}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
            >
                <CalendarIcon size={12} />
                Ir para Hoje
            </button>
        </div>
      )}
    </div>
  );
};
