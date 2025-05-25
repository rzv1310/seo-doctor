'use client';

import { useState } from 'react';
import { ActionButton, LinkButton } from '@/components/ui';

interface BillingDetailsFormProps {
  initialData: {
    billingName: string | null;
    billingCompany: string | null;
    billingVat: string | null;
    billingAddress: string | null;
    billingPhone: string | null;
  };
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function BillingDetailsForm({ 
  initialData, 
  onSave, 
  onCancel 
}: BillingDetailsFormProps) {
  const [billingName, setBillingName] = useState(initialData.billingName || '');
  const [billingCompany, setBillingCompany] = useState(initialData.billingCompany || '');
  const [billingVat, setBillingVat] = useState(initialData.billingVat || '');
  const [billingAddress, setBillingAddress] = useState(initialData.billingAddress || '');
  const [billingPhone, setBillingPhone] = useState(initialData.billingPhone || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async () => {
    setIsUpdating(true);
    await onSave({
      billingName,
      billingCompany,
      billingVat,
      billingAddress,
      billingPhone
    });
    setIsUpdating(false);
  };

  return (
    <div className="p-4 border border-border-color rounded-lg">
      <h3 className="font-medium mb-4">Editează Detaliile de Facturare</h3>
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
              className="w-full bg-dark-blue-lighter/50 border border-border-color rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
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
              className="w-full bg-dark-blue-lighter/50 border border-border-color rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
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
            className="w-full bg-dark-blue-lighter/50 border border-border-color rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
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
            className="w-full bg-dark-blue-lighter/50 border border-border-color rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 min-h-[100px]"
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
            className="w-full bg-dark-blue-lighter/50 border border-border-color rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
          />
        </div>

        <div className="flex justify-end gap-3">
          <LinkButton
            onClick={onCancel}
            variant="default"
            size="sm"
          >
            Anulare
          </LinkButton>
          <ActionButton
            onClick={handleSubmit}
            disabled={isUpdating}
            loading={isUpdating}
            size="sm"
            showArrow={false}
            fullRounded={false}
          >
            {isUpdating ? (
              'Se procesează...'
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Salvează
              </>
            )}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}