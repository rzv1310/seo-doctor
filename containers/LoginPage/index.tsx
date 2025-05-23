import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

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

  // Check if form is valid
  const isFormValid = () => {
    if (isLoggingIn) {
      // For login: email and password are required
      return email.trim() !== '' && password.trim() !== '';
    } else {
      // For signup: name, email, and password are required
      return name.trim() !== '' && email.trim() !== '' && password.trim() !== '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

    try {
      // Simple validation
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      // Additional validation for signup
      if (!isLoggingIn && !name) {
        throw new Error('Please enter your name');
      }

      if (isLoggingIn) {
        // Login
        await login(email, password);
      } else {
        // Signup
        await signup(email, password, name);
      }

      // Redirect directly to dashboard
      router.push('/dashboard');
    } catch (err) {
      // Error handling is done in the AuthContext
      console.error('Auth error:', err);
      // We don't clear the form inputs on error, just show the error message
      // This allows the user to correct the error without re-entering everything
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-blue flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="dashboard-card w-full max-w-md p-5 sm:p-6 md:p-8 border-2 sm:border border-white/20 sm:border-primary/20">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
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
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setResetEmail(email); // Pre-fill with current email if available
                    setResetError('');
                    setResetEmailSent(false);
                  }}
                  className="text-white hover:text-white/80 transition-colors underline"
                >
                  Ai uitat parola?
                </button>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid()}
            className="w-full bg-primary hover:bg-primary-dark text-white cursor-pointer font-medium py-3.5 sm:py-3 px-4 rounded-md transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 border-2 border-primary/30 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:shadow-lg text-lg sm:text-base"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-accent/40 to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-disabled:opacity-0"></span>
            <span className="relative z-10 flex items-center justify-center mx-auto w-fit">
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
              ) : null}
              {isLoggingIn ? 'Conectare' : 'Creare Cont'}
            </span>
          </button>
        </form>

        {/* Toggle between login and signup */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border-color text-center">
          <p className="text-text-primary/80 text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0">
            {isLoggingIn ? "Nu ai un cont?" : "Ai deja un cont?"}
            <button
              onClick={() => {
                setIsLoggingIn(!isLoggingIn);
                clearError();
                // If switching to sign up, keep the email and password
                // No need to clear them when we're just switching modes
              }}
              disabled={isSubmitting}
              className="sm:ml-2 px-4 py-2 sm:px-3 sm:py-1 bg-white/10 cursor-pointer hover:bg-white/20 text-white hover:text-white rounded-md border border-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-white/20 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto mt-2 sm:mt-0"
            >
              {isLoggingIn ? 'Înregistrare' : 'Conectare'}
            </button>
          </p>
        </div>

        <div className="mt-4 sm:mt-8 text-center text-xs text-text-primary/70">
          Continuând, ești de acord cu{' '}
          <Link href="/legal?tab=terms" className="text-white hover:text-white/80 underline transition-colors">
            Termenii și Condițiile
          </Link>{' '}
          și{' '}
          <Link href="/legal?tab=privacy" className="text-white hover:text-white/80 underline transition-colors">
            Politica de Confidențialitate
          </Link>
          .
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md p-6 relative bg-glass-bg backdrop-blur-xl border border-glass-border rounded-lg shadow-2xl">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetError('');
                setResetEmailSent(false);
              }}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

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
                  
                  if (!resetEmail.trim()) {
                    setResetError('Te rugăm să introduci adresa de email');
                    return;
                  }

                  try {
                    const response = await fetch('/api/auth/forgot-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: resetEmail }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(data.error || 'Eroare la trimiterea email-ului');
                    }

                    setResetEmailSent(true);
                  } catch (err) {
                    setResetError(err instanceof Error ? err.message : 'Eroare la trimiterea email-ului');
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

                  <button
                    type="submit"
                    disabled={!resetEmail.trim()}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-md transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 border-2 border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trimite link de resetare
                  </button>
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
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-md transition-all"
                >
                  Închide
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}