import { forwardRef } from 'react';



export interface PhoneLinkProps {
    phone?: string;
    formatted?: string;
    inline?: boolean;
    variant?: 'default' | 'primary' | 'muted';
    underline?: boolean;
}

const DEFAULT_PHONE = '+40742702982';
const DEFAULT_FORMATTED = '+40 742 702 982';

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