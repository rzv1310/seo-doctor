import { forwardRef } from 'react';
import Link from 'next/link';
import { Spinner } from './Spinner';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  target?: string;
}

const buttonVariants = {
  primary: 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40',
  secondary: 'bg-dark-blue-lighter hover:bg-primary/20 text-white border border-border-color',
  danger: 'bg-danger hover:bg-danger/90 text-white',
  ghost: 'text-primary hover:bg-primary/10',
  outline: 'border border-primary text-primary hover:bg-primary hover:text-white'
};

const buttonSizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    href, 
    onClick, 
    disabled = false, 
    loading = false, 
    className = '', 
    type = 'button',
    target,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-blue';
    const variantClasses = buttonVariants[variant];
    const sizeClasses = buttonSizes[size];
    
    const disabledClasses = (disabled || loading) 
      ? 'opacity-50 cursor-not-allowed pointer-events-none' 
      : 'hover:transform hover:-translate-y-0.5';

    const finalClassName = `${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`.trim();

    if (href && !disabled && !loading) {
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return (
          <a
            ref={ref as React.ForwardedRef<HTMLAnchorElement>}
            href={href}
            target={target}
            className={finalClassName}
            {...props}
          >
            {loading && <Spinner size="sm" />}
            {children}
          </a>
        );
      }

      return (
        <Link
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          href={href}
          target={target}
          className={finalClassName}
          {...props}
        >
          {loading && <Spinner size="sm" />}
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={finalClassName}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';