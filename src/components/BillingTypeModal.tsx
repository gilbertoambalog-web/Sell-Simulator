import React from 'react';
import { motion } from 'motion/react';
import { X, FileText, Truck } from 'lucide-react';

interface BillingTypeModalProps {
  onSelect: (type: 'FACTURA_A' | 'REMITO') => void;
  onClose: () => void;
}

export default function BillingTypeModal({ onSelect, onClose }: BillingTypeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-6 text-center mt-2">
          Tipo de Facturación
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => onSelect('FACTURA_A')}
            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50 group transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:text-indigo-600 text-slate-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm uppercase tracking-wider group-hover:text-indigo-700">Factura A</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Lista con IVA</p>
            </div>
          </button>

          <button 
            onClick={() => onSelect('REMITO')}
            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-800 hover:border-slate-700 bg-slate-900 group transition-all text-left shadow-lg shadow-slate-900/20"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-white group-hover:bg-slate-700 transition-colors">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-white text-sm uppercase tracking-wider">Remito</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Incremento del 3.4%</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
