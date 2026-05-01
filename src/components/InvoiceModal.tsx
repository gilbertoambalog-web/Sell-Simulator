/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, ChevronLeft, Check, Copy, Share2 } from 'lucide-react';
import { PDV, OrderItem, Order } from '../types';
import { CATEGORIES } from '../constants';
import ProductRow from './ProductRow';

interface InvoiceModalProps {
  client: PDV;
  initialOrder?: Order;
  viewOnly?: boolean;
  onClose: () => void;
  onSave: (orderData: { items: OrderItem[]; total: number }) => void;
}

export default function InvoiceModal({ client, initialOrder, viewOnly, onClose, onSave }: InvoiceModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use initialOrder if available
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem>>(() => {
    if (initialOrder && initialOrder.items) {
      const itemsMap: Record<string, OrderItem> = {};
      initialOrder.items.forEach(item => {
        itemsMap[item.id] = item;
      });
      return itemsMap;
    }
    return {};
  });
  
  const [showSummary, setShowSummary] = useState(viewOnly ? true : false);

  const allProducts = useMemo(() => {
    return Object.entries(CATEGORIES).flatMap(([category, products]) => 
      products.map(p => ({ ...p, category }))
    );
  }, []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProducts, searchTerm]);

  const updateQty = (id: string, name: string, price: number, delta: number) => {
    setOrderItems(prev => {
      const existing = prev[id] || { productId: id, name, price, quantity: 0, discount: 0 };
      const newQty = Math.max(0, existing.quantity + delta);
      if (newQty === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: { ...existing, quantity: newQty } };
    });
  };

  const updateDiscount = (id: string, discount: number) => {
    setOrderItems(prev => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], discount } };
    });
  };

  const grandTotal = useMemo(() => {
    return (Object.values(orderItems) as OrderItem[]).reduce((sum, item) => {
      const discountedPrice = item.price * (1 - item.discount / 100);
      return sum + (discountedPrice * item.quantity);
    }, 0);
  }, [orderItems]);

  const totalBultos = useMemo(() => {
    return (Object.values(orderItems) as OrderItem[]).reduce((sum, item) => sum + item.quantity, 0);
  }, [orderItems]);

  const orderSummaryText = useMemo(() => {
    let text = `📦 *PEDIDO SELL SIMULATOR*\n📍 ${client.address}\n---\n`;
    (Object.values(orderItems) as OrderItem[]).forEach(item => {
      const sub = item.quantity * (item.price * (1 - item.discount / 100));
      text += `• ${item.name} x${item.quantity} ${item.discount > 0 ? `[-${item.discount}%]` : ''} -> $${Math.round(sub).toLocaleString()}\n`;
    });
    text += `---\nBULTOS: ${totalBultos}\n*TOTAL: $${Math.round(grandTotal).toLocaleString()}*`;
    return text;
  }, [client, orderItems, totalBultos, grandTotal]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(orderSummaryText);
    alert('Resumen copiado al portapapeles');
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 max-w-xl mx-auto bg-white rounded-t-[3rem] p-6 shadow-2xl max-h-[92vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <button onClick={onClose} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
          <div className="w-8" />
        </div>

        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">Pedido</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{client.address}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {client.billing && (
              <span className="text-[10px] bg-slate-50 px-3 py-1 rounded-full font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                Fact Mensual: {client.billing}
              </span>
            )}
          </div>
        </div>

        <div className="relative mb-6 shrink-0">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar producto..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {Object.entries(CATEGORIES).map(([cat, products]) => {
            const catProds = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
            if (catProds.length === 0) return null;
            
            return (
              <div key={cat} className="mb-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-4 h-px bg-slate-200" />
                  {cat}
                </h3>
                <div className="space-y-3">
                  {catProds.map(p => (
                    <ProductRow 
                      key={p.id} 
                      product={{ ...p, category: cat }} 
                      item={orderItems[p.id]} 
                      updateQty={updateQty} 
                      updateDiscount={updateDiscount} 
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="shrink-0 pt-6 border-t border-slate-100 mt-4 bg-white">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pedido</p>
              <p className="text-3xl font-black text-indigo-600 tracking-tight">
                ${Math.round(grandTotal).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unidades</p>
              <p className="text-xl font-bold text-slate-800">{totalBultos}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowSummary(true)}
              disabled={totalBultos === 0}
              className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] disabled:opacity-50"
            >
              Confirmar Pedido
            </button>
          </div>
        </div>

        {/* Summary Overlay */}
        <AnimatePresence>
          {showSummary && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white rounded-t-[3rem] p-8 flex flex-col z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Resumen de Pedido</h3>
                <button onClick={() => viewOnly ? onClose() : setShowSummary(false)} className="p-2 bg-slate-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-3xl p-6 font-mono text-sm text-slate-600 whitespace-pre-wrap overflow-y-auto mb-6">
                {orderSummaryText}
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={copyToClipboard}
                  className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-3"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Todo
                </button>
                <button 
                  onClick={() => viewOnly ? onClose() : onSave({ items: Object.values(orderItems), total: grandTotal })}
                  className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition-colors"
                >
                  Cerrar Ventana
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
