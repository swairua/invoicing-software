import { 
  Customer, Product, Invoice, Quotation, ProformaInvoice, Payment, 
  DashboardMetrics, InvoiceItem, Supplier
} from '@shared/types';

// PostgreSQL Business Data Service that connects to real database
class PostgresBusinessDataService {
  private static instance: PostgresBusinessDataService;
  private baseUrl = '/api'; // API endpoint base URL
  
  public static getInstance(): PostgresBusinessDataService {
    if (!PostgresBusinessDataService.instance) {
      PostgresBusinessDataService.instance = new PostgresBusinessDataService();
    }
    return PostgresBusinessDataService.instance;
  }

  // API helper methods
  private async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`Making API call to: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`API response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        console.error(`API call failed: ${response.status} ${response.statusText}`);
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`API call successful for ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`API call error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Customer methods
  public getCustomers(): Promise<Customer[]> {
    return this.apiCall('/customers').then(response => {
      return Array.isArray(response.data) ? response.data : [];
    }).catch(error => {
      console.error('Failed to fetch customers:', error);
      throw new Error('Database connection required to load customers');
    });
  }

  public async getCustomerById(id: string): Promise<Customer | undefined> {
    try {
      const response = await this.apiCall(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customer:', error);
      return undefined;
    }
  }

  public async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    try {
      const response = await this.apiCall('/customers', {
        method: 'POST',
        body: JSON.stringify(customerData),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw error;
    }
  }

  // Product methods
  public getProducts(): Promise<Product[]> {
    return this.apiCall('/products').then(response => {
      return Array.isArray(response.data) ? response.data : [];
    }).catch(error => {
      console.error('Failed to fetch products:', error);
      console.log('Using fallback product data');
      return this.getFallbackProducts();
    });
  }

  public async getProductById(id: string): Promise<Product | undefined> {
    try {
      const response = await this.apiCall(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return undefined;
    }
  }

  public async updateProductStock(productId: string, quantity: number, movementType: 'in' | 'out' | 'adjustment'): Promise<void> {
    try {
      await this.apiCall(`/products/${productId}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ quantity, movementType }),
      });
    } catch (error) {
      console.error('Failed to update product stock:', error);
      throw error;
    }
  }

  public async getLowStockProducts(): Promise<Product[]> {
    try {
      const response = await this.apiCall('/products/low-stock');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch low stock products:', error);
      return [];
    }
  }

  // Invoice methods
  public getInvoices(): Promise<Invoice[]> {
    return this.apiCall('/invoices').then(response => {
      return Array.isArray(response.data) ? response.data : [];
    }).catch(error => {
      console.error('Failed to fetch invoices:', error);
      throw new Error('Database connection required to load invoices');
    });
  }

  public async getInvoiceById(id: string): Promise<Invoice | undefined> {
    try {
      const response = await this.apiCall(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
      return undefined;
    }
  }

  public async createInvoice(invoiceData: any): Promise<Invoice> {
    try {
      const response = await this.apiCall('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  }

  // Quotation methods
  public async getQuotations(): Promise<Quotation[]> {
    try {
      const response = await this.apiCall('/quotations');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
      throw new Error('Database connection required to load quotations');
    }
  }

  public async createQuotation(quotationData: any): Promise<Quotation> {
    try {
      const response = await this.apiCall('/quotations', {
        method: 'POST',
        body: JSON.stringify(quotationData),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create quotation:', error);
      throw error;
    }
  }

  // Proforma methods
  public async getProformas(): Promise<ProformaInvoice[]> {
    try {
      const response = await this.apiCall('/proformas');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch proformas:', error);
      return [];
    }
  }

  // Payment methods
  public async getPayments(): Promise<Payment[]> {
    try {
      const response = await this.apiCall('/payments');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      return [];
    }
  }

  public async processPayment(invoiceId: string, amount: number, method: string, reference: string, notes?: string): Promise<Payment | null> {
    try {
      const response = await this.apiCall('/payments', {
        method: 'POST',
        body: JSON.stringify({
          invoiceId,
          amount,
          method,
          reference,
          notes,
        }),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to process payment:', error);
      return null;
    }
  }

  // Conversion methods
  public async convertQuotationToProforma(quotationId: string): Promise<ProformaInvoice | null> {
    try {
      const response = await this.apiCall(`/quotations/${quotationId}/convert/proforma`, {
        method: 'POST',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to convert quotation to proforma:', error);
      return null;
    }
  }

  public async convertQuotationToInvoice(quotationId: string): Promise<Invoice | null> {
    try {
      const response = await this.apiCall(`/quotations/${quotationId}/convert/invoice`, {
        method: 'POST',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to convert quotation to invoice:', error);
      return null;
    }
  }

  public async convertProformaToInvoice(proformaId: string): Promise<Invoice | null> {
    try {
      const response = await this.apiCall(`/proformas/${proformaId}/convert/invoice`, {
        method: 'POST',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to convert proforma to invoice:', error);
      return null;
    }
  }

  // Dashboard methods
  public async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await this.apiCall('/dashboard/metrics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      console.log('Using fallback dashboard metrics');
      return this.getFallbackDashboardMetrics();
    }
  }

  // Simulation methods (not applicable for real database)
  public startSimulation(): void {
    console.log('Real database mode - simulation not applicable');
  }

  public stopSimulation(): void {
    console.log('Real database mode - simulation not applicable');
  }

  public isSimulationRunning(): boolean {
    return false; // Always false for real database
  }

  // Suppliers
  public async getSuppliers(): Promise<Supplier[]> {
    try {
      const response = await this.apiCall('/suppliers');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      return [];
    }
  }

  // Stock movements
  public async getStockMovements(): Promise<any[]> {
    try {
      const response = await this.apiCall('/stock-movements');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch stock movements:', error);
      return [];
    }
  }

  // Activity Log methods
  public async getActivityLog(): Promise<any[]> {
    try {
      const response = await this.apiCall('/activity-log');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch activity log:', error);
      console.log('Using fallback activity data');
      // Return fallback activity data when API is unavailable
      return this.getFallbackActivityLog();
    }
  }

  // Fallback data methods (for when API is unavailable)
  private getFallbackCustomers(): Customer[] {
    return [
      {
        id: '1',
        name: 'Acme Corporation Ltd',
        email: 'procurement@acme.com',
        phone: '+254700123456',
        kraPin: 'P051234567A',
        address: 'P.O Box 12345, Nairobi Kenya',
        creditLimit: 500000,
        balance: 125000,
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Tech Solutions Kenya Ltd',
        email: 'info@techsolutions.co.ke',
        phone: '+254722987654',
        kraPin: 'P051234568B',
        address: '456 Innovation Hub, Nairobi',
        creditLimit: 300000,
        balance: 45000,
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private getFallbackProducts(): Product[] {
    return [
      {
        id: '1',
        name: 'Latex Rubber Gloves Bicolor Reusable XL',
        description: 'High-quality latex rubber gloves',
        sku: 'LRG-001',
        category: 'Medical Supplies',
        unit: 'Pair',
        purchasePrice: 400,
        sellingPrice: 500,
        minStock: 50,
        maxStock: 1000,
        currentStock: 450,
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private getFallbackInvoices(): Invoice[] {
    return [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        customerId: '1',
        customer: this.getFallbackCustomers()[0],
        items: [],
        subtotal: 12000,
        vatAmount: 0,
        discountAmount: 0,
        total: 12000,
        amountPaid: 12000,
        balance: 0,
        status: 'paid',
        dueDate: new Date(),
        issueDate: new Date(),
        notes: 'Payment received via M-Pesa',
        companyId: '1',
        createdBy: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private getFallbackQuotations(): Quotation[] {
    return [
      {
        id: '1',
        quoteNumber: 'QUO-2024-001',
        customerId: '1',
        customer: this.getFallbackCustomers()[0],
        items: [],
        subtotal: 25000,
        vatAmount: 0,
        discountAmount: 0,
        total: 25000,
        status: 'sent',
        validUntil: new Date(),
        issueDate: new Date(),
        notes: 'Bulk order discount available',
        companyId: '1',
        createdBy: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private getFallbackDashboardMetrics(): DashboardMetrics {
    return {
      totalRevenue: 145230.5,
      outstandingInvoices: 23450.75,
      lowStockAlerts: 12,
      recentPayments: 8750.25,
      salesTrend: [
        { date: '2024-01-01', amount: 12500 },
        { date: '2024-01-02', amount: 15600 },
        { date: '2024-01-03', amount: 18200 },
        { date: '2024-01-04', amount: 16800 },
        { date: '2024-01-05', amount: 21400 },
        { date: '2024-01-06', amount: 19300 },
        { date: '2024-01-07', amount: 23200 }
      ],
      topProducts: [
        { name: 'Wireless Bluetooth Headphones', sales: 45600 },
        { name: 'Office Chair Executive', sales: 32400 },
        { name: 'Digital Blood Pressure Monitor', sales: 28900 }
      ],
      recentActivities: [
        {
          id: '1',
          type: 'invoice',
          description: 'New invoice INV-2024-001 created',
          timestamp: new Date()
        }
      ]
    };
  }

  private getFallbackActivityLog(): any[] {
    return [
      {
        id: '1',
        type: 'invoice',
        action: 'created',
        title: 'Invoice Created',
        description: 'Invoice INV-2024-001 created for Acme Corporation Ltd',
        user: 'Admin User',
        timestamp: new Date(Date.now() - 15 * 60000),
        metadata: { invoiceNumber: 'INV-2024-001', amount: 25600 }
      },
      {
        id: '2',
        type: 'payment',
        action: 'created',
        title: 'Payment Received',
        description: 'Payment received from Tech Solutions Kenya',
        user: 'Admin User',
        timestamp: new Date(Date.now() - 45 * 60000),
        metadata: { amount: 15000, method: 'M-Pesa' }
      },
      {
        id: '3',
        type: 'product',
        action: 'updated',
        title: 'Stock Updated',
        description: 'Stock level updated for Latex Rubber Gloves',
        user: 'Admin User',
        timestamp: new Date(Date.now() - 75 * 60000),
        metadata: { productName: 'Latex Rubber Gloves', newStock: 425 }
      },
      {
        id: '4',
        type: 'quotation',
        action: 'created',
        title: 'Quotation Created',
        description: 'Quotation QUO-2024-001 created for Global Trading Co.',
        user: 'Admin User',
        timestamp: new Date(Date.now() - 120 * 60000),
        metadata: { quoteNumber: 'QUO-2024-001', amount: 42500 }
      },
      {
        id: '5',
        type: 'customer',
        action: 'created',
        title: 'Customer Added',
        description: 'New customer registration: Local Retail Store',
        user: 'Admin User',
        timestamp: new Date(Date.now() - 180 * 60000),
        metadata: { customerName: 'Local Retail Store' }
      }
    ];
  }
}

export default PostgresBusinessDataService;
