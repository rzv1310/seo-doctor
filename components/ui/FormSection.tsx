'use client';

import React from 'react';
import { Card } from './Card';



interface FormSectionProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
    bordered?: boolean;
}

export function FormSection({
    title,
    subtitle,
    children,
    className = '',
    bordered = true
}: FormSectionProps) {
    return (
        <Card className={`p-6 sm:p-8 ${className}`} bordered={bordered} glass>
            {(title || subtitle) && (
                <div className="mb-6">
                    {title && (
                        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="text-text-secondary text-sm sm:text-base">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            {children}
        </Card>
    );
}

interface FormGroupProps {
    children: React.ReactNode;
    className?: string;
}

export function FormGroup({ children, className = '' }: FormGroupProps) {
    return (
        <div className={`space-y-4 mb-6 ${className}`}>
            {children}
        </div>
    );
}

interface FormRowProps {
    children: React.ReactNode;
    className?: string;
}

export function FormRow({ children, className = '' }: FormRowProps) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
            {children}
        </div>
    );
}

interface FormActionsProps {
    children: React.ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
}

export function FormActions({
    children,
    className = '',
    align = 'right'
}: FormActionsProps) {
    const alignClasses = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end'
    };

    return (
        <div className={`flex flex-col sm:flex-row gap-3 ${alignClasses[align]} pt-6 border-t border-border-color ${className}`}>
            {children}
        </div>
    );
}
