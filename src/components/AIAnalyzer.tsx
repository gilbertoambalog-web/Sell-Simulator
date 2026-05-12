/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, BrainCircuit, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { analyzePortfolioMap } from '../services/geminiService';

interface AIAnalyzerProps {
  onClose: () => void;
  clients?: any[];
}

export default function AIAnalyzer({ onClose, clients = [] }: AIAnalyzerProps) {
  const [content, setContent] = useState('');
  const [stage, setStage] = useState<'initial' | 'analyzing' | 'results'>('initial');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (isFollowUp: boolean = false) => {
    setStage('analyzing');
    setError(null);
    try {
      const data = await analyzePortfolioMap(isFollowUp ? content : '', clients);
      setResults(data);
      if (isFollowUp) setContent('');
      setStage('results');
    } catch (e: any) {
      console.error(e);
      setError(e.message || "No se pudo procesar la información. Intenta nuevamente.");
      setStage(results ? 'results' : 'initial');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white w-full max-w-[340px] h-[580px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight leading-none mb-1">Estado Ruta</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Análisis IA</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full border border-slate-100 shadow-sm text-slate-400 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="mb-4 flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4" />
              <p className="text-[11px] font-bold uppercase">{error}</p>
            </div>
          )}

          {stage === 'initial' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center py-6"
            >
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">¿Quieres análisis de ruta?</h3>
              <p className="text-sm text-slate-500">
                La IA evaluará los puntos de venta y priorizará los PDV que son PLAN con mayor CNC.
              </p>
              
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                  No
                </button>
                <button 
                  onClick={() => handleAnalyze(false)}
                  className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Sí
                </button>
              </div>
            </motion.div>
          )}

          {stage === 'analyzing' && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Procesando datos...</p>
            </div>
          )}

          {stage === 'results' && results && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-slate-200" />
                  Respuesta de IA
                </h3>
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-medium">
                  {results.response}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  Otras consultas
                </h3>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Por ejemplo: ¿Qué PDV tienen en CNC Alma Mora Reserva?"
                  className="w-full h-24 bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans resize-none shadow-sm"
                />
                <button 
                  onClick={() => handleAnalyze(true)}
                  disabled={!content.trim()}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                  <Send className="w-4 h-4" />
                  Preguntar
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function RefreshCw({ className, ...props }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}
