'use client';

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { PageHeader, Card, Grid, ActionButton, LinkButton, Input, Alert, Modal, FormSection, FormGroup, FormRow, FormActions } from '@/components/ui';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setPasswordError('');
    setPasswordSuccess('');

    // Validate password
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Toate câmpurile sunt obligatorii');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Parolele noi nu coincid');
      return;
    }

    try {
      setIsChangingPassword(true);

      // Call API to change password
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'A apărut o eroare');
      }

      // Success
      setPasswordSuccess('Parola a fost actualizată cu succes');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'A apărut o eroare');
    } finally {
      setIsChangingPassword(false);
    }
  };


  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      // Validate password
      if (!deletePassword) {
        setDeleteError('Parola este obligatorie');
        return;
      }

      setIsDeletingAccount(true);
      setDeleteError('');

      // Call API to delete account with password
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'A apărut o eroare');
      }

      // Logout and redirect to home after account deletion
      await logout();
      router.push('/');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'A apărut o eroare');
      setIsDeletingAccount(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Setări"
        subtitle="Gestionează informațiile contului și preferințele"
      />

      <FormSection
        title="Informații cont"
        subtitle="Detaliile contului tău"
        className="mb-8"
      >
        <Grid cols={2} gap="md">
          <Card className="p-4" hover>
            <div className="flex items-center mb-2 text-text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <p className="text-sm">Email</p>
            </div>
            <p className="text-base sm:text-lg font-medium">{user?.email}</p>
          </Card>

          <Card className="p-4" hover>
            <div className="flex items-center mb-2 text-text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">Nume</p>
            </div>
            <p className="text-base sm:text-lg font-medium">{user?.name}</p>
          </Card>
        </Grid>
      </FormSection>

      <FormSection
        title="Modificare parolă"
        subtitle="Actualizează parola contului tău"
        className="mb-8"
      >
        {passwordError && (
          <Alert variant="error" className="mb-6">
            {passwordError}
          </Alert>
        )}

        {passwordSuccess && (
          <Alert variant="success" className="mb-6">
            {passwordSuccess}
          </Alert>
        )}

        <form onSubmit={handlePasswordChange}>
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
              loading={isChangingPassword}
              disabled={isChangingPassword}
              size="md"
              fullRounded={false}
              showArrow={false}
            >
              {isChangingPassword ? 'Se procesează...' : 'Actualizează parola'}
            </ActionButton>
          </FormActions>
        </form>
      </FormSection>

      <FormSection
        title="Ștergere cont"
        subtitle="Șterge permanent contul și toate datele asociate"
        className="border-danger/30"
      >
        <Alert variant="error" className="mb-6">
          Această acțiune va șterge permanent contul dvs. și toate datele asociate.
          Această acțiune <span className="font-semibold">nu poate fi anulată</span>.
        </Alert>

        {deleteError && (
          <Alert variant="error" className="mb-4">
            {deleteError}
          </Alert>
        )}

        {!showDeleteConfirm ? (
          <ActionButton
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
            size="md"
            fullRounded={false}
            showArrow={false}
          >
            Șterge contul
          </ActionButton>
        ) : (
          <Card className="p-5 border-danger/30 bg-danger/5">
            <div className="mb-4">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-danger mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Ești sigur că vrei să ștergi contul?</span>
              </div>

              <Input
                id="deletePassword"
                type="password"
                label="Pentru confirmare, introdu parola actuală"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="••••••••"
                variant="danger"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <ActionButton
                variant="danger"
                onClick={handleDeleteAccount}
                loading={isDeletingAccount}
                disabled={isDeletingAccount}
                size="md"
                fullRounded={false}
                showArrow={false}
              >
                {isDeletingAccount ? 'Se procesează...' : 'Da, șterge contul'}
              </ActionButton>
              <LinkButton
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeletingAccount}
                variant="default"
                size="md"
              >
                Anulează
              </LinkButton>
            </div>
          </Card>
        )}
      </FormSection>
    </div>
  );
}