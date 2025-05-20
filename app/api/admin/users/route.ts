import { NextRequest, NextResponse } from 'next/server';
import database, { users } from '@/database';
import { eq } from 'drizzle-orm';
import { getAuthSession } from '@/utils/auth';

// This route is admin-only
export async function GET(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getAuthSession();

    // Not authenticated
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!session.user.admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get all users
    const allUsers = await database.select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
      billingName: users.billingName,
      billingCompany: users.billingCompany,
      billingVat: users.billingVat,
      billingAddress: users.billingAddress,
      billingPhone: users.billingPhone,
      admin: users.admin,
    }).from(users);

    return NextResponse.json({
      success: true,
      users: allUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}