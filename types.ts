
export type WineType = 'Rouge' | 'Blanc' | 'Rosé' | 'Effervescent';
export type TransactionType = 'vente' | 'casse/perte' | 'peremption' | 'dégustation';

export interface Wine {
  id: string;
  name: string;
  producer: string;
  vintage: number;
  type: WineType;
  grapeVariety: string;
  region: string;
  country: string;
  stock: number;
  lowStockThreshold: number;
  price: number;
  description?: string;
  lastUpdated: number;
}

export interface Transaction {
  id: string;
  wineId: string;
  wineName: string;
  type: TransactionType;
  quantity: number;
  date: string;
  totalPrice?: number;
}

export interface StockStats {
  totalBottles: number;
  totalValue: number;
  lowStockCount: number;
  typeDistribution: Record<WineType, number>;
}
