import React, { useState } from 'react';
import { User, LogIn, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

interface LoginProps {
  onLogin: (userName: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      onLogin(result.user.displayName || result.user.email || 'Vendedor');
    } catch (err: any) {
      console.error(err);
      setError('Error al iniciar sesión con Google.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-6 relative"
      >
        <div className="bg-white rounded-[3rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200 mb-4 overflow-hidden transform -rotate-6">
             <img 
              src="/regenerated_image_1777589522590.png" 
              alt="Logo"
              className="w-full h-full object-contain p-2"
            />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 italic">Sell Simulator</h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-[2px] w-8 bg-indigo-600 rounded-full" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Bienvenido</span>
              <div className="h-[2px] w-8 bg-indigo-600 rounded-full" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">
              Inicia sesión con tu cuenta de Google para guardar tu progreso
            </p>
          </div>

          <div className="w-full space-y-8">
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] py-5 font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
              <span>Ingresar con Google</span>
              <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center mt-2"
              >
                {error}
              </motion.p>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Sincronización en la Nube</span>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
          Powered by Ruta Analyzer v2.0
        </p>
      </motion.div>
    </div>
  );
}
