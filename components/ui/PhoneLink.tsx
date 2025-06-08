import { forwardRef } from 'react';
import { contactInfo } from '@/data/contact';



export interface PhoneLinkProps {
    phone?: string;
    formatted?: string;
    inline?: boolean;
    variant?: 'default' | 'primary' | 'muted';
    underline?: boolean;
}

const DEFAULT_PHONE = contactInfo.phone;
const DEFAULT_FORMATTED = contactInfo.phoneFormatted;

export const PhoneLink = forwardRef<HTMLAnchorElement, PhoneLinkProps>(
    ({
        phone = DEFAULT_PHONE,
        formatted = DEFAULT_FORMATTED,
        inline = true,
        variant = 'default',
        underline = false
    }, ref) => {
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        
        return (
            <a
                ref={ref}
                href={`tel:${cleanPhone}`}
                className={`${inline ? 'inline' : 'flex items-center'} text-green-500 hover:text-green-400 transition-colors duration-200 ${underline ? 'hover:underline' : ''}`}
            >
                {formatted}
            </a>
        );
    }
);

PhoneLink.displayName = 'PhoneLink';