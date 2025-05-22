import { forwardRef } from 'react';
import Link from 'next/link';

export interface LinkButtonProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  onClick?: () => void;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ children, href, className = '', onClick, ...props }, ref) => {
    const baseClasses = 'text-text-secondary font-bold hover:text-primary transition-all';

    return (
      <Link
        ref={ref}
        href={href}
        onClick={onClick}
        className={`${baseClasses} ${className}`.trim()}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

LinkButton.displayName = 'LinkButton';