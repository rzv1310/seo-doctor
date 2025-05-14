import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    // Accept any login credentials as specified
    // In a real app, this would validate credentials against a backend
    
    // Use the login method from AuthContext
    login();
    
    // Redirect to dashboard page
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-dark-blue flex flex-col items-center justify-center p-4">
      <div className="dashboard-card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">MiniDash</h1>
          </Link>
          <p className="text-text-secondary mt-2">
            {isLoggingIn ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {error && (
          <div className="bg-danger/20 border border-danger/30 text-danger px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          {isLoggingIn && (
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 bg-dark-blue-lighter border border-border-color rounded focus:ring-primary"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-text-secondary">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-primary hover:text-primary-dark">
                  Forgot password?
                </a>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isLoggingIn ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-color text-center">
          <p className="text-text-secondary">
            {isLoggingIn ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLoggingIn(!isLoggingIn)}
              className="ml-2 text-primary hover:text-primary-dark focus:outline-none"
            >
              {isLoggingIn ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className="mt-8 text-center text-xs text-text-secondary">
          By continuing, you agree to our{' '}
          <a href="#" className="text-primary hover:text-primary-dark">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary hover:text-primary-dark">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}