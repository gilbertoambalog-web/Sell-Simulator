/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, ChevronLeft, Check, Copy, Share2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { PDV, OrderItem, Order, PromoRule } from '../types';
import { CATEGORIES } from '../constants';
import ProductRow from './ProductRow';

interface InvoiceModalProps {
  client: PDV;
  initialOrder?: Order;
  viewOnly?: boolean;
  billingType?: 'FACTURA_A' | 'REMITO';
  customPrices?: Record<string, number>;
  customPromos?: PromoRule[];
  onClose: () => void;
  onSave: (orderData: { items: OrderItem[]; total: number }) => void;
}

export default function InvoiceModal({ client, initialOrder, viewOnly, billingType = 'FACTURA_A', customPrices = {}, customPromos = [], onClose, onSave }: InvoiceModalProps) {
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
  const [showCurrentOrder, setShowCurrentOrder] = useState(false);

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

  const promoInfoPerProduct = useMemo(() => {
    const info: Record<string, import('../types').ProductPromoInfo> = {};
    const quantitiesPerRule: Record<string, number> = {};
    
    const safePromos = Array.isArray(customPromos) ? customPromos : [];
    
    safePromos.forEach(rule => {
      let totalQty = 0;
      if (rule.isMixAndMatch && rule.targetProductIds) {
        rule.targetProductIds.forEach(id => {
           totalQty += (orderItems[id]?.quantity || 0);
        });
      }
      quantitiesPerRule[rule.id] = totalQty;
    });

    allProducts.forEach(p => {
      const applicableRules = safePromos.filter(r => r.targetProductIds && r.targetProductIds.includes(p.id));
      if (applicableRules.length === 0) return;

      let bestDiscount = 0;
      let maxFoundDiscount = 0;
      let nextTierMinQty = Infinity;
      let nextTierDiscount = 0;

      applicableRules.forEach(rule => {
         const sortedTiers = [...(rule.tiers || [])].sort((a,b) => b.minQty - a.minQty);
         const currentQty = rule.isMixAndMatch ? quantitiesPerRule[rule.id] : (orderItems[p.id]?.quantity || 0);
         
         let achievedTier = sortedTiers.find(t => currentQty >= t.minQty);
         if (achievedTier && achievedTier.discount > bestDiscount) {
            bestDiscount = achievedTier.discount;
         }
         if (sortedTiers.length > 0) {
           if (sortedTiers[0].discount > maxFoundDiscount) {
               maxFoundDiscount = sortedTiers[0].discount;
           }
         }
         const higherTiers = sortedTiers.filter(t => t.minQty > currentQty).sort((a,b) => a.minQty - b.minQty);
         if (higherTiers.length > 0) {
            const closest = higherTiers[0];
            if (closest.minQty < nextTierMinQty) {
               nextTierMinQty = closest.minQty;
               nextTierDiscount = closest.discount;
            }
         }
      });

      let msg = '';
      if (bestDiscount > 0) {
         msg += `⚡ Promo activa: ${bestDiscount}% OFF. `;
      }
      if (nextTierMinQty !== Infinity) {
         const isBox = nextTierMinQty % 6 === 0;
         const targetAmount = isBox ? nextTierMinQty / 6 : nextTierMinQty;
         const targetUnit = isBox ? 'caja(s)' : 'und(s)';
         msg += `Sugerencia: llegar a ${targetAmount} ${targetUnit} para tener el ${nextTierDiscount}% OFF.`;
      }

      if (bestDiscount > 0 || nextTierMinQty !== Infinity) {
        const combinedTiers = applicableRules.flatMap(r => r.tiers);
        
        info[p.id] = {
          autoDiscount: bestDiscount,
          maxDiscount: maxFoundDiscount,
          message: msg.trim(),
          tiers: combinedTiers
        };
      }
    });

    return info;
  }, [allProducts, customPromos, orderItems]);

  const updateQty = (id: string, name: string, price: number, delta: number) => {
    setOrderItems(prev => {
      const existing = prev[id] || { productId: id, name, price, quantity: 0, discount: 0 };
      const newQty = Math.max(0, existing.quantity + delta);
      
      const newItems = { ...prev };
      if (newQty === 0) {
        delete newItems[id];
      } else {
        newItems[id] = { ...existing, quantity: newQty };
      }

      // Reevaluate promos for all items
      const quantitiesPerRule: Record<string, number> = {};
      const safeCustomPromos = Array.isArray(customPromos) ? customPromos : [];
      safeCustomPromos.forEach(rule => {
        let totalQty = 0;
        if (rule.isMixAndMatch && rule.targetProductIds) {
          rule.targetProductIds.forEach(targetId => {
             totalQty += (newItems[targetId]?.quantity || 0);
          });
        }
        quantitiesPerRule[rule.id] = totalQty;
      });

      Object.keys(newItems).forEach(itemId => {
        const applicableRules = safeCustomPromos.filter(r => r.targetProductIds && r.targetProductIds.includes(itemId));
        let bestDiscount = 0;
        applicableRules.forEach(rule => {
           const sortedTiers = [...(rule.tiers || [])].sort((a,b) => b.minQty - a.minQty);
           const currentQty = rule.isMixAndMatch ? quantitiesPerRule[rule.id] : newItems[itemId].quantity;
           const achievedTier = sortedTiers.find(t => currentQty >= t.minQty);
           if (achievedTier && achievedTier.discount > bestDiscount) {
              bestDiscount = achievedTier.discount;
           }
        });
        
        // If we found a discount and the user hasn't overridden with a higher one
        const currentDisc = newItems[itemId].discount;
        const isCurrentFromAnyPromo = applicableRules.some(r => r.tiers && r.tiers.some(t => t.discount === currentDisc));
        
        if (bestDiscount > 0) {
           if (currentDisc < bestDiscount || (currentDisc > bestDiscount && isCurrentFromAnyPromo)) {
              newItems[itemId].discount = bestDiscount;
           }
        } else {
           if (currentDisc > 0 && isCurrentFromAnyPromo) {
              newItems[itemId].discount = 0;
           }
        }
      });

      return newItems;
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
    const tipoStr = billingType === 'REMITO' ? 'Remito' : 'Factura A';
    let text = `Pedido ${tipoStr}\nDirección ${client.address}\n`;
    (Object.values(orderItems) as OrderItem[]).forEach((item, index) => {
      const sub = item.quantity * (item.price * (1 - item.discount / 100));
      const discountText = item.discount > 0 ? ` -- (-${item.discount}%) ` : ' ';
      text += `${index + 1}. ${item.name} -- ${item.quantity}Und${discountText}--- $${Math.round(sub).toLocaleString()}\n`;
    });
    text += `Total de Bultos: ${totalBultos}\nTotal : $ ${Math.round(grandTotal).toLocaleString()}`;
    return text;
  }, [client, orderItems, totalBultos, grandTotal, billingType]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(orderSummaryText);
    alert('Resumen copiado al portapapeles');
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const tipoStr = billingType === 'REMITO' ? 'Remito' : 'Factura A';
    
    doc.setFontSize(18);
    doc.text(`Pedido ${tipoStr}`, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Dirección: ${client.address}`, 20, 30);
    
    doc.setFontSize(10);
    let y = 45;
    
    const items = Object.values(orderItems) as OrderItem[];
    items.forEach((item, index) => {
      const sub = item.quantity * (item.price * (1 - item.discount / 100));
      const discountText = item.discount > 0 ? ` (-${item.discount}%) ` : ' ';
      
      const line1 = `${index + 1}. ${item.name}`;
      const line2 = `${item.quantity}Und${discountText} --- $${Math.round(sub).toLocaleString()}`;
      
      doc.text(line1, 20, y);
      doc.text(line2, 180, y, { align: 'right' });
      
      y += 8;
      
      // If page is full, add new page
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
    
    y += 10;
    
    doc.setFontSize(12);
    doc.text(`Total de Bultos: ${totalBultos}`, 20, y);
    doc.setFontSize(14);
    doc.text(`Total: $ ${Math.round(grandTotal).toLocaleString()}`, 20, y + 10);
    
    doc.save(`Pedido_${tipoStr}_${client.address.replace(/[\s\/]/g, '_')}.pdf`);
  };

  const handleClose = () => {
    if (viewOnly) {
      onClose();
    } else {
      if (Object.keys(orderItems).length === 0) {
        onClose();
      } else {
        onSave({ items: Object.values(orderItems), total: grandTotal });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 max-w-xl mx-auto bg-white rounded-t-3xl p-4 shadow-2xl h-[95vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-3 shrink-0">
          <button onClick={handleClose} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
          <div className="w-8" />
        </div>

        <div className="flex justify-between items-center mb-3 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-none">
              {billingType === 'REMITO' ? 'Remito' : 'Factura A'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{client.address}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest border ${billingType === 'REMITO' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>
              {billingType === 'REMITO' ? 'Inc +3.4%' : 'Pedido'}
            </span>
            {client.billing && (
              <span className="text-[8px] bg-slate-50 px-2.5 py-0.5 rounded-full font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                Fact Mensual: {client.billing}
              </span>
            )}
          </div>
        </div>

        <div className="relative mb-3 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar producto..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-2.5 pl-9 pr-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {Object.entries(CATEGORIES).map(([cat, products]) => {
            const catProds = products.map(p => {
              let price = customPrices[p.id] !== undefined ? customPrices[p.id] : p.price;
              if (billingType === 'REMITO') {
                price = price * 1.034;
              }
              return { ...p, price };
            }).filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
            if (catProds.length === 0) return null;
            
            return (
              <div key={cat} className="mb-4">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <span className="w-4 h-px bg-slate-200" />
                  {cat}
                </h3>
                <div className="space-y-1.5">
                  {catProds.map(p => (
                    <ProductRow 
                      key={p.id} 
                      product={{ ...p, category: cat }} 
                      item={orderItems[p.id]} 
                      promoInfo={promoInfoPerProduct[p.id]}
                      updateQty={updateQty} 
                      updateDiscount={updateDiscount} 
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="shrink-0 pt-3 border-t border-slate-100 mt-2 bg-white">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Pedido</p>
              <p className="text-xl font-black text-indigo-600 tracking-tight leading-none">
                ${Math.round(grandTotal).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Unidades</p>
              <p className="text-lg font-bold text-slate-800 leading-none">{totalBultos}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowCurrentOrder(true)}
              disabled={totalBultos === 0}
              className="px-4 bg-slate-100 text-slate-800 font-black py-2.5 rounded-xl shadow-sm active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em] disabled:opacity-50"
            >
              Ver Pedido
            </button>
            <button 
              onClick={() => setShowSummary(true)}
              disabled={totalBultos === 0}
              className="flex-1 bg-indigo-600 text-white font-black py-2.5 rounded-xl shadow-md shadow-indigo-100 active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em] disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
        </div>

        {/* Current Order Overlay */}
        <AnimatePresence>
          {showCurrentOrder && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white rounded-t-3xl p-4 flex flex-col z-20"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Pedido Actual</h3>
                <button onClick={() => setShowCurrentOrder(false)} className="p-1.5 bg-slate-100 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 mb-2">
                {(Object.values(orderItems) as OrderItem[]).map(item => {
                   const product = allProducts.find(p => p.id === item.productId);
                   if (!product) return null;
                   
                   let price = customPrices[product.id] !== undefined ? customPrices[product.id] : product.price;
                   if (billingType === 'REMITO') {
                     price = price * 1.034;
                   }
                   
                   return (
                     <ProductRow 
                       key={product.id} 
                       product={{ ...product, price }} 
                       item={item} 
                       promoInfo={promoInfoPerProduct[product.id]}
                       updateQty={updateQty} 
                       updateDiscount={updateDiscount} 
                     />
                   );
                })}
                {Object.keys(orderItems).length === 0 && (
                  <p className="text-center text-slate-400 font-medium py-10">No hay productos seleccionados.</p>
                )}
              </div>
              
              <div className="shrink-0 pt-3 border-t border-slate-100 mt-2 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Pedido</p>
                    <p className="text-xl font-black text-indigo-600 tracking-tight leading-none">
                      ${Math.round(grandTotal).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Unidades</p>
                    <p className="text-lg font-bold text-slate-800 leading-none">{totalBultos}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCurrentOrder(false)}
                  className="w-full py-2.5 bg-indigo-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all text-center"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Overlay */}
        <AnimatePresence>
          {showSummary && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white rounded-t-3xl p-4 flex flex-col z-10"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Resumen</h3>
                <button onClick={() => viewOnly ? onClose() : setShowSummary(false)} className="p-1.5 bg-slate-100 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-xs text-slate-600 whitespace-pre-wrap overflow-y-auto mb-4">
                {orderSummaryText}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button 
                  onClick={downloadPDF}
                  className="w-full py-3 bg-red-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-md flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="w-full py-3 bg-emerald-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-md flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Todo
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <button 
                  onClick={handleClose}
                  className="w-full py-3 bg-indigo-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-md flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                >
                  Guardar Pedido
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
