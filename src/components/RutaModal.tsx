import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, MapPin, Search, Filter, Phone, Mail } from 'lucide-react';
import { PDV, PDVStatus } from '../types';
import PDVCard from './PDVCard';

interface RutaModalProps {
  clients: PDV[];
  onClose: () => void;
  onStatusChange: (id: string, status: PDVStatus) => void;
  onInvoice: (client: PDV, viewOnly?: boolean) => void;
}

export default function RutaModal({ clients, onClose, onStatusChange, onInvoice }: RutaModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredClients = clients.filter(c => 
    c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-6xl max-h-[90vh] bg-slate-50 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="p-6 sm:p-8 bg-white border-b border-slate-100 flex justify-between items-center z-10 relative">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-1">Ruta Detallada</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{clients.length} Puntos de Venta</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 bg-white border-b border-slate-100">
          <div className="relative max-w-xl mx-auto">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por dirección, nombre o ID..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {filteredClients.length === 0 ? (
            <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 border-dashed">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-black uppercase tracking-widest">Sin resultados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredClients.map((client) => (
                <PDVCard
                  key={client.id}
                  client={client}
                  onStatusChange={onStatusChange}
                  onInvoice={(c, viewOnly) => {
                    onInvoice(c, viewOnly);
                    onClose();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
