import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Transaction, BusinessSettings } from '../types';
import { generateId } from '../utils/idUtils';

interface AppState {
  products: Product[];
  transactions: Transaction[];
  settings: BusinessSettings;
  /**
   * Auth gate — intentionally NOT part of `settings` so it can never be
   * accidentally persisted through the `updateSettings` action.
   * The `partialize` function always strips this to `false` on restart.
   */
  isLoggedIn: boolean;

  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, delta: number) => void;

  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'time' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;

  recordSale: (
    productId: string,
    quantity: number,
    customSellPrice?: number,
    isCredit?: boolean,
    customerName?: string,
    customerPhone?: string
  ) => boolean;

  // Settings / auth actions
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  resetAllData: () => void;
  login: () => void;
  logout: () => void;
}

const initialSettings: BusinessSettings = {
  businessName: 'IVAN A.K.A Electronics',
  ownerName: 'Ivan',
  currency: 'UGX',
  lowStockThreshold: 5,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: [],
      transactions: [],
      settings: initialSettings,
      isLoggedIn: false,

      // ─── Product actions ─────────────────────────────────────────────────

      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: generateId('prod'),
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
              return { ...p, quantity: Math.max(0, p.quantity + delta) };
            }
            return p;
          }),
        }));
      },

      // ─── Transaction actions ─────────────────────────────────────────────

      addTransaction: (txData) => {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const newTx: Transaction = {
          ...txData,
          id: generateId('tx'),
          date: formattedDate,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: now.getTime(),
        };
        set((state) => ({ transactions: [newTx, ...state.transactions] }));
      },

      deleteTransaction: (id) => {
        const targetTx = get().transactions.find((tx) => tx.id === id);

        if (targetTx && targetTx.type === 'income' && targetTx.productId) {
          // Revert exactly as many units as were sold.
          // `quantitySold` is populated by recordSale for all new transactions.
          // Legacy transactions without the field fall back to reverting 1 unit
          // (the original behaviour) to avoid over-correcting older data.
          const unitsToRevert = targetTx.quantitySold ?? 1;
          get().adjustStock(targetTx.productId, unitsToRevert);
        }

        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));
      },

      recordSale: (productId, quantity, customSellPrice, isCredit, customerName, customerPhone) => {
        const product = get().products.find((p) => p.id === productId);
        if (!product || product.quantity < quantity) {
          return false;
        }

        const priceToUse =
          customSellPrice !== undefined && !isNaN(customSellPrice)
            ? customSellPrice
            : product.sellPrice;
        const saleAmount = priceToUse * quantity;

        // 1. Decrement stock immediately
        get().adjustStock(productId, -quantity);

        // 2. Record cashbook transaction — include `quantitySold` so that
        //    deleteTransaction can revert the exact quantity if this sale is deleted.
        const desc = isCredit
          ? `${product.name} Sold on Credit (${quantity} Unit${quantity > 1 ? 's' : ''}) to ${customerName || 'Customer'}`
          : `${product.name} Sold (${quantity} Unit${quantity > 1 ? 's' : ''})`;

        get().addTransaction({
          type: 'income',
          amount: saleAmount,
          description: desc,
          category: isCredit ? 'Credit Sales' : 'Sales',
          productId: product.id,
          quantitySold: quantity,
          isCredit,
          customerName,
          customerPhone,
        });

        return true;
      },

      // ─── Settings / auth actions ─────────────────────────────────────────

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      resetAllData: () => {
        // Only reset business data and settings. Auth state is handled separately;
        // the user remains logged in through a reset.
        // PIN is NOT touched here — it lives exclusively in SecureStore.
        set({
          products: [],
          transactions: [],
          settings: { ...initialSettings },
        });
      },

      login: () => set({ isLoggedIn: true }),

      logout: () => set({ isLoggedIn: false }),
    }),
    {
      name: 'business-balance-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist business data. Auth state (isLoggedIn) is always reset to
      // false on app restart — this prevents a stolen/backed-up device from
      // bypassing authentication by restoring the persisted store.
      partialize: (state) => ({
        products: state.products,
        transactions: state.transactions,
        settings: state.settings,
        // isLoggedIn is intentionally excluded — always starts as false.
      }),
    }
  )
);
