import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, UploadCloud, File, Image as ImageIcon, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { extractPricesFromFile } from '../services/geminiService';

interface PriceListUploadModalProps {
  onClose: () => void;
  onPricesUpdated: (newPrices: Record<string, number>) => void;
}

export default function PriceListUploadModal({ onClose, onPricesUpdated }: PriceListUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess(false);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    
    try {
      const prices = await extractPricesFromFile(file);
      if (Object.keys(prices).length === 0) {
        throw new Error("No se detectaron precios válidos que coincidan con la base de datos.");
      }
      onPricesUpdated(prices);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al procesar el archivo. Revisa el formato.');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <UploadCloud className="w-8 h-8 md:w-10 md:h-10 text-slate-400 group-hover:text-indigo-400 transition-colors" />;
    if (file.type.startsWith('image/')) return <ImageIcon className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />;
    if (file.type === 'application/pdf') return <FileText className="w-8 h-8 md:w-10 md:h-10 text-rose-500" />;
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) return <File className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />;
    return <FileText className="w-8 h-8 md:w-10 md:h-10 text-slate-500" />;
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!loading ? onClose : undefined}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-slate-800 flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight leading-none mb-1">Subir Precios</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Excel, PDF, JPG, TXT</p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-2 bg-slate-800 rounded-full border border-slate-700 shadow-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".xlsx,.xls,.csv,.txt,application/pdf,image/*"
          />

          {!file ? (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/3] rounded-3xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-800/30 hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center gap-3 p-6 group"
            >
              <div className="p-4 rounded-2xl bg-slate-800 group-hover:bg-indigo-500/10 transition-colors">
                {getFileIcon()}
              </div>
              <div className="text-center">
                <span className="block text-sm font-black text-slate-300 mb-1">Toca para seleccionar</span>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">O arrastra el archivo aquí</span>
              </div>
            </button>
          ) : (
            <div className="bg-slate-800/50 rounded-3xl p-5 border border-slate-700 flex items-center gap-4">
               {getFileIcon()}
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate">{file.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
               </div>
               <button 
                onClick={() => setFile(null)} 
                disabled={loading}
                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-colors disabled:opacity-50"
               >
                 <X className="w-4 h-4" />
               </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center">
              {error}
            </div>
          )}

          {success ? (
             <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center gap-2 text-emerald-400">
               <CheckCircle2 className="w-8 h-8" />
               <span className="text-sm font-black tracking-tight">¡Precios actualizados!</span>
             </div>
          ) : (
            <button
              onClick={handleProcess}
              disabled={!file || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-sm uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>Analizar y Aplicar</span>
              )}
            </button>
          )}

        </div>
      </motion.div>
    </div>
  );
}
