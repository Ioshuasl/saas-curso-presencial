import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  avatar?: string; // URL for user avatar
  description?: string; // Secondary text (e.g. email, job title)
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  value?: string | number | null;
  onChange: (value: string | number | null) => void;
  onCreate?: (newValue: string) => void; // Handler for creating new options
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  className?: string;
  searchable?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  onCreate,
  options,
  placeholder = "Selecione...",
  error,
  helperText,
  disabled,
  required,
  fullWidth = true,
  startIcon,
  className,
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [popoverSide, setPopoverSide] = useState<'bottom' | 'top'>('bottom');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => 
    options.find(opt => opt.value === value), 
  [options, value]);

  const filteredOptions = useMemo(() => 
    options.filter(opt => 
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  [options, searchQuery]);

  // Handle auto-positioning
  useEffect(() => {
    if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const requiredHeight = 250;

        if (spaceBelow < requiredHeight && spaceAbove > spaceBelow) {
            setPopoverSide('top');
        } else {
            setPopoverSide('bottom');
        }
    }
  }, [isOpen]);

  // Focus management and reset
  useEffect(() => {
    if (isOpen) {
        if (searchable && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
        const selectedIndex = filteredOptions.findIndex((opt) => opt.value === value);
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    } else {
        setSearchQuery("");
    }
  }, [isOpen, searchable, filteredOptions, value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
      if (isOpen && listRef.current) {
          const item = listRef.current.children[highlightedIndex] as HTMLElement;
          if (item) {
              item.scrollIntoView({ block: 'nearest' });
          }
      }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (optionValue: string | number) => {
      onChange(optionValue);
      setIsOpen(false);
  };

  const handleCreate = () => {
      if (onCreate && searchQuery) {
          onCreate(searchQuery);
          setIsOpen(false); 
      }
  };

  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (!isOpen) {
          if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(true);
          }
          return;
      }

      const optionsCount = filteredOptions.length;
      // If we can create, we add 1 virtual index at the end
      const hasCreateOption = onCreate && searchQuery && !filteredOptions.some(o => o.label.toLowerCase() === searchQuery.toLowerCase());
      const maxIndex = optionsCount + (hasCreateOption ? 0 : -1);

      switch (e.key) {
          case 'ArrowDown':
              e.preventDefault();
              setHighlightedIndex(prev => prev < maxIndex ? prev + 1 : prev);
              break;
          case 'ArrowUp':
              e.preventDefault();
              setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
              break;
          case 'Enter':
              e.preventDefault();
              if (highlightedIndex === optionsCount && hasCreateOption) {
                  handleCreate();
              } else if (filteredOptions[highlightedIndex]) {
                  handleSelect(filteredOptions[highlightedIndex].value);
              }
              break;
          case 'Escape':
              e.preventDefault();
              setIsOpen(false);
              break;
          case 'Tab':
              setIsOpen(false);
              break;
      }
  };

  const baseStyles = "flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 transition-all duration-200 min-h-[40px] dark:bg-slate-900 dark:ring-offset-slate-900 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800";

  const stateStyles = error
  ? "border-red-500 focus:ring-red-500/30 text-red-900 dark:text-red-300"
  : isOpen 
    ? "border-indigo-500 ring-2 ring-indigo-500/30 text-slate-900 dark:text-slate-100"
    : "border-slate-300 hover:border-slate-400 text-slate-900 dark:border-slate-700 dark:hover:border-slate-600 dark:text-slate-100";

  return (
    <div 
        className={cn("relative flex flex-col gap-1.5", fullWidth ? "w-full" : "w-auto", className)} 
        ref={containerRef}
        onKeyDown={handleKeyDown}
    >
      {label && (
        <label className={cn("text-sm font-medium leading-none flex items-center gap-1", error ? "text-red-600" : "text-slate-700 dark:text-slate-200")}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div 
        className={cn(baseStyles, stateStyles, "cursor-pointer relative group")}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={0} 
      >
        <div className="flex items-center gap-2 overflow-hidden">
            {startIcon && <span className="text-slate-500 shrink-0 dark:text-slate-400">{startIcon}</span>}
            {selectedOption ? (
                <div className="flex items-center gap-2 truncate">
                    {selectedOption.avatar && (
                        <img src={selectedOption.avatar} alt="" className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                    )}
                    {selectedOption.icon && <span className="text-slate-500 dark:text-slate-400">{selectedOption.icon}</span>}
                    <div className="flex flex-col leading-none">
                        <span className="font-medium">{selectedOption.label}</span>
                    </div>
                </div>
            ) : (
                <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
            )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
             {selectedOption && !disabled && (
                 <button 
                    type="button" 
                    onClick={handleClear}
                    className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 dark:text-slate-500 dark:hover:bg-red-900/20"
                 >
                     <X size={14} />
                 </button>
             )}
             <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-200 dark:text-slate-500", isOpen && "rotate-180")} />
        </div>
      </div>

      {isOpen && !disabled && (
          <div 
             className={cn(
                 "absolute left-0 z-50 w-full bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[300px] dark:bg-slate-900 dark:border-slate-700",
                 popoverSide === 'bottom' ? "top-[calc(100%+4px)] origin-top" : "bottom-[calc(100%+4px)] origin-bottom"
             )}
          >
             {searchable && (
                 <div className="p-2 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 dark:border-slate-800 dark:bg-slate-800/70">
                     <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={onCreate ? "Buscar ou criar..." : "Buscar..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                            onKeyDown={(e) => {
                                // CRITICAL: Stop propagation so the container's onKeyDown doesn't fire too
                                if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
                                    e.preventDefault();
                                    e.stopPropagation(); 
                                    handleKeyDown(e);
                                }
                            }}
                        />
                     </div>
                 </div>
             )}
             
             <div ref={listRef} className="overflow-y-auto p-1 scroll-smooth">
                 {filteredOptions.length > 0 ? (
                     filteredOptions.map((opt, index) => {
                         const isSelected = opt.value === value;
                         const isHighlighted = index === highlightedIndex;
                         return (
                             <button
                                key={opt.value}
                                type="button"
                                disabled={opt.disabled}
                                onClick={() => handleSelect(opt.value)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left",
                                    isSelected ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200" : "text-slate-700 dark:text-slate-200",
                                    isHighlighted && !isSelected && "bg-slate-100 dark:bg-slate-800",
                                    opt.disabled && "opacity-50 cursor-not-allowed"
                                )}
                             >
                                 <div className="flex items-center gap-3">
                                     {opt.avatar && (
                                         <img src={opt.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                                     )}
                                     <div className="flex flex-col">
                                         <span className={cn("font-medium", isSelected ? "text-indigo-900 dark:text-indigo-200" : "text-slate-900 dark:text-slate-100")}>
                                            {opt.label}
                                         </span>
                                         {opt.description && (
                                             <span className={cn("text-xs", isSelected ? "text-indigo-600/80 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400")}>
                                                 {opt.description}
                                             </span>
                                         )}
                                     </div>
                                 </div>
                                 {isSelected && <Check size={14} className="text-indigo-600 dark:text-indigo-300" />}
                             </button>
                         )
                     })
                 ) : (
                    <>
                     {!onCreate && (
                        <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                            Nenhum resultado encontrado.
                        </div>
                     )}
                    </>
                 )}

                 {/* Create Option Handler */}
                 {onCreate && searchQuery && !filteredOptions.some(o => o.label.toLowerCase() === searchQuery.toLowerCase()) && (
                     <button
                        type="button"
                        onClick={handleCreate}
                        onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                        className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/30",
                            highlightedIndex === filteredOptions.length && "bg-indigo-50 dark:bg-indigo-900/30"
                        )}
                     >
                        <Plus size={14} />
                        Criar "{searchQuery}"
                     </button>
                 )}
             </div>
          </div>
      )}

      {(helperText || error) && (
        <p className={cn("text-[0.8rem]", error ? "text-red-600 font-medium" : "text-slate-500 dark:text-slate-400")}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};