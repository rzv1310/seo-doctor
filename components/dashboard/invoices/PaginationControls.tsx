'use client';

import { LinkButton } from '@/components/ui';



interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export default function PaginationControls({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange
}: PaginationControlsProps) {
    const generatePaginationButtons = () => {
        const buttons = [];
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        const endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        // Add first page button if not already in range
        if (startPage > 1) {
            buttons.push(
                <LinkButton
                    key={1}
                    onClick={() => onPageChange(1)}
                    variant="default"
                    size="sm"
                >
                    1
                </LinkButton>
            );
            if (startPage > 2) {
                buttons.push(<span key="ellipsis1" className="px-1">...</span>);
            }
        }

        // Add page buttons
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <LinkButton
                    key={i}
                    onClick={() => onPageChange(i)}
                    variant={i === currentPage ? 'primary' : 'default'}
                    size="sm"
                >
                    {i}
                </LinkButton>
            );
        }

        // Add last page button if not already in range
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons.push(<span key="ellipsis2" className="px-1">...</span>);
            }
            buttons.push(
                <LinkButton
                    key={totalPages}
                    onClick={() => onPageChange(totalPages)}
                    variant="default"
                    size="sm"
                >
                    {totalPages}
                </LinkButton>
            );
        }

        return buttons;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-between items-center">
            <div className="text-sm text-text-primary">
                Afișez {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, totalItems)} din {totalItems} rezultate
            </div>
            <div className="flex space-x-1">
                {generatePaginationButtons()}
            </div>
        </div>
    );
}
