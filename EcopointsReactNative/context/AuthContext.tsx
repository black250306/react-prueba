import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

export interface AuthContextType {
  signIn: (session: { token: string; userId: string; userName: string }) => Promise<void>;
  signOut: () => void;
  token: string | null;
  userId: string | null;
  userName: string | null;
  authenticated: boolean | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<Partial<AuthContextType>>({
    token: null,
    userId: null,
    userName: null,
    authenticated: null,
  });

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const userId = await SecureStore.getItemAsync('userId');
        const userName = await SecureStore.getItemAsync('userName');

        if (token && userId) {
          setAuthState({ token, userId, userName, authenticated: true });
        } else {
          setAuthState({ token: null, userId: null, userName: null, authenticated: false });
        }
      } catch (e) {
        setAuthState({ token: null, userId: null, userName: null, authenticated: false });
      } finally {
        SplashScreen.hideAsync();
      }
    };
    loadAuthData();
  }, []);

  useEffect(() => {
    if (authState.authenticated === null) return;
    const inTabsGroup = segments[0] === '(tabs)';
    if (authState.authenticated && !inTabsGroup) {
      router.replace('/');
    } else if (!authState.authenticated && inTabsGroup) {
      router.replace('/login');
    }
  }, [authState.authenticated, segments, router]);

  const signIn = async (session: { token: string; userId: string; userName: string }) => {
    await SecureStore.setItemAsync('token', session.token);
    await SecureStore.setItemAsync('userId', session.userId);
    await SecureStore.setItemAsync('userName', session.userName);
    setAuthState({ ...session, authenticated: true });
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('userId');
    await SecureStore.deleteItemAsync('userName');
    setAuthState({ token: null, userId: null, userName: null, authenticated: false });
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ ...authState, signIn, signOut } as AuthContextType}>
      {children}
    </AuthContext.Provider>
  );
}
