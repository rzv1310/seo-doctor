import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { verifyApiAuth, verifyPassword } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';

async function deleteAccountHandler(request: NextRequest) {
  try {
    const session = await verifyApiAuth(request);

    if (!session.isAuthenticated) {
      logger.auth('delete-account', undefined, false, new Error('Unauthenticated attempt'));
      return NextResponse.json({ message: 'Neautentificat' }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password) {
      logger.auth('delete-account', session.user.id, false, new Error('Missing password'));
      return NextResponse.json({ message: 'Parola este obligatorie' }, { status: 400 });
    }

    const userResult = await db.select().from(users).where(eq(users.id, session.user.id));
    const user = userResult[0];

    if (!user) {
      logger.error('User not found for account deletion', new Error('User not found'), { userId: session.user.id });
      return NextResponse.json({ message: 'Utilizator negăsit' }, { status: 404 });
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      logger.auth('delete-account', session.user.id, false, new Error('Invalid password'));
      return NextResponse.json({ message: 'Parolă incorectă' }, { status: 401 });
    }

    await db.delete(users).where(eq(users.id, session.user.id));

    logger.auth('delete-account', session.user.id, true);
    
    const response = NextResponse.json({ message: 'Contul a fost șters cu succes' });
    response.cookies.delete('minidash_auth');

    return response;
  } catch (error) {
    logger.error('Account deletion error', error);
    return NextResponse.json({ message: 'Eroare server' }, { status: 500 });
  }
}

export const DELETE = withLogging(deleteAccountHandler);