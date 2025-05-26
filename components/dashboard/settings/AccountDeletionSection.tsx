'use client';

import { useState } from 'react';
import { ActionButton, LinkButton, Alert, Card, Input, FormSection } from '@/components/ui';



interface AccountDeletionSectionProps {
    onDelete: (password: string) => Promise<void>;
}

export default function AccountDeletionSection({ onDelete }: AccountDeletionSectionProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deletePassword, setDeletePassword] = useState('');

    const handleDeleteAccount = async () => {
        try {
            if (!deletePassword) {
                setDeleteError('Parola este obligatorie');
                return;
            }

            setIsDeletingAccount(true);
            setDeleteError('');
            await onDelete(deletePassword);
        } catch (error) {
            setDeleteError(error instanceof Error ? error.message : 'A apărut o eroare');
            setIsDeletingAccount(false);
        }
    };

    return (
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
                            onClick={() => {
                                setShowDeleteConfirm(false);
                                setDeletePassword('');
                                setDeleteError('');
                            }}
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
    );
}
