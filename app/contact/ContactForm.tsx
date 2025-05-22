'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

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

export default function ContactForm() {
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
          <Button
            onClick={() => setSubmitStatus('idle')}
          >
            Trimite alt mesaj
          </Button>
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

          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Se trimite...' : 'Trimite mesajul'}
          </Button>

          <p className="mt-4 text-xs text-text-secondary">
            Câmpurile marcate cu <span className="text-danger">*</span> sunt obligatorii.
          </p>
        </form>
      )}
    </div>
  );
}