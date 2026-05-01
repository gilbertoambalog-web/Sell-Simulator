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
  day?: string;
  onLogout?: () => void;
  onOpenAI?: () => void;
  onOpenOrders?: () => void;
  onOpenRuta?: () => void;
  onOpenArticles?: () => void;
}

const dayNames: Record<string, string> = {
  '1': 'Lunes',
  '2': 'Martes',
  '3': 'Miércoles',
  '4': 'Jueves',
  '5': 'Viernes',
  '6': 'Sábado'
};

export default function Sidebar({ stats, vendorId, day, onLogout, onOpenAI, onOpenOrders, onOpenRuta, onOpenArticles }: SidebarProps) {
  const progress = (stats.visited / stats.total) * 100;
  const dayName = day && dayNames[day] ? dayNames[day] : null;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 hidden lg:flex">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 relative flex items-center justify-center shrink-0 overflow-hidden">
            <img 
              src="/regenerated_image_1777589522590.png" 
              alt="Sell Simulator Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-black text-xl tracking-tighter text-white">Sell Simulator</h1>
        </div>
        <p className="text-[11px] text-slate-400 uppercase tracking-widest font-black">Vendedor: {vendorId || 'No Identificado'}</p>
        {dayName && <p className="text-[11px] text-indigo-400 mt-1 uppercase tracking-widest font-black">Ruta: {dayName} {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</p>}
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        <NavItem icon={<LayoutDashboard size={18} />} label="Inicio" active />
        <NavItem icon={<Sparkles size={18} />} label="Análisis IA" onClick={onOpenAI} />
        <NavItem icon={<Package size={18} />} label="Pedidos del Día" onClick={onOpenOrders} />
        <NavItem icon={<Users size={18} />} label="Ruta" onClick={onOpenRuta} />
        <NavItem icon={<Box size={18} />} label="Artículos" onClick={onOpenArticles} />
      </nav>

      <div className="p-6 space-y-4">
        <button className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors px-4 py-2 text-sm font-bold w-full text-left">
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
      </div>
    </aside>
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
