
import { useEffect, useState } from 'react';

// Mock types to match Supabase usage
export interface User {
  id: string;
  email?: string;
  app_metadata?: any;
  user_metadata?: any;
  aud?: string;
  created_at?: string;
}

export interface Session {
  user: User;
  access_token: string;
}

const MOCK_USER: User = {
  id: 'local-user',
  email: 'user@local.app',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString()
};

const MOCK_SESSION: Session = {
  user: MOCK_USER,
  access_token: 'mock-token'
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth
    const checkAuth = async () => {
      // Always authenticated in local mode
      setUser(MOCK_USER);
      setSession(MOCK_SESSION);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const signOut = async () => {
    // No-op for local
    console.log("Sign out called - no-op in local mode");
  };

  return { user, session, loading, signOut };
}

export function useRequireAuth() {
  const { user, loading } = useAuth();
  return { user, loading };
}
