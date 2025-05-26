import { forwardRef, ReactNode } from 'react';



interface InputProps {
    label?: string;
    type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    icon?: ReactNode;
    className?: string;
    name?: string;
    id?: string;
    autoComplete?: string;
    variant?: 'default' | 'danger';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({
        label,
        type = 'text',
        placeholder,
        value,
        onChange,
        error,
        required = false,
        disabled = false,
        icon,
        className = '',
        name,
        id,
        autoComplete,
        variant = 'default',
        ...props
    }, ref) => {
        const inputId = id || name;

        const getBorderColor = () => {
            if (error) return 'border-danger focus:border-danger focus:ring-danger';
            if (variant === 'danger') return 'border-danger/20 focus:border-danger focus:ring-danger';
            return 'border-border-color focus:border-primary focus:ring-primary';
        };

        return (
            <div className={`space-y-2 ${className}`}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-text-primary"
                    >
                        {label}
                        {required && <span className="text-danger ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                            {icon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        name={name}
                        type={type}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        required={required}
                        disabled={disabled}
                        autoComplete={autoComplete}
                        className={`
              w-full rounded-md border transition-colors
              ${icon ? 'pl-10 pr-4' : 'px-4'} py-3
              bg-dark-blue text-text-primary placeholder-text-secondary
              ${getBorderColor()}
              focus:outline-none focus:ring-2 focus:ring-opacity-50
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
                        {...props}
                    />
                </div>

                {error && (
                    <p className="text-sm text-danger flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {error}
                    </p>
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

        return (
            <div className={`space-y-2 ${className}`}>
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-text-primary"
                    >
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
                    className={`
            w-full rounded-md border transition-colors px-4 py-3
            bg-dark-blue text-text-primary placeholder-text-secondary
            ${error
                            ? 'border-danger focus:border-danger focus:ring-danger'
                            : 'border-border-color focus:border-primary focus:ring-primary'
                        }
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-vertical
          `}
                    {...props}
                />

                {error && (
                    <p className="text-sm text-danger flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
