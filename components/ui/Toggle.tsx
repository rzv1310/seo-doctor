import React from 'react';



interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Toggle({
    checked,
    onChange,
    disabled = false,
    label,
    size = 'md',
    className = '',
}: ToggleProps) {
    const sizeClasses = {
        sm: 'w-8 h-4',
        md: 'w-11 h-6',
        lg: 'w-14 h-8',
    };

    const thumbSizeClasses = {
        sm: 'w-3 h-3 translate-x-0.5',
        md: 'w-5 h-5 translate-x-0.5',
        lg: 'w-6 h-6 translate-x-1',
    };

    const thumbTranslateClasses = {
        sm: checked ? 'translate-x-4' : 'translate-x-0.5',
        md: checked ? 'translate-x-5' : 'translate-x-0.5',
        lg: checked ? 'translate-x-6' : 'translate-x-1',
    };

    return (
        <div className={`flex items-center ${className}`}>
            <button
                type="button"
                className={`
          relative inline-flex ${sizeClasses[size]} items-center rounded-full
          transition-colors duration-200 ease-in-out focus:outline-none
          focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-dark-blue
          ${disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }
          ${checked
                        ? 'bg-primary'
                        : 'bg-dark-blue-lighter border border-border-color'
                    }
        `}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                aria-checked={checked}
                role="switch"
                aria-label={label}
            >
                <span
                    className={`
            ${thumbSizeClasses[size]}
            pointer-events-none inline-block rounded-full
            bg-white shadow-lg transform ring-0 transition-transform duration-200 ease-in-out
            ${thumbTranslateClasses[size]}
          `}
                />
            </button>
            {label && (
                <span className={`ml-3 text-sm text-text-primary ${disabled ? 'opacity-50' : ''}`}>
                    {label}
                </span>
            )}
        </div>
    );
}
