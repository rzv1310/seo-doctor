// Currency conversion utilities
// Exchange rate: 5 RON = 1 EUR
export const RON_TO_EUR_RATE = 0.2; // 1 RON = 0.2 EUR (5:1 conversion rate)
export const EUR_TO_RON_RATE = 5; // 1 EUR = 5 RON



/**
 * Convert RON to EUR
 * @param amountInRON - Amount in RON (in bani - smallest unit)
 * @returns Amount in EUR (in cents - smallest unit)
 */
export function convertRONtoEUR(amountInRON: number): number {
    // Convert from bani to RON, then to EUR, then to cents
    const ron = amountInRON / 100;
    const eur = ron * RON_TO_EUR_RATE;
    return Math.round(eur * 100);
}

/**
 * Convert EUR to RON
 * @param amountInEUR - Amount in EUR (in cents - smallest unit)
 * @returns Amount in RON (in bani - smallest unit)
 */
export function convertEURtoRON(amountInEUR: number): number {
    // Convert from cents to EUR, then to RON, then to bani
    const eur = amountInEUR / 100;
    const ron = eur / RON_TO_EUR_RATE;
    return Math.round(ron * 100);
}

/**
 * Format RON amount for display
 * @param amountInBani - Amount in bani (smallest unit)
 * @returns Formatted string (e.g., "5.000 RON")
 */
export function formatRON(amountInBani: number): string {
    const ron = amountInBani / 100;
    return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'RON',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(ron);
}

/**
 * Format EUR amount for display
 * @param amountInCents - Amount in cents (smallest unit)
 * @returns Formatted string (e.g., "1.000 €")
 */
export function formatEUR(amountInCents: number): string {
    const eur = amountInCents / 100;
    return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(eur);
}

/**
 * Get display price in EUR for a RON amount
 * @param amountInRON - Amount in RON (in bani - smallest unit)
 * @returns Formatted EUR string for display
 */
export function getDisplayPriceInEUR(amountInRON: number): string {
    const eurInCents = convertRONtoEUR(amountInRON);
    return formatEUR(eurInCents);
}

/**
 * Convert RON bani to EUR cents (alias for convertRONtoEUR)
 * @param ronBani - Amount in RON bani (smallest unit)
 * @returns Amount in EUR cents (smallest unit)
 */
export function convertRONBaniToEURCents(ronBani: number): number {
    return convertRONtoEUR(ronBani);
}