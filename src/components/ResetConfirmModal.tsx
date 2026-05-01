import React from 'react';
import { motion } from 'motion/react';
import { Trash2, X } from 'lucide-react';

interface ResetConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ResetConfirmModal({ onConfirm, onCancel }: ResetConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 flex flex-col items-center text-center overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-red-600" />
        
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 mt-2">
          <Trash2 size={32} />
        </div>

        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">¿Limpiar Ruta?</h2>
        <p className="text-sm font-medium text-slate-500 mb-8 max-w-[280px]">
          Estás a punto de borrar todos los pedidos y la ruta actual. Esto simula el comienzo de un nuevo día.
        </p>

        <div className="flex gap-4 w-full">
          <button 
            onClick={onCancel}
            className="flex-1 py-3.5 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors rounded-2xl text-xs font-black uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 transition-colors text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-200"
          >
            Limpiar Ruta
          </button>
        </div>
      </motion.div>
    </div>
  );
}
