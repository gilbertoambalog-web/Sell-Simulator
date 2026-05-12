/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, Target, Percent, Trash2, Menu } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardHeaderProps {
  stats: { sold: number; visited: number; total: number };
  onReset: () => void;
  onOpenMenu?: () => void;
}

export default function DashboardHeader({ stats, onReset, onOpenMenu }: DashboardHeaderProps) {
  const effectiveness = stats.visited > 0 ? Math.round((stats.sold / stats.visited) * 100) : 0;

  return (
    <header className="h-auto md:h-24 bg-white border-b border-slate-200 px-2 py-1.5 md:px-8 md:py-0 flex flex-col md:flex-row items-center justify-between shadow-sm shrink-0 sticky top-0 z-40 gap-1 md:gap-4">
      <div className="flex gap-2 md:gap-12 w-full md:w-auto justify-between md:justify-start items-center">
        {onOpenMenu && (
          <button 
            onClick={onOpenMenu}
            className="lg:hidden p-2 -ml-1 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
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
