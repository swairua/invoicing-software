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
  ProductCategory,
} from "@shared/types";

// PostgreSQL Business Data Service that connects to real database
class PostgresBusinessDataService {
  private static instance: PostgresBusinessDataService;
  private baseUrl = "/api"; // API endpoint base URL

  // Simple test method to check if basic API connectivity works
  private async testBasicConnectivity(): Promise<boolean> {
    try {
      console.log("🧪 Testing basic connectivity...");
      const response = await fetch("/api/ping");
      console.log("🧪 Basic connectivity test response:", response.status);
      return response.ok;
    } catch (error) {
      console.error("🧪 Basic connectivity test failed:", error);
      return false;
    }
  }

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
    console.log(`🌐 Making API call to: ${url}`);
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log(`🌐 Endpoint: ${endpoint}`);
    console.log(`🌐 Full URL: ${url}`);
    console.log(`🌐 Current window location:`, window.location.href);

    // Get company ID from localStorage (stored by auth system)
    const userData = localStorage.getItem("user_data");
    const companyId = userData
      ? JSON.parse(userData).companyId
      : "00000000-0000-0000-0000-000000000001";

    console.log(`🏢 Using company ID: ${companyId}`);

    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
        "x-company-id": companyId,
        ...options.headers,
      },
      ...options,
    };

    console.log(`📤 Request options:`, requestOptions);

    try {
      console.log(`🔄 Starting fetch request to ${url}...`);

      const response = await fetch(url, requestOptions);

      console.log(`📥 Response received:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      if (!response.ok) {
        console.error(
          `❌ API call failed: ${response.status} ${response.statusText}`,
        );

        let errorDetails = 'No additional details';
        try {
          // Try to read error response as JSON first, fallback to text
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorDetails = JSON.stringify(errorData);
          } else {
            errorDetails = await response.text();
          }
        } catch (readError) {
          console.warn('Could not read error response body:', readError);
        }

        console.error(`❌ Response body:`, errorDetails);
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API call successful for ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`💥 API call error for ${endpoint}:`, error);
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
      console.log("updateCustomer called with id:", id, "type:", typeof id);
      console.log("updateCustomer called with customerData:", customerData);
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
        throw new Error(
          `Failed to fetch products from database: ${error.message}`,
        );
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
        throw new Error(
          `Failed to fetch invoices from database: ${error.message}`,
        );
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
      const quotations = Array.isArray(response.data) ? response.data : [];

      // Transform database column names to TypeScript interface properties
      return quotations.map((q: any) => ({
        id: q.id,
        quoteNumber: q.quote_number,
        customerId: q.customer_id,
        customer: {
          id: q.customer_id,
          name: q.customer_name,
          email: q.customer_email,
          // Add more customer fields as needed
        },
        items: [], // Will be populated when needed
        subtotal: parseFloat(q.subtotal) || 0,
        vatAmount: parseFloat(q.vat_amount) || 0,
        discountAmount: parseFloat(q.discount_amount) || 0,
        total: parseFloat(q.total_amount) || 0,
        status: q.status,
        validUntil: new Date(q.valid_until),
        issueDate: new Date(q.issue_date),
        notes: q.notes,
        companyId: q.company_id,
        createdBy: q.created_by,
        createdAt: new Date(q.created_at),
        updatedAt: new Date(q.updated_at),
      }));
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      throw new Error(
        `Failed to fetch quotations from database: ${error.message}`,
      );
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

  public async getProformaInvoiceById(
    id: string,
  ): Promise<ProformaInvoice | undefined> {
    try {
      const response = await this.apiCall(`/proformas/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch proforma invoice:", error);
      return undefined;
    }
  }

  public async createProformaInvoice(
    proformaData: any,
  ): Promise<ProformaInvoice> {
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
      throw new Error(
        `Failed to fetch credit notes from database: ${error.message}`,
      );
    }
  }

  public async getCreditNote(id: string): Promise<any | undefined> {
    try {
      const response = await this.apiCall(`/credit-notes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch credit note:", error);
      throw new Error(
        `Failed to fetch credit note from database: ${error.message}`,
      );
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
      throw new Error(
        `Failed to fetch dashboard metrics from database: ${error.message}`,
      );
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
      throw new Error(
        `Failed to fetch activity log from database: ${error.message}`,
      );
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
      throw new Error(
        `Failed to fetch statement of account from database: ${error.message}`,
      );
    }
  }

  // Test connectivity method
  public async testConnection(): Promise<boolean> {
    try {
      console.log("🧪 Testing API connectivity...");
      const response = await this.apiCall("/ping");
      console.log("🧪 Ping test successful:", response);
      return true;
    } catch (error) {
      console.error("🧪 Ping test failed:", error);
      return false;
    }
  }

  // Create sample data method (simulates form submissions)
  public async createSampleData(): Promise<any> {
    try {
      console.log("📋 Creating sample data via API...");
      const response = await this.apiCall("/create-sample-data", {
        method: "POST"
      });
      console.log("✅ Sample data created:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to create sample data:", error);
      throw error;
    }
  }

  // Categories methods
  public async getCategories(): Promise<ProductCategory[]> {
    try {
      const response = await this.apiCall("/categories");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw new Error(
        `Failed to fetch categories from database: ${error.message}`,
      );
    }
  }

  public async createCategory(
    categoryData: Omit<ProductCategory, "id" | "createdAt" | "updatedAt">,
  ): Promise<ProductCategory> {
    try {
      const response = await this.apiCall("/categories", {
        method: "POST",
        body: JSON.stringify(categoryData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  }

  public async updateCategory(
    id: string,
    categoryData: Partial<ProductCategory>,
  ): Promise<ProductCategory | undefined> {
    try {
      const response = await this.apiCall(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(categoryData),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update category:", error);
      throw error;
    }
  }

  public async deleteCategory(id: string): Promise<boolean> {
    try {
      await this.apiCall(`/categories/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Failed to delete category:", error);
      return false;
    }
  }
}

export default PostgresBusinessDataService;
