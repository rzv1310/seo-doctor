import { forwardRef } from 'react';
import Link from 'next/link';
import { Spinner } from './Spinner';

export interface ActionButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  target?: string;
  showArrow?: boolean;
  animate?: boolean;
}

export const ActionButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ActionButtonProps>(
  ({
    children,
    href,
    onClick,
    disabled = false,
    loading = false,
    className = '',
    type = 'button',
    target,
    showArrow = true,
    animate = false,
    ...props
  }, ref) => {
    const baseClasses = `bg-gradient-to-l font-bold from-primary to-primary-dark text-white rounded-full px-6 py-2.5
      transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2
      border-2 border-primary/30 relative group overflow-hidden inline-flex justify-center
      ${animate ? 'animate-pulse hover:animate-none' : ''}
      ${(disabled || loading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:transform hover:-translate-y-0.5'}`;

    const content = (
      <>
        {loading && <Spinner size="sm" />}
        <span className="relative z-10">{children}</span>
        {showArrow && !loading && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        )}
      </>
    );

    if (href && !disabled && !loading) {
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return (
          <a
            ref={ref as React.ForwardedRef<HTMLAnchorElement>}
            href={href}
            target={target}
            className={`${baseClasses} ${className}`.trim()}
            {...props}
          >
            {content}
          </a>
        );
      }

      return (
        <Link
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          href={href}
          target={target}
          className={`${baseClasses} ${className}`.trim()}
          {...props}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseClasses} ${className}`.trim()}
        {...props}
      >
        {content}
      </button>
    );
  }
);

ActionButton.displayName = 'ActionButton';