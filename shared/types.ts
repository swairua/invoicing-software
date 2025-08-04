// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'sales' | 'accountant' | 'viewer';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  kraPin: string;
  vatNumber?: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  currency: string;
  vatRate: number;
  invoicePrefix: string;
  createdAt: Date;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  kraPin?: string;
  address?: string;
  creditLimit: number;
  balance: number;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  kraPin?: string;
  address?: string;
  balance: number;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  companyId: string;
}

// Stock Types
export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

// Invoice/Document Types
export interface InvoiceItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  vatRate: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  discountAmount: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  dueDate: Date;
  issueDate: Date;
  notes?: string;
  etimsStatus?: EtimsStatus;
  etimsCode?: string;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type EtimsStatus = 'pending' | 'submitted' | 'accepted' | 'rejected';

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerId: string;
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  discountAmount: number;
  total: number;
  status: QuotationStatus;
  validUntil: Date;
  issueDate: Date;
  notes?: string;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface ProformaInvoice {
  id: string;
  proformaNumber: string;
  customerId: string;
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  discountAmount: number;
  total: number;
  status: ProformaStatus;
  validUntil: Date;
  issueDate: Date;
  notes?: string;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProformaStatus = 'draft' | 'sent' | 'converted' | 'expired';

// Payment Types
export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  notes?: string;
  invoiceId?: string;
  customerId: string;
  companyId: string;
  createdBy: string;
  createdAt: Date;
}

export type PaymentMethod = 'cash' | 'mpesa' | 'bank' | 'cheque' | 'card';

// Report Types
export interface SalesReport {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  totalSales: number;
  totalInvoices: number;
  averageInvoiceValue: number;
  topProducts: Array<{
    product: Product;
    quantity: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    customer: Customer;
    invoiceCount: number;
    totalAmount: number;
  }>;
}

export interface StockReport {
  lowStockProducts: Product[];
  overstockProducts: Product[];
  stockMovements: StockMovement[];
  totalStockValue: number;
}

export interface AgedReceivables {
  customerId: string;
  customerName: string;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
  total: number;
}

// Dashboard Types
export interface DashboardMetrics {
  totalRevenue: number;
  outstandingInvoices: number;
  lowStockAlerts: number;
  recentPayments: number;
  salesTrend: Array<{
    date: string;
    amount: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
  }>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface CreateCustomerForm {
  name: string;
  email?: string;
  phone?: string;
  kraPin?: string;
  address?: string;
  creditLimit: number;
}

export interface CreateProductForm {
  name: string;
  description?: string;
  sku: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
}

export interface CreateInvoiceForm {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
  }>;
  dueDate: Date;
  notes?: string;
}
