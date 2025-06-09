// Authentication constants
export const AUTH_COOKIE_NAME = 'seo_doctor_auth';

// Ensure AUTH_SECRET is set in production
if (!process.env.AUTH_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET environment variable must be set in production');
}

export const SECRET_KEY = process.env.AUTH_SECRET || 'dev-secret-key-do-not-use-in-production';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds
export const PASSWORD_SALT_ROUNDS = 12; // Standardized salt rounds for bcrypt