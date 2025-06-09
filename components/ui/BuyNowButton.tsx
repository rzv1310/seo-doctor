'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { services } from '@/data/services';
import { ActionButton } from './ActionButton';



interface BuyNowButtonProps {
    serviceName: 'GMB MAX' | 'GOOGLE ORGANIC';
    size?: 'sm' | 'md' | 'lg';
    fullRounded?: boolean;
    showArrow?: boolean;
}

export function BuyNowButton({ serviceName, size = 'lg', fullRounded = false, showArrow = true }: BuyNowButtonProps) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { addItem } = useCart();
    
    const handleClick = () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        
        // Find the service data
        const service = services.find(s => s.name === serviceName);
        if (!service) {
            console.error(`Service ${serviceName} not found`);
            return;
        }
        
        // Add to cart
        addItem({
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            priceValue: service.priceValue,
            priceValueEUR: service.priceValueEUR,
            features: service.features,
            period: service.period
        });
        
        // Redirect to checkout
        router.push('/dashboard/checkout');
    };
    
    return (
        <ActionButton 
            onClick={handleClick}
            size={size}
            fullRounded={fullRounded}
            showArrow={showArrow}
        >
            Cumpără acum!
        </ActionButton>
    );
}