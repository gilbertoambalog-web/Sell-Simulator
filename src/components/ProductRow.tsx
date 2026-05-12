import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, OrderItem, ProductPromoInfo } from '../types';

interface ProductRowProps {
  product: Product;
  item?: OrderItem;
  promoInfo?: ProductPromoInfo;
  updateQty: (id: string, name: string, price: number, delta: number) => void;
  updateDiscount: (id: string, discount: number) => void;
}

const getDiscountBgClass = (discount: number) => {
  if (discount >= 15) return "bg-purple-500 text-white";
  if (discount >= 10) return "bg-red-500 text-white";
  if (discount >= 7) return "bg-yellow-400 text-slate-900";
  if (discount >= 4) return "bg-emerald-500 text-white";
  if (discount >= 1) return "bg-blue-500 text-white";
  return "bg-slate-200 text-slate-500";
};

const getDiscountBorderClass = (discount: number) => {
  if (discount >= 15) return "border-purple-500 text-purple-600";
  if (discount >= 10) return "border-red-500 text-red-600";
  if (discount >= 7) return "border-yellow-500 text-yellow-700";
  if (discount >= 4) return "border-emerald-500 text-emerald-600";
  if (discount >= 1) return "border-blue-500 text-blue-600";
  return "border-slate-200 text-slate-400";
};

