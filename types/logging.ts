export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'auth';


export interface LogContext {
    userId?: string;
    userEmail?: string;
    method?: string;
    path?: string;
    statusCode?: number;
    duration?: number;
    error?: any;
    [key: string]: any;
}


export type ClientLogLevel = 'info' | 'warn' | 'error';


export interface ClientLogContext {
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    error?: Error;
    [key: string]: any;
}