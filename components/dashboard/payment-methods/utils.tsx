export const getCardIcon = (brand: string) => {
  const brandLower = brand.toLowerCase();
  switch (brandLower) {
    case 'visa':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="#1434CB">
          <path d="M12 0h-10c-1.105 0-2 .895-2 2v20c0 1.105.895 2 2 2h20c1.105 0 2-.895 2-2v-20c0-1.105-.895-2-2-2h-10zm0 2v6h-10v-6h10zm-10 8h10v12h-10v-12zm12 12v-12h10v12h-10zm10-14h-10v-6h10v6z" />
        </svg>
      );
    case 'mastercard':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24">
          <circle cx="7" cy="12" r="7" fill="#EB001B" />
          <circle cx="17" cy="12" r="7" fill="#F79E1B" />
          <path d="M12 17.5a7 7 0 010-11c1.94 1.94 1.94 9.06 0 11z" fill="#FF5F00" />
        </svg>
      );
    case 'amex':
    case 'american express':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="#2E77BB">
          <rect width="24" height="24" rx="2" />
        </svg>
      );
    case 'discover':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="#FF6000">
          <rect width="24" height="24" rx="2" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
  }
};