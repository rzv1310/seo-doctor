'use client';

import { useState } from 'react';
import { ActionButton } from './ActionButton';
import type { ActionButtonProps } from './ActionButton';


interface AcceptButtonProps extends Omit<ActionButtonProps, 'onClick'> {
    onAccept: () => void | Promise<void>;
    confirmTitle: string;
    confirmMessage?: string;
    acceptText?: string;
    cancelText?: string;
}

export function AcceptButton({
    onAccept,
    confirmTitle,
    confirmMessage,
    acceptText = 'Da',
    cancelText = 'Nu',
    children,
    ...buttonProps
}: AcceptButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirm(true);
    };

    const handleAccept = async () => {
        setIsProcessing(true);
        try {
            await onAccept();
            setShowConfirm(false);
        } catch (error) {
            console.error('Error in accept action:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        setShowConfirm(false);
    };

    return (
        <>
            <ActionButton
                {...buttonProps}
                onClick={handleClick}
            >
                {children}
            </ActionButton>

            {showConfirm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg max-w-sm w-full p-6">
                        <h3 className="text-lg font-semibold mb-2">{confirmTitle}</h3>
                        {confirmMessage && (
                            <p className="text-text-secondary text-sm mb-4">{confirmMessage}</p>
                        )}
                        
                        <div className="flex gap-3 justify-end mt-6">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 rounded bg-glass-bg backdrop-blur-sm border border-glass-border hover:bg-white/10 transition-colors text-sm font-medium"
                                disabled={isProcessing}
                            >
                                {cancelText}
                            </button>
                            <button
                                type="button"
                                onClick={handleAccept}
                                className="px-4 py-2 rounded bg-danger hover:bg-danger/80 transition-colors text-sm font-medium"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Se procesează...
                                    </span>
                                ) : acceptText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}