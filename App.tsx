
import React, { useState, useEffect, useMemo } from 'react';
import { Wine, WineType, StockStats, Transaction } from './types';
import WineCard from './components/WineCard';
import WineForm from './components/WineForm';
import StockManagementForm from './components/StockManagementForm';
import { analyzeStockStatus } from './services/geminiService';

const INITIAL_WINES: Wine[] = [
  {
    id: '1',
    name: 'Château Bel-Air',
    producer: 'Domaine de Bel-Air',
    vintage: 2018,
    type: 'Rouge',
    grapeVariety: 'Merlot, Cabernet Franc',
    region: 'Saint-Émilion Grand Cru',
    country: 'France',
    stock: 24,
    lowStockThreshold: 12,
    price: 45.00,
    description: 'Un vin puissant aux notes de fruits noirs et de boisé fin.',
    lastUpdated: Date.now()
  },
  {
    id: '2',
    name: 'Domaine des Alouettes',
    producer: 'Vignobles Henry',
    vintage: 2020,
    type: 'Blanc',
    grapeVariety: 'Sauvignon Blanc',
    region: 'Sancerre',
    country: 'France',
    stock: 4,
    lowStockThreshold: 10,
    price: 22.50,
    description: 'Une fraîcheur minérale caractéristique du Sauvignon Blanc.',
    lastUpdated: Date.now()
  },
  {
    id: '3',
    name: 'Terre Promise',
    producer: 'Château Miraval',
    vintage: 2022,
    type: 'Rosé',
    grapeVariety: 'Cinsault, Grenache',
    region: 'Côtes de Provence',
    country: 'France',
    stock: 48,
    lowStockThreshold: 24,
    price: 18.00,
    description: 'Notes d\'agrumes et de fleurs blanches, très rafraîchissant.',
    lastUpdated: Date.now()
  }
];

type Tab = 'stock' | 'ventes' | 'dashboard' | 'alertes';

