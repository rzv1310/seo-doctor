// Translate common Stripe error messages to Romanian

interface StripeErrorTranslations {
    [key: string]: string;
}

const stripeErrorTranslations: StripeErrorTranslations = {
    // Authentication errors
    'We are unable to authenticate your payment method. Please choose a different payment method and try again.': 'Nu putem autentifica metoda ta de plată. Te rugăm să alegi o altă metodă de plată și să încerci din nou.',
    'Your card was declined.': 'Cardul tău a fost refuzat.',
    'Your card does not support this type of purchase.': 'Cardul tău nu suportă acest tip de achiziție.',
    'Your card has insufficient funds.': 'Cardul tău are fonduri insuficiente.',
    'Your card was declined. Your request was in live mode, but used a known test card.': 'Cardul tău a fost refuzat. Cererea ta a fost în modul live, dar a folosit un card de test cunoscut.',
    'Your card number is incorrect.': 'Numărul cardului tău este incorect.',
    'Your card has expired.': 'Cardul tău a expirat.',
    'Your card\'s security code is incorrect.': 'Codul de securitate al cardului tău este incorect.',
    'Your postal code is incorrect.': 'Codul poștal este incorect.',
    'Your card is not supported. Please use a different card.': 'Cardul tău nu este suportat. Te rugăm să folosești un alt card.',
    
    // 3D Secure errors
    'Your card was declined due to insufficient funds.': 'Cardul tău a fost refuzat din cauza fondurilor insuficiente.',
    'Authentication failed.': 'Autentificarea a eșuat.',
    
    // Processing errors
    'An error occurred while processing your card. Try again in a little bit.': 'A apărut o eroare în timpul procesării cardului. Încearcă din nou în câteva momente.',
    'Unable to process payment at this time. Please try again later.': 'Nu putem procesa plata în acest moment. Te rugăm să încerci din nou mai târziu.',
    'Payment processing failed. Please try again.': 'Procesarea plății a eșuat. Te rugăm să încerci din nou.',
    
    // Network errors
    'There was a problem connecting to our payment processor. Please try again.': 'A apărut o problemă la conectarea cu procesatorul nostru de plăți. Te rugăm să încerci din nou.',
    'Unable to connect to Stripe. Please check your internet connection and try again.': 'Nu ne putem conecta la Stripe. Te rugăm să verifici conexiunea la internet și să încerci din nou.',
    
    // Generic errors
    'Something went wrong. Please try again.': 'Ceva nu a mers bine. Te rugăm să încerci din nou.',
    'An unexpected error occurred.': 'A apărut o eroare neașteptată.',
    'Payment failed. Please try again.': 'Plata a eșuat. Te rugăm să încerci din nou.',
};

// Common Stripe error codes and their Romanian translations
const stripeErrorCodes: StripeErrorTranslations = {
    'card_declined': 'Cardul a fost refuzat.',
    'expired_card': 'Cardul a expirat.',
    'incorrect_cvc': 'Codul de securitate (CVC) este incorect.',
    'insufficient_funds': 'Fonduri insuficiente.',
    'invalid_number': 'Numărul cardului este invalid.',
    'processing_error': 'A apărut o eroare în timpul procesării.',
    'authentication_required': 'Este necesară autentificarea suplimentară.',
    'generic_decline': 'Cardul a fost refuzat.',
    'lost_card': 'Cardul a fost raportat ca pierdut.',
    'stolen_card': 'Cardul a fost raportat ca furat.',
    'pickup_card': 'Contactează banca pentru acest card.',
    'restricted_card': 'Cardul are restricții.',
    'security_violation': 'Violație de securitate.',
    'service_not_allowed': 'Serviciul nu este permis.',
    'stop_payment_order': 'Plata a fost oprită.',
    'testmode_decline': 'Cardul de test a fost refuzat în modul de testare.',
    'withdrawal_count_limit_exceeded': 'Limita de retrageri a fost depășită.',
};

/**
 * Translate Stripe error messages to Romanian
 */
export function translateStripeError(error: any): string {
    if (!error) {
        return 'A apărut o eroare neașteptată.';
    }

    let errorMessage = '';

    // If error has a message, try to translate it
    if (error.message) {
        errorMessage = stripeErrorTranslations[error.message] || error.message;
    }

    // If error has a code, try to get Romanian translation for the code
    if (error.code && stripeErrorCodes[error.code]) {
        // If we have a code translation and no message translation, use code translation
        if (!stripeErrorTranslations[error.message]) {
            errorMessage = stripeErrorCodes[error.code];
        }
    }

    // If error has decline_code, try to translate it
    if (error.decline_code && stripeErrorCodes[error.decline_code]) {
        errorMessage = stripeErrorCodes[error.decline_code];
    }

    // Fallback to original message or generic error
    if (!errorMessage) {
        errorMessage = error.message || error.toString() || 'A apărut o eroare la procesarea plății.';
    }

    return errorMessage;
}

/**
 * Translate general payment error messages to Romanian
 */
export function translatePaymentError(message: string): string {
    // First try direct translation
    if (stripeErrorTranslations[message]) {
        return stripeErrorTranslations[message];
    }

    // Try partial matches for common patterns
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('unable to authenticate') && lowerMessage.includes('payment method')) {
        return 'Nu putem autentifica metoda ta de plată. Te rugăm să alegi o altă metodă de plată și să încerci din nou.';
    }
    
    if (lowerMessage.includes('card was declined')) {
        return 'Cardul tău a fost refuzat.';
    }
    
    if (lowerMessage.includes('insufficient funds')) {
        return 'Fonduri insuficiente.';
    }
    
    if (lowerMessage.includes('expired')) {
        return 'Cardul a expirat.';
    }
    
    if (lowerMessage.includes('security code') || lowerMessage.includes('cvc')) {
        return 'Codul de securitate al cardului este incorect.';
    }
    
    if (lowerMessage.includes('authentication failed')) {
        return 'Autentificarea a eșuat.';
    }
    
    if (lowerMessage.includes('connection') || lowerMessage.includes('network')) {
        return 'Problemă de conectare. Te rugăm să verifici conexiunea la internet și să încerci din nou.';
    }

    // Return original message if no translation found
    return message;
}