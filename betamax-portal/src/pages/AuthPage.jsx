import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';
import { LogIn, UserPlus, Github, Mail } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      <div className="fixed inset-0 crt-scanline z-50 pointer-events-none opacity-20"></div>
      
      <div className="max-w-md w-full space-y-8 bg-black/40 p-8 rounded-lg border border-cyan-900/30 backdrop-blur-md relative z-10 box-glow">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-glow-cyan italic mb-2">
            <span className="text-fuchsia-500">BETA</span> MAX
          </h1>
          <p className="text-xs text-cyan-700 uppercase tracking-widest">Access Protocol v1.0</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-cyan-600 uppercase mb-2 block">Identity Identifier (Email)</label>
              <input
                type="email"
                required
                className="w-full cyber-input"
                placeholder="user@betamax.core"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-cyan-600 uppercase mb-2 block">Access Key (Password)</label>
              <input
                type="password"
                required
                className="w-full cyber-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-mono">{error}</p>}

          <div className="flex flex-col gap-4">
            <button type="submit" className="cyber-button flex items-center justify-center gap-2 w-full">
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              {isLogin ? 'Initialize Session' : 'Create Access Identity'}
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-cyan-900/30"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase"><span className="px-2 bg-black text-cyan-800">Or Link External Core</span></div>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleLogin}
              className="cyber-button cyber-button-secondary flex items-center justify-center gap-2 w-full"
            >
              <img src="https://www.gstatic.com/firebase/anonymous-app/png/google.png" className="w-4 h-4 invert" alt="Google" />
              Sign in with Google
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] text-cyan-700 hover:text-cyan-400 uppercase tracking-widest transition-colors"
          >
            {isLogin ? "Need a new identity? REGISTER" : "Already have access? LOGIN"}
          </button>
        </div>
      </div>
    </div>
  );
}