const App: React.FC = () => {
  const [wines, setWines] = useState<Wine[]>(() => {
    const saved = localStorage.getItem('vinora_inventory_v3');
    return saved ? JSON.parse(saved) : INITIAL_WINES;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('vinora_transactions_v3');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeTab, setActiveTab] = useState<Tab>('stock');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isManageStockOpen, setIsManageStockOpen] = useState(false);
  const [filterType, setFilterType] = useState<WineType | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    localStorage.setItem('vinora_inventory_v3', JSON.stringify(wines));
  }, [wines]);

  useEffect(() => {
    localStorage.setItem('vinora_transactions_v3', JSON.stringify(transactions));
  }, [transactions]);

  const stats = useMemo((): StockStats => {
    return wines.reduce((acc, wine) => {
      acc.totalBottles += wine.stock;
      acc.totalValue += wine.stock * wine.price;
      if (wine.stock <= (wine.lowStockThreshold || 6)) acc.lowStockCount += 1;
      acc.typeDistribution[wine.type] = (acc.typeDistribution[wine.type] || 0) + 1;
      return acc;
    }, {
      totalBottles: 0,
      totalValue: 0,
      lowStockCount: 0,
      typeDistribution: { 'Rouge': 0, 'Blanc': 0, 'Rosé': 0, 'Effervescent': 0 }
    });
  }, [wines]);

  const filteredWines = wines.filter(wine => {
    const matchesType = filterType === 'All' || wine.type === filterType;
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      wine.name.toLowerCase().includes(s) || 
      wine.region.toLowerCase().includes(s) ||
      wine.producer?.toLowerCase().includes(s) ||
      wine.grapeVariety?.toLowerCase().includes(s);
    return matchesType && matchesSearch;
  });

  const handleAddWine = (newWine: Wine) => {
    setWines(prev => [newWine, ...prev]);
  };

  const handleDeleteWine = (id: string) => {
    if (window.confirm("Supprimer définitivement cette référence ?")) {
      setWines(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    setWines(prevWines => prevWines.map(w => {
      if (w.id === transaction.wineId) {
        return {
          ...w,
          stock: w.stock - transaction.quantity,
          lastUpdated: Date.now()
        };
      }
      return w;
    }));
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeStockStatus(wines);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const salesHistory = transactions.filter(t => t.type === 'vente');
  const alertsList = wines.filter(w => w.stock <= (w.lowStockThreshold || 6));

  return (
    <div className="min-h-screen pb-12 bg-stone-50">
      {/* Header */}
      <header className="bg-rose-950 text-white py-12 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-900 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl font-serif font-bold mb-2 tracking-tight italic">Vinora</h1>
              <p className="text-rose-200 font-light tracking-widest uppercase text-xs">Système de Gestion de Stock & Ventes</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsManageStockOpen(true)}
                className="bg-rose-800 text-white border border-rose-700 px-6 py-4 rounded-xl font-bold shadow-xl hover:bg-rose-700 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9l5 4V5z"/><path d="M2 11h20"/><path d="M13 19l5-4-5-4v8z"/></svg>
                Gérer le stock
              </button>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-white text-rose-950 px-6 py-4 rounded-xl font-bold shadow-xl hover:bg-rose-50 transition-all transform hover:-translate-y-1 active:scale-95"
              >
                + Enregistrer un Cru
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 mb-8 overflow-x-auto gap-8">
          {[
            { id: 'stock', label: 'Inventaire', icon: '🍷' },
            { id: 'ventes', label: 'Suivi des Ventes', icon: '📊' },
            { id: 'dashboard', label: 'Tableau de bord', icon: '📈' },
            { id: 'alertes', label: 'Alertes Stock', icon: '⚠️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${
                activeTab === tab.id ? 'text-rose-900' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-900 rounded-t-full"></div>
              )}
              {tab.id === 'alertes' && alertsList.length > 0 && (
                <span className="ml-1 bg-rose-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {alertsList.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'stock' && (
          <>
            <section className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                {['All', 'Rouge', 'Blanc', 'Rosé', 'Effervescent'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap uppercase tracking-wider ${
                      filterType === type 
                      ? 'bg-rose-900 text-white shadow-md' 
                      : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {type === 'All' ? 'Tous' : type}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-96">
                <input 
                  type="text" 
                  placeholder="Rechercher..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-3 top-3 text-stone-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
              </div>
            </section>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWines.map(wine => (
                <WineCard key={wine.id} wine={wine} onDelete={handleDeleteWine} />
              ))}
            </section>
          </>
        )}

        {activeTab === 'ventes' && (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
              <h2 className="text-xl font-serif font-bold text-stone-900">Historique des Opérations</h2>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">{transactions.length} mouvement(s)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Produit</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-center">Quantité</th>
                    <th className="px-6 py-4 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-stone-500">{t.date}</td>
                      <td className="px-6 py-4 text-sm font-bold text-stone-900">{t.wineName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase ${
                          t.type === 'vente' ? 'bg-emerald-100 text-emerald-800' : 
                          t.type === 'casse/perte' ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-800'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-serif text-stone-900">{t.quantity}</td>
                      <td className="px-6 py-4 text-sm text-right font-serif text-stone-900">
                        {t.totalPrice ? `${t.totalPrice.toFixed(2)}€` : '-'}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-stone-400 italic">Aucune opération enregistrée.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider mb-1">Stock Physique</p>
                <p className="text-3xl font-serif text-stone-900">{stats.totalBottles} <span className="text-sm font-sans text-stone-400">btls</span></p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider mb-1">Valeur de Cave</p>
                <p className="text-3xl font-serif text-stone-900">{stats.totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider mb-1">Chiffre d'Affaires</p>
                <p className="text-3xl font-serif text-stone-900">
                  {salesHistory.reduce((acc, t) => acc + (t.totalPrice || 0), 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€
                </p>
              </div>
              <div className="bg-stone-900 p-6 rounded-2xl shadow-xl text-white flex flex-col justify-between">
                <div>
                  <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider mb-2">Conseiller IA</p>
                  {aiAnalysis ? (
                    <p className="text-xs italic text-stone-300 leading-relaxed line-clamp-3">"{aiAnalysis}"</p>
                  ) : (
                    <p className="text-xs text-stone-500 italic">Analysez votre stock pour des conseils stratégiques.</p>
                  )}
                </div>
                <button 
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="mt-4 text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 self-start uppercase tracking-widest"
                >
                  {isAnalyzing ? 'Analyse...' : '✨ Analyser le stock'}
                </button>
              </div>
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl border border-stone-200">
                <h3 className="text-lg font-serif font-bold mb-6">Répartition par Type</h3>
                <div className="space-y-4">
                  {Object.entries(stats.typeDistribution).map(([type, count]) => (
                    <div key={type}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-stone-600">{type}</span>
                        <span className="text-stone-400">{count} réf.</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-rose-900 h-full transition-all duration-1000" 
                          style={{ width: `${(count / wines.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col justify-center items-center text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">🍷</span>
                </div>
                <h3 className="text-lg font-serif font-bold mb-2">Santé de la Cave</h3>
                <p className="text-sm text-stone-500 max-w-xs">
                  Votre cave contient {wines.length} références différentes pour un total de {stats.totalBottles} bouteilles.
                  {stats.lowStockCount > 0 ? ` Attention : ${stats.lowStockCount} références sont en stock critique.` : " Votre stock est actuellement bien géré."}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alertes' && (
          <div className="space-y-6">
            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-200">
              <h2 className="text-xl font-serif font-bold text-rose-900 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                Wines requiring restock
              </h2>
              <p className="text-sm text-rose-700">Les références ci-dessous ont atteint ou dépassé leur seuil d'alerte minimum.</p>
            </div>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {alertsList.length > 0 ? (
                alertsList.map(wine => (
                  <WineCard key={wine.id} wine={wine} onDelete={handleDeleteWine} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-stone-100 italic text-stone-400">
                  Aucune alerte de stock actuellement. Toutes vos bouteilles sont au-dessus de leurs seuils.
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 text-center text-stone-400 text-[10px] font-bold uppercase tracking-widest py-8 border-t border-stone-100">
        <p>&copy; {new Date().getFullYear()} Vinora Inventory Management Systems</p>
      </footer>

      {/* Modals */}
      {isFormOpen && (
        <WineForm onAdd={handleAddWine} onClose={() => setIsFormOpen(false)} />
      )}
      {isManageStockOpen && (
        <StockManagementForm 
          wines={wines} 
          onTransaction={handleTransaction} 
          onClose={() => setIsManageStockOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
