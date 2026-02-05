import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { UserProfile } from '../types';
import { initializeUser } from '../services/gameService';

interface AuthContextType {
  user: User | null; // Firebase Auth User
  profile: UserProfile | null; // Database User Profile
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  demoMode: boolean;
  enableDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Priority: If Demo Mode is active, initialize demo user and ignore Firebase Auth
    if (demoMode) {
      const mockUid = 'demo-user-123';
      initializeUser(mockUid, 'demo@example.com', 'Demo Player').then(p => {
        setProfile(p);
        setLoading(false);
      });
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userProfile = await initializeUser(currentUser.uid, currentUser.email, currentUser.displayName);
          setProfile(userProfile);
        } catch (error) {
          console.error("Error initializing user:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [demoMode]);

  const refreshProfile = async () => {
    if (user || demoMode) {
      if (profile) {
        setProfile({ ...profile }); 
      }
    }
  };

  const logout = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    }
    setDemoMode(false);
    setUser(null);
    setProfile(null);
  };

  const enableDemoMode = () => {
    setDemoMode(true);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, logout, demoMode, enableDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};