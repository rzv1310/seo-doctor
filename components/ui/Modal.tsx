'use client';

import { ReactNode, useEffect } from 'react';



interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const modalSizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
};

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className = ''
}: ModalProps) {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = modalSizes[size];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className={`relative bg-dark-blue-lighter rounded-lg shadow-xl w-full ${sizeClasses} ${className}`.trim()}>
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between p-6 border-b border-border-color">
                        <h2 className="text-xl font-semibold">{title}</h2>
                        <button
                            type="button"
                            className="rounded-md p-2 text-text-secondary hover:text-text-primary hover:bg-dark-blue-lightest transition-colors"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false
}: ConfirmationModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="mb-6">
                <p className="text-text-secondary">{message}</p>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-text-secondary hover:text-text-primary border border-border-color rounded-md hover:bg-dark-blue-lightest transition-colors disabled:opacity-50"
                >
                    {cancelText}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${variant === 'danger'
                            ? 'bg-danger hover:bg-danger/90 text-white'
                            : variant === 'warning'
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-primary hover:bg-primary-dark text-white'
                        }`}
                >
                    {loading && (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
}
