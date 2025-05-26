'use client';

import LandingPage from '@/containers/LandingPage';
import { useAuth } from '@/context/AuthContext';



export default function Home() {
    const { isAuthenticated } = useAuth();

    return <LandingPage isAuthenticated={isAuthenticated} />;
}
