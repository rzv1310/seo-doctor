import { forwardRef } from 'react';
import NextLink from 'next/link';

export interface LinkProps {
  children: React.ReactNode;
  href: string;
  target?: string;
  rel?: string;
  underline?: boolean;
  variant?: 'default' | 'primary' | 'muted';
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({
    children,
    href,
    target,
    rel,
    underline = false,
    variant = 'default',
    ...props
  }, ref) => {
    const variantClasses = {
      default: 'text-text-primary hover:text-text-primary',
      primary: 'text-text-primary hover:text-primary-light',
      muted: 'text-text-secondary hover:text-text-primary'
    };

    const baseClasses = `transition-colors duration-200 ${variantClasses[variant]}
      ${underline ? 'hover:underline' : ''}`;

    // External links or special protocols
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return (
        <a
          ref={ref}
          href={href}
          target={target}
          rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
          className={baseClasses.trim()}
          {...props}
        >
          {children}
        </a>
      );
    }

    // Internal links
    return (
      <NextLink
        ref={ref}
        href={href}
        target={target}
        className={baseClasses.trim()}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);

Link.displayName = 'Link';