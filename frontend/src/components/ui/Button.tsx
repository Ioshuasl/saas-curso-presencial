import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    startIcon, 
    endIcon, 
    fullWidth = false,
    children, 
    disabled, 
    ...props 
  }, ref) => {
    
    const variants = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm border-transparent focus-visible:ring-indigo-500",
      secondary: "bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm focus-visible:ring-slate-400",
      outline: "bg-transparent border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus-visible:ring-indigo-500",
      ghost: "bg-transparent border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm border-transparent focus-visible:ring-red-500",
      link: "bg-transparent border-transparent text-indigo-600 underline-offset-4 hover:underline p-0 h-auto shadow-none",
    };

    const sizes = {
      xs: "h-7 px-2 text-xs",
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10 p-0 items-center justify-center shrink-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 border",
          variants[variant],
          size !== 'icon' && sizes[size],
          size === 'icon' && "h-10 w-10 p-2",
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && startIcon && <span className={cn("mr-2", size === 'xs' ? "mr-1" : "mr-2")}>{startIcon}</span>}
        {children}
        {!isLoading && endIcon && <span className="ml-2">{endIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";