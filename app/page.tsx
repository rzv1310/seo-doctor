'use client';

import LandingPage from '../containers/LandingPage';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    // Use auth status from the context which is initialized from server-side props
    const { isAuthenticated } = useAuth();

    // Render the landing page with auth status from context
    return <LandingPage isAuthenticated={isAuthenticated} />;
}