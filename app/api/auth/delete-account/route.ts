import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { verifyAuth } from '@/app/utils/auth';

export async function DELETE(request: NextRequest) {
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
    
    // Delete user account
    await db.delete(users).where(eq(users.id, userId));
    
    // Clear auth cookie
    cookies().delete('auth_token');
    
    return NextResponse.json({ message: 'Contul a fost șters cu succes' });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ message: 'Eroare server' }, { status: 500 });
  }
}