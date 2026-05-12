import React from 'react';
import { motion } from 'motion/react';
import { X, FileText, Tag, Sliders, Upload, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onImportRuta: () => void;
  onLimpiarRuta: () => void;
  onSubirPrecios: () => void;
  onSubirPromociones: () => void;
}

export default function SettingsModal({ onClose, onImportRuta, onLimpiarRuta, onSubirPrecios, onSubirPromociones }: SettingsModalProps) {
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
        className="relative bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-800 flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/50">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight leading-none mb-1">Configuración</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ajustes del sistema</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-full border border-slate-700 shadow-sm text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2 mb-2">Administración de Ruta</h3>
          <button 
            onClick={() => {
              onClose();
              onImportRuta();
            }}
            className="w-full bg-slate-800/50 border border-slate-700 hover:border-emerald-500 hover:bg-slate-800 transition-all rounded-2xl p-4 flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 group-hover:bg-emerald-500/10 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">Importar Ruta</h3>
              <p className="text-[10px] font-bold text-slate-400">Cargar clientes desde archivo JSON</p>
            </div>
          </button>

          <button 
            onClick={() => {
              onClose();
              onLimpiarRuta();
            }}
            className="w-full bg-slate-800/50 border border-slate-700 hover:border-red-500 hover:bg-slate-800 transition-all rounded-2xl p-4 flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 group-hover:bg-red-500/10 flex items-center justify-center text-slate-400 group-hover:text-red-400 transition-colors shadow-sm">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">Limpiar Ruta</h3>
              <p className="text-[10px] font-bold text-slate-400">Eliminar todos los clientes y pedidos</p>
            </div>
          </button>

          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2 mt-6 mb-2">Archivos Maestros</h3>
          <button 
            onClick={() => {
              onClose();
              onSubirPrecios();
            }}
            className="w-full bg-slate-800/50 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all rounded-2xl p-4 flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 group-hover:bg-indigo-500/10 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">Subir Lista de Precios</h3>
              <p className="text-[10px] font-bold text-slate-400">Actualizar archivo maestro de precios</p>
            </div>
          </button>

          <button 
            onClick={() => {
              onClose();
              onSubirPromociones();
            }}
            className="w-full bg-slate-800/50 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all rounded-2xl p-4 flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 group-hover:bg-indigo-500/10 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors shadow-sm">
              <Tag className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">Subir Cuadro de Promociones</h3>
              <p className="text-[10px] font-bold text-slate-400">Descuentos y reglas automáticas</p>
            </div>
          </button>

          <button className="w-full bg-slate-800/50 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all rounded-2xl p-4 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 group-hover:bg-indigo-500/10 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors shadow-sm">
              <Sliders className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">Personalización</h3>
              <p className="text-[10px] font-bold text-slate-400">Temas, logos y apariencia visual</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
