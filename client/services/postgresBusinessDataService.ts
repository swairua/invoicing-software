import {
  Customer,
  Product,
  Invoice,
  Quotation,
  ProformaInvoice,
  Payment,
  DashboardMetrics,
  InvoiceItem,
  Supplier,
} from "@shared/types";

// PostgreSQL Business Data Service that connects to real database
class PostgresBusinessDataService {
  private static instance: PostgresBusinessDataService;
  private baseUrl = "/api"; // API endpoint base URL

  public static getInstance(): PostgresBusinessDataService {
    if (!PostgresBusinessDataService.instance) {
      PostgresBusinessDataService.instance = new PostgresBusinessDataService();
    }
    return PostgresBusinessDataService.instance;
  }

  // API helper methods
  private async apiCall(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`Making API call to: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      console.log(
        `API response status: ${response.status} ${response.statusText}`,
      );

      if (!response.ok) {
        console.error(
          `API call failed: ${response.status} ${response.statusText}`,
        );
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
    console.log("PostgresBusinessDataService: getCustomers() called");
    return this.apiCall("/customers")
      .then((response) => {
        console.log(
          "PostgresBusinessDataService: customers API response:",
          response,
        );
        const rawCustomers = Array.isArray(response.data) ? response.data : [];

        // Transform data to handle currentBalance -> balance mapping and ensure numeric values
        const customers = rawCustomers.map((customer) => ({
          ...customer,
          balance: Number(customer.currentBalance || customer.balance || 0),
          creditLimit: Number(customer.creditLimit || 0),
          currentBalance: undefined, // Remove to avoid confusion
        }));

        console.log(
          "PostgresBusinessDataService: transformed customers:",
          customers,
        );
        return customers;
      })
      .catch((error) => {
        console.error(
          "PostgresBusinessDataService: Failed to fetch customers:",
          error,
        );
        throw new Error(`Failed to fetch customers: ${error.message}`);
      });
  }

  public async getCustomerById(id: string): Promise<Customer | undefined> {
    try {
      const response = await this.apiCall(`/customers/${id}`);
      const customer = response.data;
      if (!customer) return undefined;

      // Transform data to handle currentBalance -> balance mapping
      return {
        ...customer,
        balance: Number(customer.currentBalance || customer.balance || 0),
        creditLimit: Number(customer.creditLimit || 0),
        currentBalance: undefined, // Remove to avoid confusion
      };
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      return undefined;
    }
  }

  public async createCustomer(
    customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">,
  ): Promise<Customer> {
    try {
      const response = await this.apiCall("/customers", {
        method: "POST",
        body: JSON.stringify(customerData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create customer:", error);
      throw error;
    }
  }

  public async updateCustomer(
    id: string,
    customerData: Partial<Customer>,
  ): Promise<Customer | undefined> {
    try {
      const response = await this.apiCall(`/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(customerData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update customer:", error);
      throw error;
    }
  }

