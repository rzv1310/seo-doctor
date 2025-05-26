import { useState, useEffect } from 'react';



export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    billingName?: string;
    billingCompany?: string;
    billingVat?: string;
    billingAddress?: string;
    billingPhone?: string;
    admin?: boolean;
}

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/admin/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch users');
            }

            setUsers(data.users);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching users');
            console.error('Error fetching users:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return {
        users,
        isLoading,
        error,
        refetch: fetchUsers,
    };
}
