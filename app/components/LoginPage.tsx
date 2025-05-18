import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login, signup, error, clearError } = useAuth();

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
      <div className="dashboard-card w-full max-w-md p-5 sm:p-6 md:p-8 border-2 sm:border border-border-color sm:border-primary/20">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl sm:text-3xl font-bold">SEO Doctor</h1>
          </Link>
          <p className="text-text-secondary mt-2">
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
              <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-text-secondary mb-1">
                Nume
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-blue-lighter rounded-md py-3 sm:py-2.5 px-4 sm:px-3 text-white border border-border-color focus:outline-none focus:border-primary text-base sm:text-base"
                placeholder="Numele tău"
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Email field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-text-secondary mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-blue-lighter rounded-md py-2.5 px-3 text-white border border-border-color focus:outline-none focus:border-primary text-base sm:text-base"
              placeholder="your@email.com"
              disabled={isSubmitting}
            />
          </div>

          {/* Password field */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-text-secondary mb-1">
              Parolă
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-blue-lighter rounded-md py-2.5 px-3 text-white border border-border-color focus:outline-none focus:border-primary text-base sm:text-base"
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
                <a href="#" className="text-primary hover:text-primary-dark">
                  Ai uitat parola?
                </a>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-dark text-white cursor-pointer font-medium py-3.5 sm:py-3 px-4 rounded-md transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 border-2 border-primary/30 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed text-lg sm:text-base"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-accent/40 to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
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
          <p className="text-text-secondary text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0">
            {isLoggingIn ? "Nu ai un cont?" : "Ai deja un cont?"}
            <button
              onClick={() => {
                setIsLoggingIn(!isLoggingIn);
                clearError();
                // If switching to sign up, keep the email and password
                // No need to clear them when we're just switching modes
              }}
              disabled={isSubmitting}
              className="sm:ml-2 px-4 py-2 sm:px-3 sm:py-1 bg-dark-blue-lighter cursor-pointer hover:bg-primary/10 text-primary hover:text-primary-dark rounded-md border border-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto mt-2 sm:mt-0"
            >
              {isLoggingIn ? 'Înregistrare' : 'Conectare'}
            </button>
          </p>
        </div>

        <div className="mt-4 sm:mt-8 text-center text-xs text-text-secondary">
          Continuând, ești de acord cu{' '}
          <a href="#" className="text-primary hover:text-primary-dark">
            Termenii și Condițiile
          </a>{' '}
          și{' '}
          <a href="#" className="text-primary hover:text-primary-dark">
            Politica de Confidențialitate
          </a>
          .
        </div>
      </div>
    </div>
  );
}