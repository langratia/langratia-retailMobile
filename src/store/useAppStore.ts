import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Transaction, BusinessSettings } from '../types';

interface AppState {
  products: Product[];
  transactions: Transaction[];
  settings: BusinessSettings;
  
  // Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, delta: number) => void;
  
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'time'>) => void;
  deleteTransaction: (id: string) => void;
  
  recordSale: (
    productId: string,
    quantity: number,
    customSellPrice?: number,
    isCredit?: boolean,
    customerName?: string,
    customerPhone?: string
  ) => boolean;
  
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  login: () => void;
  logout: () => void;
}

const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Samsung A16 (128GB)',
    category: 'Smartphones',
    buyPrice: 180,
    sellPrice: 220,
    quantity: 12,
  },
  {
    id: 'prod-2',
    name: 'Charger (20W)',
    category: 'Accessories',
    buyPrice: 4,
    sellPrice: 8,
    quantity: 3,
  },
  {
    id: 'prod-3',
    name: 'Wireless Earbuds',
    category: 'Accessories',
    buyPrice: 12,
    sellPrice: 18,
    quantity: 0,
  },
  {
    id: 'prod-4',
    name: 'Redmi Note 13',
    category: 'Smartphones',
    buyPrice: 150,
    sellPrice: 190,
    quantity: 15,
  },
];

const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    amount: 540,
    description: 'Cash Sale',
    category: 'Sales',
    date: 'Today',
    time: '09:30 AM',
  },
  {
    id: 'tx-2',
    type: 'expense',
    amount: 500,
    description: 'Shop Rent',
    category: 'Rent',
    date: 'Today',
    time: '08:15 AM',
  },
  {
    id: 'tx-3',
    type: 'income',
    amount: 440,
    description: 'Samsung A16 Sold (2 Units)',
    category: 'Sales',
    date: 'Yesterday',
    time: '06:45 PM',
    productId: 'prod-1',
  },
  {
    id: 'tx-4',
    type: 'expense',
    amount: 1250,
    description: 'Mobile Accessories Purchase',
    category: 'Stock Purchase',
    date: 'Yesterday',
    time: '03:20 PM',
  },
  {
    id: 'tx-5',
    type: 'income',
    amount: 90,
    description: 'Charger Sold (3 Units)',
    category: 'Sales',
    date: 'Yesterday',
    time: '11:10 AM',
    productId: 'prod-2',
  },
  {
    id: 'tx-6',
    type: 'expense',
    amount: 120,
    description: 'Electricity Bill',
    category: 'Utilities',
    date: 'May 21, 2024',
    time: '09:00 AM',
  },
  {
    id: 'tx-7',
    type: 'income',
    amount: 680,
    description: 'Cash Sale',
    category: 'Sales',
    date: 'May 20, 2024',
    time: '05:30 PM',
  },
];

const initialSettings: BusinessSettings = {
  businessName: 'Business Balance',
  ownerName: 'Ahmed',
  currency: 'UGX',
  lowStockThreshold: 5,
  isLoggedIn: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      transactions: initialTransactions,
      settings: initialSettings,

      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: `prod-${Date.now()}`,
        };
        set((state) => ({ products: [newProduct, ...state.products] }));
      },

      updateProduct: (id, productData) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...productData } : p
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      adjustStock: (productId, delta) => {
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id === productId) {
              const newQty = Math.max(0, p.quantity + delta);
              return { ...p, quantity: newQty };
            }
            return p;
          }),
        }));
      },

      addTransaction: (txData) => {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const newTx: Transaction = {
          ...txData,
          id: `tx-${Date.now()}`,
          date: formattedDate,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        set((state) => ({ transactions: [newTx, ...state.transactions] }));
      },

      deleteTransaction: (id) => {
        const targetTx = get().transactions.find((tx) => tx.id === id);
        if (targetTx && targetTx.type === 'income' && targetTx.productId) {
          // Revert stock automatically
          get().adjustStock(targetTx.productId, 1);
        }
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));
      },

      recordSale: (
        productId,
        quantity,
        customSellPrice,
        isCredit,
        customerName,
        customerPhone
      ) => {
        const product = get().products.find((p) => p.id === productId);
        if (!product || product.quantity < quantity) {
          return false;
        }

        const priceToUse = customSellPrice !== undefined && !isNaN(customSellPrice) ? customSellPrice : product.sellPrice;
        const saleAmount = priceToUse * quantity;
        
        // 1. Decrement stock
        get().adjustStock(productId, -quantity);

        // 2. Add cashbook transaction
        const desc = isCredit
          ? `${product.name} Sold on Credit (${quantity} Unit${quantity > 1 ? 's' : ''}) to ${customerName || 'Customer'}`
          : `${product.name} Sold (${quantity} Unit${quantity > 1 ? 's' : ''})`;

        get().addTransaction({
          type: 'income',
          amount: saleAmount,
          description: desc,
          category: isCredit ? 'Credit Sales' : 'Sales',
          productId: product.id,
          isCredit,
          customerName,
          customerPhone,
        });

        return true;
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      login: () => {
        set((state) => ({
          settings: { ...state.settings, isLoggedIn: true },
        }));
      },

      logout: () => {
        set((state) => ({
          settings: { ...state.settings, isLoggedIn: false },
        }));
      },
    }),
    {
      name: 'business-balance-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
