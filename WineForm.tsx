
import React, { useState } from 'react';
import { Wine, WineType } from '../types';
import { generateWineDescription } from '../services/geminiService';

interface WineFormProps {
  onAdd: (wine: Wine) => void;
  onClose: () => void;
}

const WineForm: React.FC<WineFormProps> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState<Partial<Wine>>({
    name: '',
    producer: '',
    vintage: new Date().getFullYear(),
    type: 'Rouge',
    grapeVariety: '',
    region: '',
    country: 'France',
    stock: 0,
    lowStockThreshold: 6,
    price: 0,
    description: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.region) return;

    const newWine: Wine = {
      ...(formData as Wine),
      id: crypto.randomUUID(),
      lastUpdated: Date.now(),
    } as Wine;
    onAdd(newWine);
    onClose();
  };

  const handleGenerateAI = async () => {
    if (!formData.name || !formData.region) {
      alert("Veuillez remplir le nom et la région d'abord.");
      return;
    }
    setIsGenerating(true);
    const desc = await generateWineDescription(formData);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-stone-200">
        <div className="bg-rose-900 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif font-bold">Nouvelle Référence</h2>
            <p className="text-rose-200 text-sm">Précisez les détails du cru</p>
          </div>
          <button onClick={onClose} className="text-rose-200 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nom du Vin</label>
              <input 
                type="text" 
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Château Margaux"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Producteur / Domaine</label>
              <input 
                type="text" 
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                value={formData.producer}
                onChange={e => setFormData({...formData, producer: e.target.value})}
                placeholder="Ex: Famille Durand"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Cépage(s)</label>
              <input 
                type="text" 
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                value={formData.grapeVariety}
                onChange={e => setFormData({...formData, grapeVariety: e.target.value})}
                placeholder="Ex: Cabernet Sauvignon, Merlot"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Type</label>
              <select 
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as WineType})}
              >
                <option value="Rouge">Rouge</option>
                <option value="Blanc">Blanc</option>
                <option value="Rosé">Rosé</option>
                <option value="Effervescent">Effervescent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Millésime</label>
              <input 
                type="number" 
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                value={formData.vintage}
                onChange={e => setFormData({...formData, vintage: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Région</label>
              <input 
                type="text" 
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                value={formData.region}
                onChange={e => setFormData({...formData, region: e.target.value})}
                placeholder="Ex: Bordeaux"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Pays</label>
              <input 
                type="text" 
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                value={formData.country}
                onChange={e => setFormData({...formData, country: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Prix Vente (€)</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                value={formData.price}
                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Stock Initial</label>
                <input 
                  type="number" 
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Seuil d'alerte</label>
                <input 
                  type="number" 
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                  value={formData.lowStockThreshold}
                  onChange={e => setFormData({...formData, lowStockThreshold: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-stone-500 uppercase">Description / Notes de dégustation</label>
              <button 
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1"
              >
                {isGenerating ? <span className="animate-spin">◌</span> : '✨'} Générer avec IA
              </button>
            </div>
            <textarea 
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 outline-none h-24 resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Notes de dégustation..."
            />
          </div>

          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-stone-200 text-stone-600 rounded-xl font-semibold hover:bg-stone-50 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 bg-rose-900 text-white rounded-xl font-semibold hover:bg-rose-800 shadow-lg transition-all active:scale-95"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WineForm;
