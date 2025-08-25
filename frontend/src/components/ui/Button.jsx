import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const buttonVariants = {
  default: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500",
  outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-indigo-500",
  ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
  danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500",
};

const buttonSizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-8 py-4 text-lg",
};

const Button = forwardRef(({ 
  className, 
  variant = "default", 
  size = "md", 
  loading = false,
  children, 
  disabled,
  ...props 
}, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        buttonVariants[variant],
        buttonSizes[size],
        loading && "cursor-wait",
        className
      )}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;