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
    name: 'Tecno Spark 20 (128GB)',
    category: 'Smartphones',
    buyPrice: 490000,
    sellPrice: 580000,
    quantity: 8,
  },
  {
    id: 'prod-2',
    name: 'Samsung Galaxy A16 (128GB)',
    category: 'Smartphones',
    buyPrice: 720000,
    sellPrice: 850000,
    quantity: 5,
  },
  {
    id: 'prod-3',
    name: 'Redmi Note 13 (256GB)',
    category: 'Smartphones',
    buyPrice: 680000,
    sellPrice: 790000,
    quantity: 6,
  },
  {
    id: 'prod-4',
    name: 'Itel P40 (64GB)',
    category: 'Smartphones',
    buyPrice: 280000,
    sellPrice: 340000,
    quantity: 12,
  },
  {
    id: 'prod-5',
    name: 'Nokia 105 (Feature Phone)',
    category: 'Feature Phones',
    buyPrice: 38000,
    sellPrice: 55000,
    quantity: 20,
  },
  {
    id: 'prod-6',
    name: 'Itel It2163 (Dual SIM)',
    category: 'Feature Phones',
    buyPrice: 25000,
    sellPrice: 40000,
    quantity: 15,
  },
  {
    id: 'prod-7',
    name: 'USB-C Fast Charger (33W)',
    category: 'Accessories',
    buyPrice: 12000,
    sellPrice: 22000,
    quantity: 30,
  },
  {
    id: 'prod-8',
    name: 'Earphones (Type-C)',
    category: 'Accessories',
    buyPrice: 8000,
    sellPrice: 15000,
    quantity: 25,
  },
  {
    id: 'prod-9',
    name: 'Wireless Earbuds (TWS)',
    category: 'Accessories',
    buyPrice: 35000,
    sellPrice: 55000,
    quantity: 4,
  },
  {
    id: 'prod-10',
    name: 'Phone Screen Protector (Universal)',
    category: 'Accessories',
    buyPrice: 2500,
    sellPrice: 5000,
    quantity: 60,
  },
  {
    id: 'prod-11',
    name: 'Phone Back Cover (Assorted)',
    category: 'Accessories',
    buyPrice: 3500,
    sellPrice: 8000,
    quantity: 40,
  },
  {
    id: 'prod-12',
    name: 'Power Bank 10000mAh',
    category: 'Accessories',
    buyPrice: 45000,
    sellPrice: 70000,
    quantity: 10,
  },
  {
    id: 'prod-13',
    name: 'Bluetooth Speaker (Mini)',
    category: 'Audio',
    buyPrice: 55000,
    sellPrice: 85000,
    quantity: 7,
  },
  {
    id: 'prod-14',
    name: 'USB Flash Drive 32GB',
    category: 'Storage',
    buyPrice: 15000,
    sellPrice: 25000,
    quantity: 18,
  },
  {
    id: 'prod-15',
    name: 'Memory Card 32GB (Class 10)',
    category: 'Storage',
    buyPrice: 12000,
    sellPrice: 20000,
    quantity: 22,
  },
  {
    id: 'prod-16',
    name: 'USB Cable (Type-C, 1m)',
    category: 'Accessories',
    buyPrice: 4000,
    sellPrice: 8000,
    quantity: 50,
  },
  {
    id: 'prod-17',
    name: 'Smart Watch (HW Series)',
    category: 'Wearables',
    buyPrice: 75000,
    sellPrice: 120000,
    quantity: 3,
  },
  {
    id: 'prod-18',
    name: 'Selfie Ring Light (Clip-on)',
    category: 'Accessories',
    buyPrice: 18000,
    sellPrice: 30000,
    quantity: 2,
  },
  {
    id: 'prod-19',
    name: 'OTG Adapter (Type-C to USB)',
    category: 'Accessories',
    buyPrice: 5000,
    sellPrice: 10000,
    quantity: 35,
  },
  {
    id: 'prod-20',
    name: 'Tripod Phone Stand (Flexible)',
    category: 'Accessories',
    buyPrice: 22000,
    sellPrice: 40000,
    quantity: 0,
  },
];

