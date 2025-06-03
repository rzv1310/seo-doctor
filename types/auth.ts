export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string | null;
    createdAt: string;
    billingName?: string | null;
    billingCompany?: string | null;
    billingVat?: string | null;
    billingRegistrationNumber?: string | null;
    billingAddress?: string | null;
    billingPhone?: string | null;
    stripeCustomerId?: string | null;
    admin?: boolean | null;
}


export interface AuthSession {
    user: User;
    isAuthenticated: true;
}


export interface NoAuthSession {
    user: null;
    isAuthenticated: false;
}


export type SessionResult = AuthSession | NoAuthSession;


export interface TokenPayload {
    userId: string;
    exp: number;
}


export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    setUser: (user: User | null) => void;
    refreshUser: () => Promise<void>;
}


export interface AuthProviderProps {
    children: React.ReactNode;
    initialUser?: User | null;
    initialAuth?: boolean;
}