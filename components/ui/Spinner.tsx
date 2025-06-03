interface SpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    center?: boolean;
}

const spinnerSizes = {
    xs: 'h-3 w-3 border-2',
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-4',
    xl: 'h-12 w-12 border-4'
};

export function Spinner({ size = 'md', className = '', center = false }: SpinnerProps) {
    const sizeClasses = spinnerSizes[size];
    
    const spinnerElement = (
        <div
            className={`animate-spin rounded-full border-white border-t-transparent ${sizeClasses} ${className}`}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );

    if (center) {
        return (
            <div className="flex items-center justify-center">
                {spinnerElement}
            </div>
        );
    }

    return spinnerElement;
}
