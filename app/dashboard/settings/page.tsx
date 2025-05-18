'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

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
      setIsDeletingAccount(true);
      setDeleteError('');
      
      // Call API to delete account
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Setări</h1>
      
      <div className="bg-blue-900/20 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Informații cont</h2>
        <div className="mb-4">
          <p className="text-text-secondary mb-1">Email</p>
          <p>{user?.email}</p>
        </div>
        <div className="mb-4">
          <p className="text-text-secondary mb-1">Nume</p>
          <p>{user?.name}</p>
        </div>
      </div>
      
      <div className="bg-blue-900/20 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Modificare parolă</h2>
        
        {passwordError && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
            {passwordError}
          </div>
        )}
        
        {passwordSuccess && (
          <div className="bg-green-500/20 border border-green-500 text-green-500 px-4 py-2 rounded mb-4">
            {passwordSuccess}
          </div>
        )}
        
        <form onSubmit={handlePasswordChange}>
          <div className="mb-4">
            <label className="block mb-1 text-text-secondary" htmlFor="currentPassword">
              Parola actuală
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-blue-900/30 border border-border-color rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 text-text-secondary" htmlFor="newPassword">
              Parola nouă
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-blue-900/30 border border-border-color rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 text-text-secondary" htmlFor="confirmPassword">
              Confirmă parola nouă
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-blue-900/30 border border-border-color rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <button
            type="submit"
            disabled={isChangingPassword}
            className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded disabled:opacity-70"
          >
            {isChangingPassword ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Se procesează...
              </span>
            ) : (
              'Actualizează parola'
            )}
          </button>
        </form>
      </div>
      
      <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-red-500">Ștergere cont</h2>
        <p className="mb-4 text-text-secondary">
          Această acțiune va șterge permanent contul dvs. și toate datele asociate. Această acțiune nu poate fi anulată.
        </p>
        
        {deleteError && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
            {deleteError}
          </div>
        )}
        
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded"
          >
            Șterge contul
          </button>
        ) : (
          <div className="border border-red-500/30 p-4 rounded bg-red-900/20">
            <p className="mb-4 font-medium">Ești sigur că vrei să ștergi contul?</p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded disabled:opacity-70"
              >
                {isDeletingAccount ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Se procesează...
                  </span>
                ) : (
                  'Da, șterge contul'
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeletingAccount}
                className="bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded disabled:opacity-70"
              >
                Anulează
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}