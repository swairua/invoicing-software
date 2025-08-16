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

export type UserRole = "admin" | "sales" | "accountant" | "viewer";

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
  barcode?: string;
  category: string;
  categoryId?: string; // UUID reference to product_categories table
  subcategory?: string;
  brand?: string;
  supplier?: string;
  supplierId?: string; // UUID reference to suppliers table
  unit: string;
  weight?: number;
  dimensions?: ProductDimensions;
  purchasePrice: number;
  sellingPrice: number;
  markup?: number;
  costPrice?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  reservedStock?: number;
  availableStock?: number;
  reorderLevel?: number;
  location?: string;
  binLocation?: string;
  tags?: string[];
  taxable: boolean;
  taxRate?: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  hasVariants: boolean;
  variants?: ProductVariant[];
  images?: string[];
  notes?: string;
  isActive: boolean;
  status: ProductStatus;
  companyId: string;
  createdBy?: string; // UUID reference to users table
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit: "cm" | "in" | "m";
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  attributes: Record<string, string>; // e.g., { color: 'red', size: 'M' }
  price?: number;
  stock?: number;
  isActive: boolean;
}

export type ProductStatus =
  | "active"
  | "inactive"
  | "discontinued"
  | "out_of_stock";

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  companyId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Stock Types
export interface StockMovement {
  id: string;
  productId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

// Tax Types for Line Items
export interface LineItemTax {
  id: string;
  name: string;
  rate: number;
  amount: number;
  isCompoundTax?: boolean; // Applied after other taxes
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
  lineItemTaxes?: LineItemTax[]; // Optional additional taxes per line item
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
  additionalTaxAmount?: number; // Sum of all line item taxes
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

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type EtimsStatus = "pending" | "submitted" | "accepted" | "rejected";

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerId: string;
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  discountAmount: number;
  additionalTaxAmount?: number; // Sum of all line item taxes
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

export type QuotationStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired";

export interface ProformaInvoice {
  id: string;
  proformaNumber: string;
  customerId: string;
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  discountAmount: number;
  additionalTaxAmount?: number; // Sum of all line item taxes
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

export type ProformaStatus = "draft" | "sent" | "converted" | "expired";

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

export type PaymentMethod = "cash" | "mpesa" | "bank" | "cheque" | "card";

// Additional Document Types
export interface PackingList {
  id: string;
  packingNumber: string;
  customerId: string;
  customer: Customer;
  items: PackingListItem[];
  totalQuantity: number;
  totalPackages: number;
  weight?: number;
  dimensions?: string;
  status: "draft" | "packed" | "shipped" | "delivered";
  packingDate: Date;
  shippingDate?: Date;
  deliveryDate?: Date;
  notes?: string;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PackingListItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  packageType?: string;
  packageQuantity?: number;
  weight?: number;
  serialNumbers?: string[];
  batchNumbers?: string[];
}

export interface DeliveryNote {
  id: string;
  deliveryNumber: string;
  customerId: string;
  customer: Customer;
  items: DeliveryNoteItem[];
  totalQuantity: number;
  status: "draft" | "in_transit" | "delivered" | "returned";
  deliveryDate: Date;
  deliveryAddress: string;
  driverName?: string;
  vehicleNumber?: string;
  notes?: string;
  signatureUrl?: string;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryNoteItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  deliveredQuantity?: number;
  condition?: "good" | "damaged" | "missing";
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
  subtotal: number;
  vatAmount: number;
  discountAmount: number;
  total: number;
  status: "draft" | "sent" | "confirmed" | "received" | "cancelled";
  orderDate: Date;
  expectedDate?: Date;
  receivedDate?: Date;
  notes?: string;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  receivedQuantity?: number;
}

export interface CreditNote {
  id: string;
  creditNumber: string;
  customerId: string;
  customer: Customer;
  invoiceId?: string;
  items: CreditNoteItem[];
  subtotal: number;
  vatAmount: number;
  additionalTaxAmount?: number; // Sum of all line item taxes
  total: number;
  reason: string;
  status: "draft" | "issued" | "applied";
  issueDate: Date;
  notes?: string;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditNoteItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  lineItemTaxes?: LineItemTax[]; // Optional additional taxes per line item
  total: number;
}

export interface GoodsReceivedNote {
  id: string;
  grnNumber: string;
  supplierId: string;
  supplier: Supplier;
  purchaseOrderId?: string;
  items: GoodsReceivedItem[];
  totalQuantity: number;
  status: "draft" | "received" | "inspected" | "accepted" | "rejected";
  receivedDate: Date;
  inspectedBy?: string;
  notes?: string;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoodsReceivedItem {
  id: string;
  productId: string;
  product: Product;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity?: number;
  rejectionReason?: string;
  condition: "good" | "damaged" | "defective";
  batchNumber?: string;
  expiryDate?: Date;
}

// Report Types
export interface SalesReport {
  period: "day" | "week" | "month" | "year";
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

// Template Management Types
export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  type: DocumentType;
  isActive: boolean;
  isDefault: boolean;
  design: TemplateDesign;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentType =
  | "invoice"
  | "quotation"
  | "proforma"
  | "receipt"
  | "packing_list"
  | "delivery_note"
  | "purchase_order"
  | "credit_note"
  | "debit_note"
  | "statement"
  | "goods_received_note"
  | "material_transfer_note";

export interface TemplateDesign {
  layout: "standard" | "modern" | "minimal" | "corporate";
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    size: {
      heading: number;
      body: number;
      small: number;
    };
  };
  spacing: {
    margins: number;
    lineHeight: number;
    sectionGap: number;
  };
  header: {
    showLogo: boolean;
    logoPosition: "left" | "center" | "right";
    showCompanyInfo: boolean;
    backgroundColor?: string;
  };
  footer: {
    showTerms: boolean;
    showSignature: boolean;
    showPageNumbers: boolean;
    customText?: string;
  };
  table: {
    headerBackgroundColor: string;
    alternateRowColor?: string;
    borderStyle: "none" | "light" | "medium" | "heavy";
  };
}
