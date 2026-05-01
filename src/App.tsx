/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Smartphone,
  Filter,
  TrendingDown,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { PDV, PDVStatus, Order } from './types';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import DashboardHeader from './components/DashboardHeader';
import PDVCard from './components/PDVCard';
import InvoiceModal from './components/InvoiceModal';
import AIAnalyzer from './components/AIAnalyzer';
import Login from './components/Login';
import RouteImportModal from './components/RouteImportModal';
import OrdersModal from './components/OrdersModal';
import RutaModal from './components/RutaModal';
import LogoutConfirmModal from './components/LogoutConfirmModal';
import ResetConfirmModal from './components/ResetConfirmModal';
import ArticlesModal from './components/ArticlesModal';

import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [vendorId, setVendorId] = useState<string | null>(null);
  const [clients, setClients] = useState<PDV[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quiebresText, setQuiebresText] = useState('');

  // Local UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPDV, setSelectedPDV] = useState<PDV | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceViewOnly, setInvoiceViewOnly] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showRuta, setShowRuta] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showArticles, setShowArticles] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        setVendorId(null);
        setClients([]);
        setOrders([]);
        setQuiebresText('');
      } else {
        setVendorId(user.displayName || user.email || 'Vendedor');
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    
    const path = `users/${firebaseUser.uid}`;
    const unsubscribe = onSnapshot(doc(db, path), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setClients(data.clients || []);
        setOrders(data.orders || []);
        setQuiebresText(data.quiebresText || '');
        if (data.vendorId && data.vendorId !== vendorId) {
          setVendorId(data.vendorId);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  const saveToFirestore = async (overrideClients?: PDV[], overrideOrders?: Order[], overrideQuiebres?: string) => {
    if (!firebaseUser) return;
    const path = `users/${firebaseUser.uid}`;
    try {
      await setDoc(doc(db, path), {
        clients: overrideClients !== undefined ? overrideClients : clients,
        orders: overrideOrders !== undefined ? overrideOrders : orders,
        quiebresText: overrideQuiebres !== undefined ? overrideQuiebres : quiebresText,
        vendorId: vendorId || '',
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  // Debounced save for text
  useEffect(() => {
    if (firebaseUser) {
      const timer = setTimeout(() => {
        saveToFirestore();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [quiebresText]);

  const handleSetStatus = (id: string, status: PDVStatus) => {
    const newClients = clients.map(c => c.id === id ? { ...c, status } : c);
    setClients(newClients);
    saveToFirestore(newClients, orders, quiebresText);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const handleLimpiarRuta = () => {
    setClients([]);
    setOrders([]);
    setQuiebresText('');
    saveToFirestore([], [], '');
    setShowResetConfirm(false);
  };

  const handleImport = (newClients: PDV[]) => {
    setClients(newClients);
    saveToFirestore(newClients, orders, quiebresText);
    setShowImport(false);
  };

  const stats = useMemo(() => {
    if (clients.length === 0) return { sold: 0, visited: 0, total: 0, conPlan: 0, noCompro: 0 };
    const sold = clients.filter(c => c.status === PDVStatus.SOLD).length;
    const visited = clients.filter(c => c.status && c.status !== PDVStatus.PENDING).length;
    const conPlan = clients.filter(c => c.plan != null).length;
    const noCompro = clients.filter(c => !c.billing || c.billing.trim() === '$ 0' || c.billing.trim() === '0').length;
    return { sold, visited, total: clients.length, conPlan, noCompro };
  }, [clients]);

  const filteredClients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.id.toLowerCase().includes(term) ||
      c.address.toLowerCase().includes(term) ||
      c.billing?.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  const topCNC = useMemo(() => {
    if (!clients || clients.length === 0) return [];
    
    // Calculate CNC count for each client
    const cncClients = clients.map(client => {
      const cncCount = client.plans ? client.plans.filter(p => p !== 'CCC').length : 0;
      return {
        ...client,
        cncCount
      };
    });

    // Sort by PLAN (has plan vs no plan), then by CNC count descending
    cncClients.sort((a, b) => {
      const aHasPlan = a.plan ? 1 : 0;
      const bHasPlan = b.plan ? 1 : 0;
      
      if (aHasPlan !== bHasPlan) {
        return bHasPlan - aHasPlan;
      }
      return b.cncCount - a.cncCount;
    });

    return cncClients.filter(c => c.cncCount > 0).slice(0, 5);
  }, [clients]);

  if (loadingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Login onLogin={setVendorId} />;
  }

  const activeMobileTab = showAI ? 'ia' : showOrders ? 'pedidos' : showRuta ? 'ruta' : showArticles ? 'articulos' : 'inicio';

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-indigo-100">
      <Sidebar 
        stats={stats} 
        vendorId={vendorId} 
        day={clients[0]?.day}
        onLogout={() => setShowLogoutConfirm(true)} 
        onOpenAI={() => setShowAI(true)} 
        onOpenOrders={() => setShowOrders(true)}
        onOpenRuta={() => setShowRuta(true)}
        onOpenArticles={() => setShowArticles(true)}
      />
      <MobileNav 
        onOpenAI={() => setShowAI(true)}
        onOpenOrders={() => setShowOrders(true)}
        onOpenRuta={() => setShowRuta(true)}
        onOpenArticles={() => setShowArticles(true)}
        activeTab={activeMobileTab as any}
        setActiveTab={(tab) => {
          if (tab === 'inicio') {
            setShowAI(false);
            setShowOrders(false);
            setShowRuta(false);
            setShowArticles(false);
          }
        }}
      />

      <main className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <DashboardHeader 
          stats={stats} 
          onReset={handleLogout}
          onImportRuta={() => setShowImport(true)}
          onLimpiarRuta={() => setShowResetConfirm(true)}
        />

        <div className="flex-1 p-3 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 overflow-hidden">
          {/* List of Clients/PDVs */}
          <section className="md:col-span-5 lg:col-span-4 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto pr-2 pb-6 custom-scrollbar space-y-4">
              
              {/* Mobile Dashboard Elements */}
              <div className="flex md:hidden flex-col gap-3 shrink-0 pt-2">
                <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
                    <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-tighter mb-3">Estado de Ruta</h2>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-50 rounded-xl p-2 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 text-center">Total<br/>PDV</span>
                        <span className="text-base font-black text-slate-800 leading-none">{stats.total}</span>
                      </div>
                      <div className="bg-indigo-50 rounded-xl p-2 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none mb-1">Planes</span>
                        <span className="text-base font-black text-indigo-600 leading-none">{stats.conPlan}</span>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-2 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest leading-none mb-1">CNC</span>
                        <span className="text-base font-black text-amber-600 leading-none">{stats.noCompro}</span>
                      </div>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-4 shadow-lg relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
                    <div className="flex justify-between items-center mb-1 relative z-10">
                      <h2 className="text-[10px] font-black uppercase tracking-tighter text-indigo-400">Monto Total</h2>
                      <span className="text-[9px] font-black text-slate-500 tracking-[0.2em] uppercase">
                        {orders.length} pedidos
                      </span>
                    </div>
                    <div className="relative z-10 text-center py-1">
                      <p className="text-3xl font-black text-white tracking-tighter">
                        ${orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                      </p>
                    </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-2 pt-2 md:pt-0">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Hoja de Ruta</h2>
              </div>

              <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 py-1 -mt-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar clientes..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 pb-2">
                <AnimatePresence mode="popLayout">
                  {filteredClients.map((client) => (
                    <PDVCard
                      key={client.id}
                      client={client}
                      onStatusChange={handleSetStatus}
                      onInvoice={(c, viewOnly) => {
                        setSelectedPDV(c);
                        setInvoiceViewOnly(!!viewOnly);
                        setShowInvoice(true);
                      }}
                    />
                  ))}
                </AnimatePresence>
                {filteredClients.length === 0 && (
                  <div className="py-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <Smartphone className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Sin resultados</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Analysis & Workspace Layer */}
          <section className="hidden md:flex md:col-span-7 lg:col-span-8 flex-col gap-6 overflow-hidden">
            <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
              
              <div className="flex justify-between items-center mb-6 relative shrink-0">
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Estado de Ruta</h2>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total PDV</span>
                      <span className="text-xs font-black text-slate-800 leading-none">{stats.total}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">PLANES</span>
                      <span className="text-xs font-black text-indigo-600 leading-none">{stats.conPlan}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">CNC</span>
                      <span className="text-xs font-black text-amber-600 leading-none">{stats.noCompro}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-start border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50 p-6 overflow-y-auto custom-scrollbar">
                {clients.length === 0 ? (
                  <div className="text-center m-auto">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-slate-100 mx-auto mb-4">
                      <Search className="w-8 h-8 text-indigo-200" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 max-w-[200px] leading-relaxed mx-auto">
                      Importa una ruta para ver un análisis sugerido por IA.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <h3 className="text-xs font-black uppercase text-slate-700 tracking-widest">Top Oportunidades: Riesgo de Caída</h3>
                    </div>
                    <div className="space-y-3">
                      {topCNC.map((client) => (
                        <div key={client.id} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                          <div>
                            <p className="text-xs font-black text-slate-800">{client.address}</p>
                            <p className="text-[10px] font-bold text-slate-400">{client.name}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {client.plan && (
                              <span className="text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">
                                {client.plan}
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">
                              <TrendingDown className="w-3 h-3" />
                              <span className="text-[10px] font-black">{client.cncCount} CNC</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-6 w-full mt-auto mb-0">
              <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm flex flex-col relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Quiebres</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5">Sin Stock</p>
                  </div>
                </div>
                <textarea 
                  className="flex-1 w-full min-h-[100px] resize-none bg-slate-50 border-none rounded-2xl p-4 text-xs font-medium text-slate-600 focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="Anotar productos importantes sin stock..."
                  value={quiebresText}
                  onChange={(e) => setQuiebresText(e.target.value)}
                />
              </div>

              <div className="min-h-48 flex-1 bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-center text-white relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                <div className="flex justify-between items-center mb-4 relative">
                  <h2 className="text-sm font-black uppercase tracking-tighter text-indigo-400">Monto Total</h2>
                  <span className="text-[10px] font-black text-slate-500 tracking-[0.2em]">{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</span>
                </div>
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">({orders.length}) Pedidos Facturados</p>
                    <p className="text-5xl font-black text-white tracking-tighter">
                      ${orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showInvoice && selectedPDV && (
          <InvoiceModal
            client={selectedPDV}
            initialOrder={invoiceViewOnly || editingOrderId ? orders.find(o => o.pdvId === selectedPDV.id) : undefined}
            viewOnly={invoiceViewOnly}
            onClose={() => {
              setShowInvoice(false);
              setEditingOrderId(null);
            }}
            onSave={(orderData) => {
              let nextOrders = orders;
              if (editingOrderId) {
                nextOrders = orders.map(o => o.id === editingOrderId ? {
                  ...o,
                  items: orderData.items,
                  total: orderData.total,
                  createdAt: new Date().toISOString()
                } : o);
                setOrders(nextOrders);
                setEditingOrderId(null);
              } else {
                const newOrder: Order = {
                  id: crypto.randomUUID(),
                  pdvId: selectedPDV.id,
                  items: orderData.items,
                  total: orderData.total,
                  createdAt: new Date().toISOString()
                };
                nextOrders = [newOrder, ...orders];
                setOrders(nextOrders);
              }
              const newClients = clients.map(c => c.id === selectedPDV.id ? { ...c, status: PDVStatus.SOLD } : c);
              setClients(newClients);
              saveToFirestore(newClients, nextOrders, quiebresText);
              setShowInvoice(false);
            }}
          />
        )}
        {showAI && (
          <AIAnalyzer onClose={() => setShowAI(false)} />
        )}
        {showImport && (
          <RouteImportModal 
            onClose={() => setShowImport(false)} 
            onImport={handleImport}
          />
        )}
        {showOrders && (
          <OrdersModal
            orders={orders}
            clients={clients}
            onClose={() => setShowOrders(false)}
            onEditOrder={(order) => {
              const pdv = clients.find(c => c.id === order.pdvId);
              if (pdv) {
                setSelectedPDV(pdv);
                setEditingOrderId(order.id);
                setInvoiceViewOnly(false);
                setShowInvoice(true);
                setShowOrders(false);
              }
            }}
            onDeleteOrder={(orderId, pdvId) => {
              const nextOrders = orders.filter(o => o.id !== orderId);
              setOrders(nextOrders);
              const newClients = clients.map(c => c.id === pdvId ? { ...c, status: PDVStatus.PENDING } : c);
              setClients(newClients);
              saveToFirestore(newClients, nextOrders, quiebresText);
            }}
          />
        )}
        {showRuta && (
          <RutaModal
            clients={clients}
            onClose={() => setShowRuta(false)}
            onStatusChange={handleSetStatus}
            onInvoice={(c, viewOnly) => {
              setSelectedPDV(c);
              setInvoiceViewOnly(!!viewOnly);
              setShowInvoice(true);
            }}
          />
        )}
        {showLogoutConfirm && (
          <LogoutConfirmModal
            onConfirm={() => {
              setShowLogoutConfirm(false);
              handleLogout();
            }}
            onCancel={() => setShowLogoutConfirm(false)}
          />
        )}
        {showResetConfirm && (
          <ResetConfirmModal
            onConfirm={handleLimpiarRuta}
            onCancel={() => setShowResetConfirm(false)}
          />
        )}
        {showArticles && (
          <ArticlesModal onClose={() => setShowArticles(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function TrendingUp({ className, ...props }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

