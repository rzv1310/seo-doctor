import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken } from './app/utils/auth';

// Auth cookie name
const AUTH_COOKIE_NAME = 'minidash_auth';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/dashboard/',
];

// API routes that require authentication
const PROTECTED_API_ROUTES = [
  '/api/dashboard',
  '/api/create-payment-intent',
];

// Public API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/webhook',
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = [
  '/login',
  '/login/',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for auth cookie
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = authCookie ? verifyAuthToken(authCookie) : null;
  const isAuthenticated = !!user;

  // Check if it's a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if it's a protected API route
  const isProtectedApiRoute = PROTECTED_API_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if it's a public API route
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if it's an auth route (login, etc.)
  const isAuthRoute = AUTH_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Handle API routes with proper CORS
  if (pathname.startsWith('/api/')) {
    // Add CORS headers for API routes
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 204,
        headers: response.headers
      });
    }
    
    // Check if it's a public API route first (allow these regardless of auth)
    if (isPublicApiRoute) {
      return response;
    }
    
    // Check auth for protected API routes
    if (isProtectedApiRoute && !isAuthenticated) {
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: 'Authentication required' 
        }),
        { 
          status: 401, 
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers)
          }
        }
      );
    }
    
    return response;
  }

  // Redirect to login if trying to access a protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if already authenticated and trying to access login
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Continue for all other routes
  return NextResponse.next();
}

// Configure the middleware to run only for specific paths
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/api/:path*',
    
    // Auth routes
    '/login',
    '/login/:path*',
  ],
};