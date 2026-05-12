/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Users, BarChart3, Settings, LogOut, Package, TrendingUp, Sparkles, Box } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  stats: { visited: number; total: number };
  vendorId?: string | null;
  userName?: string | null;
  day?: string;
  onLogout?: () => void;
  onOpenAI?: () => void;
  onOpenOrders?: () => void;
  onOpenRuta?: () => void;
  onOpenArticles?: () => void;
  onOpenSettings?: () => void;
  onGoHome?: () => void;
  onUpdateVendorId?: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const dayNames: Record<string, string> = {
  '1': 'Lunes',
  '2': 'Martes',
  '3': 'Miércoles',
  '4': 'Jueves',
  '5': 'Viernes',
  '6': 'Sábado'
};

export default function Sidebar({ stats, vendorId, userName, day, onLogout, onOpenAI, onOpenOrders, onOpenRuta, onOpenArticles, onGoHome, onOpenSettings, onUpdateVendorId, isOpen = false, onClose }: SidebarProps) {
  const progress = (stats.visited / stats.total) * 100;
  const dayName = day && dayNames[day] ? dayNames[day] : null;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col shrink-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 relative flex items-center justify-center shrink-0 overflow-hidden">
            <img 
              src="/regenerated_image_1777589522590.png" 
              alt="Sell Simulator Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-black text-xl tracking-tighter text-white">Sell Simulator</h1>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 space-y-1.5">
          <p className="text-[10px] text-slate-300 uppercase tracking-widest font-black truncate" title={userName || 'Usuario'}>
            Usuario: {userName || 'Usuario'}
          </p>
          <div 
            onClick={() => {
              const val = window.prompt('Ingrese número de vendedor:', vendorId?.replace('Vendedor ', '') || '---');
              if (val && onUpdateVendorId) onUpdateVendorId(val);
            }}
            className="group cursor-pointer flex justify-between items-center"
            title="Click para editar"
          >
            <p className="text-[10px] text-slate-300 uppercase tracking-widest font-black group-hover:text-white transition-colors">Vendedor: {vendorId || '---'}</p>
          </div>
          <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-black">
            Ruta: {stats.total > 0 ? `${dayName ? `${dayName} / ` : ''}${new Date().getDate()}/${new Date().getMonth() + 1}` : '---'}
          </p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
        <NavItem icon={<LayoutDashboard size={18} />} label="Inicio" onClick={onGoHome} active />
        <NavItem icon={<Sparkles size={18} />} label="Estado de Ruta" onClick={onOpenAI} />
        <NavItem icon={<Package size={18} />} label="Pedidos del Día" onClick={onOpenOrders} />
        <NavItem icon={<Users size={18} />} label="Ruta" onClick={onOpenRuta} />
        <NavItem icon={<Box size={18} />} label="Artículos" onClick={onOpenArticles} />
      </nav>

      <div className="p-6 space-y-4">
        <button 
          onClick={onOpenSettings}
          className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors px-4 py-2 text-sm font-bold w-full text-left"
        >
          <Settings size={18} />
          <span>Configuración</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 text-red-400/60 hover:text-red-400 transition-colors px-4 py-2 text-sm font-bold w-full text-left bg-red-400/5 rounded-xl"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
        <div className="pt-4 text-center">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            Desarrollado por<br />Gilberto Rodriguez
          </p>
        </div>
      </div>
    </aside>
    </>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
      active 
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    }`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
