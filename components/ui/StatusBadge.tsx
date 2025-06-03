interface StatusBadgeProps {
    status: string;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    size?: 'sm' | 'md';
    className?: string;
}

const statusVariants = {
    success: 'bg-green-900/30 text-green-300 border-green-900/30',
    warning: 'bg-yellow-900/30 text-yellow-300 border-yellow-900/30',
    danger: 'bg-red-900/30 text-red-300 border-red-900/30',
    info: 'bg-blue-900/30 text-blue-300 border-blue-900/30',
    neutral: 'bg-gray-900/30 text-gray-300 border-gray-900/30'
};

const statusSizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
};

// Auto-detect variant based on status text
function getVariantFromStatus(status: string): StatusBadgeProps['variant'] {
    const lowerStatus = status.toLowerCase();

    if (['active', 'completed', 'success', 'paid', 'delivered'].includes(lowerStatus)) {
        return 'success';
    }
    if (['pending', 'processing', 'trial', 'pending_payment'].includes(lowerStatus)) {
        return 'warning';
    }
    if (['cancelled', 'failed', 'expired', 'error', 'inactive'].includes(lowerStatus)) {
        return 'danger';
    }
    if (['info', 'draft'].includes(lowerStatus)) {
        return 'info';
    }
    return 'neutral';
}

export function StatusBadge({
    status,
    variant,
    size = 'md',
    className = ''
}: StatusBadgeProps) {
    const autoVariant = variant || getVariantFromStatus(status) || 'neutral';
    const variantClasses = statusVariants[autoVariant];
    const sizeClasses = statusSizes[size];

    const baseClasses = 'inline-flex items-center border rounded-full font-medium capitalize';
    const finalClassName = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

    // Display status in Romanian
    const statusTranslations: Record<string, string> = {
        active: 'Activ',
        cancelled: 'Anulat',
        pending: 'În așteptare',
        pending_payment: 'Plată în așteptare',
        trial: 'Perioadă de probă',
        expired: 'Expirat',
        failed: 'Eșuat',
        completed: 'Finalizat',
        paid: 'Plătit',
        processing: 'În procesare',
        inactive: 'Inactiv',
        available: 'Disponibil'
    };
    
    const displayStatus = statusTranslations[status.toLowerCase()] || status;

    return (
        <span className={finalClassName}>
            {displayStatus}
        </span>
    );
}
