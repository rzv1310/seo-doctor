'use client';

import { BillingDetails } from '@/types/billing';



interface BillingDetailsDisplayProps {
    details: BillingDetails;
}

export default function BillingDetailsDisplay({ details }: BillingDetailsDisplayProps) {
    const hasDetails = details.billingName || details.billingCompany;

    return (
        <div className="p-4 border border-border-color rounded-lg">
            <h3 className="font-medium mb-4">Detalii Facturare</h3>
            <div className="space-y-3">
                {hasDetails ? (
                    <>
                        {details.billingName && (
                            <div>
                                <p className="text-sm text-text-secondary">Nume persoană fizică:</p>
                                <p className="text-base">{details.billingName}</p>
                            </div>
                        )}

                        {details.billingCompany && (
                            <div>
                                <p className="text-sm text-text-secondary">Denumire companie:</p>
                                <p className="text-base">{details.billingCompany}</p>
                            </div>
                        )}

                        {details.billingVat && (
                            <div>
                                <p className="text-sm text-text-secondary">Cod fiscal / CUI:</p>
                                <p className="text-base">{details.billingVat}</p>
                            </div>
                        )}

                        {details.billingRegistrationNumber && details.billingRegistrationNumber.trim() !== '' && (
                            <div>
                                <p className="text-sm text-text-secondary">Nr. Reg. Com.:</p>
                                <p className="text-base">{details.billingRegistrationNumber}</p>
                            </div>
                        )}

                        {details.billingAddress && (
                            <div>
                                <p className="text-sm text-text-secondary">Adresă:</p>
                                <p className="text-base whitespace-pre-wrap">{details.billingAddress}</p>
                            </div>
                        )}

                        {details.billingPhone && (
                            <div>
                                <p className="text-sm text-text-secondary">Telefon:</p>
                                <p className="text-base">{details.billingPhone}</p>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-text-tertiary italic">Nu există detalii de facturare specificate</p>
                )}
            </div>
        </div>
    );
}
