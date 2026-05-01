/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, Target, Percent, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardHeaderProps {
  stats: { sold: number; visited: number; total: number };
  onReset: () => void;
  onImportRuta: () => void;
  onLimpiarRuta: () => void;
}

export default function DashboardHeader({ stats, onReset, onImportRuta, onLimpiarRuta }: DashboardHeaderProps) {
  const effectiveness = stats.visited > 0 ? Math.round((stats.sold / stats.visited) * 100) : 0;

  return (
    <header className="h-auto md:h-24 bg-white border-b border-slate-200 px-4 py-4 md:px-8 flex flex-col md:flex-row items-center justify-between shadow-sm shrink-0 sticky top-0 z-40 gap-4">
      <div className="flex gap-4 md:gap-12 w-full md:w-auto justify-between md:justify-start">
        <KPI 
          label="Pedidos" 
          value={stats.sold} 
          icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
          subValue="Finalizados"
        />
        <KPI 
          label="Efectividad" 
          value={`${effectiveness}%`} 
          icon={<Target className="w-4 h-4 text-indigo-500" />}
          subValue="Conversión"
          highlight={effectiveness > 70 ? 'emerald' : 'indigo'}
        />
        <KPI 
          label="Cobertura" 
          value={`${Math.round((stats.visited / stats.total) * 100)}%`} 
          icon={<Percent className="w-4 h-4 text-slate-400" />}
          subValue="De la ruta"
        />
      </div>

      <div className="flex gap-3 w-full md:w-auto justify-end">
        <button 
          onClick={onLimpiarRuta}
          className="flex-1 md:flex-none px-4 md:px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">Limpiar</span>
        </button>
        <button 
          onClick={onImportRuta}
          className="flex-1 md:flex-none px-4 md:px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          Importar<span className="hidden sm:inline"> Ruta</span>
        </button>
      </div>
    </header>
  );
}

function KPI({ label, value, icon, subValue, highlight = 'slate' }: { label: string; value: string | number; icon: React.ReactNode; subValue: string; highlight?: 'emerald' | 'indigo' | 'slate' }) {
  const valueColor = highlight === 'emerald' ? 'text-emerald-600' : highlight === 'indigo' ? 'text-indigo-600' : 'text-slate-900';

  return (
    <div className="flex gap-4 items-center flex-1">
      <div>
        <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest leading-tight md:leading-normal">{label}</p>
        <div className="flex items-baseline gap-1 md:gap-2">
          <span className={`text-lg md:text-2xl font-black ${valueColor} tracking-tight leading-none`}>{value}</span>
          <span className="hidden md:inline text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{subValue}</span>
        </div>
      </div>
    </div>
  );
}