const ProductRow: React.FC<ProductRowProps> = ({ product: p, item, promoInfo, updateQty, updateDiscount }) => {
  const quantity = item?.quantity || 0;
  const hasQty = quantity > 0;
  
  const [localQty, setLocalQty] = useState<string>(quantity.toString());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (parseInt(localQty || '0', 10) !== quantity) {
      setLocalQty(quantity.toString());
    }
    if (quantity === 0) {
      setIsExpanded(false);
    }
  }, [quantity]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Only allow digits
    setLocalQty(val);
    if (!isExpanded) setIsExpanded(true);
    
    if (val === '') {
      updateQty(p.id, p.name, p.price, -quantity);
    } else {
      const num = parseInt(val, 10);
      updateQty(p.id, p.name, p.price, num - quantity);
    }
  };

  const [tempDiscount, setTempDiscount] = useState<number | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customVal, setCustomVal] = useState<string>('');
  
  const handleDiscountSelect = (d: number) => {
    setIsCustom(false);
    setTempDiscount(d);
  };

  const handleCustomSelect = () => {
    setIsCustom(true);
    setTempDiscount(null);
  };
  
  const handleOk = () => {
    if (isCustom) {
      const val = parseFloat(customVal);
      if (!isNaN(val) && val >= 0 && val <= 100) {
        updateDiscount(p.id, val);
      } else {
        updateDiscount(p.id, 0);
      }
    } else if (tempDiscount !== null) {
      updateDiscount(p.id, tempDiscount);
    } else {
      updateDiscount(p.id, 0); // No discount selected
    }
    setTempDiscount(null);
    setIsCustom(false);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTempDiscount(null);
    setIsCustom(false);
    setCustomVal('');
    setIsExpanded(false);
  };
  
  const currentDisplayedValue = item?.discount || 0;

  const boxes = Math.floor(quantity / 6);
  const singles = quantity % 6;
  let qtyText = '';
  if (boxes > 0) qtyText += `${boxes} Caja(s)`;
  if (singles > 0) {
    if (qtyText) qtyText += ` y `;
    qtyText += `${singles} Und(s)`;
  }

  return (
    <div className={`p-3 rounded-2xl border transition-all ${
      hasQty ? (isExpanded ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-emerald-50 border-emerald-200 shadow-sm') : 'bg-white border-slate-100'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 cursor-pointer" onClick={() => hasQty && setIsExpanded(!isExpanded)}>
          <p className={`font-bold text-xs leading-tight ${hasQty && !isExpanded ? 'text-emerald-900' : 'text-slate-800'}`}>{p.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className={`text-[10px] font-medium ${hasQty && !isExpanded ? 'text-emerald-700/70' : 'text-slate-400'}`}>${p.price.toLocaleString()}</p>
            {item?.discount ? (
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${getDiscountBgClass(item.discount)}`}>
                -{item.discount}%
              </span>
            ) : null}
            {!isExpanded && hasQty && (
               <span className="text-[9px] font-bold text-emerald-700 ml-2">
                 • {qtyText}
               </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-slate-100 shadow-inner" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => {
              if (!isExpanded && quantity === 0) setIsExpanded(true);
              else if (!isExpanded && quantity === 1) setIsExpanded(true);
              else if (!isExpanded) setIsExpanded(true);
              updateQty(p.id, p.name, p.price, -1);
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors text-lg"
          >
            -
          </button>
          <input 
            type="text"
            inputMode="numeric"
            value={localQty}
            onClick={() => { if(!isExpanded) setIsExpanded(true); }}
            onChange={handleQtyChange}
            className="w-8 text-center font-black text-[13px] bg-transparent outline-none"
          />
          <button 
            onClick={() => {
               if (!isExpanded) setIsExpanded(true);
               updateQty(p.id, p.name, p.price, 1);
            }}
            className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors text-lg text-center pb-0.5"
          >
            +
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && hasQty && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {promoInfo && promoInfo.message && (
              <div className="mt-2 flex items-center px-3 py-2 bg-indigo-50 border border-indigo-100/50 rounded-xl">
                <p className="text-[10px] font-bold text-indigo-600 leading-snug break-words">
                  {promoInfo.message}
                </p>
              </div>
            )}
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 flex-wrap">
              {(() => {
                let buttons: number[] = [];
                if (promoInfo && promoInfo.tiers && promoInfo.tiers.length > 0) {
                  const uniqueDiscounts = Array.from(new Set<number>(promoInfo.tiers.map(t => t.discount)));
                  buttons = uniqueDiscounts.sort((a, b) => a - b);
                } else if (promoInfo && promoInfo.maxDiscount > 0) {
                  const maxDiscount = promoInfo.maxDiscount;
                  const generatedDiscounts = Array.from(new Set<number>([
                      Math.max(1, Math.round(maxDiscount / 3)),
                      Math.max(2, Math.round(maxDiscount * 2 / 3)),
                      maxDiscount
                    ]));
                  buttons = generatedDiscounts.sort((a, b) => a - b);
                } else {
                  buttons = [2, 4, 6];
                }

                return (
                  <>
                    {buttons.map(d => {
                      const isActive = (!isCustom && tempDiscount === d) || (tempDiscount === null && !isCustom && item?.discount === d);
                      const baseClass = isActive 
                            ? getDiscountBgClass(d) + " border-transparent"
                            : "bg-white " + getDiscountBorderClass(d);
                      
                      return (
                        <button 
                          key={d}
                          onClick={() => handleDiscountSelect(d)}
                          className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all hover:brightness-95 ${baseClass}`}
                        >
                          {d}% Off
                        </button>
                      );
                    })}
                    <div className="flex-none basis-full flex gap-2 mt-1">
                      <button
                        onClick={handleCustomSelect}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                          isCustom || (tempDiscount === null && !isCustom && item?.discount && !(buttons.includes(item.discount)))
                            ? 'bg-slate-800 border-slate-800 text-white'
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                        }`}
                      >
                        Otro
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
            
            {isCustom && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2"
              >
                <input 
                  type="number"
                  min="1" max="100"
                  value={customVal}
                  onChange={(e) => setCustomVal(e.target.value)}
                  placeholder="%"
                  className="w-16 border-2 border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold outline-none focus:border-indigo-500 text-center"
                />
                <span className="text-xs text-slate-400 font-bold">% de desc.</span>
              </motion.div>
            )}

            <div className="flex gap-2 mt-3 justify-end items-center">
              <button 
                onClick={handleCancel}
                className="px-3 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleOk}
                className="px-4 py-1.5 text-[10px] bg-slate-900 text-white rounded-lg font-black uppercase tracking-widest shadow-sm hover:bg-slate-800 transition-colors"
              >
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductRow;
