import React, { forwardRef } from 'react';
import { ButtonProps } from '@/types/ui';
import { cn, generateId } from './utils';
import { Loader2 } from 'lucide-react';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      disabled = false,
      loading = false,
      icon,
      iconPosition = 'left',
      onClick,
      className,
      title,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex items-center justify-center rounded-md font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'relative overflow-hidden',
    ];

    const variantClasses = {
      default: [
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'focus-visible:ring-primary',
      ],
      primary: [
        'bg-blue-600 text-white hover:bg-blue-700',
        'focus-visible:ring-blue-600',
      ],
      secondary: [
        'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        'focus-visible:ring-secondary',
      ],
      outline: [
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        'focus-visible:ring-accent',
      ],
      ghost: [
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:ring-accent',
      ],
      destructive: [
        'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        'focus-visible:ring-destructive',
      ],
    };

    const sizeClasses = {
      xs: ['h-7 px-2 text-xs', 'gap-1'],
      sm: ['h-8 px-3 text-sm', 'gap-1.5'],
      md: ['h-9 px-4 text-sm', 'gap-2'],
      lg: ['h-10 px-5 text-base', 'gap-2.5'],
      xl: ['h-11 px-6 text-lg', 'gap-3'],
    };

    const iconSizeClasses = {
      xs: 'h-3 w-3',
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
    };

    const classes = cn(
      ...baseClasses,
      ...variantClasses[variant],
      ...sizeClasses[size][0].split(' '),
      className
    );

    const gapClass = sizeClasses[size][1];

    const content = (
      <>
        {loading && (
          <Loader2 
            className={cn('animate-spin', iconSizeClasses[size])} 
            aria-hidden="true"
          />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span 
            className={cn('flex-shrink-0', iconSizeClasses[size])}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        
        <span className={loading ? 'opacity-0' : ''}>{children}</span>
        
        {!loading && icon && iconPosition === 'right' && (
          <span 
            className={cn('flex-shrink-0', iconSizeClasses[size])}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </>
    );

    return (
      <button
        ref={ref}
        className={cn(
          classes,
          gapClass,
          icon && iconPosition === 'left' && 'pl-3',
          icon && iconPosition === 'right' && 'pr-3'
        )}
        disabled={disabled || loading}
        onClick={disabled || loading ? undefined : onClick}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        title={title}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';