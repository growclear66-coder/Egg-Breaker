import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuth } from '../context/AuthContext';

export const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { enableDemoMode } = useAuth();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Firebase not configured. Please use Demo Mode.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      let msg = 'Authentication failed';
      if (err.code === 'auth/email-already-in-use') msg = 'Email already exists';
      if (err.code === 'auth/wrong-password') msg = 'Invalid password';
      if (err.code === 'auth/user-not-found') msg = 'User not found';
      if (err.code === 'auth/weak-password') msg = 'Password too weak';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) {
      setError("Firebase not configured. Please use Demo Mode.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (err.code === 'auth/configuration-not-found') {
        setError("⚠️ Google Sign-In is disabled. Enable it in Firebase Console > Authentication > Sign-in method.");
      } else if (err.code === 'auth/unauthorized-domain') {
        const hostname = window.location.hostname;
        setError(`⚠️ Access Denied: The domain "${hostname}" is not authorized. If you are using the default Firebase keys, you cannot sign in. Please use "Demo Mode" below.`);
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("⚠️ Google Sign-In provider is not enabled in Firebase Console.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in cancelled.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Popup blocked. Please allow popups for this site.");
      } else {
        setError("Google sign-in failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          EggBreaker Pro
        </h1>
        <p className="text-slate-400 mt-2">Crack eggs, level up, compete.</p>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        <Input 
          type="email" 
          placeholder="email@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email Address"
          required
        />
        <Input 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Password"
          required
        />
        
        {error && <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm break-words">{error}</div>}

        <Button type="submit" isLoading={loading} className="w-full">
          {isLogin ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px bg-slate-700 flex-1"></div>
        <span className="text-slate-500 text-sm">OR</span>
        <div className="h-px bg-slate-700 flex-1"></div>
      </div>

      <div className="space-y-3">
        <Button 
          variant="secondary" 
          type="button" 
          onClick={handleGoogleLogin} 
          className="w-full bg-white hover:bg-gray-100 text-gray-900"
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.17c-.22-.66-.35-1.36-.35-2.17s.13-1.51.35-2.17V7.69H2.18C1.43 9.16 1 10.84 1 12c0 1.16.43 2.84 1.18 4.31l3.66-2.14z" />
            <path fill="#EA4335" d="M12 4.8c1.6 0 3.09.55 4.23 1.64l3.18-3.18C17.46 1.52 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.14C6.71 6.73 9.14 4.8 12 4.8z" />
          </svg>
          Continue with Google
        </Button>

        <div className="text-center text-sm">
          <button 
            type="button"
            className="text-slate-400 hover:text-white underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
        
        <div className="pt-4 border-t border-slate-700 text-center">
            <p className="text-xs text-slate-500 mb-2">
              Problems with Google Sign-In or API Keys?
            </p>
             <Button variant="ghost" className="w-full text-xs" onClick={enableDemoMode}>
                Launch Demo Mode (Offline)
             </Button>
        </div>
      </div>
    </div>
  );
};