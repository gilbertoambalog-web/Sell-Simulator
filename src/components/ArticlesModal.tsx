import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Box, Search, Upload, Check } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface ArticlesModalProps {
  onClose: () => void;
  customStock: Record<string, number>;
  onStockUpdated: (newStock: Record<string, number>) => void;
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

export default function ArticlesModal({ onClose, customStock, onStockUpdated }: ArticlesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [stockText, setStockText] = useState('');

  const handleImportStock = () => {
    if (!stockText.trim()) return;

    const lines = stockText.split('\n');
    const newStock = { ...customStock };
    const allProducts = Object.values(CATEGORIES).flat();

    lines.forEach(line => {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        // Assume format is: name \t quantity
        const namePart = parts[0].trim().toLowerCase();
        const qtyPart = parseInt(parts[parts.length - 1].trim().replace(/\D/g, ''), 10);
        
        if (!isNaN(qtyPart)) {
          const matchedProduct = allProducts.find(p => p.name.toLowerCase().includes(namePart) || namePart.includes(p.name.toLowerCase()));
          if (matchedProduct) {
            newStock[matchedProduct.id] = qtyPart;
          }
        }
      } else {
        // Fallback for space separated: "Fernet Branca 24"
        const words = line.split(' ');
        const lastWord = words.pop() || '';
        const qty = parseInt(lastWord.replace(/\D/g, ''), 10);
        const namePart = words.join(' ').trim().toLowerCase();
        
        if (!isNaN(qty) && namePart.length > 3) {
          const matchedProduct = allProducts.find(p => p.name.toLowerCase().includes(namePart) || namePart.includes(p.name.toLowerCase()));
          if (matchedProduct) {
            newStock[matchedProduct.id] = qty;
          }
        }
      }
    });

    onStockUpdated(newStock);
    setShowUpload(false);
    setStockText('');
  };

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return CATEGORIES;
    const term = searchTerm.toLowerCase();
    const result: Record<string, typeof CATEGORIES[string]> = {};
    
    Object.entries(CATEGORIES).forEach(([catName, items]) => {
      const filtered = items.filter(item => item.name.toLowerCase().includes(term));
      if (filtered.length > 0) {
        result[catName] = filtered;
      }
    });
    return result;
  }, [searchTerm]);

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
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 gap-4 shrink-0">
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
          
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="flex-1 md:w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
              />
            </div>
            <button 
              onClick={() => setShowUpload(!showUpload)}
              className="px-4 py-2 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-100 transition-colors shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Cargar Stock</span>
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 shrink-0 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 border border-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {showUpload && (
          <div className="p-6 bg-emerald-50/50 border-b border-slate-100 shrink-0">
            <h3 className="text-sm font-black text-slate-800 mb-2">Importar Stock</h3>
            <p className="text-xs font-medium text-slate-500 mb-4">
              Pega el texto desde Excel o Sheets. El formato debe contener el nombre del producto y el stock (ej. "Fernet Branca 750ml 24").
            </p>
            <textarea
              className="w-full h-32 p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono resize-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Ejemplo:&#10;San Telmo Malbec 120&#10;Frizzé Blue 48"
              value={stockText}
              onChange={(e) => setStockText(e.target.value)}
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleImportStock}
                className="px-6 py-2.5 bg-emerald-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-md flex items-center gap-2 hover:bg-emerald-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Procesar y Guardar
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(filteredCategories).map(([catName, items]) => (
              <div key={catName} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                  <span className="text-xl">{categoryIcons[catName] || '📦'}</span>
                  <h3 className="text-sm font-black text-slate-800 tracking-tight">{catName}</h3>
                </div>
                <div className="flex-1 space-y-4">
                  {items.map((item) => {
                    const stk = customStock[item.id];
                    const hasStock = stk !== undefined;
                    return (
                      <div key={item.id} className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{item.name}</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${hasStock ? 'text-emerald-600' : 'text-slate-400'}`}>
                            STOCK: {hasStock ? stk : '--'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {Object.keys(filteredCategories).length === 0 && (
            <div className="text-center py-20">
              <Box className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Sin resultados</h3>
              <p className="text-[10px] font-medium text-slate-300 mt-2">No se encontraron artículos para tu búsqueda.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

