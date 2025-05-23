'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setError('Link invalid sau expirat');
                setIsValidating(false);
                return;
            }

            try {
                const response = await fetch('/api/auth/validate-reset-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                if (!response.ok) {
                    throw new Error('Token invalid sau expirat');
                }

                setTokenValid(true);
            } catch (err) {
                setError('Link invalid sau expirat. Te rugăm să soliciți un nou link de resetare.');
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const isFormValid = () => {
        return password.trim() !== '' && 
               confirmPassword.trim() !== '' && 
               password === confirmPassword &&
               password.length >= 6;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isFormValid()) {
            if (password !== confirmPassword) {
                setError('Parolele nu se potrivesc');
            } else if (password.length < 6) {
                setError('Parola trebuie să aibă cel puțin 6 caractere');
            }
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Eroare la resetarea parolei');
            }

            setSuccess(true);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Eroare la resetarea parolei');
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
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
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
                    <Link href="/" className="inline-block">
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
                        <Link 
                            href="/login"
                            className="inline-block bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-md transition-all"
                        >
                            Mergi la autentificare
                        </Link>
                    </div>
                ) : tokenValid ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-text-primary/90 mb-1">
                                Parolă nouă
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-dark-blue-lighter rounded-md py-2.5 px-3 text-white border border-white/20 focus:outline-none focus:border-white"
                                placeholder="••••••••"
                                disabled={isSubmitting}
                                minLength={6}
                            />
                            <p className="text-xs text-text-primary/60 mt-1">Minim 6 caractere</p>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-text-primary/90 mb-1">
                                Confirmă parola nouă
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-dark-blue-lighter rounded-md py-2.5 px-3 text-white border border-white/20 focus:outline-none focus:border-white"
                                placeholder="••••••••"
                                disabled={isSubmitting}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !isFormValid()}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-md transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 border-2 border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center justify-center">
                                {isSubmitting ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                                ) : null}
                                Resetează parola
                            </span>
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <p className="text-text-primary/80 mb-6">
                            Linkul de resetare este invalid sau a expirat. Te rugăm să soliciți un nou link.
                        </p>
                        <Link 
                            href="/login"
                            className="inline-block bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-md transition-all"
                        >
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
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                        <p className="text-text-primary/60">Se încarcă...</p>
                    </div>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}