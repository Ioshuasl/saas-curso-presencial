import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface MultiSelectOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string; // 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray'
  description?: string;
}

interface MultiSelectProps {
  label?: string;
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  onCreate?: (newValue: string) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  className?: string;
  maxTags?: number;
}

const colorStyles: Record<string, string> = {
    red: "bg-red-100 text-red-800 border-red-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    gray: "bg-slate-100 text-slate-700 border-slate-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
};

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  value = [],
  onChange,
  onCreate,
  options,
  placeholder = "Selecione opções...",
  error,
  helperText,
  disabled,
  required,
  fullWidth = true,
  startIcon,
  className,
  maxTags = 100,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [popoverSide, setPopoverSide] = useState<'bottom' | 'top'>('bottom');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => 
    options.filter(opt => 
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  [options, searchQuery]);

  const selectedOptions = useMemo(() => 
    options.filter(opt => value.includes(opt.value)),
  [options, value]);

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

  useEffect(() => {
    if (isOpen) {
        if (searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
        setHighlightedIndex(0);
    } else {
        setSearchQuery("");
    }
  }, [isOpen]);

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

  // Scroll highlighted item
  useEffect(() => {
      if (isOpen && listRef.current) {
          const item = listRef.current.children[highlightedIndex] as HTMLElement;
          if (item) {
              item.scrollIntoView({ block: 'nearest' });
          }
      }
  }, [highlightedIndex, isOpen]);

  const handleToggle = (optionValue: string | number) => {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
      // Keep open for multiple selection
      if (searchInputRef.current) searchInputRef.current.focus(); 
  };

  const handleCreate = () => {
      if (onCreate && searchQuery) {
          onCreate(searchQuery);
          setSearchQuery(""); // Clear search after create to allow more
      }
  };

  const handleRemove = (e: React.MouseEvent, optionValue: string | number) => {
      e.stopPropagation();
      onChange(value.filter(v => v !== optionValue));
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
                  handleToggle(filteredOptions[highlightedIndex].value);
              }
              break;
          case 'Escape':
              e.preventDefault();
              setIsOpen(false);
              break;
      }
  };

  const baseStyles = "flex w-full items-center justify-between rounded-md border bg-white px-3 py-1.5 text-sm ring-offset-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 transition-all duration-200 min-h-[40px]";

  const stateStyles = error
  ? "border-red-500 focus:ring-red-500/30 text-red-900"
  : isOpen 
    ? "border-primary-500 ring-2 ring-primary-500/30 text-slate-900"
    : "border-slate-300 hover:border-slate-400 text-slate-900";

  return (
    <div 
        className={cn("relative flex flex-col gap-1.5", fullWidth ? "w-full" : "w-auto", className)} 
        ref={containerRef}
        onKeyDown={handleKeyDown}
    >
      {label && (
        <label className={cn("text-sm font-medium leading-none flex items-center gap-1", error ? "text-red-600" : "text-slate-700")}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div 
        className={cn(baseStyles, stateStyles, "cursor-pointer h-auto group")}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 overflow-hidden">
            {startIcon && selectedOptions.length === 0 && <span className="text-slate-500 shrink-0">{startIcon}</span>}
            
            {selectedOptions.length > 0 ? (
                <>
                    {selectedOptions.slice(0, maxTags).map((opt) => (
                        <div 
                            key={opt.value}
                            className={cn(
                                "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold border animate-in fade-in zoom-in duration-200",
                                opt.color && colorStyles[opt.color] ? colorStyles[opt.color] : colorStyles.gray
                            )}
                            onClick={(e) => e.stopPropagation()} 
                        >
                            {opt.icon && <span>{opt.icon}</span>}
                            {opt.label}
                            <div 
                                role="button"
                                onClick={(e) => handleRemove(e, opt.value)}
                                className="hover:bg-black/10 rounded-full p-0.5 transition-colors cursor-pointer"
                            >
                                <X size={10} />
                            </div>
                        </div>
                    ))}
                    {selectedOptions.length > maxTags && (
                        <span className="text-xs text-slate-500 font-medium">
                            +{selectedOptions.length - maxTags} more
                        </span>
                    )}
                </>
            ) : (
                <span className="text-slate-400 py-0.5">{placeholder}</span>
            )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
             {selectedOptions.length > 0 && !disabled && (
                 <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); onChange([]); }}
                    className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                 >
                     <X size={14} />
                 </button>
             )}
             <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
        </div>
      </div>

      {isOpen && !disabled && (
          <div 
             className={cn(
                 "absolute left-0 z-50 w-full bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[300px]",
                 popoverSide === 'bottom' ? "top-[calc(100%+4px)] origin-top" : "bottom-[calc(100%+4px)] origin-bottom"
             )}
          >
             <div className="p-2 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                 <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={onCreate ? "Buscar ou criar tag..." : "Buscar..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-slate-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white"
                        onKeyDown={(e) => {
                             if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 handleKeyDown(e);
                             }
                        }}
                    />
                 </div>
             </div>
             
             <div ref={listRef} className="overflow-y-auto p-1 scroll-smooth">
                 {filteredOptions.length > 0 ? (
                     filteredOptions.map((opt, index) => {
                         const isSelected = value.includes(opt.value);
                         const isHighlighted = index === highlightedIndex;
                         return (
                             <button
                                key={opt.value}
                                type="button"
                                disabled={disabled}
                                onClick={() => handleToggle(opt.value)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                                    isHighlighted ? "bg-slate-100" : "text-slate-700",
                                )}
                             >
                                 <div className="flex items-center gap-2">
                                     <div className={cn(
                                         "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                         isSelected 
                                            ? "bg-primary-600 border-primary-600 text-white" 
                                            : "border-slate-300 bg-white"
                                     )}>
                                         {isSelected && <Check size={10} strokeWidth={3} />}
                                     </div>
                                     <div className="flex flex-col items-start">
                                        <div className="flex items-center gap-2">
                                            {opt.icon && <span className="text-slate-400">{opt.icon}</span>}
                                            {opt.color && (
                                                <span className={cn("w-2 h-2 rounded-full", colorStyles[opt.color].replace('bg-', 'bg-').split(' ')[0])} />
                                            )}
                                            <span>{opt.label}</span>
                                        </div>
                                        {opt.description && <span className="text-xs text-slate-500 ml-6">{opt.description}</span>}
                                     </div>
                                 </div>
                             </button>
                         )
                     })
                 ) : (
                    <>
                     {!onCreate && (
                        <div className="py-4 text-center text-xs text-slate-500">
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
                            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left text-primary-600 hover:bg-primary-50",
                            highlightedIndex === filteredOptions.length && "bg-primary-50"
                        )}
                     >
                        <Plus size={14} />
                        Criar Tag "{searchQuery}"
                     </button>
                 )}
             </div>
             <div className="p-2 border-t border-slate-100 bg-slate-50 text-xs text-center text-slate-500">
                {selectedOptions.length} selecionados
             </div>
          </div>
      )}

      {(helperText || error) && (
        <p className={cn("text-[0.8rem]", error ? "text-red-600 font-medium" : "text-slate-500")}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};