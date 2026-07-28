export type ProductCategory = 'Smartphones' | 'Accessories' | 'Electronics' | 'General';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  imageUri?: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO String or readable format
  time: string;
  productId?: string;
  isCredit?: boolean;
  customerName?: string;
  customerPhone?: string;
  paidAmount?: number;
}

export interface BusinessSettings {
  businessName: string;
  ownerName: string;
  currency: string;
  lowStockThreshold: number;
  isLoggedIn: boolean;
}

export type RootTabParamList = {
  Home: undefined;
  Inventory: undefined;
  Cashbook: undefined;
  Reports: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  AddEditProduct: { product?: Product };
  AddTransaction: { defaultType?: TransactionType };
  RecordSale: { productId?: string };
  ProductDetails: { productId: string };
};
