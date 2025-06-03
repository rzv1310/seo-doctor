'use client';

import { useState } from 'react';
import { ActionButton, PasswordInput, FormSection, FormGroup, FormRow, FormActions, Alert } from '@/components/ui';



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
                        <PasswordInput
                            id="currentPassword"
                            label="Parola actuală"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />

                        <PasswordInput
                            id="newPassword"
                            label="Parola nouă"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </FormRow>

                    <PasswordInput
                        id="confirmPassword"
                        label="Confirmă parola nouă"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
