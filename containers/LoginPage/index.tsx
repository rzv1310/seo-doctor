import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ActionButton, LinkButton, Link } from '@/components/ui';
import { useLogger } from '@/lib/client-logger';



export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [resetError, setResetError] = useState('');
    const router = useRouter();
    const { login, signup, error, clearError } = useAuth();
    const logger = useLogger('LoginPage');

    const isFormValid = () => {
        if (isLoggingIn) {
            return email.trim() !== '' && password.trim() !== '';
        } else {
            return name.trim() !== '' && email.trim() !== '' && password.trim() !== '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setIsSubmitting(true);

        const formType = isLoggingIn ? 'login' : 'signup';
        logger.info(`${formType} attempt started`);

        try {
            if (!email || !password) {
                const validationError = new Error('Please enter both email and password');
                logger.error('Form validation failed', validationError, { formType, field: 'email_password' });
                throw validationError;
            }

            if (!isLoggingIn && !name) {
                const validationError = new Error('Please enter your name');
                logger.error('Form validation failed', validationError, { formType, field: 'name' });
                throw validationError;
            }

            if (isLoggingIn) {
                await login(email, password);
            } else {
                await signup(email, password, name);
            }

            logger.info(`${formType} successful`);
            router.push('/dashboard');
        } catch (err) {
            logger.error(`${formType} failed`, err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-blue flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="dashboard-card w-full max-w-md p-5 sm:p-6 md:p-8 border-2 sm:border border-white/20 sm:border-primary/20">
                <div className="text-center mb-8">
                    <Link href="/" variant="default">
                        <h1 className="text-2xl sm:text-3xl font-bold">SEO Doctor</h1>
                    </Link>
                    <p className="text-text-primary/80 mt-2">
                        {isLoggingIn ? 'Conectează-te la contul tău' : 'Crează contul tău'}
                    </p>
                </div>

                {error && (
                    <div className="bg-danger/20 border border-danger/30 text-danger px-4 py-3 rounded-md mb-6 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Name field (only for signup) */}
                    {!isLoggingIn && (
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-text-primary/90 mb-1">
                                Nume
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-dark-blue-lighter rounded-md py-3 sm:py-2.5 px-4 sm:px-3 text-white border border-white/20 focus:outline-none focus:border-white text-base sm:text-base"
                                placeholder="Numele tău"
                                disabled={isSubmitting}
                            />
                        </div>
                    )}

                    {/* Email field */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-text-primary/90 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-dark-blue-lighter rounded-md py-2.5 px-3 text-white border border-white/20 focus:outline-none focus:border-white text-base sm:text-base"
                            placeholder="email@exemplu.ro"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Password field */}
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-text-primary/90 mb-1">
                            Parolă
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-dark-blue-lighter rounded-md py-2.5 px-3 text-white border border-white/20 focus:outline-none focus:border-white text-base sm:text-base"
                            placeholder="••••••••"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Forgot password (only for login) */}
                    {isLoggingIn && (
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center">
                            </div>
                            <div className="text-xs sm:text-sm">
                                <LinkButton
                                    type="button"
                                    onClick={() => {
                                        logger.interaction('forgot_password_click', { email });
                                        setShowForgotPassword(true);
                                        setResetEmail(email);
                                        setResetError('');
                                        setResetEmailSent(false);
                                    }}
                                    variant="default"
                                    size="sm"
                                >
                                    Ai uitat parola?
                                </LinkButton>
                            </div>
                        </div>
                    )}

                    {/* Submit button */}
                    <ActionButton
                        type="submit"
                        disabled={isSubmitting || !isFormValid()}
                        loading={isSubmitting}
                        fullWidth
                        size="lg"
                        fullRounded={false}
                        showArrow={false}
                    >
                        {isLoggingIn ? 'Conectare' : 'Creare Cont'}
                    </ActionButton>
                </form>

                {/* Toggle between login and signup */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border-color text-center">
                    <p className="text-text-primary/80 text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0">
                        <span
                            className="mr-4"
                        >
                            {isLoggingIn ? "Nu ai un cont?" : "Ai deja un cont?"}
                        </span>
                        <ActionButton
                            onClick={() => {
                                const newMode = !isLoggingIn ? 'login' : 'signup';
                                logger.interaction('auth_mode_toggle', { from: isLoggingIn ? 'login' : 'signup', to: newMode });
                                setIsLoggingIn(!isLoggingIn);
                                clearError();
                            }}
                            disabled={isSubmitting}
                            size="sm"
                            fullRounded={false}
                            showArrow={false}
                            variant="default"
                        >
                            {isLoggingIn ? 'Înregistrare' : 'Conectare'}
                        </ActionButton>
                    </p>
                </div>

                <div className="mt-4 sm:mt-8 text-center text-xs text-text-primary/70">
                    Continuând, ești de acord cu{' '}
                    <Link href="/legal?tab=terms" variant="primary" underline>
                        Termenii și Condițiile
                    </Link>{' '}
                    și{' '}
                    <Link href="/legal?tab=privacy" variant="primary" underline>
                        Politica de Confidențialitate
                    </Link>
                    .
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="w-full max-w-md p-6 relative bg-glass-bg backdrop-blur-xl border border-glass-border rounded-lg shadow-2xl">
                        <div className="absolute top-4 right-4">
                            <LinkButton
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setResetError('');
                                    setResetEmailSent(false);
                                }}
                                variant="default"
                                size="md"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </LinkButton>
                        </div>

                        <h2 className="text-xl font-bold mb-4">Resetează parola</h2>

                        {!resetEmailSent ? (
                            <>
                                <p className="text-text-primary/80 mb-6">
                                    Introdu adresa de email asociată contului tău și îți vom trimite un link pentru resetarea parolei.
                                </p>

                                {resetError && (
                                    <div className="bg-danger/20 border border-danger/30 text-danger px-4 py-3 rounded-md mb-4 font-medium">
                                        {resetError}
                                    </div>
                                )}

                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    setResetError('');
                                    logger.info('Password reset request started');

                                    if (!resetEmail.trim()) {
                                        const validationError = 'Te rugăm să introduci adresa de email';
                                        setResetError(validationError);
                                        logger.error('Password reset validation failed', new Error(validationError), { field: 'email' });
                                        return;
                                    }

                                    try {
                                        logger.info('Password reset requested', { email: resetEmail });
                                        const response = await fetch('/api/auth/forgot-password', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ email: resetEmail }),
                                        });

                                        const data = await response.json();

                                        if (!response.ok) {
                                            const error = new Error(data.error || 'Eroare la trimiterea email-ului');
                                            logger.error('Password reset request failed', error, { email: resetEmail, status: response.status });
                                            throw error;
                                        }

                                        setResetEmailSent(true);
                                        logger.info('Password reset email sent', { email: resetEmail });
                                    } catch (err) {
                                        const errorMessage = err instanceof Error ? err.message : 'Eroare la trimiterea email-ului';
                                        setResetError(errorMessage);
                                        logger.error('Password reset failed', err);
                                    }
                                }}>
                                    <div className="mb-6">
                                        <label htmlFor="reset-email" className="block text-xs sm:text-sm font-medium text-text-primary/90 mb-1">
                                            Email
                                        </label>
                                        <input
                                            id="reset-email"
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className="w-full bg-dark-blue-lighter rounded-md py-2.5 px-3 text-white border border-white/20 focus:outline-none focus:border-white"
                                            placeholder="email@exemplu.ro"
                                            autoFocus
                                        />
                                    </div>

                                    <ActionButton
                                        type="submit"
                                        disabled={!resetEmail.trim()}
                                        fullWidth
                                        size="md"
                                        fullRounded={false}
                                        showArrow={false}
                                    >
                                        Trimite link de resetare
                                    </ActionButton>
                                </form>
                            </>
                        ) : (
                            <div className="text-center">
                                <div className="mb-4">
                                    <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Email trimis!</h3>
                                <p className="text-text-primary/80 mb-6">
                                    Am trimis un link de resetare a parolei la <strong>{resetEmail}</strong>.
                                    Verifică-ți inbox-ul și urmează instrucțiunile din email.
                                </p>
                                <ActionButton
                                    onClick={() => setShowForgotPassword(false)}
                                    size="sm"
                                    fullRounded={false}
                                    showArrow={false}
                                >
                                    Închide
                                </ActionButton>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
