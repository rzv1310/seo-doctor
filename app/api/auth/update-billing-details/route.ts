import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { verifyAuth, verifyAuthToken } from '@/app/utils/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyAuth(cookies());
    
    if (!userId) {
      return NextResponse.json({ message: 'Neautentificat' }, { status: 401 });
    }
    
    // Get request body with billing details
    const { billingName, billingCompany, billingVat, billingAddress, billingPhone } = await request.json();
    
    if (!billingName && !billingCompany) {
      return NextResponse.json({ message: 'Numele sau compania este obligatorie' }, { status: 400 });
    }
    
    if (!billingAddress) {
      return NextResponse.json({ message: 'Adresa de facturare este obligatorie' }, { status: 400 });
    }
    
    // Get user from database
    const userResult = await db.select().from(users).where(eq(users.id, userId));
    const user = userResult[0];
    
    if (!user) {
      return NextResponse.json({ message: 'Utilizator negăsit' }, { status: 404 });
    }
    
    // Update user's billing details
    await db.update(users)
      .set({ 
        billingName,
        billingCompany,
        billingVat,
        billingAddress,
        billingPhone
      })
      .where(eq(users.id, userId));
    
    return NextResponse.json({ 
      message: 'Detaliile de facturare au fost actualizate cu succes',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        billingName,
        billingCompany,
        billingVat,
        billingAddress,
        billingPhone
      }
    });
  } catch (error) {
    console.error('Update billing details error:', error);
    return NextResponse.json({ message: 'Eroare server' }, { status: 500 });
  }
}