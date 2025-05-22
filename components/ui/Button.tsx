import { forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { StarBorder } from './star-border';
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
  color?: string;
  speed?: string;
}

const buttonVariants = {
  primary: 'bg-[#1e3a8a] text-white border-[#0ea5e9]/30 hover:bg-[#1d4ed8]',
  secondary: 'bg-[#1e40af] text-[#f8fafc] border-[#334155]/60 hover:bg-[#2563eb]',
  danger: 'bg-[#1e3a8a] text-[#ef4444] border-[#dc2626]/30 hover:bg-[#1d4ed8]',
  ghost: 'bg-transparent border-transparent text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e3a8a]/20',
  outline: 'bg-transparent border-[#334155]/60 text-[#94a3b8] hover:bg-[#1e3a8a] hover:text-[#f8fafc]'
};

const buttonSizes = {
  sm: 'py-2 px-4 text-sm',
  md: 'py-3 px-6 text-base',
  lg: 'py-4 px-8 text-lg'
};

const variantColors = {
  primary: '#0ea5e9',
  secondary: '#94a3b8',
  danger: '#dc2626',
  ghost: '#94a3b8',
  outline: '#334155'
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
    color,
    speed = "6s",
    ...props
  }, ref) => {
    const variantClasses = buttonVariants[variant];
    const sizeClasses = buttonSizes[size];
    const buttonColor = color || variantColors[variant];

    const disabledClasses = (disabled || loading)
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : 'hover:transform hover:-translate-y-0.5';

    const content = (
      <div className="flex items-center justify-center gap-2">
        {loading && <Spinner size="sm" />}
        {children}
      </div>
    );

    if (href && !disabled && !loading) {
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return (
          <StarBorder
            as="a"
            color={buttonColor}
            speed={speed}
            className={cn(
              'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background font-medium cursor-pointer',
              disabledClasses,
              className
            )}
            href={href}
            target={target}
            {...props}
          >
            {content}
          </StarBorder>
        );
      }

      return (
        <Link
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          href={href}
          target={target}
          className="inline-block"
        >
          <StarBorder
            color={buttonColor}
            speed={speed}
            className={cn(
              'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background font-medium cursor-pointer',
              disabledClasses,
              className
            )}
          >
            {content}
          </StarBorder>
        </Link>
      );
    }

    return (
      <StarBorder
        as="button"
        color={buttonColor}
        speed={speed}
        className={cn(
          'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background font-medium cursor-pointer',
          disabledClasses,
          className
        )}
        onClick={onClick}
        type={type}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </StarBorder>
    );
  }
);

Button.displayName = 'Button';