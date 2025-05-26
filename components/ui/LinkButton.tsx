import { forwardRef } from 'react';



export interface LinkButtonProps {
    children: React.ReactNode;
    onClick?: (e?: any) => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'default' | 'primary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export const LinkButton = forwardRef<HTMLButtonElement, LinkButtonProps>(
    ({
        children,
        onClick,
        disabled = false,
        type = 'button',
        variant = 'default',
        size = 'md',
        ...props
    }, ref) => {
        const variantClasses = {
            default: 'text-text-secondary hover:text-white',
            primary: 'text-primary hover:text-primary-light',
            danger: 'text-danger hover:text-red-400'
        };

        const sizeClasses = {
            sm: 'text-sm',
            md: 'text-base',
            lg: 'text-lg'
        };

        const baseClasses = `select-none inline-flex items-center gap-2 font-medium transition-all duration-200 cursor-pointer
      ${variantClasses[variant]} ${sizeClasses[size]}
      ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`;

        return (
            <button
                ref={ref}
                type={type}
                onClick={onClick}
                disabled={disabled}
                className={baseClasses.trim()}
                {...props}
            >
                {children}
            </button>
        );
    }
);

LinkButton.displayName = 'LinkButton';
