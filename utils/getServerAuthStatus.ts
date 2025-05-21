import { cookies } from 'next/headers';
import { verifyAuthToken } from './auth';

// Cookie name
const AUTH_COOKIE_NAME = 'minidash_auth';

/**
 * Server-side function to check authentication status
 * This should be used in your Server Components or page.tsx files
 *
 * This needs to be async with Next.js App Router
 */
export async function getServerAuthStatus() {
  try {
    // Access cookies directly
    const cookieStore = await cookies();

    // Get auth token from cookies without using methods that need to be awaited
    const tokenCookie = cookieStore.get(AUTH_COOKIE_NAME);
    const token = tokenCookie?.value;

    // Verify token
    const user = token ? verifyAuthToken(token) : null;

    return {
      isAuthenticated: !!user,
      user
    };
  } catch (error) {
    console.error('Error in getServerAuthStatus:', error);
    return {
      isAuthenticated: false,
      user: null
    };
  }
}