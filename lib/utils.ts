import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"



export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Generate unique IDs
export function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Format currency
export function formatCurrency(amount: number, currency = 'EUR') {
    return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency,
    }).format(amount / 100)
}

// Format date
export function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat('ro-RO').format(new Date(date))
}
