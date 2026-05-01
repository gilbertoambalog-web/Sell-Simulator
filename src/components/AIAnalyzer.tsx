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
}

export default function AIAnalyzer({ onClose }: AIAnalyzerProps) {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzePortfolioMap(content);
      setResults(data);
    } catch (e) {
      setError("No se pudo procesar la información. Intenta con un formato más claro.");
    } finally {
      setIsAnalyzing(false);
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
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Estrategia IA</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Análisis de Ruta</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full border border-slate-100 shadow-sm text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {!results ? (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
                <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                  Pega el texto de un **Análisis de Ruta** o describe los productos activos en tus puntos de venta para recibir una estrategia de crecimiento.
                </p>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ejemplo: Cliente 437230 tiene activos: Vinos San Telmo, Alma Mora. Falta: Dadá, Spirits..."
                className="w-full h-40 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans italic resize-none"
              />

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-[11px] font-bold uppercase">{error}</p>
                </div>
              )}

              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !content}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-95 text-xs uppercase tracking-widest"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generar Estrategia
                  </>
                )}
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-slate-200" />
                  Resumen Ejecutivo
                </h3>
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                  <p className="text-sm text-emerald-900 leading-relaxed italic font-medium">
                    "{results.summary}"
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Insights Clave</h3>
                <div className="space-y-2">
                  {results.topInsights.map((insight: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-normal">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Recomendaciones</h3>
                <div className="space-y-2">
                  {results.recommendations.map((rec: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                      <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-700 font-bold leading-normal">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setResults(null)}
                className="w-full py-4 border border-slate-100 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Analizar Otro Mapa
              </button>
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
