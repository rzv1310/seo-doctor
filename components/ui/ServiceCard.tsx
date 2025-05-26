'use client';

import React from 'react';
import { ActionButton } from './ActionButton';
import { Card } from './Card';



interface ServiceCardProps {
    title: string;
    description: string;
    price: string;
    features: string[];
    href: string;
    popular?: boolean;
    className?: string;
}

export function ServiceCard({
    title,
    description,
    price,
    features,
    href,
    popular = false,
    className = ''
}: ServiceCardProps) {
    return (
        <Card
            className={`relative p-6 sm:p-8 h-full flex flex-col ${popular ? 'border-primary shadow-lg shadow-primary/20' : ''} ${className}`}
            hover
            glass
        >
            {popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-1 rounded-full text-sm font-medium">
                        Popular
                    </span>
                </div>
            )}

            <div className="flex-1">
                <div className="mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                        {title}
                    </h3>
                    <p className="text-text-secondary text-sm sm:text-base">
                        {description}
                    </p>
                </div>

                <div className="mb-6">
                    <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">
                        {price}
                    </div>
                    <p className="text-text-secondary text-sm">
                        per month
                    </p>
                </div>

                <ul className="space-y-3 mb-8">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <svg
                                className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="text-text-secondary text-sm sm:text-base">
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <ActionButton
                href={href}
                fullWidth
                size="md"
                fullRounded={false}
                showArrow={false}
            >
                Choose Plan
            </ActionButton>
        </Card>
    );
}

interface PricingCardProps {
    plan: {
        name: string;
        price: string;
        period: string;
        description: string;
        features: string[];
        popular?: boolean;
        buttonText?: string;
        buttonHref?: string;
    };
    className?: string;
}

export function PricingCard({ plan, className = '' }: PricingCardProps) {
    return (
        <div className={`relative ${className}`}>
            {plan.popular && (
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-dark rounded-2xl blur opacity-30"></div>
            )}

            <Card
                className={`relative p-6 sm:p-8 h-full flex flex-col ${plan.popular ? 'border-primary' : ''}`}
                glass
                hover
            >
                {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-1 rounded-full text-sm font-semibold">
                            Most Popular
                        </span>
                    </div>
                )}

                <div className="text-center mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                        {plan.name}
                    </h3>
                    <p className="text-text-secondary text-sm sm:text-base mb-4">
                        {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl sm:text-5xl font-bold text-primary">
                            {plan.price}
                        </span>
                        <span className="text-text-secondary text-sm sm:text-base">
                            /{plan.period}
                        </span>
                    </div>
                </div>

                <ul className="flex-1 space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <svg
                                className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="text-text-secondary text-sm sm:text-base">
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>

                <ActionButton
                    href={plan.buttonHref}
                    fullWidth
                    size="md"
                    fullRounded={false}
                    showArrow={false}
                >
                    {plan.buttonText || 'Get Started'}
                </ActionButton>
            </Card>
        </div>
    );
}
