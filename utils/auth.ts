import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { NextResponse } from 'next/server';
import type { cookies } from 'next/headers';
import type { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import database, { users } from '@/database';
import { eq } from 'drizzle-orm';

// Cookie names
const AUTH_COOKIE_NAME = 'minidash_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

// Secret key for token encryption - in production, this would be an environment variable
const SECRET_KEY = process.env.AUTH_SECRET || 'your-secret-key-change-in-production';

// Interface for user data stored in the cookie
interface AuthUser {
  id: string;
  email: string;
  name: string;
}

// Interface for the encrypted token payload
interface TokenPayload {
  user: AuthUser;
  exp: number;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a random user ID
 */
export function generateUserId(): string {
  return uuidv4();
}

/**
 * Create an encrypted auth token for the user
 */
export function createAuthToken(user: AuthUser): string {
  const payload: TokenPayload = {
    user,
    exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE, // Expiry in seconds
  };
  
  return CryptoJS.AES.encrypt(JSON.stringify(payload), SECRET_KEY).toString();
}

/**
 * Verify and decode an auth token
 */
export function verifyAuthToken(token: string): AuthUser | null {
  try {
    const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    const payload = JSON.parse(decryptedData) as TokenPayload;
    
    // Check if token has expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload.user;
  } catch (error) {
    return null;
  }
}

/**
 * Set the auth cookie in the browser
 * @returns {Response} A response with the cookie set
 */
export function setAuthCookie(user: AuthUser): Response {
  try {
    const token = createAuthToken(user);
    
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });
    
    // Set the cookie on the response
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error setting auth cookie:', error);
    throw new Error('Failed to set authentication cookie');
  }
}

/**
 * Delete the auth cookie
 * @returns {Response} A response with the cookie cleared
 */
export function clearAuthCookie(): Response {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    // Clear the cookie
    response.cookies.delete(AUTH_COOKIE_NAME);
    
    return response;
  } catch (error) {
    console.error('Error clearing auth cookie:', error);
    throw new Error('Failed to clear authentication cookie');
  }
}

/**
 * Get the authenticated user from the cookie
 */
export function getAuthUser(): AuthUser | null {
  try {
    const token = getCookie(AUTH_COOKIE_NAME);
    
    if (!token) {
      return null;
    }
    
    const user = verifyAuthToken(token as string);
    
    // If token is invalid or expired, clear the cookie
    if (!user) {
      try {
        clearAuthCookie();
      } catch (clearError) {
        // Just log the error but don't fail the entire function
        console.error('Error clearing invalid auth cookie:', clearError);
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

/**
 * Extracts auth token from request headers (for API routes)
 */
export function getAuthTokenFromRequest(request: Request): string | null {
  try {
    // Try to get from authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Try to get from cookie header
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === AUTH_COOKIE_NAME) {
          return decodeURIComponent(value);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting auth token:', error);
    return null;
  }
}

/**
 * Verify authentication from a request object and return user ID
 */
export function verifyAuthFromRequest(request: Request): string | null {
  try {
    const token = getAuthTokenFromRequest(request);
    if (!token) return null;
    
    const user = verifyAuthToken(token);
    return user?.id || null;
  } catch (error) {
    console.error('Authentication verification error:', error);
    return null;
  }
}

/**
 * Get the hardcoded test user ID for development
 * WARNING: Only use this in development mode!
 */
export function getTestUserId(): string {
  return process.env.NODE_ENV !== 'production' ? 'test-user-id' : '';
}

/**
 * Verify authentication for API routes, handling all possible input types
 */
export async function verifyAuth(request: Request | NextRequest | null): Promise<string | null> {
  try {
    // First try to get user ID from request
    if (request) {
      const userId = verifyAuthFromRequest(request);
      if (userId) return userId;
    }
    
    // If we're still in development, return test user as fallback
    if (process.env.NODE_ENV !== 'production') {
      const testId = getTestUserId();
      if (testId) {
        console.warn('Using test user ID for authentication - NOT SECURE FOR PRODUCTION');
        return testId;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

/**
 * Get the full auth session with user details from database
 */
export async function getAuthSession(request?: Request) {
  try {
    // Get user ID from auth token
    const userId = request ? await verifyAuth(request) : getAuthUser()?.id;
    
    if (!userId) {
      return null;
    }
    
    // Query database to get full user data
    const [user] = await database.select({
      id: users.id,
      email: users.email,
      name: users.name,
      picture: users.picture,
      createdAt: users.createdAt,
      billingName: users.billingName,
      billingCompany: users.billingCompany,
      billingVat: users.billingVat,
      billingAddress: users.billingAddress,
      billingPhone: users.billingPhone,
      stripeCustomerId: users.stripeCustomerId,
      admin: users.admin,
    }).from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    return user ? { user } : null;
  } catch (error) {
    console.error('Error getting auth session:', error);
    return null;
  }
}