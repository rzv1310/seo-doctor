import { ReactNode } from 'react';



export interface CardProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    bordered?: boolean;
    glass?: boolean;
    hover?: boolean;
    className?: string;
}

export function Card({
    children,
    title,
    subtitle,
    bordered = true,
    glass = false,
    hover = false,
    className = ''
}: CardProps) {
    const baseClasses = 'rounded-xl overflow-hidden';

    const backgroundClasses = glass
        ? 'bg-dark-blue-lighter/40 backdrop-blur-sm'
        : 'bg-dark-blue-lighter';

    const borderClasses = bordered ? 'border border-border-color' : '';

    const hoverClasses = hover
        ? 'transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10'
        : '';

    const finalClassName = `${baseClasses} ${backgroundClasses} ${borderClasses} ${hoverClasses} ${className}`.trim();

    return (
        <div className={finalClassName}>
            {(title || subtitle) && (
                <div className="p-6 border-b border-border-color">
                    {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
                    {subtitle && <p className="text-text-secondary">{subtitle}</p>}
                </div>
            )}
            <div className={title || subtitle ? 'p-6' : 'p-6'}>
                {children}
            </div>
        </div>
    );
}

export interface DashboardCardProps extends CardProps {
    icon?: ReactNode;
    value?: string | number;
    label?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export function DashboardCard({
    icon,
    value,
    label,
    trend,
    children,
    ...cardProps
}: DashboardCardProps) {
    return (
        <Card
            className="dashboard-card"
            glass
            hover
            {...cardProps}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {icon && (
                        <div className="text-2xl text-primary mb-3">
                            {icon}
                        </div>
                    )}
                    {value && (
                        <div className="text-2xl font-bold mb-1">
                            {value}
                        </div>
                    )}
                    {label && (
                        <div className="text-text-secondary text-sm">
                            {label}
                        </div>
                    )}
                    {children}
                </div>
                {trend && (
                    <div className={`text-sm font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </div>
                )}
            </div>
        </Card>
    );
}
