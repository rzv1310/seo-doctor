'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header, Footer } from '../../components/layout';
import { useAuth } from '../../context/AuthContext';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear validation error on field change
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Numele este obligatoriu';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email-ul este obligatoriu';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Adresa de email nu este validă';
    }

    // Phone validation - optional but validate format if provided
    if (formData.phone && !/^(\+4|)?(07[0-8]{1}[0-9]{1}|02[0-9]{2}|03[0-9]{2}){1}?(\s|\.|\-)?([0-9]{3}(\s|\.|\-|)){2}$/.test(formData.phone)) {
      newErrors.phone = 'Numărul de telefon nu este valid';
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subiectul este obligatoriu';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Mesajul este obligatoriu';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Mesajul trebuie să conțină cel puțin 10 caractere';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'A apărut o eroare la trimiterea mesajului');
      }

      // Success
      setSubmitStatus('success');
      setSubmitMessage(data.message || 'Mesajul a fost trimis cu succes!');

      // Reset form on successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

    } catch (error) {
      // Error
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'A apărut o eroare la trimiterea mesajului');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-blue text-text-primary pb-16">
      {/* Header */}
      <Header isSimplified={true} isAuthenticated={isAuthenticated} />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-2 text-center">Contactează-ne</h1>
        <p className="text-text-secondary text-center mb-12">Suntem aici pentru a te ajuta. Trimite-ne un mesaj și vom reveni în cel mai scurt timp posibil.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-dark-blue-lighter rounded-lg p-6 border border-border-color">
            {submitStatus === 'success' ? (
              <div className="bg-green-900/20 border border-green-900/30 rounded-md p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-xl font-semibold text-green-300 mb-2">Mesaj trimis cu succes!</h3>
                <p className="text-text-secondary mb-6">
                  {submitMessage || 'Îți mulțumim pentru mesaj! Vom reveni cu un răspuns în cel mai scurt timp.'}
                </p>
                <button
                  onClick={() => setSubmitStatus('idle')}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors"
                >
                  Trimite alt mesaj
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {submitStatus === 'error' && (
                  <div className="bg-red-900/20 border border-red-900/30 rounded-md p-4 mb-6 text-danger">
                    {submitMessage || 'A apărut o eroare la trimiterea mesajului. Te rugăm să încerci din nou.'}
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Nume complet <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Numele și prenumele"
                    className={`w-full px-4 py-2 bg-dark-blue border rounded-md focus:outline-none focus:ring-1 ${
                      errors.name ? 'border-danger focus:ring-danger' : 'border-border-color focus:ring-primary'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="adresa@exemplu.ro"
                    className={`w-full px-4 py-2 bg-dark-blue border rounded-md focus:outline-none focus:ring-1 ${
                      errors.email ? 'border-danger focus:ring-danger' : 'border-border-color focus:ring-primary'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
                </div>

                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">Telefon</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="07XX XXX XXX"
                    className={`w-full px-4 py-2 bg-dark-blue border rounded-md focus:outline-none focus:ring-1 ${
                      errors.phone ? 'border-danger focus:ring-danger' : 'border-border-color focus:ring-primary'
                    }`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-danger">{errors.phone}</p>}
                </div>

                <div className="mb-4">
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">Subiect <span className="text-danger">*</span></label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-dark-blue border rounded-md focus:outline-none focus:ring-1 ${
                      errors.subject ? 'border-danger focus:ring-danger' : 'border-border-color focus:ring-primary'
                    }`}
                  >
                    <option value="">Selectează un subiect</option>
                    <option value="Informații generale">Informații generale</option>
                    <option value="Ofertă de preț">Ofertă de preț</option>
                    <option value="Suport tehnic">Suport tehnic</option>
                    <option value="Colaborare">Colaborare</option>
                    <option value="Alt subiect">Alt subiect</option>
                  </select>
                  {errors.subject && <p className="mt-1 text-sm text-danger">{errors.subject}</p>}
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium mb-1">Mesaj <span className="text-danger">*</span></label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Scrie mesajul tău aici..."
                    className={`w-full px-4 py-2 bg-dark-blue border rounded-md focus:outline-none focus:ring-1 ${
                      errors.message ? 'border-danger focus:ring-danger' : 'border-border-color focus:ring-primary'
                    }`}
                  ></textarea>
                  {errors.message && <p className="mt-1 text-sm text-danger">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                      Se trimite...
                    </>
                  ) : 'Trimite mesajul'}
                </button>

                <p className="mt-4 text-xs text-text-secondary">
                  Câmpurile marcate cu <span className="text-danger">*</span> sunt obligatorii.
                </p>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Informații de contact</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-dark-blue-lighter p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-text-secondary">contact@seodoctor.ro</p>
                    <p className="text-text-secondary">suport@seodoctor.ro</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-dark-blue-lighter p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Telefon</p>
                    <p className="text-text-secondary">+40 721 234 567</p>
                    <p className="text-text-secondary">+40 21 123 4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-dark-blue-lighter p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Adresă</p>
                    <p className="text-text-secondary">Strada Exemplu nr. 123</p>
                    <p className="text-text-secondary">București, România</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Urmărește-ne</h2>
              <div className="flex gap-4">
                <a href="#" className="bg-dark-blue-lighter p-3 rounded-lg hover:bg-dark-blue transition-colors">
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
                <a href="#" className="bg-dark-blue-lighter p-3 rounded-lg hover:bg-dark-blue transition-colors">
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.056 10.056 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482c-4.09-.193-7.71-2.16-10.14-5.126a4.822 4.822 0
                    00-.665 2.473c0
                    1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63a9.935 9.935 0 002.46-2.532l-.047-.02z" />
                  </svg>
                </a>
                <a href="#" className="bg-dark-blue-lighter p-3 rounded-lg hover:bg-dark-blue transition-colors">
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                  </svg>
                </a>
                <a href="#" className="bg-dark-blue-lighter p-3 rounded-lg hover:bg-dark-blue transition-colors">
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}