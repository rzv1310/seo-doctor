import { ReactNode } from 'react';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  type?: 'success' | 'error' | 'warning' | 'info'; // Backward compatibility
  message?: string | ReactNode;
  children?: ReactNode;
  title?: string;
  icon?: ReactNode;
  onClose?: () => void;
  className?: string;
}

const alertVariants = {
  success: 'bg-green-900/30 border-green-900/50 text-green-300',
  error: 'bg-red-900/30 border-red-900/50 text-red-300',
  warning: 'bg-yellow-900/30 border-yellow-900/50 text-yellow-300',
  info: 'bg-blue-900/30 border-blue-900/50 text-blue-300'
};

const defaultIcons = {
  success: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

export function Alert({ 
  variant,
  type, 
  message, 
  children,
  title, 
  icon, 
  onClose, 
  className = '' 
}: AlertProps) {
  const alertType = variant || type || 'info';
  const variantClasses = alertVariants[alertType];
  const displayIcon = icon || defaultIcons[alertType];
  const content = children || message;
  
  const baseClasses = 'rounded-lg border p-4';
  const finalClassName = `${baseClasses} ${variantClasses} ${className}`.trim();

  return (
    <div className={finalClassName} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {displayIcon}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {content}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className="inline-flex rounded-md p-1.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}