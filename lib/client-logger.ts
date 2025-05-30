import { ClientLogLevel, ClientLogContext } from '@/types/logging';



class ClientLogger {
    private isDevelopment = process.env.NODE_ENV === 'development';
    private buffer: Array<{ level: ClientLogLevel; message: string; context?: ClientLogContext; timestamp: string }> = [];
    private flushInterval: NodeJS.Timeout | null = null;
    private maxBufferSize = 50;

    constructor() {
        if (typeof window !== 'undefined') {
            // Flush logs every 10 seconds or when buffer is full
            this.flushInterval = setInterval(() => this.flush(), 10000);

            // Flush logs before page unload
            window.addEventListener('beforeunload', () => this.flush());

            // Capture unhandled errors
            window.addEventListener('error', (event) => {
                this.error('Unhandled error', event.error, {
                    component: 'window',
                    action: 'error'
                });
            });

            // Capture unhandled promise rejections
            window.addEventListener('unhandledrejection', (event) => {
                this.error('Unhandled promise rejection', new Error(event.reason), {
                    component: 'window',
                    action: 'unhandledrejection'
                });
            });
        }
    }

    private formatMessage(level: ClientLogLevel, message: string, context?: ClientLogContext): any {
        const timestamp = new Date().toISOString();
        const baseLog = {
            timestamp,
            level,
            message,
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            ...context
        };

        if (context?.error) {
            baseLog.error = {
                message: context.error.message,
                stack: this.isDevelopment ? context.error.stack : undefined,
                name: context.error.name
            };
        }

        return baseLog;
    }

    private log(level: ClientLogLevel, message: string, context?: ClientLogContext): void {
        const formattedMessage = this.formatMessage(level, message, context);

        // In development, log to console
        if (this.isDevelopment) {
            switch (level) {
                case 'error':
                    console.error(message, context);
                    break;
                case 'warn':
                    console.warn(message, context);
                    break;
                case 'info':
                default:
                    console.log(message, context);
                    break;
            }
        }

        // Add to buffer for sending to server
        this.buffer.push({
            level,
            message,
            context,
            timestamp: new Date().toISOString()
        });

        // Flush if buffer is full
        if (this.buffer.length >= this.maxBufferSize) {
            this.flush();
        }
    }

    private async flush(): Promise<void> {
        if (this.buffer.length === 0) return;

        const logs = [...this.buffer];
        this.buffer = [];

        try {
            // Send logs to server
            await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logs })
            });
        } catch (error) {
            // If logging fails, don't re-log to avoid infinite loop
            if (this.isDevelopment) {
                console.error('Failed to send logs to server:', error);
            }
        }
    }

    info(message: string, context?: ClientLogContext): void {
        this.log('info', message, context);
    }

    warn(message: string, context?: ClientLogContext): void {
        this.log('warn', message, context);
    }

    error(message: string, error?: Error | unknown, context?: ClientLogContext): void {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        this.log('error', message, { ...context, error: errorObj });
    }

    // Helper for tracking user interactions
    interaction(action: string, component: string, details?: any): void {
        this.info('User interaction', {
            action,
            component,
            ...details
        });
    }

    // Helper for tracking API calls
    api(method: string, path: string, status: number, duration: number, error?: Error): void {
        const level: ClientLogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
        const message = `API: ${method} ${path} ${status} ${duration}ms`;

        this.log(level, message, {
            method,
            path,
            status,
            duration,
            error
        });
    }

    // Helper for tracking performance
    performance(metric: string, value: number, context?: any): void {
        this.info('Performance metric', {
            metric,
            value,
            ...context
        });
    }

    // Helper for tracking form submissions
    form(action: string, formName: string, success: boolean, error?: Error): void {
        const level: ClientLogLevel = error ? 'error' : success ? 'info' : 'warn';
        const message = `Form: ${formName} ${action} ${success ? 'succeeded' : 'failed'}`;

        this.log(level, message, {
            action,
            formName,
            success,
            error
        });
    }

    destroy(): void {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        this.flush();
    }
}

export const clientLogger = typeof window !== 'undefined' ? new ClientLogger() : null;

// React hook for component-level logging
export function useLogger(componentName: string) {
    return {
        info: (message: string, context?: Omit<ClientLogContext, 'component'>) =>
            clientLogger?.info(message, { ...context, component: componentName }),
        warn: (message: string, context?: Omit<ClientLogContext, 'component'>) =>
            clientLogger?.warn(message, { ...context, component: componentName }),
        error: (message: string, error?: Error | unknown, context?: Omit<ClientLogContext, 'component'>) =>
            clientLogger?.error(message, error, { ...context, component: componentName }),
        interaction: (action: string, details?: any) =>
            clientLogger?.interaction(action, componentName, details)
    };
}
