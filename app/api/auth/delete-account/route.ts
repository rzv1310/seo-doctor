import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { verifyAuth, verifyPassword } from '@/utils/auth';

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyAuth(request);

    if (!userId) {
      return NextResponse.json({ message: 'Neautentificat' }, { status: 401 });
    }

    // Get request body with password
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ message: 'Parola este obligatorie' }, { status: 400 });
    }

    // Get user from database
    const userResult = await db.select().from(users).where(eq(users.id, userId));
    const user = userResult[0];

    if (!user) {
      return NextResponse.json({ message: 'Utilizator negăsit' }, { status: 404 });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ message: 'Parolă incorectă' }, { status: 401 });
    }

    // Delete user account
    await db.delete(users).where(eq(users.id, userId));

    // Create response with message
    const response = NextResponse.json({ message: 'Contul a fost șters cu succes' });
    
    // Clear auth cookie on the response
    response.cookies.delete('minidash_auth');

    return response;
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ message: 'Eroare server' }, { status: 500 });
  }
}