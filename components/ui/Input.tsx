import { forwardRef } from 'react';



export interface InputProps {
    id?: string;
    label?: string;
    type?: 'text' | 'email' | 'tel' | 'url' | 'number';
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    name?: string;
    autoComplete?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({
        id,
        label,
        type = 'text',
        placeholder,
        value,
        onChange,
        error,
        helperText,
        required = false,
        disabled = false,
        className = '',
        name,
        autoComplete,
        ...props
    }, ref) => {
        const baseInputClasses = `w-full bg-dark-blue-lighter rounded-md py-2.5 px-3 text-white border border-white/20 focus:outline-none focus:border-white text-base sm:text-base ${className}`;
        const errorInputClasses = error ? 'border-danger focus:border-danger' : 'border-white/20 focus:border-white';

        return (
            <div>
                {label && (
                    <label htmlFor={id} className="block text-xs sm:text-sm font-medium text-text-primary/90 mb-1">
                        {label}
                        {required && <span className="text-danger ml-1">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    id={id}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    className={`${baseInputClasses} ${errorInputClasses}`.trim()}
                    {...props}
                />
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

Input.displayName = 'Input';

interface TextareaProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    rows?: number;
    className?: string;
    name?: string;
    id?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({
        label,
        placeholder,
        value,
        onChange,
        error,
        required = false,
        disabled = false,
        rows = 4,
        className = '',
        name,
        id,
        ...props
    }, ref) => {
        const textareaId = id || name;
        const baseTextareaClasses = `w-full bg-dark-blue-lighter rounded-md py-2.5 px-3 text-white border border-white/20 focus:outline-none focus:border-white text-base sm:text-base resize-vertical ${className}`;
        const errorTextareaClasses = error ? 'border-danger focus:border-danger' : 'border-white/20 focus:border-white';

        return (
            <div>
                {label && (
                    <label htmlFor={textareaId} className="block text-xs sm:text-sm font-medium text-text-primary/90 mb-1">
                        {label}
                        {required && <span className="text-danger ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    rows={rows}
                    className={`${baseTextareaClasses} ${errorTextareaClasses}`.trim()}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-danger mt-1">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';