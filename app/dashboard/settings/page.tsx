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
  const [deletePassword, setDeletePassword] = useState('');
  
  // Billing details states
  const [billingName, setBillingName] = useState(user?.billingName || '');
  const [billingCompany, setBillingCompany] = useState(user?.billingCompany || '');
  const [billingVat, setBillingVat] = useState(user?.billingVat || '');
  const [billingAddress, setBillingAddress] = useState(user?.billingAddress || '');
  const [billingPhone, setBillingPhone] = useState(user?.billingPhone || '');
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [isUpdatingBilling, setIsUpdatingBilling] = useState(false);
  const [billingUpdateSuccess, setBillingUpdateSuccess] = useState('');
  const [billingUpdateError, setBillingUpdateError] = useState('');

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
  
  // Handle billing details update
  const handleBillingUpdate = async () => {
    try {
      // Reset states
      setBillingUpdateError('');
      setBillingUpdateSuccess('');
      
      // Validate fields
      if (!billingName.trim() && !billingCompany.trim()) {
        setBillingUpdateError('Numele sau compania este obligatorie');
        return;
      }
      
      if (!billingAddress.trim()) {
        setBillingUpdateError('Adresa este obligatorie');
        return;
      }
      
      setIsUpdatingBilling(true);
      
      // Call API to update billing details
      const response = await fetch('/api/auth/update-billing-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingName,
          billingCompany,
          billingVat,
          billingAddress,
          billingPhone,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'A apărut o eroare');
      }
      
      // Success
      setBillingUpdateSuccess('Detaliile de facturare au fost actualizate cu succes');
      setIsEditingBilling(false);
      
      // Update user context
      if (user) {
        user.billingName = billingName;
        user.billingCompany = billingCompany;
        user.billingVat = billingVat;
        user.billingAddress = billingAddress;
        user.billingPhone = billingPhone;
      }
    } catch (error) {
      setBillingUpdateError(error instanceof Error ? error.message : 'A apărut o eroare');
    } finally {
      setIsUpdatingBilling(false);
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
    <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">Setări</h1>
      </div>
      
      {/* Account Information Panel */}
      <div 
        className="dashboard-card p-6 mb-8"
        style={{ animation: 'fadeInUp 0.6s ease forwards', animationDelay: '0.1s', opacity: 0 }}
      >
        <div className="flex items-center border-b border-border-color pb-4 mb-6">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold">Informații cont</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-glass-border rounded-lg bg-glass-bg backdrop-blur-sm transition-all duration-300 hover:border-primary/30">
            <div className="flex items-center mb-2 text-text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <p className="text-sm">Email</p>
            </div>
            <p className="text-base sm:text-lg font-medium">{user?.email}</p>
          </div>
          
          <div className="p-4 border border-glass-border rounded-lg bg-glass-bg backdrop-blur-sm transition-all duration-300 hover:border-primary/30">
            <div className="flex items-center mb-2 text-text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">Nume</p>
            </div>
            <p className="text-base sm:text-lg font-medium">{user?.name}</p>
          </div>
          
          <div className="p-4 border border-glass-border rounded-lg bg-glass-bg backdrop-blur-sm transition-all duration-300 hover:border-primary/30 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                <p className="text-sm font-medium">Detalii facturare</p>
              </div>
              
              {!isEditingBilling ? (
                <button 
                  onClick={() => setIsEditingBilling(true)} 
                  className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Editează
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsEditingBilling(false);
                    setBillingName(user?.billingName || '');
                    setBillingCompany(user?.billingCompany || '');
                    setBillingVat(user?.billingVat || '');
                    setBillingAddress(user?.billingAddress || '');
                    setBillingPhone(user?.billingPhone || '');
                    setBillingUpdateError('');
                    setBillingUpdateSuccess('');
                  }} 
                  className="text-text-secondary hover:text-text-primary text-sm font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Anulează
                </button>
              )}
            </div>
            
            {billingUpdateError && (
              <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-2 rounded-lg mb-4 flex items-start text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {billingUpdateError}
              </div>
            )}
            
            {billingUpdateSuccess && (
              <div className="bg-success/10 border border-success/30 text-success px-4 py-2 rounded-lg mb-4 flex items-start text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {billingUpdateSuccess}
              </div>
            )}
            
            {isEditingBilling ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="billingName" className="block text-sm text-text-secondary mb-1">
                      Nume persoană fizică
                    </label>
                    <input
                      id="billingName"
                      type="text"
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                      placeholder="Numele și prenumele"
                      className="w-full bg-dark-blue-lighter/50 border border-glass-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="billingCompany" className="block text-sm text-text-secondary mb-1">
                      Denumire companie
                    </label>
                    <input
                      id="billingCompany"
                      type="text"
                      value={billingCompany}
                      onChange={(e) => setBillingCompany(e.target.value)}
                      placeholder="Denumirea companiei"
                      className="w-full bg-dark-blue-lighter/50 border border-glass-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="billingVat" className="block text-sm text-text-secondary mb-1">
                    Cod fiscal / CUI
                  </label>
                  <input
                    id="billingVat"
                    type="text"
                    value={billingVat}
                    onChange={(e) => setBillingVat(e.target.value)}
                    placeholder="Codul fiscal al companiei"
                    className="w-full bg-dark-blue-lighter/50 border border-glass-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label htmlFor="billingAddress" className="block text-sm text-text-secondary mb-1">
                    Adresă <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="billingAddress"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Adresa completă (stradă, număr, bloc, scară, apartament, localitate, județ, cod poștal, țară)"
                    className="w-full bg-dark-blue-lighter/50 border border-glass-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 min-h-[100px]"
                  />
                </div>
                
                <div>
                  <label htmlFor="billingPhone" className="block text-sm text-text-secondary mb-1">
                    Telefon
                  </label>
                  <input
                    id="billingPhone"
                    type="text"
                    value={billingPhone}
                    onChange={(e) => setBillingPhone(e.target.value)}
                    placeholder="Număr de telefon"
                    className="w-full bg-dark-blue-lighter/50 border border-glass-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  />
                </div>
                
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleBillingUpdate}
                    disabled={isUpdatingBilling}
                    className="btn btn-primary py-2 px-4 rounded-lg transition-all duration-300 text-sm hover:translate-y-[-2px]"
                  >
                    {isUpdatingBilling ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        <span>Se procesează...</span>
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Salvează
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1 space-y-3">
                {(user?.billingName || user?.billingCompany) ? (
                  <>
                    {user?.billingName && (
                      <div>
                        <p className="text-sm text-text-secondary">Nume persoană fizică:</p>
                        <p className="text-base">{user.billingName}</p>
                      </div>
                    )}
                    
                    {user?.billingCompany && (
                      <div>
                        <p className="text-sm text-text-secondary">Denumire companie:</p>
                        <p className="text-base">{user.billingCompany}</p>
                      </div>
                    )}
                    
                    {user?.billingVat && (
                      <div>
                        <p className="text-sm text-text-secondary">Cod fiscal / CUI:</p>
                        <p className="text-base">{user.billingVat}</p>
                      </div>
                    )}
                    
                    {user?.billingAddress && (
                      <div>
                        <p className="text-sm text-text-secondary">Adresă:</p>
                        <p className="text-base whitespace-pre-wrap">{user.billingAddress}</p>
                      </div>
                    )}
                    
                    {user?.billingPhone && (
                      <div>
                        <p className="text-sm text-text-secondary">Telefon:</p>
                        <p className="text-base">{user.billingPhone}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-text-tertiary italic">Nu există detalii de facturare specificate</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Password Change Panel */}
      <div 
        className="dashboard-card p-6 mb-8"
        style={{ animation: 'fadeInUp 0.6s ease forwards', animationDelay: '0.2s', opacity: 0 }}
      >
        <div className="flex items-center border-b border-border-color pb-4 mb-6">
          <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold">Modificare parolă</h2>
        </div>
        
        {passwordError && (
          <div className="bg-danger/10 border border-danger/30 text-danger px-5 py-3 rounded-lg mb-6 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {passwordError}
          </div>
        )}
        
        {passwordSuccess && (
          <div className="bg-success/10 border border-success/30 text-success px-5 py-3 rounded-lg mb-6 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {passwordSuccess}
          </div>
        )}
        
        <form onSubmit={handlePasswordChange} className="p-3 sm:p-4 border border-glass-border rounded-lg bg-glass-bg backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="mb-4">
              <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-text-secondary" htmlFor="currentPassword">
                Parola actuală
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-tertiary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-dark-blue-lighter/50 border border-glass-border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-text-secondary" htmlFor="newPassword">
                Parola nouă
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-tertiary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-dark-blue-lighter/50 border border-glass-border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-text-secondary" htmlFor="confirmPassword">
              Confirmă parola nouă
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-tertiary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-dark-blue-lighter/50 border border-glass-border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isChangingPassword}
            className="btn btn-primary py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg transition-all duration-300 hover:translate-y-[-2px] group w-full sm:w-auto"
          >
            {isChangingPassword ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                <span className="text-sm sm:text-base">Se procesează...</span>
              </span>
            ) : (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span className="text-sm sm:text-base">Actualizează parola</span>
              </span>
            )}
          </button>
        </form>
      </div>
      
      {/* Account Deletion Panel */}
      <div 
        className="dashboard-card p-6"
        style={{ animation: 'fadeInUp 0.6s ease forwards', animationDelay: '0.3s', opacity: 0 }}
      >
        <div className="flex items-center border-b border-danger/30 pb-4 mb-6">
          <div className="w-8 h-8 bg-danger/10 rounded-full flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-danger" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-danger">Ștergere cont</h2>
        </div>
        
        <div className="p-5 border border-danger/20 rounded-lg bg-danger/5 backdrop-blur-sm">
          <div className="flex items-start mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-danger mr-3 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-text-secondary text-xs sm:text-sm">
              Această acțiune va șterge permanent contul dvs. și toate datele asociate. 
              Această acțiune <span className="text-danger font-semibold">nu poate fi anulată</span>.
            </p>
          </div>
          
          {deleteError && (
            <div className="bg-danger/10 border border-danger/30 text-danger px-5 py-3 rounded-lg mb-4 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {deleteError}
            </div>
          )}
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center border border-danger/30 bg-danger/10 hover:bg-danger/20 text-danger font-medium py-2.5 px-5 rounded-lg transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Șterge contul
            </button>
          ) : (
            <div className="border border-danger/30 p-5 rounded-lg bg-danger/10 backdrop-blur-sm">
              <p className="mb-4 font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-danger mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Ești sigur că vrei să ștergi contul?
              </p>
              
              <div className="mb-4">
                <label className="block mb-2 text-xs sm:text-sm font-medium text-text-secondary" htmlFor="deletePassword">
                  Pentru confirmare, introdu parola actuală
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-tertiary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full bg-dark-blue-lighter/50 border border-danger/20 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-danger/50 focus:border-danger/50 transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="bg-danger hover:bg-danger/90 text-white font-medium py-2.5 px-4 sm:px-5 rounded-lg disabled:opacity-70 transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
                >
                  {isDeletingAccount ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      <span className="text-sm sm:text-base">Se procesează...</span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm sm:text-base">Da, șterge contul</span>
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeletingAccount}
                  className="border border-glass-border bg-glass-bg backdrop-blur-sm hover:bg-dark-blue-lighter text-text-primary font-medium py-2.5 px-4 sm:px-5 rounded-lg disabled:opacity-70 transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm sm:text-base">Anulează</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}