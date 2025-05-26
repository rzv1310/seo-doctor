import { forwardRef } from 'react';
import Link from 'next/link';
import { Spinner } from './Spinner';



export interface ActionButtonProps {
    children: React.ReactNode;
    href?: string;
    onClick?: (e?: any) => void;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    target?: string;
    showArrow?: boolean;
    animate?: boolean;
    fullRounded?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'danger';
    fullWidth?: boolean;
}

export const ActionButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ActionButtonProps>(
    ({
        children,
        href,
        onClick,
        disabled = false,
        loading = false,
        type = 'button',
        target,
        showArrow = true,
        animate = false,
        fullRounded = true,
        size = 'md',
        variant = 'default',
        fullWidth = false,
        ...props
    }, ref) => {
        const sizeClasses = {
            sm: 'px-4 py-2 text-sm',
            md: 'px-6 py-2.5 text-base',
            lg: 'px-8 py-3 text-lg'
        };

        const variantClasses = {
            default: 'from-primary to-accent border-primary/30 hover:shadow-primary/30 hover:border-accent/50 before:from-accent before:to-primary',
            danger: 'from-purple-800 to-pink-800 border-purple-800/30 hover:shadow-purple-800/30 hover:border-pink-800/50 before:from-pink-800 before:to-purple-800'
        };

        const baseClasses = `select-none bg-gradient-to-r font-bold text-white ${fullRounded ? 'rounded-full' : 'rounded-lg'}
      transition-all duration-300 hover:shadow-lg flex items-center gap-2 justify-center
      border-2 relative group overflow-hidden cursor-pointer
      before:absolute before:inset-0 before:bg-gradient-to-r
      before:opacity-0 before:transition-opacity before:duration-[400ms]
      hover:before:opacity-100
      ${sizeClasses[size]} ${variantClasses[variant]}
      ${fullWidth ? 'w-full' : 'inline-flex'}
      ${animate ? 'animate-pulse-slow hover:animate-none' : ''}
      ${(disabled || loading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:transform hover:-translate-y-0.5'}`;

        const content = (
            <>
                {loading && <Spinner size="sm" />}
                <span className="relative z-10 flex items-center gap-2">{children}</span>
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
                        className={baseClasses.trim()}
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
                    className={baseClasses.trim()}
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
                className={baseClasses.trim()}
                {...props}
            >
                {content}
            </button>
        );
    }
);

ActionButton.displayName = 'ActionButton';
