'use client';

import { useState } from 'react';
import { ActionButton, Input, FormSection, FormGroup, FormRow, FormActions, Alert } from '@/components/ui';

interface PasswordChangeFormProps {
  onSubmit: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
}

export default function PasswordChangeForm({ onSubmit }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Toate câmpurile sunt obligatorii');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Parolele noi nu coincid');
      return;
    }

    try {
      setIsChanging(true);
      await onSubmit({ currentPassword, newPassword });
      setSuccess('Parola a fost actualizată cu succes');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A apărut o eroare');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <FormSection
      title="Modificare parolă"
      subtitle="Actualizează parola contului tău"
      className="mb-8"
    >
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-6">
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <FormRow>
            <Input
              id="currentPassword"
              type="password"
              label="Parola actuală"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              }
            />

            <Input
              id="newPassword"
              type="password"
              label="Parola nouă"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              }
            />
          </FormRow>

          <Input
            id="confirmPassword"
            type="password"
            label="Confirmă parola nouă"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
          />
        </FormGroup>

        <FormActions>
          <ActionButton
            type="submit"
            loading={isChanging}
            disabled={isChanging}
            size="md"
            fullRounded={false}
            showArrow={false}
          >
            {isChanging ? 'Se procesează...' : 'Actualizează parola'}
          </ActionButton>
        </FormActions>
      </form>
    </FormSection>
  );
}