const initialTransactions: Transaction[] = [
  // --- TODAY ---
  {
    id: 'tx-1',
    type: 'income',
    amount: 580000,
    description: 'Tecno Spark 20 Sold (1 Unit)',
    category: 'Sales',
    date: 'Today',
    time: '10:15 AM',
    productId: 'prod-1',
  },
  {
    id: 'tx-2',
    type: 'income',
    amount: 30000,
    description: 'USB-C Charger Sold (3 Units) + Screen Protector',
    category: 'Sales',
    date: 'Today',
    time: '09:45 AM',
  },
  {
    id: 'tx-3',
    type: 'expense',
    amount: 15000,
    description: 'Airtel Mobile Money Charges',
    category: 'Bank Charges',
    date: 'Today',
    time: '08:30 AM',
  },
  // --- YESTERDAY ---
  {
    id: 'tx-4',
    type: 'income',
    amount: 850000,
    description: 'Samsung Galaxy A16 Sold (1 Unit)',
    category: 'Sales',
    date: 'Yesterday',
    time: '05:20 PM',
    productId: 'prod-2',
  },
  {
    id: 'tx-5',
    type: 'income',
    amount: 55000,
    description: 'Nokia 105 Sold (1 Unit) + TWS Earbuds',
    category: 'Sales',
    date: 'Yesterday',
    time: '03:10 PM',
  },
  {
    id: 'tx-6',
    type: 'expense',
    amount: 1200000,
    description: 'Stock Purchase – Techno & Itel phones (4 Units)',
    category: 'Stock Purchase',
    date: 'Yesterday',
    time: '11:00 AM',
  },
  {
    id: 'tx-7',
    type: 'expense',
    amount: 450000,
    description: 'Monthly Shop Rent – Garden City Stalls',
    category: 'Rent',
    date: 'Yesterday',
    time: '09:00 AM',
  },
  // --- Jul 27 ---
  {
    id: 'tx-8',
    type: 'income',
    amount: 790000,
    description: 'Redmi Note 13 Sold (1 Unit)',
    category: 'Sales',
    date: 'Jul 27, 2026',
    time: '04:30 PM',
    productId: 'prod-3',
  },
  {
    id: 'tx-9',
    type: 'income',
    amount: 80000,
    description: 'Power Bank Sold (1 Unit) + Cables (3 Units)',
    category: 'Sales',
    date: 'Jul 27, 2026',
    time: '02:15 PM',
  },
  {
    id: 'tx-10',
    type: 'expense',
    amount: 120000,
    description: 'UMEME Electricity Bill – July',
    category: 'Utilities',
    date: 'Jul 27, 2026',
    time: '10:00 AM',
  },
  // --- Jul 25 ---
  {
    id: 'tx-11',
    type: 'income',
    amount: 680000,
    description: 'Itel P40 Sold (2 Units)',
    category: 'Sales',
    date: 'Jul 25, 2026',
    time: '05:45 PM',
    productId: 'prod-4',
  },
  {
    id: 'tx-12',
    type: 'income',
    amount: 120000,
    description: 'Smart Watch HW Series Sold (1 Unit)',
    category: 'Sales',
    date: 'Jul 25, 2026',
    time: '03:00 PM',
    productId: 'prod-17',
  },
  {
    id: 'tx-13',
    type: 'expense',
    amount: 350000,
    description: 'Stock Purchase – Accessories Restock (Cables, Protectors, Covers)',
    category: 'Stock Purchase',
    date: 'Jul 25, 2026',
    time: '11:30 AM',
  },
  {
    id: 'tx-14',
    type: 'expense',
    amount: 80000,
    description: 'Staff Salary – Shop Attendant (Moses)',
    category: 'Salaries',
    date: 'Jul 25, 2026',
    time: '09:15 AM',
  },
  // --- Jul 22 ---
  {
    id: 'tx-15',
    type: 'income',
    amount: 165000,
    description: 'Nokia 105 Sold (3 Units)',
    category: 'Sales',
    date: 'Jul 22, 2026',
    time: '04:00 PM',
    productId: 'prod-5',
  },
  {
    id: 'tx-16',
    type: 'income',
    amount: 85000,
    description: 'Bluetooth Speaker Sold (1 Unit)',
    category: 'Sales',
    date: 'Jul 22, 2026',
    time: '01:45 PM',
    productId: 'prod-13',
  },
  {
    id: 'tx-17',
    type: 'expense',
    amount: 50000,
    description: 'Transport – Stock Pickup from Kampala Road',
    category: 'Transport',
    date: 'Jul 22, 2026',
    time: '10:30 AM',
  },
  // --- Jul 20 ---
  {
    id: 'tx-18',
    type: 'income',
    amount: 850000,
    description: 'Samsung Galaxy A16 Sold (1 Unit) – Credit Sale to Namukasa J.',
    category: 'Credit Sales',
    date: 'Jul 20, 2026',
    time: '03:30 PM',
    productId: 'prod-2',
    isCredit: true,
    customerName: 'Namukasa Josephine',
    customerPhone: '0772345678',
  },
  {
    id: 'tx-19',
    type: 'expense',
    amount: 25000,
    description: 'Shop Cleaning & Supplies',
    category: 'Miscellaneous',
    date: 'Jul 20, 2026',
    time: '08:00 AM',
  },
  {
    id: 'tx-20',
    type: 'expense',
    amount: 2500000,
    description: 'Major Restock – Smartphones (Tecno, Itel, Redmi – 10 Units)',
    category: 'Stock Purchase',
    date: 'Jul 20, 2026',
    time: '11:00 AM',
  },
];

const initialSettings: BusinessSettings = {
  businessName: 'IVAN A.K.A Electronics',
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
