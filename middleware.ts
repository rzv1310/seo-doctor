import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import CryptoJS from 'crypto-js';
import { eq } from 'drizzle-orm';
import database, { users } from '@/database';
import { AUTH_COOKIE_NAME, SECRET_KEY } from '@/data/auth';

async function verifyAuthToken(token: string): Promise<string | null> {
    try {
        const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        const payload = JSON.parse(decryptedData) as { userId: string; exp: number };

        if (payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        // Check if user exists in database
        const [user] = await database.select({ id: users.id })
            .from(users)
            .where(eq(users.id, payload.userId))
            .limit(1);

        if (!user) {
            return null;
        }

        return payload.userId;
    } catch (error) {
        return null;
    }
}

// Routes that require authentication
const PROTECTED_ROUTES = [
    '/dashboard',
    '/dashboard/',
];

// API routes that require authentication
const PROTECTED_API_ROUTES = [
    '/api/dashboard',
    '/api/create-payment-intent',
    '/api/admin',
];

// Public API routes that don't require authentication
const PUBLIC_API_ROUTES = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/me',
    '/api/webhook',
];

// API routes that should handle auth internally (not in middleware)
const INTERNAL_AUTH_API_ROUTES = [
    '/api/messages/sse',
    '/api/messages/unread-count',
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = [
    '/login',
    '/login/',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for auth cookie
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const userId = authCookie ? await verifyAuthToken(authCookie) : null;
    const isAuthenticated = !!userId;

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

    // Check if it's an internal auth API route
    const isInternalAuthApiRoute = INTERNAL_AUTH_API_ROUTES.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // Check if it's an auth route (login, etc.)
    const isAuthRoute = AUTH_ROUTES.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // Skip middleware for logout requests to prevent interference
    if (pathname === '/api/auth/logout') {
        return NextResponse.next();
    }

    // If there's an auth cookie but no valid userId (user not found in DB or token expired),
    // only clear the cookie and redirect for protected routes
    if (authCookie && !userId && (isProtectedRoute || isProtectedApiRoute)) {
        const response = NextResponse.next();
        response.cookies.set({
            name: AUTH_COOKIE_NAME,
            value: '',
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });
        
        // If it's a protected route, redirect to login
        if (isProtectedRoute) {
            const url = new URL('/login', request.url);
            url.searchParams.set('from', pathname);
            return NextResponse.redirect(url, {
                headers: response.headers,
            });
        }
        
        // For protected API routes, return 401
        if (isProtectedApiRoute) {
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

    // Handle API routes with proper security headers
    if (pathname.startsWith('/api/')) {
        const response = NextResponse.next();
        
        // Add security headers
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Only set CORS headers if needed (for specific origins in production)
        const origin = request.headers.get('origin');
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
        
        if (process.env.NODE_ENV === 'development' || 
            (origin && allowedOrigins.includes(origin))) {
            response.headers.set('Access-Control-Allow-Origin', origin || '*');
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            response.headers.set('Access-Control-Allow-Credentials', 'true');
        }

        // Handle OPTIONS request for CORS preflight
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 204,
                headers: response.headers
            });
        }

        // Check if it's a public API route first (allow these regardless of auth)
        if (isPublicApiRoute || isInternalAuthApiRoute) {
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

    // Add security headers for all other routes
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Add HSTS header in production
    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    return response;
}

// Configure the middleware to run only for specific paths
export const config = {
    matcher: [
        // Root path
        '/',
        
        // Protected routes
        '/dashboard',
        '/dashboard/:path*',
        
        // API routes
        '/api/:path*',

        // Auth routes
        '/login',
        '/login/:path*',
    ],
};
