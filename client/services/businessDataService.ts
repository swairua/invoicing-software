import {
  Customer,
  Product,
  Invoice,
  Quotation,
  ProformaInvoice,
  Payment,
  PurchaseOrder,
  DeliveryNote,
  PackingList,
  CreditNote,
  StockMovement,
  DashboardMetrics,
  InvoiceItem,
  Supplier,
} from "@shared/types";

// Minimal business data service without mock data - for fallback only
class BusinessDataService {
  private static instance: BusinessDataService;

  public static getInstance(): BusinessDataService {
    if (!BusinessDataService.instance) {
      BusinessDataService.instance = new BusinessDataService();
    }
    return BusinessDataService.instance;
  }

  constructor() {
    console.log("⚠️ Using minimal business data service - no data available");
    console.log("🔧 This should only be used as a fallback when database is unavailable");
  }

  // All methods return empty arrays or default values
  public getCustomers(): Promise<Customer[]> {
    return Promise.resolve([]);
  }

  public getCustomerById(id: string): Promise<Customer | undefined> {
    return Promise.resolve(undefined);
  }

  public createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    return Promise.reject(new Error("Database connection required"));
  }

  public updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | undefined> {
    return Promise.reject(new Error("Database connection required"));
  }

  public deleteCustomer(id: string): Promise<boolean> {
    return Promise.reject(new Error("Database connection required"));
  }

  public getProducts(): Promise<Product[]> {
    return Promise.resolve([]);
  }

  public getProductById(id: string): Promise<Product | undefined> {
    return Promise.resolve(undefined);
  }

  public createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return Promise.reject(new Error("Database connection required"));
  }

  public updateProduct(id: string, product: Partial<Product>): Promise<Product | undefined> {
    return Promise.reject(new Error("Database connection required"));
  }

  public deleteProduct(id: string): Promise<boolean> {
    return Promise.reject(new Error("Database connection required"));
  }

  public getInvoices(): Promise<Invoice[]> {
    return Promise.resolve([]);
  }

  public getInvoiceById(id: string): Promise<Invoice | undefined> {
    return Promise.resolve(undefined);
  }

  public createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'>): Promise<Invoice> {
    return Promise.reject(new Error("Database connection required"));
  }

  public updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice | undefined> {
    return Promise.reject(new Error("Database connection required"));
  }

  public deleteInvoice(id: string): Promise<boolean> {
    return Promise.reject(new Error("Database connection required"));
  }

  public getQuotations(): Promise<Quotation[]> {
    return Promise.resolve([]);
  }

  public getQuotationById(id: string): Promise<Quotation | undefined> {
    return Promise.resolve(undefined);
  }

  public createQuotation(quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'quoteNumber'>): Promise<Quotation> {
    return Promise.reject(new Error("Database connection required"));
  }

  public updateQuotation(id: string, quotation: Partial<Quotation>): Promise<Quotation | undefined> {
    return Promise.reject(new Error("Database connection required"));
  }

  public deleteQuotation(id: string): Promise<boolean> {
    return Promise.reject(new Error("Database connection required"));
  }

  public getProformaInvoices(): Promise<ProformaInvoice[]> {
    return Promise.resolve([]);
  }

  public getProformaInvoiceById(id: string): Promise<ProformaInvoice | undefined> {
    return Promise.resolve(undefined);
  }

  public createProformaInvoice(proforma: Omit<ProformaInvoice, 'id' | 'createdAt' | 'updatedAt' | 'proformaNumber'>): Promise<ProformaInvoice> {
    return Promise.reject(new Error("Database connection required"));
  }

  public updateProformaInvoice(id: string, proforma: Partial<ProformaInvoice>): Promise<ProformaInvoice | undefined> {
    return Promise.reject(new Error("Database connection required"));
  }

  public deleteProformaInvoice(id: string): Promise<boolean> {
    return Promise.reject(new Error("Database connection required"));
  }

  public getPayments(): Promise<Payment[]> {
    return Promise.resolve([]);
  }

  public getPaymentById(id: string): Promise<Payment | undefined> {
    return Promise.resolve(undefined);
  }

  public createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    return Promise.reject(new Error("Database connection required"));
  }

  public updatePayment(id: string, payment: Partial<Payment>): Promise<Payment | undefined> {
    return Promise.reject(new Error("Database connection required"));
  }

  public deletePayment(id: string): Promise<boolean> {
    return Promise.reject(new Error("Database connection required"));
  }

  public getDashboardMetrics(): Promise<DashboardMetrics> {
    return Promise.resolve({
      totalRevenue: 0,
      totalInvoices: 0,
      totalCustomers: 0,
      pendingInvoices: 0,
      overdueInvoices: 0,
      totalProducts: 0,
      lowStockAlerts: 0,
      recentActivities: [],
      topCustomers: [],
      salesTrend: [],
      paymentStatus: {
        paid: 0,
        pending: 0,
        overdue: 0
      }
    });
  }

  public getSuppliers(): Promise<Supplier[]> {
    return Promise.resolve([]);
  }

  public getSupplierById(id: string): Promise<Supplier | undefined> {
    return Promise.resolve(undefined);
  }

  public createSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    return Promise.reject(new Error("Database connection required"));
  }

  public updateSupplier(id: string, supplier: Partial<Supplier>): Promise<Supplier | undefined> {
    return Promise.reject(new Error("Database connection required"));
  }

  public deleteSupplier(id: string): Promise<boolean> {
    return Promise.reject(new Error("Database connection required"));
  }

  // Additional methods that might be called
  public startSimulation(): void {
    console.log("⚠️ Simulation not available in minimal mode");
  }

  public stopSimulation(): void {
    console.log("⚠️ Simulation not available in minimal mode");
  }

  public isSimulationRunning(): boolean {
    return false;
  }

  public getTemplates(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public createTemplate(template: any): Promise<any> {
    return Promise.reject(new Error("Database connection required"));
  }

  public getTemplateById(id: string): Promise<any | undefined> {
    return Promise.resolve(undefined);
  }
}

export default BusinessDataService;
