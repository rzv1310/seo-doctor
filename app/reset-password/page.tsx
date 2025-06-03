'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link, PasswordInput, Spinner } from '@/components/ui';
import { useLogger } from '@/lib/client-logger';



function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const logger = useLogger('ResetPasswordForm');

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                const errorMsg = 'Link invalid sau expirat';
                setError(errorMsg);
                setIsValidating(false);
                logger.error('No reset token provided', new Error(errorMsg));
                return;
            }

            let response: Response | undefined;
            try {
                logger.info('Validating reset token');
                response = await fetch('/api/auth/validate-reset-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                if (!response.ok) {
                    throw new Error('Token invalid sau expirat');
                }

                setTokenValid(true);
                logger.info('Reset token validated successfully');
            } catch (err) {
                const errorMsg = 'Link invalid sau expirat. Te rugăm să soliciți un nou link de resetare.';
                setError(errorMsg);
                logger.error('Token validation failed', { error: err instanceof Error ? err.message : String(err), status: response?.status });
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [token, logger]);

    const isFormValid = () => {
        return password.trim() !== '' &&
            confirmPassword.trim() !== '' &&
            password === confirmPassword &&
            password.length >= 6;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        logger.info('Password reset attempt started');

        if (!isFormValid()) {
            let validationError = '';
            if (password !== confirmPassword) {
                validationError = 'Parolele nu se potrivesc';
            } else if (password.length < 6) {
                validationError = 'Parola trebuie să aibă cel puțin 6 caractere';
            }
            setError(validationError);
            logger.error('Form validation failed', new Error(validationError), { field: validationError.includes('potrivesc') ? 'password_mismatch' : 'password_length' });
            return;
        }

        setIsSubmitting(true);

        try {
            logger.info('Resetting password');
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.error || 'Eroare la resetarea parolei');
                logger.error('Password reset failed', error, { status: response.status });
                throw error;
            }

            setSuccess(true);
            logger.info('Password reset successful');

            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Eroare la resetarea parolei';
            setError(errorMsg);
            logger.error('Password reset failed', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading state while validating
    if (isValidating) {
        return (
            <div className="min-h-screen bg-dark-blue flex flex-col items-center justify-center p-4 sm:p-6">
                <div className="dashboard-card w-full max-w-md p-5 sm:p-6 md:p-8">
                    <div className="text-center">
                        <Spinner size="lg" center className="mb-4" />
                        <p className="text-text-primary/60">Verificare link...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-blue flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="dashboard-card w-full max-w-md p-5 sm:p-6 md:p-8">
                <div className="text-center mb-8">
                    <Link href="/" variant="default">
                        <h1 className="text-2xl sm:text-3xl font-bold">SEO Doctor</h1>
                    </Link>
                    <p className="text-text-primary/80 mt-2">
                        {tokenValid ? 'Resetează-ți parola' : 'Link invalid'}
                    </p>
                </div>

                {error && !success && (
                    <div className="bg-danger/20 border border-danger/30 text-danger px-4 py-3 rounded-md mb-6 font-medium">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="text-center">
                        <div className="mb-4">
                            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Parola a fost resetată!</h3>
                        <p className="text-text-primary/80 mb-6">
                            Parola ta a fost schimbată cu succes. Vei fi redirecționat către pagina de autentificare...
                        </p>
                        <Link href="/login" variant="primary">
                            Mergi la autentificare
                        </Link>
                    </div>
                ) : tokenValid ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <PasswordInput
                                id="password"
                                label="Parolă nouă"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                                minLength={6}
                                helperText="Minim 6 caractere"
                            />
                        </div>

                        <div className="mb-6">
                            <PasswordInput
                                id="confirmPassword"
                                label="Confirmă parola nouă"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !isFormValid()}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-md transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 border-2 border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center justify-center">
                                {isSubmitting && <Spinner size="sm" className="mr-2" />}
                                Resetează parola
                            </span>
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <p className="text-text-primary/80 mb-6">
                            Linkul de resetare este invalid sau a expirat. Te rugăm să soliciți un nou link.
                        </p>
                        <Link href="/login" variant="primary">
                            Înapoi la autentificare
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-dark-blue flex flex-col items-center justify-center p-4 sm:p-6">
                <div className="dashboard-card w-full max-w-md p-5 sm:p-6 md:p-8">
                    <div className="text-center">
                        <Spinner size="lg" center className="mb-4" />
                        <p className="text-text-primary/60">Se încarcă...</p>
                    </div>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
