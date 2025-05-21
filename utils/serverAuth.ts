import { cookies } from 'next/headers';
import database, { users } from '@/database';
import { eq } from 'drizzle-orm';
import { verifyAuthToken } from './auth';

// Cookie name
const AUTH_COOKIE_NAME = 'minidash_auth';

/**
 * Server-side function to check authentication status
 * This should be used in your Server Components or layout.tsx files
 *
 * This function retrieves the full user from the database, making it
 * a single source of truth for authentication status on initial page load
 */
export async function getServerAuthUser() {
  try {
    // In Next.js 14, we need to use the RequestCookies directly
    const cookieStore = await cookies();

    // Get the value directly without using methods that need to be awaited
    const tokenCookie = cookieStore.get(AUTH_COOKIE_NAME);
    const token = tokenCookie?.value;

    if (!token) {
      return {
        isAuthenticated: false,
        user: null
      };
    }

    // Verify token
    const userFromToken = verifyAuthToken(token);

    if (!userFromToken) {
      return {
        isAuthenticated: false,
        user: null
      };
    }

    // Get complete user data from database
    const [user] = await database.select({
      id: users.id,
      email: users.email,
      name: users.name,
      billingName: users.billingName,
      billingCompany: users.billingCompany,
      billingVat: users.billingVat,
      billingAddress: users.billingAddress,
      billingPhone: users.billingPhone,
      admin: users.admin,
    }).from(users)
      .where(eq(users.id, userFromToken.id))
      .limit(1);

    return {
      isAuthenticated: !!user,
      user: user || null
    };
  } catch (error) {
    console.error('Error in getServerAuthUser:', error);
    return {
      isAuthenticated: false,
      user: null
    };
  }
}