// Authentication constants
export const AUTH_COOKIE_NAME = 'seo_doctor_auth';
export const SECRET_KEY = process.env.AUTH_SECRET || 'your-secret-key-change-in-production';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds