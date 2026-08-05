export type ProductCategory = string;

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  imageUri?: string;
  isArchived?: boolean;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  /** Human-readable date string — kept for backward compat with stored records. */
  date: string;
  time: string;
  /**
   * Unix timestamp (ms) added in v1.2.
   * All new transactions carry this field. Legacy records may omit it; use
   * `resolveTransactionTimestamp()` from dateUtils when comparing dates.
   */
  createdAt?: number;
  /**
   * Number of product units sold — populated by `recordSale` so that
   * `deleteTransaction` can accurately revert the correct stock quantity.
   */
  quantitySold?: number;
  productId?: string;
  isCredit?: boolean;
  customerName?: string;
  customerPhone?: string;
  paidAmount?: number;
}

/**
 * Business configuration settings.
 *
 * NOTE: `isLoggedIn` and `securityPin` have been intentionally removed from
 * this interface. Auth state is tracked as a separate top-level store property
 * (never persisted), and the security PIN lives exclusively in SecureStore.
 */
export interface BusinessSettings {
  businessName: string;
  ownerName: string;
  currency: string;
  lowStockThreshold: number;
}

export type RootTabParamList = {
  Home: undefined;
  Inventory: undefined;
  Cashbook: undefined;
  Printery: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Reports: { defaultFilter?: 'all' | 'income' | 'expense' | 'credit' };
  /** Full tabular ledger — optionally pre-filtered on open */
  StatementModal: { defaultFilter?: 'all' | 'income' | 'expense' | 'credit' } | undefined;
  MenuModal: undefined;
  Settings: undefined;
  AddEditProduct: { product?: Product } | undefined;
  AddTransaction: { defaultType?: TransactionType } | undefined;
  RecordSale: { productId?: string } | undefined;
  ProductDetails: { productId: string };
};
