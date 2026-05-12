import React, { useState } from 'react';
import { X, Upload, ClipboardPaste, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { PDV, PDVStatus } from '../types';

interface RouteImportModalProps {
  onClose: () => void;
  onImport: (clients: PDV[], vendorId?: string) => void;
}

export default function RouteImportModal({ onClose, onImport }: RouteImportModalProps) {
  const [data, setData] = useState('');
  const [error, setError] = useState<string | null>(null);

  const parseData = () => {
    try {
      if (!data.trim()) {
        setError('Por favor, pega los datos de la ruta.');
        return;
      }

      // Split by lines
      const lines = data.trim().split('\n');
      
      let detectedVendorId = '';

      const parsedClients: PDV[] = lines.map((line, index) => {
        // Split by tabs to perfectly match Excel copy-paste
        const parts = line.split('\t').map(p => p.trim());
        
        // Sometimes users might paste text where columns are separated by multiple spaces instead of tabs
        // If there's no tab, fallback to splitting by double space or more
        const extractedParts = parts.length > 2 ? parts : line.split(/\s{2,}/).map(p => p.trim());

        if (extractedParts.length < 5) {
          throw new Error(`Línea ${index + 1} tiene un formato inválido. Necesita estar separada por columnas (tabulaciones o múltiples espacios).`);
        }

        if (index === 0 && extractedParts[0]) {
          detectedVendorId = extractedParts[0];
        }

        const billing = extractedParts[5] || '$ 0';
        const isVerified = extractedParts[8] === 'SI';
        const category = extractedParts[6] === '-' ? null : extractedParts[6];
        const plans = extractedParts.slice(10); // Everything after index 9

        // Map category/plan to our enum if possible
        let mappedPlan: 'GOLD' | 'SILVER' | 'INICIAL' | null = null;
        if (category?.toUpperCase().includes('SILVER')) mappedPlan = 'SILVER';
        else if (category?.toUpperCase().includes('GOLD')) mappedPlan = 'GOLD';
        else if (category?.toUpperCase().includes('INICIAL')) mappedPlan = 'INICIAL';

        return {
          id: `CLIENT-${extractedParts[0]}-${index}`,
          name: extractedParts[2],
          address: extractedParts[3],
          type: extractedParts[4],
          billing: billing,
          category: category || '-',
          isVerified: isVerified,
          day: extractedParts[1],
          plans: plans,
          plan: mappedPlan,
          portfolio: [1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1], // Default placeholder logic
          status: PDVStatus.PENDING
        };
      });

      if (parsedClients.length > 0) {
        onImport(parsedClients, detectedVendorId);
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar los datos. Verifica el formato.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tighter italic">Importar Nueva Ruta</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carga los datos del vendedor para analizar</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-xl transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4" /> Pega aquí la tabla de datos
            </h3>
            <textarea 
              value={data}
              onChange={(e) => {
                setData(e.target.value);
                setError(null);
              }}
              className="w-full h-64 bg-white border border-slate-200 rounded-2xl p-4 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-inner"
              placeholder="Ej: 901	1	ZHENG CHANGI	AVDA SUAREZ 1957 ..."
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={parseData}
              className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              Procesar y Cargar Ruta
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
