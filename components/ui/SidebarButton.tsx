'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarButtonProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    divider?: boolean;
}

export function SidebarButton({ href, icon, label, onClick, divider }: SidebarButtonProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <div>
            {divider && <hr className="my-2 border-glass-border" />}
            <Link
                href={href}
                onClick={onClick}
                className={`sidebar-item group flex items-center px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'active' : ''
                }`}
            >
                <span className={`transition-colors ${
                    isActive
                        ? 'text-sky-400'
                        : 'text-text-primary group-hover:text-sky-400'
                }`}>
                    {icon}
                </span>
                <span className={`ml-3 transition-colors ${
                    isActive
                        ? 'text-text-primary'
                        : 'text-text-primary group-hover:text-sky-400'
                }`}>
                    {label}
                </span>
            </Link>
        </div>
    );
}