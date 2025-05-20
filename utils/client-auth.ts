import CryptoJS from 'crypto-js';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

// Cookie names
const AUTH_COOKIE_NAME = 'minidash_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

// Secret key for token encryption - in production, this would be an environment variable
const SECRET_KEY = process.env.NEXT_PUBLIC_AUTH_SECRET || 'your-secret-key-change-in-production';

// Interface for user data stored in the cookie
export interface AuthUser {
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
 * Get the authenticated user from the cookie
 */
export function getAuthUser(): AuthUser | null {
  try {
    const token = getCookie(AUTH_COOKIE_NAME);

    if (!token) {
      return null;
    }

    const user = verifyAuthToken(token as string);

    // Don't attempt to clear the cookie on the client side to avoid
    // potential issues with server-rendered cookies
    return user;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}