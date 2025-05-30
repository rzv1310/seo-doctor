import { useState, useEffect } from 'react';

import { useLogger } from '@/lib/client-logger';
import { User } from '@/types/auth';



export function useUsers() {
    const logger = useLogger('useUsers');
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
            logger.error('Error fetching users', err);
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
