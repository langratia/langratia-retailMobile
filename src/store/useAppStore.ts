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
  resetAllData: () => void;
  login: () => void;
  logout: () => void;
}

const initialProducts: Product[] = [];

const initialTransactions: Transaction[] = [];

const initialSettings: BusinessSettings = {
  businessName: 'IVAN A.K.A Electronics',
  ownerName: 'Ivan',
  currency: 'UGX',
  lowStockThreshold: 5,
  isLoggedIn: false,
  securityPin: '1234',
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

      resetAllData: () => {
        set({
          products: [],
          transactions: [],
          settings: {
            businessName: 'IVAN A.K.A Electronics',
            ownerName: 'Ivan',
            currency: 'UGX',
            lowStockThreshold: 5,
            isLoggedIn: false,
            securityPin: '1234',
          },
        });
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
