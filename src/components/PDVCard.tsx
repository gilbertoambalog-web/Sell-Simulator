/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, ShoppingBag, MapPin, Medal } from 'lucide-react';
import { PDV, PDVStatus } from '../types';

interface PDVCardProps {
  client: PDV;
  onStatusChange: (id: string, status: PDVStatus) => void;
  onInvoice: (client: PDV, viewOnly?: boolean) => void;
}

const PDVCard: React.FC<PDVCardProps> = ({ client, onStatusChange, onInvoice }) => {
  const isSold = client.status === PDVStatus.SOLD;
  const isNoSale = client.status === PDVStatus.NO_SALE;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`bg-white p-4 rounded-2xl shadow-sm border-2 transition-all relative group cursor-pointer ${
        isSold ? 'border-emerald-500' : 
        isNoSale ? 'border-red-500' : 
        'border-transparent hover:border-slate-200'
      }`}
    >

      <div className="flex items-center gap-2 mb-1">
        <p className="text-sm text-slate-800 font-black truncate flex-1 uppercase tracking-tighter">{client.address}</p>
        <div className="flex flex-col items-end bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-100 shadow-sm ml-auto">
          <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Fact Mensual</span>
          <span className="text-xs font-black text-indigo-600 leading-none">{client.billing || '$ 0'}</span>
        </div>
      </div>


      <div className="flex items-center gap-2 mb-3">
        {client.plan && (
          <span className={`flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
            client.plan === 'GOLD' ? 'bg-amber-100 text-amber-700' : 
            client.plan === 'SILVER' ? 'bg-slate-200 text-slate-700' :
            client.plan === 'INICIAL' ? 'bg-indigo-100 text-indigo-700' :
            'bg-slate-100 text-slate-500'
          }`}>
            <Medal size={10} />
            {client.plan}
          </span>
        )}
      </div>

      {/* Portfolio Grid */}
      <div className="mb-4">
        <div className="grid grid-cols-6 gap-x-1 gap-y-3 mb-1">
          {['A.M', 'Alaris', 'Dadá', 'T. Reserva', 'F. las Moras', 'L. Arboles', 'A.M Rva', 'G Flavor', 'Antares', 'Frizze', 'Smf Flavors'].map((sku, i) => {
            const p = (client.plans && client.plans.length > i) ? client.plans[i] : 'CNC';
            return (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter text-center leading-[11px] mb-1 h-6 flex items-end justify-center overflow-hidden w-full px-0.5 whitespace-normal">
                  <span className="line-clamp-2" style={{ fontSize: '9px', lineHeight: '11px' }}>{sku}</span>
                </span>
                <div 
                  className={`w-full h-2.5 rounded-[1px] transition-all ${
                    p === 'CCC' 
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                      : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                  }`}
                  title={`${sku}: ${p}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(client.id, isNoSale ? PDVStatus.PENDING : PDVStatus.NO_SALE);
          }}
          className={`flex-1 text-[9px] py-2 rounded-lg font-black uppercase transition-all border ${
            isNoSale
              ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20'
              : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100'
          }`}
        >
          S/D
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onInvoice(client, isSold);
          }}
          className={`flex-[2] text-[9px] py-2 rounded-lg font-black uppercase shadow-sm transition-all flex items-center justify-center gap-2 ${
            isSold 
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
            : 'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-100'
          }`}
        >
          {isSold ? 'Ver Pedido' : 'Facturar'}
        </button>
      </div>
    </motion.div>

  );
};

export default PDVCard;
