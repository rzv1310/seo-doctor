import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { verifyAuth } from '@/utils/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyAuth(cookies());

    if (!userId) {
      return NextResponse.json({ message: 'Neautentificat' }, { status: 401 });
    }

    // Get user from database
    const userResult = await db.select().from(users).where(eq(users.id, userId));
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
    const passwordValid = await bcrypt.compare(currentPassword, user.password);

    if (!passwordValid) {
      return NextResponse.json({ message: 'Parola actuală este incorectă' }, { status: 400 });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password in database
    await db.update(users)
      .set({ password: newPasswordHash })
      .where(eq(users.id, userId));

    return NextResponse.json({ message: 'Parola a fost actualizată cu succes' });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ message: 'Eroare server' }, { status: 500 });
  }
}