  public async deleteCustomer(id: string): Promise<boolean> {
    try {
      await this.apiCall(`/customers/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Failed to delete customer:", error);
      return false;
    }
  }

  // Product methods
  public getProducts(): Promise<Product[]> {
    console.log("PostgresBusinessDataService: getProducts() called");
    return this.apiCall("/products")
      .then((response) => {
        console.log("PostgresBusinessDataService: API response:", response);
        const products = Array.isArray(response.data) ? response.data : [];
        console.log(
          "PostgresBusinessDataService: returning products:",
          products,
        );
        return products;
      })
      .catch((error) => {
        console.error(
          "PostgresBusinessDataService: Failed to fetch products:",
          error,
        );
        throw new Error(`Failed to fetch products from database: ${error.message}`);
      });
  }

  public async getProductById(id: string): Promise<Product | undefined> {
    try {
      const response = await this.apiCall(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch product:", error);
      return undefined;
    }
  }

  public async createProduct(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ): Promise<Product> {
    try {
      const response = await this.apiCall("/products", {
        method: "POST",
        body: JSON.stringify(productData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error;
    }
  }

  public async updateProduct(
    id: string,
    productData: Partial<Product>,
  ): Promise<Product | undefined> {
    try {
      const response = await this.apiCall(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  }

  public async deleteProduct(id: string): Promise<boolean> {
    try {
      await this.apiCall(`/products/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Failed to delete product:", error);
      return false;
    }
  }

  public async updateProductStock(
    productId: string,
    quantity: number,
    movementType: "in" | "out" | "adjustment",
  ): Promise<void> {
    try {
      await this.apiCall(`/products/${productId}/stock`, {
        method: "PUT",
        body: JSON.stringify({ quantity, movementType }),
      });
    } catch (error) {
      console.error("Failed to update product stock:", error);
      throw error;
    }
  }

  public async getLowStockProducts(): Promise<Product[]> {
    try {
      const response = await this.apiCall("/products/low-stock");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Failed to fetch low stock products:", error);
      return [];
    }
  }

  // Invoice methods
  public getInvoices(): Promise<Invoice[]> {
    return this.apiCall("/invoices")
      .then((response) => {
        return Array.isArray(response.data) ? response.data : [];
      })
      .catch((error) => {
        console.error("Failed to fetch invoices:", error);
        console.log("Using fallback invoice data");
        return this.getFallbackInvoices();
      });
  }

  public async getInvoiceById(id: string): Promise<Invoice | undefined> {
    try {
      const response = await this.apiCall(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
      return undefined;
    }
  }

  public async createInvoice(invoiceData: any): Promise<Invoice> {
    try {
      const response = await this.apiCall("/invoices", {
        method: "POST",
        body: JSON.stringify(invoiceData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create invoice:", error);
      throw error;
    }
  }

  public async updateInvoice(
    id: string,
    invoiceData: Partial<Invoice>,
  ): Promise<Invoice | undefined> {
    try {
      const response = await this.apiCall(`/invoices/${id}`, {
        method: "PUT",
        body: JSON.stringify(invoiceData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update invoice:", error);
      throw error;
    }
  }

  public async deleteInvoice(id: string): Promise<boolean> {
    try {
      await this.apiCall(`/invoices/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      return false;
    }
  }

  // Quotation methods
  public async getQuotations(): Promise<Quotation[]> {
    try {
      const response = await this.apiCall("/quotations");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      console.log("Using fallback quotation data");
      return this.getFallbackQuotations();
    }
  }

  public async getQuotationById(id: string): Promise<Quotation | undefined> {
    try {
      const response = await this.apiCall(`/quotations/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch quotation:", error);
      return undefined;
    }
  }

  public async createQuotation(quotationData: any): Promise<Quotation> {
    try {
      const response = await this.apiCall("/quotations", {
        method: "POST",
        body: JSON.stringify(quotationData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create quotation:", error);
      throw error;
    }
  }

  public async updateQuotation(
    id: string,
    quotationData: Partial<Quotation>,
  ): Promise<Quotation | undefined> {
    try {
      const response = await this.apiCall(`/quotations/${id}`, {
        method: "PUT",
        body: JSON.stringify(quotationData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update quotation:", error);
      throw error;
    }
  }

  public async deleteQuotation(id: string): Promise<boolean> {
    try {
      await this.apiCall(`/quotations/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Failed to delete quotation:", error);
      return false;
    }
  }

  // Proforma methods
  public async getProformas(): Promise<ProformaInvoice[]> {
    try {
      const response = await this.apiCall("/proformas");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Failed to fetch proformas:", error);
      return [];
    }
  }

  // Alias method for compatibility with existing code
  public async getProformaInvoices(): Promise<ProformaInvoice[]> {
    return this.getProformas();
  }

  public async getProformaInvoiceById(id: string): Promise<ProformaInvoice | undefined> {
    try {
      const response = await this.apiCall(`/proformas/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch proforma invoice:", error);
      return undefined;
    }
  }

  public async createProformaInvoice(proformaData: any): Promise<ProformaInvoice> {
    try {
      const response = await this.apiCall("/proformas", {
        method: "POST",
        body: JSON.stringify(proformaData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create proforma invoice:", error);
      throw error;
    }
  }

  public async updateProformaInvoice(
    id: string,
    proformaData: Partial<ProformaInvoice>,
  ): Promise<ProformaInvoice | undefined> {
    try {
      const response = await this.apiCall(`/proformas/${id}`, {
        method: "PUT",
        body: JSON.stringify(proformaData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update proforma invoice:", error);
      throw error;
    }
  }

  public async deleteProformaInvoice(id: string): Promise<boolean> {
    try {
      await this.apiCall(`/proformas/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Failed to delete proforma invoice:", error);
      return false;
    }
  }

  // Credit Notes methods
  public async getCreditNotes(): Promise<any[]> {
    try {
      const response = await this.apiCall("/credit-notes");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Failed to fetch credit notes:", error);
      console.log("Using fallback credit notes data");
      return this.getFallbackCreditNotes();
    }
  }

  public async getCreditNote(id: string): Promise<any | undefined> {
    try {
      const response = await this.apiCall(`/credit-notes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch credit note:", error);
      console.log("Using fallback credit note data");
      // Return the first matching credit note from fallback data
      const fallbackData = this.getFallbackCreditNotes();
      return fallbackData.find((cn) => cn.id === id);
    }
  }

  // Payment methods
  public async getPayments(): Promise<Payment[]> {
    try {
      const response = await this.apiCall("/payments");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      return [];
    }
  }

  public async createPayment(
    paymentData: Omit<Payment, "id" | "createdAt" | "updatedAt">,
  ): Promise<Payment> {
    try {
      const response = await this.apiCall("/payments", {
        method: "POST",
        body: JSON.stringify(paymentData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create payment:", error);
      throw error;
    }
  }

  public async updatePayment(
    id: string,
    paymentData: Partial<Payment>,
  ): Promise<Payment | undefined> {
    try {
      const response = await this.apiCall(`/payments/${id}`, {
        method: "PUT",
        body: JSON.stringify(paymentData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update payment:", error);
      throw error;
    }
  }

  public async deletePayment(id: string): Promise<boolean> {
    try {
      await this.apiCall(`/payments/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Failed to delete payment:", error);
      return false;
    }
  }

  public async processPayment(
    invoiceId: string,
    amount: number,
    method: string,
    reference: string,
    notes?: string,
  ): Promise<Payment | null> {
    try {
      const response = await this.apiCall("/payments", {
        method: "POST",
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
      console.error("Failed to process payment:", error);
      return null;
    }
  }

  // Conversion methods
  public async convertQuotationToProforma(
    quotationId: string,
  ): Promise<ProformaInvoice | null> {
    try {
      const response = await this.apiCall(
        `/quotations/${quotationId}/convert/proforma`,
        {
          method: "POST",
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to convert quotation to proforma:", error);
      return null;
    }
  }

  public async convertQuotationToInvoice(
    quotationId: string,
  ): Promise<Invoice | null> {
    try {
      const response = await this.apiCall(
        `/quotations/${quotationId}/convert/invoice`,
        {
          method: "POST",
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to convert quotation to invoice:", error);
      return null;
    }
  }

  public async convertProformaToInvoice(
    proformaId: string,
  ): Promise<Invoice | null> {
    try {
      const response = await this.apiCall(
        `/proformas/${proformaId}/convert/invoice`,
        {
          method: "POST",
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to convert proforma to invoice:", error);
      return null;
    }
  }

  // Dashboard methods
  public async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await this.apiCall("/dashboard/metrics");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch dashboard metrics:", error);
      console.log("Using fallback dashboard metrics");
      return this.getFallbackDashboardMetrics();
    }
  }

  // Simulation methods (not applicable for real database)
  public startSimulation(): void {
    console.log("Real database mode - simulation not applicable");
  }

  public stopSimulation(): void {
    console.log("Real database mode - simulation not applicable");
  }

  public isSimulationRunning(): boolean {
    return false; // Always false for real database
  }

  // Suppliers
  public async getSuppliers(): Promise<Supplier[]> {
    try {
      const response = await this.apiCall("/suppliers");
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      return [];
    }
  }

  public async createSupplier(
    supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">,
  ): Promise<Supplier> {
    try {
      const response = await this.apiCall("/suppliers", {
        method: "POST",
        body: JSON.stringify(supplierData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create supplier:", error);
      throw error;
    }
  }

  public async updateSupplier(
    id: string,
    supplierData: Partial<Supplier>,
  ): Promise<Supplier | undefined> {
    try {
      const response = await this.apiCall(`/suppliers/${id}`, {
        method: "PUT",
        body: JSON.stringify(supplierData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update supplier:", error);
      throw error;
    }
  }

  public async deleteSupplier(id: string): Promise<boolean> {
    try {
      await this.apiCall(`/suppliers/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Failed to delete supplier:", error);
      return false;
    }
  }

  // Stock movements
  public async getStockMovements(): Promise<any[]> {
    try {
      const response = await this.apiCall("/stock-movements");
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch stock movements:", error);
      return [];
    }
  }

  // Activity Log methods
  public async getActivityLog(): Promise<any[]> {
    try {
      const response = await this.apiCall("/activity-log");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Failed to fetch activity log:", error);
      console.log("Using fallback activity data");
      // Return fallback activity data when API is unavailable
      return this.getFallbackActivityLog();
    }
  }

  public async addActivityLog(entry: any): Promise<void> {
    try {
      await this.apiCall("/activity-log", {
        method: "POST",
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error("Failed to add activity log entry:", error);
      // Don't throw here as activity logging is usually not critical
    }
  }

  // Statement of Account methods
  public async getStatementOfAccount(filter: {
    customerId: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    aging?: string;
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();

      if (filter.customerId)
        queryParams.append("customerId", filter.customerId);
      if (filter.startDate) queryParams.append("startDate", filter.startDate);
      if (filter.endDate) queryParams.append("endDate", filter.endDate);
      if (filter.status) queryParams.append("status", filter.status);
      if (filter.aging) queryParams.append("aging", filter.aging);

      const response = await this.apiCall(
        `/statement-of-account?${queryParams.toString()}`,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch statement of account:", error);
      console.log("Using fallback statement data");
      return this.getFallbackStatementData(filter);
    }
  }

  // Fallback data methods (for when API is unavailable)
  private getFallbackCustomers(): Customer[] {
    return [
      {
        id: "1",
        name: "Acme Corporation Ltd",
        email: "procurement@acme.com",
        phone: "+254700123456",
        kraPin: "P051234567A",
        address: "P.O Box 12345, Nairobi Kenya",
        creditLimit: 500000,
        balance: 125000,
        isActive: true,
        companyId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        name: "Tech Solutions Kenya Ltd",
        email: "info@techsolutions.co.ke",
        phone: "+254722987654",
        kraPin: "P051234568B",
        address: "456 Innovation Hub, Nairobi",
        creditLimit: 300000,
        balance: 45000,
        isActive: true,
        companyId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private getFallbackProducts(): Product[] {
    return [
      {
        id: "1",
        name: "Latex Rubber Gloves Bicolor Reusable XL",
        description:
          "High-quality latex rubber gloves for medical and industrial use",
        sku: "LRG-001",
        category: "Medical Supplies",
        unit: "Pair",
        purchasePrice: 400,
        sellingPrice: 500,
        minStock: 50,
        maxStock: 1000,
        currentStock: 450,
        taxable: false,
        trackInventory: true,
        allowBackorders: true,
        hasVariants: false,
        isActive: true,
        status: "active",
        companyId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        name: "Digital Blood Pressure Monitor",
        description: "Accurate digital blood pressure monitoring device",
        sku: "DBP-001",
        category: "Medical Equipment",
        unit: "Piece",
        purchasePrice: 2500,
        sellingPrice: 3500,
        minStock: 5,
        maxStock: 100,
        currentStock: 25,
        taxable: false,
        trackInventory: true,
        allowBackorders: true,
        hasVariants: false,
        isActive: true,
        status: "active",
        companyId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        name: "Executive Office Chair with Lumbar Support",
        description: "Ergonomic executive chair with adjustable lumbar support",
        sku: "EOC-002",
        category: "Office Furniture",
        unit: "Piece",
        purchasePrice: 12000,
        sellingPrice: 18000,
        minStock: 5,
        maxStock: 50,
        currentStock: 12,
        taxable: true,
        trackInventory: true,
        allowBackorders: false,
        hasVariants: true,
        isActive: true,
        status: "active",
        companyId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "4",
        name: "Wireless Bluetooth Headphones",
        description: "Premium wireless headphones with noise cancellation",
        sku: "WBH-004",
        category: "Electronics",
        unit: "Piece",
        purchasePrice: 3500,
        sellingPrice: 5500,
        minStock: 20,
        maxStock: 200,
        currentStock: 85,
        taxable: true,
        trackInventory: true,
        allowBackorders: true,
        hasVariants: true,
        isActive: true,
        status: "active",
        companyId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "5",
        name: "Surgical Face Masks (Box of 50)",
        description: "3-layer disposable surgical face masks, medical grade",
        sku: "SFM-005",
        category: "Medical Supplies",
        unit: "Box",
        purchasePrice: 800,
        sellingPrice: 1200,
        minStock: 100,
        maxStock: 2000,
        currentStock: 45,
        taxable: false,
        trackInventory: true,
        allowBackorders: false,
        hasVariants: false,
        isActive: true,
        status: "out_of_stock",
        companyId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private getFallbackInvoices(): Invoice[] {
    return [
      {
        id: "1",
        invoiceNumber: "INV-2024-001",
        customerId: "1",
        customer: this.getFallbackCustomers()[0],
        items: [],
        subtotal: 12000,
        vatAmount: 0,
        discountAmount: 0,
        total: 12000,
        amountPaid: 12000,
        balance: 0,
        status: "paid",
        dueDate: new Date(),
        issueDate: new Date(),
        notes: "Payment received via M-Pesa",
        companyId: "1",
        createdBy: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private getFallbackQuotations(): Quotation[] {
    return [
      {
        id: "1",
        quoteNumber: "QUO-2024-001",
        customerId: "1",
        customer: this.getFallbackCustomers()[0],
        items: [],
        subtotal: 25000,
        vatAmount: 0,
        discountAmount: 0,
        total: 25000,
        status: "sent",
        validUntil: new Date(),
        issueDate: new Date(),
        notes: "Bulk order discount available",
        companyId: "1",
        createdBy: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private getFallbackDashboardMetrics(): DashboardMetrics {
    return {
      totalRevenue: 145230.5,
      outstandingInvoices: 23450.75,
      lowStockAlerts: 12,
      recentPayments: 8750.25,
      salesTrend: [
        { date: "2024-01-01", amount: 12500 },
        { date: "2024-01-02", amount: 15600 },
        { date: "2024-01-03", amount: 18200 },
        { date: "2024-01-04", amount: 16800 },
        { date: "2024-01-05", amount: 21400 },
        { date: "2024-01-06", amount: 19300 },
        { date: "2024-01-07", amount: 23200 },
      ],
      topProducts: [
        { name: "Wireless Bluetooth Headphones", sales: 45600 },
        { name: "Office Chair Executive", sales: 32400 },
        { name: "Digital Blood Pressure Monitor", sales: 28900 },
      ],
      recentActivities: [
        {
          id: "1",
          type: "invoice",
          description: "New invoice INV-2024-001 created",
          timestamp: new Date(),
        },
      ],
    };
  }

  private getFallbackCreditNotes(): any[] {
    return [
      {
        id: "1",
        creditNoteNumber: "CN-2024-001",
        customerId: "1",
        customer: {
          id: "1",
          name: "Acme Corporation Ltd",
          email: "contact@acme.com",
        },
        items: [
          {
            id: "1",
            productId: "1",
            product: {
              id: "1",
              name: "Latex Rubber Gloves Bicolor Reusable XL",
              sku: "LRG-XL-001",
            },
            quantity: 10,
            unitPrice: 500,
            total: 5000,
          },
        ],
        subtotal: 5000,
        vatAmount: 800,
        total: 5800,
        reason: "Defective items returned",
        status: "issued",
        issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        notes: "Credit for defective gloves returned by customer",
        companyId: "1",
        createdBy: "1",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: "2",
        creditNoteNumber: "CN-2024-002",
        customerId: "2",
        customer: {
          id: "2",
          name: "Tech Solutions Kenya Ltd",
          email: "info@techsolutions.co.ke",
        },
        items: [
          {
            id: "2",
            productId: "2",
            product: {
              id: "2",
              name: "Digital Blood Pressure Monitor",
              sku: "DBP-001",
            },
            quantity: 1,
            unitPrice: 3500,
            total: 3500,
          },
        ],
        subtotal: 3500,
        vatAmount: 560,
        total: 4060,
        reason: "Billing error adjustment",
        status: "draft",
        issueDate: new Date(),
        notes: "Credit for billing error on invoice INV-2024-002",
        companyId: "1",
        createdBy: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private getFallbackActivityLog(): any[] {
    return [
      {
        id: "1",
        type: "invoice",
        action: "created",
        title: "Invoice Created",
        description: "Invoice INV-2024-001 created for Acme Corporation Ltd",
        user: "Admin User",
        timestamp: new Date(Date.now() - 15 * 60000),
        metadata: { invoiceNumber: "INV-2024-001", amount: 25600 },
      },
      {
        id: "2",
        type: "payment",
        action: "created",
        title: "Payment Received",
        description: "Payment received from Tech Solutions Kenya",
        user: "Admin User",
        timestamp: new Date(Date.now() - 45 * 60000),
        metadata: { amount: 15000, method: "M-Pesa" },
      },
      {
        id: "3",
        type: "product",
        action: "updated",
        title: "Stock Updated",
        description: "Stock level updated for Latex Rubber Gloves",
        user: "Admin User",
        timestamp: new Date(Date.now() - 75 * 60000),
        metadata: { productName: "Latex Rubber Gloves", newStock: 425 },
      },
      {
        id: "4",
        type: "quotation",
        action: "created",
        title: "Quotation Created",
        description: "Quotation QUO-2024-001 created for Global Trading Co.",
        user: "Admin User",
        timestamp: new Date(Date.now() - 120 * 60000),
        metadata: { quoteNumber: "QUO-2024-001", amount: 42500 },
      },
      {
        id: "5",
        type: "customer",
        action: "created",
        title: "Customer Added",
        description: "New customer registration: Local Retail Store",
        user: "Admin User",
        timestamp: new Date(Date.now() - 180 * 60000),
        metadata: { customerName: "Local Retail Store" },
      },
    ];
  }

  private getFallbackStatementData(filter: any): any {
    const fallbackTransactions = [
      {
        id: "1",
        date: "2025-03-01",
        name: "Muthaiga Country Club",
        invoice: "790",
        dueDate: "2025-03-02",
        originalAmount: 60000,
        paidAmount: 60000,
        balance: 0,
        status: "paid",
      },
      {
        id: "2",
        date: "2025-03-01",
        name: "Muthaiga Country Club",
        invoice: "791",
        dueDate: "2025-03-02",
        originalAmount: 18495,
        paidAmount: 18495,
        balance: 0,
        status: "paid",
      },
      {
        id: "3",
        date: "2025-09-01",
        name: "Muthaiga Country Club",
        invoice: "795",
        dueDate: "2025-09-02",
        originalAmount: 16000,
        paidAmount: 16000,
        balance: 0,
        status: "paid",
      },
      {
        id: "4",
        date: "2025-01-24",
        name: "Muthaiga Country Club",
        invoice: "804",
        dueDate: "2025-02-24",
        originalAmount: 24000,
        paidAmount: 24000,
        balance: 0,
        status: "paid",
      },
      {
        id: "5",
        date: "2025-02-12",
        name: "Muthaiga Country Club",
        invoice: "822",
        dueDate: "2025-03-12",
        originalAmount: 24000,
        paidAmount: 24000,
        balance: 0,
        status: "paid",
      },
      {
        id: "6",
        date: "2025-02-14",
        name: "Muthaiga Country Club",
        invoice: "826",
        dueDate: "2025-03-14",
        originalAmount: 5000,
        paidAmount: 5000,
        balance: 0,
        status: "paid",
      },
      {
        id: "7",
        date: "2025-03-06",
        name: "Muthaiga Country Club",
        invoice: "835",
        dueDate: "2025-04-06",
        originalAmount: 16000,
        paidAmount: 16000,
        balance: 0,
        status: "paid",
      },
      {
        id: "8",
        date: "2025-03-19",
        name: "Muthaiga Country Club",
        invoice: "843",
        dueDate: "2025-04-19",
        originalAmount: 24000,
        paidAmount: 24000,
        balance: 0,
        status: "paid",
      },
      {
        id: "9",
        date: "2025-04-01",
        name: "Muthaiga Country Club",
        invoice: "852",
        dueDate: "2025-05-01",
        originalAmount: 40000,
        paidAmount: 40000,
        balance: 0,
        status: "paid",
      },
      {
        id: "10",
        date: "2025-04-04",
        name: "Muthaiga Country Club",
        invoice: "854",
        dueDate: "2025-05-04",
        originalAmount: 16000,
        paidAmount: 16000,
        balance: 0,
        status: "paid",
      },
      {
        id: "11",
        date: "2025-04-16",
        name: "Muthaiga Country Club",
        invoice: "859",
        dueDate: "2025-05-16",
        originalAmount: 29000,
        paidAmount: 29000,
        balance: 0,
        status: "paid",
      },
      {
        id: "12",
        date: "2025-05-05",
        name: "Muthaiga Country Club",
        invoice: "863",
        dueDate: "2025-06-05",
        originalAmount: 16000,
        paidAmount: 16000,
        balance: 0,
        status: "paid",
      },
      {
        id: "13",
        date: "2025-06-05",
        name: "Muthaiga Country Club",
        invoice: "876",
        dueDate: "2025-07-05",
        originalAmount: 24000,
        paidAmount: 0,
        balance: 24000,
        status: "overdue",
      },
      {
        id: "14",
        date: "2025-06-13",
        name: "Muthaiga Country Club",
        invoice: "881",
        dueDate: "2025-07-13",
        originalAmount: 24000,
        paidAmount: 0,
        balance: 24000,
        status: "overdue",
      },
      {
        id: "15",
        date: "2025-07-02",
        name: "Muthaiga Country Club",
        invoice: "884",
        dueDate: "2025-08-02",
        originalAmount: 16000,
        paidAmount: 0,
        balance: 16000,
        status: "current",
      },
    ];

    // Apply basic filtering (client-side for fallback data)
    let filteredTransactions = [...fallbackTransactions];

    if (filter.startDate) {
      filteredTransactions = filteredTransactions.filter(
        (t) => new Date(t.date) >= new Date(filter.startDate),
      );
    }

    if (filter.endDate) {
      filteredTransactions = filteredTransactions.filter(
        (t) => new Date(t.date) <= new Date(filter.endDate),
      );
    }

    if (filter.status && filter.status !== "all") {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.status === filter.status,
      );
    }

    return {
      transactions: filteredTransactions,
      summary: {
        totalOriginal: filteredTransactions.reduce(
          (sum, t) => sum + t.originalAmount,
          0,
        ),
        totalPaid: filteredTransactions.reduce(
          (sum, t) => sum + t.paidAmount,
          0,
        ),
        totalBalance: filteredTransactions.reduce(
          (sum, t) => sum + t.balance,
          0,
        ),
      },
    };
  }
}

export default PostgresBusinessDataService;
