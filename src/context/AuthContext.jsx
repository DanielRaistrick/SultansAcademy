import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // undefined = still resolving, null = logged out, object = logged in
  const [user, setUser] = useState(undefined);
  const [redirectError, setRedirectError] = useState(null);

  useEffect(() => {
    // Handle the return leg of signInWithRedirect
    getRedirectResult(auth).catch((err) => {
      console.error('Redirect sign-in error:', err);
      setRedirectError(err);
    });

    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, redirectError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
