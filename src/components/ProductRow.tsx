import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, OrderItem } from '../types';

interface ProductRowProps {
  product: Product;
  item?: OrderItem;
  updateQty: (id: string, name: string, price: number, delta: number) => void;
  updateDiscount: (id: string, discount: number) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({ product: p, item, updateQty, updateDiscount }) => {
  const quantity = item?.quantity || 0;
  const hasQty = quantity > 0;
  
  const [localQty, setLocalQty] = useState<string>(quantity.toString());

  useEffect(() => {
    if (parseInt(localQty || '0', 10) !== quantity) {
      setLocalQty(quantity.toString());
    }
  }, [quantity]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Only allow digits
    setLocalQty(val);
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
  };

  const handleCancel = () => {
    setTempDiscount(null);
    setIsCustom(false);
    setCustomVal('');
    // Optionally we can reset the discount to 0 or leave it as it was
    // updateDiscount(p.id, 0); 
  };
  
  // if tempDiscount or isCustom are not set, reflect current item.discount
  const currentDisplayedValue = item?.discount || 0;

  return (
    <div className={`p-4 rounded-3xl border transition-all ${
      hasQty ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100'
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-bold text-slate-800 text-[13px]">{p.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[11px] text-slate-400 font-medium">${p.price.toLocaleString()}</p>
            {item?.discount ? (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white uppercase">
                -{item.discount}%
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-full border border-slate-100 shadow-inner">
          <button 
            onClick={() => updateQty(p.id, p.name, p.price, -1)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            -
          </button>
          <input 
            type="text"
            inputMode="numeric"
            value={localQty}
            onChange={handleQtyChange}
            className="w-10 text-center font-black text-sm bg-transparent outline-none"
          />
          <button 
            onClick={() => updateQty(p.id, p.name, p.price, 1)}
            className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
          >
            +
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {hasQty && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 flex-wrap">
              {[2, 4, 6].map(d => {
                const isActive = (!isCustom && tempDiscount === d) || (tempDiscount === null && !isCustom && item?.discount === d);
                return (
                  <button 
                    key={d}
                    onClick={() => handleDiscountSelect(d)}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {d}% Off
                  </button>
                );
              })}
              <button
                onClick={handleCustomSelect}
                className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                  isCustom || (tempDiscount === null && !isCustom && item?.discount && ![2,4,6].includes(item.discount))
                    ? 'bg-slate-800 border-slate-800 text-white'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                }`}
              >
                Otro
              </button>
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
