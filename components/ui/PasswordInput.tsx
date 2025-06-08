'use client';

import { useState, forwardRef } from 'react';



export interface PasswordInputProps {
    id?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    minLength?: number;
    className?: string;
    label?: string;
    helperText?: string;
    error?: string;
    required?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({
        id,
        value,
        onChange,
        placeholder = "••••••••",
        disabled = false,
        minLength,
        className = "",
        label,
        helperText,
        error,
        required = false,
        ...props
    }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        const baseInputClasses = `w-full bg-dark-blue-lighter rounded-md py-2.5 px-3 pr-10 text-white border border-white/20 focus:outline-none focus:border-white text-base sm:text-base ${className}`;
        const errorInputClasses = error ? 'border-danger focus:border-danger' : 'border-white/20 focus:border-white';

        return (
            <div>
                {label && (
                    <label htmlFor={id} className="block text-xs sm:text-sm font-medium text-text-primary/90 mb-1">
                        {label}
                        {required && <span className="text-danger ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        id={id}
                        type={showPassword ? "text" : "password"}
                        value={value}
                        onChange={onChange}
                        className={`${baseInputClasses} ${errorInputClasses}`.trim()}
                        placeholder={placeholder}
                        disabled={disabled}
                        minLength={minLength}
                        {...props}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-white transition-colors cursor-pointer"
                        disabled={disabled}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>
                {error && (
                    <p className="text-xs text-danger mt-1">{error}</p>
                )}
                {helperText && !error && (
                    <p className="text-xs text-text-primary/60 mt-1">{helperText}</p>
                )}
            </div>
        );
    }
);

PasswordInput.displayName = 'PasswordInput';