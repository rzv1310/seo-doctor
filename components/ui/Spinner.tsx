interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'white' | 'danger';
    className?: string;
}

const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
};

const spinnerColors = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    danger: 'border-danger border-t-transparent'
};

export function Spinner({ size = 'md', color = 'primary', className = '' }: SpinnerProps) {
    const sizeClasses = spinnerSizes[size];
    const colorClasses = spinnerColors[color];

    return (
        <div
            className={`animate-spin rounded-full border-2 ${sizeClasses} ${colorClasses} ${className}`}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}
