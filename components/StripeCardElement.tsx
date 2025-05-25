'use client';

import { useState } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import stripePromise from '@/utils/stripe';
import { ActionButton, LinkButton, Toggle } from '@/components/ui';

interface StripeCardFormProps {
  onSuccess: (cardId: string) => void;
  onCancel: () => void;
  setAsDefault?: boolean;
}

function StripeCardForm({ onSuccess, onCancel, setAsDefault = false }: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(setAsDefault);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setError('');
    setProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Elementul card nu a fost găsit');
      setProcessing(false);
      return;
    }

    try {
      // Create token
      const { token, error: tokenError } = await stripe.createToken(cardElement);

      if (tokenError) {
        throw new Error(tokenError.message);
      }

      if (!token) {
        throw new Error('Nu s-a putut crea token-ul');
      }

      // Send token to backend
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.id,
          setAsDefault: saveAsDefault,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Eroare la adăugarea cardului');
      }

      onSuccess(data.card.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A apărut o eroare');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm text-text-secondary mb-2">
          Detalii Card
        </label>
        <div className="bg-dark-blue-lighter/50 border border-border-color rounded-lg p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': {
                    color: '#6b7280',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <Toggle
          checked={saveAsDefault}
          onChange={setSaveAsDefault}
          label="Setează ca metodă de plată implicită"
          size="sm"
        />
      </div>

      <div className="flex justify-end gap-3">
        <LinkButton
          type="button"
          onClick={onCancel}
          variant="default"
          size="sm"
          disabled={processing}
        >
          Anulare
        </LinkButton>
        <ActionButton
          type="submit"
          size="sm"
          showArrow={false}
          fullRounded={false}
          disabled={!stripe || processing}
          loading={processing}
        >
          {processing ? 'Se procesează...' : 'Adaugă Card'}
        </ActionButton>
      </div>
    </form>
  );
}

interface StripeCardElementProps {
  onSuccess: (cardId: string) => void;
  onCancel: () => void;
  setAsDefault?: boolean;
}

export default function StripeCardElement({ onSuccess, onCancel, setAsDefault }: StripeCardElementProps) {
  return (
    <Elements stripe={stripePromise}>
      <StripeCardForm
        onSuccess={onSuccess}
        onCancel={onCancel}
        setAsDefault={setAsDefault}
      />
    </Elements>
  );
}