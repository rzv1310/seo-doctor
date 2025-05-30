import { NextRequest, NextResponse } from 'next/server';
import { LogLevel, LogContext } from '@/types/logging';



class Logger {
    private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` ${JSON.stringify(context)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
    }

    info(message: string, context?: LogContext) {
        console.log(this.formatMessage('info', message, context));
    }

    warn(message: string, context?: LogContext) {
        console.warn(this.formatMessage('warn', message, context));
    }

    error(message: string, context?: LogContext) {
        console.error(this.formatMessage('error', message, context));
    }

    debug(message: string, context?: LogContext) {
        if (process.env.NODE_ENV === 'development') {
            console.log(this.formatMessage('debug', message, context));
        }
    }

    auth(message: string, context?: LogContext) {
        console.log(this.formatMessage('auth', message, context));
    }

    api(req: NextRequest, res: NextResponse, startTime: number, context?: LogContext) {
        const duration = Date.now() - startTime;
        const method = req.method;
        const path = new URL(req.url).pathname;
        const statusCode = res.status;

        this.info(`API ${method} ${path}`, {
            method,
            path,
            statusCode,
            duration,
            ...context
        });
    }
}

export const logger = new Logger();

// Middleware wrapper for logging API routes
export function withLogging<T extends any[], R>(
    handler: (...args: T) => Promise<NextResponse>
): (...args: T) => Promise<NextResponse> {
    return async (...args: T) => {
        const startTime = Date.now();
        const req = args[0] as NextRequest;

        try {
            const res = await handler(...args);
            logger.api(req, res, startTime);
            return res;
        } catch (error) {
            logger.error('API handler error', {
                method: req.method,
                path: new URL(req.url).pathname,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
    };
}
