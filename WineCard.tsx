
import React, { useState } from 'react';
import { Wine } from '../types';
import { suggestPairing } from '../services/geminiService';

interface WineCardProps {
  wine: Wine;
  onDelete: (id: string) => void;
}

const WineCard: React.FC<WineCardProps> = ({ wine, onDelete }) => {
  const [showPairings, setShowPairings] = useState(false);
  const [pairings, setPairings] = useState<string[]>([]);
  const [loadingPairings, setLoadingPairings] = useState(false);

  const handleSuggestPairings = async () => {
    if (pairings.length > 0) {
      setShowPairings(!showPairings);
      return;
    }
    setLoadingPairings(true);
    const result = await suggestPairing(wine);
    setPairings(result);
    setLoadingPairings(false);
    setShowPairings(true);
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Rouge': return 'bg-rose-900 text-rose-100';
      case 'Blanc': return 'bg-amber-100 text-amber-800';
      case 'Rosé': return 'bg-pink-100 text-pink-800';
      case 'Effervescent': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isLowStock = wine.stock <= (wine.lowStockThreshold || 0);

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${isLowStock ? 'border-rose-300 ring-1 ring-rose-300' : 'border-stone-200'} overflow-hidden transition-all hover:shadow-md group flex flex-col h-full`}>
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(wine.type)}`}>
            {wine.type}
          </span>
          <span className="text-stone-400 text-[10px] font-bold uppercase">{wine.country}</span>
        </div>
        
        <h3 className="text-xl font-bold text-stone-900 mb-0.5 leading-tight">
          {wine.name}
        </h3>
        <p className="text-rose-900 text-xs font-semibold mb-2">{wine.producer || 'Producteur non renseigné'}</p>
        
        <div className="flex gap-2 text-[10px] font-medium text-stone-500 mb-4 border-b border-stone-100 pb-2">
          <span className="bg-stone-100 px-1.5 py-0.5 rounded">{wine.vintage}</span>
          <span className="bg-stone-100 px-1.5 py-0.5 rounded italic">{wine.region}</span>
          {wine.grapeVariety && <span className="bg-stone-100 px-1.5 py-0.5 rounded">{wine.grapeVariety}</span>}
        </div>

        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-[10px] text-stone-400 uppercase font-bold tracking-tighter">Prix Unitaire</p>
            <p className="text-xl font-serif text-stone-800">{wine.price.toFixed(2)}€</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-stone-400 uppercase font-bold tracking-tighter">Stock</p>
            <p className={`text-xl font-serif ${isLowStock ? 'text-rose-600' : 'text-stone-800'}`}>
              {wine.stock} <span className="text-xs font-sans">btls</span>
            </p>
          </div>
        </div>

        {isLowStock && (
          <div className="mb-4 bg-rose-50 text-rose-700 text-[10px] font-bold p-2 rounded flex items-center gap-2 border border-rose-100 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            STOCK CRITIQUE (Seuil: {wine.lowStockThreshold})
          </div>
        )}

        {wine.description && (
          <p className="text-stone-600 text-xs italic mb-4 line-clamp-3 bg-stone-50 p-2 rounded">
            "{wine.description}"
          </p>
        )}
      </div>

      <div className="px-5 pb-5 pt-0 mt-auto border-t border-stone-50">
        <div className="flex justify-between items-center gap-2 pt-4">
          <button 
            onClick={handleSuggestPairings}
            className="text-[10px] font-bold text-rose-900 hover:underline uppercase tracking-widest"
          >
            {loadingPairings ? 'Chargement...' : '✨ Voir les accords'}
          </button>
          <button 
            onClick={() => onDelete(wine.id)}
            className="text-[10px] text-stone-300 hover:text-rose-600 font-bold uppercase tracking-widest"
          >
            Supprimer
          </button>
        </div>

        {showPairings && pairings.length > 0 && (
          <div className="mt-4 p-3 bg-rose-50 rounded-lg border border-rose-100 animate-fadeIn">
            <h4 className="text-[10px] font-bold text-rose-900 uppercase mb-2">Accords suggérés :</h4>
            <ul className="text-xs text-rose-800 space-y-1">
              {pairings.map((p, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-rose-400 rounded-full mt-1.5 shrink-0"></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default WineCard;
