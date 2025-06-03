import stripe from './stripe-server';
import { logger } from './logger';
import { BillingDetails, ParsedAddress, StripeCustomerUpdateData } from '@/types/billing';



// Utility function to parse Romanian address format
export function parseAddress(addressString: string): ParsedAddress {
    if (!addressString?.trim()) {
        throw new Error('Address string is required');
    }

    // Split by comma and clean up parts
    const parts = addressString.split(',').map(part => part.trim()).filter(Boolean);
    
    if (parts.length < 2) {
        throw new Error('Address must contain at least street and city');
    }

    // Default structure for Romanian addresses
    // Format: "Strada, Numărul, Bloc/Scara/Apt, Localitatea, Județul, Cod Poștal"
    const address: ParsedAddress = {
        line1: parts[0] || '',
        city: parts[parts.length - 3] || parts[parts.length - 2] || parts[1] || '',
        postal_code: extractPostalCode(parts[parts.length - 1] || ''),
        country: 'RO'
    };

    // Add line2 if we have building/apartment info
    if (parts.length > 3) {
        const buildingInfo = parts.slice(1, parts.length - 2).join(', ');
        if (buildingInfo) {
            address.line2 = buildingInfo;
        }
    }

    // Add state if available
    if (parts.length >= 3) {
        const potentialState = parts[parts.length - 2];
        if (potentialState && !isPostalCode(potentialState)) {
            address.state = potentialState;
        }
    }

    return address;
}

// Extract postal code from a string (Romanian format: 6 digits)
function extractPostalCode(text: string): string {
    const postalCodeMatch = text.match(/\b\d{6}\b/);
    return postalCodeMatch ? postalCodeMatch[0] : '';
}

// Check if a string looks like a postal code
function isPostalCode(text: string): boolean {
    return /^\d{6}$/.test(text.trim());
}

// Validate billing details
export function validateBillingDetails(details: BillingDetails): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // At least one name type is required
    if (!details.billingName && !details.billingCompany) {
        errors.push('Either personal name or company name is required');
    }

    // Address is required
    if (!details.billingAddress?.trim()) {
        errors.push('Billing address is required');
    } else {
        try {
            parseAddress(details.billingAddress);
        } catch (error) {
            errors.push(`Invalid address format: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Validate VAT number format if provided (Romanian CUI format)
    if (details.billingVat) {
        const vatNumber = details.billingVat.replace(/\s+/g, '');
        if (!/^(RO)?[\d]{2,10}$/.test(vatNumber)) {
            errors.push('Invalid VAT number format (should be RO followed by 2-10 digits)');
        }
    }

    // Validate registration number format if provided (Romanian J format)
    if (details.billingRegistrationNumber) {
        const regNumber = details.billingRegistrationNumber.trim();
        if (!regNumber.startsWith('J')) {
            errors.push('Numărul de înregistrare trebuie să înceapă cu litera J');
        }
    }

    // Validate phone number if provided
    if (details.billingPhone) {
        const phoneNumber = details.billingPhone.replace(/[\s\-\(\)]/g, '');
        if (!/^(\+40|0040|0)?[1-9]\d{8}$/.test(phoneNumber)) {
            errors.push('Invalid Romanian phone number format');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Sanitize billing details input
export function sanitizeBillingDetails(details: BillingDetails): BillingDetails {
    return {
        billingName: details.billingName?.trim() || null,
        billingCompany: details.billingCompany?.trim() || null,
        billingVat: details.billingVat?.trim().toUpperCase() || null,
        billingRegistrationNumber: details.billingRegistrationNumber?.trim().toUpperCase() || null,
        billingAddress: details.billingAddress?.trim() || null,
        billingPhone: details.billingPhone?.trim() || null,
    };
}

// Convert billing details to Stripe customer update format
export function billingDetailsToStripeFormat(details: BillingDetails): StripeCustomerUpdateData {
    const updateData: StripeCustomerUpdateData = {};

    // Set customer name (prioritize company name)
    const name = details.billingCompany || details.billingName;
    if (name) {
        updateData.name = name;
    }

    // Parse and set address
    if (details.billingAddress) {
        try {
            updateData.address = parseAddress(details.billingAddress);
        } catch (error) {
            logger.warn('Failed to parse address for Stripe', { 
                address: details.billingAddress,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    // Set phone number
    if (details.billingPhone) {
        updateData.phone = details.billingPhone;
    }

    // Set tax status based on VAT number
    if (details.billingVat) {
        updateData.tax_exempt = 'none'; // Customer has VAT number but is not exempt
    }

    return updateData;
}

// Update Stripe customer with billing details
export async function updateStripeCustomerBilling(
    stripeCustomerId: string, 
    billingDetails: BillingDetails,
    userId?: string
): Promise<void> {
    try {
        const updateData = billingDetailsToStripeFormat(billingDetails);
        
        if (Object.keys(updateData).length === 0) {
            logger.info('No billing details to update in Stripe', { stripeCustomerId, userId });
            return;
        }

        await stripe.customers.update(stripeCustomerId, updateData);
        
        logger.info('Stripe customer billing details updated successfully', { 
            stripeCustomerId, 
            userId,
            updatedFields: Object.keys(updateData)
        });
    } catch (error) {
        logger.error('Failed to update Stripe customer billing details', { 
            error: error instanceof Error ? error.message : String(error),
            stripeCustomerId,
            userId
        });
        throw error;
    }
}

// Format address for display
export function formatAddressForDisplay(address: ParsedAddress): string {
    const parts = [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postal_code,
        address.country
    ].filter(Boolean);
    
    return parts.join(', ');
}