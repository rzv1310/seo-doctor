'use client';

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, Grid, FormSection } from '@/components/ui';
import { DashboardPageLayout } from '@/components/layout';
import PasswordChangeForm from '@/components/dashboard/settings/PasswordChangeForm';
import AccountDeletionSection from '@/components/dashboard/settings/AccountDeletionSection';
import AccountInfoSection from '@/components/dashboard/settings/AccountInfoSection';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();


  // Handle password change
  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string }) => {
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'A apărut o eroare');
    }
  };


  // Handle account deletion
  const handleDeleteAccount = async (password: string) => {
    const response = await fetch('/api/auth/delete-account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'A apărut o eroare');
    }

    // Logout and redirect to home after account deletion
    await logout();
    router.push('/');
  };

  return (
    <DashboardPageLayout
      title="Setări"
      subtitle="Gestionează informațiile contului și preferințele"
    >
        <AccountInfoSection user={user} />

      <PasswordChangeForm onSubmit={handlePasswordChange} />

      <AccountDeletionSection onDelete={handleDeleteAccount} />
    </DashboardPageLayout>
  );
}