
import React, { useState } from 'react';
import { Wine, Transaction, TransactionType } from '../types';

interface StockManagementFormProps {
  wines: Wine[];
  onTransaction: (transaction: Transaction) => void;
  onClose: () => void;
}

const StockManagementForm: React.FC<StockManagementFormProps> = ({ wines, onTransaction, onClose }) => {
  const [selectedWineId, setSelectedWineId] = useState('');
  const [action, setAction] = useState<TransactionType>('vente');
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wine = wines.find(w => w.id === selectedWineId);
    if (!wine || quantity <= 0) return;

    if (quantity > wine.stock) {
      alert("Quantité supérieure au stock disponible.");
      return;
    }

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      wineId: wine.id,
      wineName: wine.name,
      type: action,
      quantity: quantity,
      date: date,
      totalPrice: action === 'vente' ? wine.price * quantity : undefined
    };

    onTransaction(transaction);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-200">
        <div className="bg-rose-950 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">Gérer le stock</h2>
            <p className="text-rose-200 text-xs font-bold uppercase tracking-widest mt-1">Mouvement de bouteilles</p>
          </div>
          <button onClick={onClose} className="text-rose-200 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-2 tracking-wider">Sélectionner une bouteille</label>
            <select 
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none appearance-none"
              value={selectedWineId}
              onChange={e => setSelectedWineId(e.target.value)}
            >
              <option value="">-- Choisir un vin --</option>
              {wines.map(wine => (
                <option key={wine.id} value={wine.id} disabled={wine.stock <= 0}>
                  {wine.name} ({wine.stock} en stock)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2 tracking-wider">Action</label>
              <select 
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                value={action}
                onChange={e => setAction(e.target.value as TransactionType)}
              >
                <option value="vente">Vente</option>
                <option value="casse/perte">Casse/Perte</option>
                <option value="peremption">Péremption</option>
                <option value="dégustation">Dégustation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2 tracking-wider">Quantité</label>
              <input 
                type="number" 
                min="1"
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-2 tracking-wider">Date de l'opération</label>
            <input 
              type="date" 
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-stone-200 text-stone-600 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-stone-50 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 bg-rose-900 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-rose-800 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedWineId}
            >
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockManagementForm;
