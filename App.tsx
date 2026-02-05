import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameDashboard } from './components/GameDashboard';
import { AuthForm } from './components/AuthForm';
import { isFirebaseReady } from './firebaseConfig';

const AppContent: React.FC = () => {
  const { user, loading, demoMode } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Cracking the shell...</p>
        </div>
      </div>
    );
  }

  // Show config warning if not configured and not in demo mode
  if (!isFirebaseReady && !user && !demoMode) {
     return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
           <AuthForm />
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {user || demoMode ? <GameDashboard /> : (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center">
           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
           <div className="relative z-10 w-full max-w-md">
             <AuthForm />
           </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;