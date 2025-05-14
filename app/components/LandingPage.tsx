import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-blue flex flex-col">
      {/* Header */}
      <header className="border-b border-border-color">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">MiniDash</h1>
          </div>
          <nav className="flex items-center gap-8">
            <a href="#features" className="text-text-secondary hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-text-secondary hover:text-primary transition-colors">Pricing</a>
            <Link 
              href="/login" 
              className="bg-primary hover:bg-primary-dark text-white rounded-md px-4 py-2 transition-colors"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-24 flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Manage Your Digital Services <br />in One Place
        </h1>
        <p className="text-text-secondary text-xl max-w-2xl mb-12">
          The simplest way to track, manage, and optimize all your digital subscriptions.
          Save time, reduce costs, and never miss a renewal again.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/login" 
            className="bg-primary hover:bg-primary-dark text-white text-lg font-medium rounded-md px-8 py-3 transition-colors"
          >
            Get Started
          </Link>
          <a 
            href="#demo" 
            className="border border-border-color text-white hover:bg-dark-blue-lighter text-lg font-medium rounded-md px-8 py-3 transition-colors"
          >
            See Demo
          </a>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="py-20 bg-dark-blue-lighter">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Everything You Need</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="dashboard-card p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Subscription Management</h3>
              <p className="text-text-secondary">
                Track all your subscriptions in one place with automated renewal reminders and spending analytics.
              </p>
            </div>
            
            <div className="dashboard-card p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Usage Analytics</h3>
              <p className="text-text-secondary">
                Monitor your usage across all services and identify opportunities to optimize your digital spending.
              </p>
            </div>
            
            <div className="dashboard-card p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Access</h3>
              <p className="text-text-secondary">
                Your data is encrypted and secure, with customizable access controls and two-factor authentication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-text-secondary text-center max-w-2xl mx-auto mb-16">
            Choose the plan that works for your needs, with no hidden fees or surprises.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="dashboard-card p-6 border border-border-color hover:border-primary transition-all duration-300">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <div className="text-3xl font-bold mb-2">$9<span className="text-lg text-text-secondary">/month</span></div>
              <p className="text-text-secondary mb-6">Perfect for individuals with few subscriptions</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Up to 10 services
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic analytics
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Email notifications
                </li>
              </ul>
              
              <Link 
                href="/login" 
                className="block text-center bg-dark-blue-lighter hover:bg-primary hover:text-white border border-border-color rounded-md py-2 transition-colors w-full"
              >
                Get Started
              </Link>
            </div>
            
            <div className="dashboard-card p-6 border-2 border-primary relative transform scale-105">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-md rounded-tr-md">
                POPULAR
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <div className="text-3xl font-bold mb-2">$19<span className="text-lg text-text-secondary">/month</span></div>
              <p className="text-text-secondary mb-6">Best for professionals with multiple subscriptions</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited services
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Custom notifications
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Spending insights
                </li>
              </ul>
              
              <Link 
                href="/login" 
                className="block text-center bg-primary hover:bg-primary-dark text-white rounded-md py-2 transition-colors w-full"
              >
                Get Started
              </Link>
            </div>
            
            <div className="dashboard-card p-6 border border-border-color hover:border-primary transition-all duration-300">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold mb-2">$49<span className="text-lg text-text-secondary">/month</span></div>
              <p className="text-text-secondary mb-6">For teams and businesses with advanced needs</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Professional
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Team management
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  API access
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Dedicated support
                </li>
              </ul>
              
              <Link 
                href="/login" 
                className="block text-center bg-dark-blue-lighter hover:bg-primary hover:text-white border border-border-color rounded-md py-2 transition-colors w-full"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo / Screenshot section */}
      <section id="demo" className="py-20 bg-dark-blue-lighter">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-16">See MiniDash in Action</h2>
          
          <div className="max-w-5xl mx-auto dashboard-card overflow-hidden border border-border-color">
            <div className="aspect-w-16 aspect-h-9 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-dark-blue to-transparent opacity-20"></div>
              <div className="p-4 flex flex-col h-full">
                <div className="sidebar-mockup w-1/6 h-full bg-sidebar-bg border-r border-border-color"></div>
                <div className="flex-1 bg-card-bg p-4">
                  <div className="w-full h-12 mb-4 bg-dark-blue-lighter rounded-md"></div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="h-24 bg-dark-blue-lighter rounded-md"></div>
                    <div className="h-24 bg-dark-blue-lighter rounded-md"></div>
                    <div className="h-24 bg-dark-blue-lighter rounded-md"></div>
                  </div>
                  <div className="h-64 bg-dark-blue-lighter rounded-md mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-48 bg-dark-blue-lighter rounded-md"></div>
                    <div className="h-48 bg-dark-blue-lighter rounded-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <Link 
              href="/login" 
              className="bg-primary hover:bg-primary-dark text-white text-lg font-medium rounded-md px-8 py-3 transition-colors inline-block"
            >
              Try it yourself
            </Link>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Ready to simplify your digital life?</h2>
          <p className="text-text-secondary mb-8 text-xl">
            Join thousands of users who trust MiniDash to manage their digital services.
          </p>
          <Link 
            href="/login" 
            className="bg-primary hover:bg-primary-dark text-white text-lg font-medium rounded-md px-8 py-3 transition-colors inline-block"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-color py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">MiniDash</h3>
              <p className="text-text-secondary">
                The simple way to manage all your digital services in one place.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-text-secondary hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-text-secondary hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="text-text-secondary hover:text-primary transition-colors">Integrations</a></li>
                <li><a href="#" className="text-text-secondary hover:text-primary transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-text-secondary hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="text-text-secondary hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-text-secondary hover:text-primary transition-colors">Support</a></li>
                <li><a href="#" className="text-text-secondary hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-text-secondary hover:text-primary transition-colors">About us</a></li>
                <li><a href="#" className="text-text-secondary hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="text-text-secondary hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="text-text-secondary hover:text-primary transition-colors">Legal</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border-color flex flex-col md:flex-row justify-between items-center">
            <div className="text-text-secondary mb-4 md:mb-0">
              © 2025 MiniDash. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}