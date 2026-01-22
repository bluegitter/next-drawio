import React, { forwardRef, useId } from 'react';
import { InputProps } from '@/types/ui';
import { cn } from './utils';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value,
      onChange,
      placeholder,
      type = 'text',
      disabled = false,
      error,
      label,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const id = useId();
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';

    const baseClasses = [
      'flex w-full rounded-md border border-input bg-background',
      'px-3 py-2 text-sm ring-offset-background',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ];

    const sizeClasses = {
      xs: 'h-7 px-2 text-xs',
      sm: 'h-8 px-3 text-sm',
      md: 'h-9 px-3 text-sm',
      lg: 'h-10 px-4 text-base',
      xl: 'h-11 px-4 text-lg',
    };

    const errorClasses = error ? [
      'border-destructive focus-visible:ring-destructive',
    ] : [];

    const inputType = isPassword && showPassword ? 'text' : type;

    const inputElement = (
      <input
        ref={ref}
        id={id}
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          ...baseClasses,
          sizeClasses[size],
          ...errorClasses,
          isPassword && 'pr-10',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
    );

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {inputElement}
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        
        {error && (
          <div className="flex items-center gap-1 text-sm text-destructive" id={`${id}-error`}>
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';