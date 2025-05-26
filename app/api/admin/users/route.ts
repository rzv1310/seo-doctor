import { NextRequest, NextResponse } from 'next/server';
import database, { users } from '@/database';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';



export const GET = withLogging(async (req: NextRequest) => {
    try {
        const session = await verifyApiAuth(req);

        if (!session.isAuthenticated) {
            logger.auth('Unauthenticated access attempt to admin users', { path: '/api/admin/users' });
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        if (!session.user.admin) {
            logger.auth('Non-admin access attempt to admin users', {
                path: '/api/admin/users',
                userId: session.user.id,
                userEmail: session.user.email
            });
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        logger.auth('Admin accessing user list', { adminEmail: session.user.email });

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

        logger.info('User list fetched successfully', {
            adminEmail: session.user.email,
            userCount: allUsers.length
        });

        return NextResponse.json({
            success: true,
            users: allUsers,
        });
    } catch (error) {
        logger.error('Error fetching users', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
});
