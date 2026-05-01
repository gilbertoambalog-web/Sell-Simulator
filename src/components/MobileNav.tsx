import React from 'react';
import { LayoutDashboard, Sparkles, Package, Users, Box } from 'lucide-react';

interface MobileNavProps {
  onOpenAI: () => void;
  onOpenOrders: () => void;
  onOpenRuta: () => void;
  onOpenArticles: () => void;
  activeTab: 'inicio' | 'ia' | 'pedidos' | 'ruta' | 'articulos';
  setActiveTab: (tab: 'inicio' | 'ia' | 'pedidos' | 'ruta' | 'articulos') => void;
}

export default function MobileNav({ onOpenAI, onOpenOrders, onOpenRuta, onOpenArticles, activeTab, setActiveTab }: MobileNavProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-3 flex justify-around items-center z-50 pb-safe">
      <NavItem 
        icon={<LayoutDashboard size={20} />} 
        label="Inicio" 
        active={activeTab === 'inicio'} 
        onClick={() => setActiveTab('inicio')} 
      />
      <NavItem 
        icon={<Sparkles size={20} />} 
        label="IA" 
        active={activeTab === 'ia'} 
        onClick={() => { setActiveTab('ia'); onOpenAI(); }} 
      />
      <NavItem 
        icon={<Package size={20} />} 
        label="Pedidos" 
        active={activeTab === 'pedidos'} 
        onClick={() => { setActiveTab('pedidos'); onOpenOrders(); }} 
      />
      <NavItem 
        icon={<Users size={20} />} 
        label="Ruta" 
        active={activeTab === 'ruta'} 
        onClick={() => { setActiveTab('ruta'); onOpenRuta(); }} 
      />
      <NavItem 
        icon={<Box size={20} />} 
        label="Artículos" 
        active={activeTab === 'articulos'} 
        onClick={() => { setActiveTab('articulos'); onOpenArticles(); }} 
      />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 w-16 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400'}`}
    >
      <div className={`p-1.5 rounded-xl ${active ? 'bg-indigo-50 text-indigo-600' : 'bg-transparent text-slate-500'}`}>
        {icon}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
