import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getServerSession } from '@/lib/auth';



export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        const { logs } = await req.json();

        if (!Array.isArray(logs)) {
            return NextResponse.json(
                { error: 'Invalid logs format' },
                { status: 400 }
            );
        }

        // Process each log entry
        for (const log of logs) {
            const context = {
                ...log.context,
                userId: session?.user?.id,
                source: 'client'
            };

            switch (log.level) {
                case 'error':
                    logger.error(`[Client] ${log.message}`, { ...context, error: log.context?.error });
                    break;
                case 'warn':
                    logger.warn(`[Client] ${log.message}`, context);
                    break;
                case 'info':
                default:
                    logger.info(`[Client] ${log.message}`, context);
                    break;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Failed to process client logs', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { error: 'Failed to process logs' },
            { status: 500 }
        );
    }
}
