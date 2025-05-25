import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import database, { users } from '@/database';
import { eq } from 'drizzle-orm';

// Configuration
const AUTH_COOKIE_NAME = 'minidash_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds
const SECRET_KEY = process.env.AUTH_SECRET || 'your-secret-key-change-in-production';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string | null;
  createdAt: string;
  billingName?: string | null;
  billingCompany?: string | null;
  billingVat?: string | null;
  billingAddress?: string | null;
  billingPhone?: string | null;
  stripeCustomerId?: string | null;
  admin?: boolean | null;
}

export interface AuthSession {
  user: User;
  isAuthenticated: true;
}

export interface NoAuthSession {
  user: null;
  isAuthenticated: false;
}

export type SessionResult = AuthSession | NoAuthSession;

interface TokenPayload {
  userId: string;
  exp: number;
}

// Core utilities
export function generateUserId(): string {
  return uuidv4();
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

function createAuthToken(userId: string): string {
  const payload: TokenPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE,
  };
  return CryptoJS.AES.encrypt(JSON.stringify(payload), SECRET_KEY).toString();
}

function verifyAuthToken(token: string): string | null {
  try {
    const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    const payload = JSON.parse(decryptedData) as TokenPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload.userId;
  } catch (error) {
    return null;
  }
}

// Server-side auth functions
export async function getServerSession(): Promise<SessionResult> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(AUTH_COOKIE_NAME);

    if (!tokenCookie?.value) {
      console.log('No auth cookie found');
      return { user: null, isAuthenticated: false };
    }

    const userId = verifyAuthToken(tokenCookie.value);
    if (!userId) {
      console.log('Invalid auth token');
      return { user: null, isAuthenticated: false };
    }

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

    if (!user) {
      return { user: null, isAuthenticated: false };
    }

    return { user, isAuthenticated: true };
  } catch (error) {
    console.error('Error getting server session:', error);
    return { user: null, isAuthenticated: false };
  }
}

// API auth functions
export function getAuthTokenFromRequest(request: Request): string | null {
  try {
    // Try authorization header first
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try cookie header
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

export async function verifyApiAuth(request: Request): Promise<SessionResult> {
  try {
    const token = getAuthTokenFromRequest(request);
    if (!token) {
      return { user: null, isAuthenticated: false };
    }

    const userId = verifyAuthToken(token);
    if (!userId) {
      return { user: null, isAuthenticated: false };
    }

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

    if (!user) {
      return { user: null, isAuthenticated: false };
    }

    return { user, isAuthenticated: true };
  } catch (error) {
    console.error('Error verifying API auth:', error);
    return { user: null, isAuthenticated: false };
  }
}

// Response helpers
export function createAuthResponse(user: User): Response {
  try {
    const token = createAuthToken(user.id);

    const response = NextResponse.json({
      success: true,
      user,
    });

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
    console.error('Error creating auth response:', error);
    throw new Error('Failed to create authentication response');
  }
}

export function createLogoutResponse(): Response {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error('Error creating logout response:', error);
    throw new Error('Failed to create logout response');
  }
}

// Client-side utilities (for compatibility)
export function getClientAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${AUTH_COOKIE_NAME}=`))
      ?.split('=')[1];
    
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  } catch (error) {
    console.error('Error getting client auth token:', error);
    return null;
  }
}

export function getClientUserId(): string | null {
  const token = getClientAuthToken();
  return token ? verifyAuthToken(token) : null;
}