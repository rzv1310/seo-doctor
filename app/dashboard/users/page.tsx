'use client';

import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardPageLayout } from '@/components/layout';



export default function UsersPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { users, isLoading, error } = useUsers();
    const [searchTerm, setSearchTerm] = useState('');

    // Redirect if not admin
    if (user && !user.admin) {
        router.push('/dashboard');
        return null;
    }

    // Filter users based on search term
    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ro-RO');
    };

    return (
        <DashboardPageLayout
            title="Utilizatori"
            subtitle="Administrare utilizatori platformă"
        >

            {/* Search and filters */}
            <div className="bg-dark-blue-lighter p-4 rounded-lg mb-6">
                <div className="flex gap-4 flex-wrap">
                    <div className="flex-1 min-w-[250px]">
                        <label htmlFor="search" className="block text-sm mb-1">Căutare</label>
                        <input
                            id="search"
                            type="text"
                            placeholder="Caută după nume sau email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 bg-dark-blue border border-border-color rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6">
                    <p>{error}</p>
                </div>
            )}

            {/* Loading state */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                </div>
            ) : (
                /* Users table */
                <div className="bg-dark-blue-lighter rounded-lg overflow-hidden">
                    {filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-text-secondary">
                            {searchTerm ? 'Niciun utilizator găsit pentru căutarea dvs.' : 'Nu există utilizatori.'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-dark-blue/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            Nume
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            Data creării
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            Admin
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-dark-blue/30">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary mr-3">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        {user.billingCompany && (
                                                            <div className="text-sm text-text-secondary">{user.billingCompany}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div>{user.email}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div>{formatDate(user.createdAt)}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div>
                                                    {user.admin ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                                                            Da
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-dark-blue text-gray-300">
                                                            Nu
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </DashboardPageLayout>
    );
}
