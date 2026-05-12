import React from 'react';
import { motion } from 'motion/react';
import { X, Box } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface ArticlesModalProps {
  onClose: () => void;
}

const categoryIcons: Record<string, string> = {
  "VINOS DEL AÑO": "🍷",
  "VINOS DE GUARDA": "🥂",
  "PREMIUM": "🥂",
  "ESPUMANTES": "🍾",
  "RTD": "🍹",
  "ANTARES": "🍺",
  "SPIRITS": "🍶"
};

export default function ArticlesModal({ onClose }: ArticlesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Box size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Artículos</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Catálogo de Productos
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(CATEGORIES).map(([catName, items]) => (
              <div key={catName} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                  <span className="text-xl">{categoryIcons[catName] || '📦'}</span>
                  <h3 className="text-sm font-black text-slate-800 tracking-tight">{catName}</h3>
                </div>
                <div className="flex-1 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{item.name}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">STOCK: --</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

