import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, Calendar, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Order, PDV } from '../types';

interface OrdersModalProps {
  orders: Order[];
  clients: PDV[];
  onClose: () => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string, pdvId: string) => void;
}

export default function OrdersModal({ orders, clients, onClose, onEditOrder, onDeleteOrder }: OrdersModalProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const getClientAddress = (pdvId: string) => {
    const client = clients.find(c => c.id === pdvId);
    return client ? client.address : 'Dirección Desconocida';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Pedidos del Día</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{orders.length} pedidos registrados</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {orders.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-slate-100 rounded-3xl text-center">
              <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No hay pedidos</h3>
              <p className="text-[10px] font-medium text-slate-300 mt-2">Aún no se han facturado clientes hoy.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex justify-between items-end mb-4 border-b border-slate-50 pb-4">
                  <div>
                    <h3 className="font-bold text-sm text-indigo-600 uppercase mb-1">{getClientAddress(order.pdvId)}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 mb-2">
                      <button 
                        onClick={() => onEditOrder(order)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                        title="Editar pedido"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(order.id)}
                        className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                        title="Eliminar pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-800">${Math.round(order.total).toLocaleString()}</p>
                      <p className="text-xs text-slate-400 font-medium text-right">{order.items.reduce((s, i) => s + i.quantity, 0)} bultos</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.filter(i => i.quantity > 0).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-600">
                        {item.quantity}x {item.name}
                        {item.discount > 0 && (
                          <span className="ml-2 text-[9px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase">
                            -{item.discount}%
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-slate-400">
                        ${Math.round(item.quantity * item.price * (1 - item.discount / 100)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total del Pedido</span>
                  <span className="text-sm font-black text-indigo-600">${Math.round(order.total).toLocaleString()}</span>
                </div>

                <AnimatePresence>
                  {deleteConfirmId === order.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center"
                    >
                      <AlertTriangle className="w-8 h-8 text-rose-500 mb-3" />
                      <h4 className="text-sm font-black text-slate-800 mb-1">¿Eliminar este pedido?</h4>
                      <p className="text-xs text-slate-500 mb-6">Esta acción no se puede deshacer.</p>
                      <div className="flex gap-3 w-full">
                        <button 
                          onClick={() => setDeleteConfirmId(null)}
                          className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs uppercase"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => {
                            onDeleteOrder(order.id, order.pdvId);
                            setDeleteConfirmId(null);
                          }}
                          className="flex-1 py-3 bg-rose-500 text-white font-black rounded-xl text-xs uppercase"
                        >
                          Eliminar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
