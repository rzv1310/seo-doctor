import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { verifyApiAuth, verifyPassword, hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await verifyApiAuth(request);

    if (!session.isAuthenticated) {
      return NextResponse.json({ message: 'Neautentificat' }, { status: 401 });
    }

    // Get user from database
    const userResult = await db.select().from(users).where(eq(users.id, session.user.id));
    const user = userResult[0];

    if (!user) {
      return NextResponse.json({ message: 'Utilizator negăsit' }, { status: 404 });
    }

    // Get request body
    const { currentPassword, newPassword } = await request.json();

    // Validate request
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Toate câmpurile sunt obligatorii' }, { status: 400 });
    }

    // Verify current password
    const passwordValid = await verifyPassword(currentPassword, user.password);

    if (!passwordValid) {
      return NextResponse.json({ message: 'Parola actuală este incorectă' }, { status: 400 });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in database
    await db.update(users)
      .set({ password: newPasswordHash })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ message: 'Parola a fost actualizată cu succes' });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ message: 'Eroare server' }, { status: 500 });
  }
}