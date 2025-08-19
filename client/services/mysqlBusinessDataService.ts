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

// MySQL Business Data Service that connects to real database
class MySQLBusinessDataService {
  private static instance: MySQLBusinessDataService;
  private baseUrl = "/api"; // API endpoint base URL
  private dashboardMetricsPromise: Promise<any> | null = null; // Prevent concurrent calls
  private hasDetectedFetchInterference = false; // Track if we've detected fetch interference

  // Simple test method to check if basic API connectivity works
  private async testBasicConnectivity(): Promise<boolean> {
    try {
      console.log("🧪 Testing basic connectivity...");
      const response = await this.robustFetch("/api/ping");
      console.log("🧪 Basic connectivity test response:", response.status);
      return response.ok;
    } catch (error) {
      console.error("🧪 Basic connectivity test failed:", error);
      return false;
    }
  }

  // Hybrid fetch implementation with fast FullStory detection and XMLHttpRequest fallback
  private async robustFetch(url: string, options: RequestInit = {}): Promise<Response> {
    console.log(`🔍 robustFetch called for: ${url}`);
    console.log(`🔍 FullStory interference pre-detected: ${this.hasDetectedFetchInterference}`);

    // If we've already detected FullStory interference, skip native fetch entirely
    if (this.hasDetectedFetchInterference && typeof XMLHttpRequest !== 'undefined') {
      console.log("🔧 Skipping native fetch, using XMLHttpRequest due to pre-detected FullStory interference");
      try {
        return await this.xmlHttpRequestFetch(url, options);
      } catch (xhrError) {
        console.error(`❌ XMLHttpRequest failed for ${url}:`, xhrError);
        throw new Error(`XMLHttpRequest failed: ${xhrError.message}`);
      }
    }

    // Try native fetch first with reasonable timeout for production environments
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Fetch timeout - likely FullStory interference')), 10000); // 10 second timeout for production
    });

    try {
      console.log("📡 Attempting native fetch with FullStory detection...");
      const fetchPromise = window.fetch(url, options);
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      console.log(`✅ Native fetch succeeded for: ${url}`);
      return response;
    } catch (error) {
      console.error(`❌ Native fetch failed for ${url}:`, error);

      // Any fetch failure in production likely means FullStory interference
      if (typeof XMLHttpRequest !== 'undefined') {
        console.log("🔧 Falling back to XMLHttpRequest due to fetch failure");
        this.hasDetectedFetchInterference = true; // Remember for future calls

        try {
          return await this.xmlHttpRequestFetch(url, options);
        } catch (xhrError) {
          console.error(`❌ XMLHttpRequest also failed for ${url}:`, xhrError);

          // If XMLHttpRequest times out, try a more permissive approach
          if (xhrError.message.includes('timeout')) {
            console.log("�� XMLHttpRequest timed out, trying fetch with no-cors mode...");
            try {
              const response = await window.fetch(url, {
                ...options,
                mode: 'cors',
                credentials: 'same-origin',
              });
              return response;
            } catch (finalError) {
              console.error(`❌ All methods failed for ${url}:`, finalError);
              throw new Error(`All network methods failed. Original: ${error.message}, XHR: ${xhrError.message}, Final: ${finalError.message}`);
            }
          }

          throw new Error(`Both fetch and XMLHttpRequest failed. Fetch: ${error.message}, XHR: ${xhrError.message}`);
        }
      } else {
        throw new Error(`Fetch failed and XMLHttpRequest not available: ${error.message}`);
      }
    }
  }

  // XMLHttpRequest-based fetch alternative
  private async xmlHttpRequestFetch(url: string, options: RequestInit = {}): Promise<Response> {
    return new Promise((resolve, reject) => {
      console.log(`🔧 XMLHttpRequest fallback for: ${url}`);

      const xhr = new XMLHttpRequest();
      const method = options.method || 'GET';

      xhr.open(method, url, true);

      // Set headers
      if (options.headers) {
        const headers = new Headers(options.headers);
        headers.forEach((value, key) => {
          console.log(`🔧 Setting header: ${key} = ${value}`);
          xhr.setRequestHeader(key, value);
        });
      }

      xhr.onload = () => {
        console.log(`🔧 XMLHttpRequest response: status=${xhr.status}, statusText=${xhr.statusText}`);
        console.log(`🔧 XMLHttpRequest responseText length: ${xhr.responseText?.length || 0}`);

        const response = new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers({
            'content-type': xhr.getResponseHeader('content-type') || 'application/json'
          })
        });
        resolve(response);
      };

      xhr.onerror = (event) => {
        console.error(`🔧 XMLHttpRequest error:`, event);
        reject(new TypeError('Network request failed via XMLHttpRequest'));
      };

      xhr.ontimeout = () => {
        console.error(`🔧 XMLHttpRequest timeout after ${xhr.timeout}ms`);
        reject(new TypeError('Network request timed out via XMLHttpRequest'));
      };

      xhr.onabort = () => {
        console.error(`🔧 XMLHttpRequest aborted`);
        reject(new TypeError('Network request aborted via XMLHttpRequest'));
      };

      // Set reasonable timeout for XMLHttpRequest fallback
      xhr.timeout = 15000; // 15 seconds

      // Send request
      console.log(`��� Sending XMLHttpRequest with method=${method}, body=${options.body ? 'present' : 'none'}`);
      if (options.body) {
        xhr.send(options.body as string);
      } else {
        xhr.send();
      }
    });
  }

  constructor() {
    // Intelligent FullStory detection for all environments
    const currentUrl = window.location.href;
    const isProduction = currentUrl.includes('fly.dev') || currentUrl.includes('.app') || !currentUrl.includes('localhost');

    // In production environments, be very aggressive about FullStory detection
    if (isProduction) {
      console.log(`🚨 Production environment detected: ${currentUrl}`);
      console.log(`🚨 Pre-emptively enabling XMLHttpRequest fallback for production`);
      this.hasDetectedFetchInterference = true;
    } else {
      // Always run detection, but be more aggressive in production
      this.detectBrowserInterference();
    }

    // Additional logging for debugging
    console.log(`🔍 MySQLBusinessDataService initialized`);
    console.log(`🔍 Current URL: ${currentUrl}`);
    console.log(`🔍 Is production: ${isProduction}`);
    console.log(`🔍 FullStory interference detected: ${this.hasDetectedFetchInterference}`);

    if (this.hasDetectedFetchInterference) {
      console.log(`🚨 Will use XMLHttpRequest fallback for FullStory-affected requests`);
    } else {
      console.log(`✅ Will try normal fetch first with fast FullStory detection`);
    }
  }

  public static getInstance(): MySQLBusinessDataService {
    if (!MySQLBusinessDataService.instance) {
      MySQLBusinessDataService.instance = new MySQLBusinessDataService();
    }
    return MySQLBusinessDataService.instance;
  }

  // Detect if browser extensions or third-party scripts are interfering with fetch
  private detectBrowserInterference(): void {
    try {
      console.log('🔍 Starting browser interference detection...');

      // Check if fetch has been modified
      const fetchString = window.fetch.toString();
      const isNativeFetch = fetchString.includes('[native code]');
      console.log('🔍 Fetch function string (first 100 chars):', fetchString.substring(0, 100));
      console.log('🔍 Is native fetch:', isNativeFetch);

      // Check for known third-party scripts that can interfere
      const hasFullStory = !!window.FS || !!document.querySelector('script[src*="fullstory"]') || !!document.querySelector('script[src*="fs.js"]');
      const hasIntercom = !!window.Intercom;
      const hasHotjar = !!window.hj;
      const hasGoogleTagManager = !!window.gtag || !!window.google_tag_manager;

      console.log('🔍 Third-party script detection:', {
        nativeFetch: isNativeFetch,
        fullStory: hasFullStory,
        intercom: hasIntercom,
        hotjar: hasHotjar,
        gtm: hasGoogleTagManager
      });

      // Be more aggressive about detecting FullStory
      const userAgent = navigator.userAgent;
      const currentUrl = window.location.href;

      // Check for FullStory in multiple ways
      const hasFullStoryWindow = !!window.FS;
      const hasFullStoryScript = !!document.querySelector('script[src*="fullstory"]') || !!document.querySelector('script[src*="fs.js"]');
      const hasFullStoryInUrl = currentUrl.includes('fullstory');
      const hasFullStoryInFetch = fetchString.includes('fullstory') || fetchString.includes('fs.js');

      // Since the error traces clearly show FullStory, let's also check for eval contexts
      const hasEvalContext = fetchString.includes('eval') || fetchString.includes('messageHandler');

      const isLikelyFullStoryPresent = hasFullStoryWindow || hasFullStoryScript || hasFullStoryInUrl || hasFullStoryInFetch || hasEvalContext;

      console.log('🔍 FullStory comprehensive detection:', {
        hasFullStoryWindow,
        hasFullStoryScript,
        hasFullStoryInUrl,
        hasFullStoryInFetch,
        hasEvalContext,
        overall: isLikelyFullStoryPresent
      });

      // Check for production environment where FullStory is likely present
      const isProductionWithFullStory = currentUrl.includes('fly.dev') || currentUrl.includes('fullstory');

      // Be more conservative - only detect interference if we have strong evidence
      if (!isNativeFetch || hasFullStory || isLikelyFullStoryPresent) {
        this.hasDetectedFetchInterference = true;
        console.warn('🚨 Detected definite fetch interference from:', {
          nativeFetch: isNativeFetch,
          fullStory: hasFullStory,
          fullStoryAggressive: isLikelyFullStoryPresent
        });
        console.warn('🚨 Will use fallback strategy for network requests');
      } else if (isProductionWithFullStory) {
        console.log('🔍 Production environment detected, will monitor for FullStory interference');
        // Don't pre-emptively set interference flag, let runtime detection handle it
      } else {
        console.log('✅ No interference detected, using native fetch');
      }
    } catch (error) {
      console.warn('⚠️ Could not detect browser interference:', error);
      // Default to safe mode if detection fails
      this.hasDetectedFetchInterference = true;
      console.warn('⚠️ Defaulting to XMLHttpRequest fallback due to detection error');
    }
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
      console.log(`🔄 Request options being sent:`, JSON.stringify(requestOptions, null, 2));

      // Add a small delay to prevent rapid successive calls
      if (endpoint === '/dashboard/metrics') {
        console.log(`⏱��� Adding small delay for dashboard metrics to prevent race conditions...`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Use robust fetch to avoid third-party interference
      const response = await this.robustFetch(url, requestOptions);

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

      // Provide more specific error information for network failures
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error(`🌐 Network error for ${endpoint}: This usually indicates:`);
        console.error(`   - Server is unreachable`);
        console.error(`   - CORS policy blocked the request`);
        console.error(`   - Network connection issues`);
        console.error(`   - Server endpoint doesn't exist`);
        console.error(`🔍 Attempted URL: ${url}`);
        console.error(`🏢 Company ID: ${requestOptions.headers['x-company-id']}`);
      }

      throw error;
    }
  }

  // Customer methods
  public getCustomers(): Promise<Customer[]> {
    console.log("MySQLBusinessDataService: getCustomers() called");
    return this.apiCall("/customers")
      .then((response) => {
        console.log(
          "MySQLBusinessDataService: customers API response:",
          response,
        );

        if (!response.success) {
          throw new Error(response.error || "Failed to fetch customers");
        }

        const customers = Array.isArray(response.data) ? response.data : [];

        console.log(
          "MySQLBusinessDataService: transformed customers:",
          customers,
        );

        return customers;
      })
      .catch((error) => {
        console.error(
          "MySQLBusinessDataService: Failed to fetch customers:",
          error,
        );
        throw error;
      });
  }

  public async getCustomer(id: string): Promise<Customer | null> {
    try {
      const response = await this.apiCall(`/customers/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Failed to fetch customer ${id}:`, error);
      return null;
    }
  }

  public async createCustomer(customer: Partial<Customer>): Promise<Customer> {
    try {
      const response = await this.apiCall("/customers", {
        method: "POST",
        body: JSON.stringify(customer),
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create customer");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create customer:", error);
      throw error;
    }
  }

  public async updateCustomer(
    id: string,
    customer: Partial<Customer>,
  ): Promise<Customer> {
    try {
      const response = await this.apiCall(`/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(customer),
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to update customer");
      }

      return response.data;
    } catch (error) {
      console.error(`Failed to update customer ${id}:`, error);
      throw error;
    }
  }

  public async deleteCustomer(id: string): Promise<boolean> {
    try {
      const response = await this.apiCall(`/customers/${id}`, {
        method: "DELETE",
      });
      return response.success;
    } catch (error) {
      console.error(`Failed to delete customer ${id}:`, error);
      return false;
    }
  }

  // Product methods
  public getProducts(): Promise<Product[]> {
    console.log("MySQLBusinessDataService: getProducts() called");
    return this.apiCall("/products")
      .then((response) => {
        console.log("MySQLBusinessDataService: API response:", response);
        const products = Array.isArray(response.data) ? response.data : [];
        console.log(
          "MySQLBusinessDataService: returning products:",
          products,
        );
        return products;
      })
      .catch((error) => {
        console.error(
          "MySQLBusinessDataService: Failed to fetch products:",
          error,
        );
        throw error;
      });
  }

  public async getProduct(id: string): Promise<Product | null> {
    try {
      const response = await this.apiCall(`/products/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      return null;
    }
  }

  public async getLowStockProducts(): Promise<Product[]> {
    try {
      const response = await this.apiCall("/products/low-stock");
      return response.success ? response.data : [];
    } catch (error) {
      console.error("Failed to fetch low stock products:", error);
      return [];
    }
  }

  public async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await this.apiCall(`/products/search?q=${encodeURIComponent(query)}`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error("Failed to search products:", error);
      return [];
    }
  }

  public async createProduct(product: Partial<Product>): Promise<Product> {
    try {
      const response = await this.apiCall("/products", {
        method: "POST",
        body: JSON.stringify(product),
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create product");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error;
    }
  }

  public async updateProduct(
    id: string,
    product: Partial<Product>,
  ): Promise<Product> {
    try {
      const response = await this.apiCall(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(product),
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to update product");
      }

      return response.data;
    } catch (error) {
      console.error(`Failed to update product ${id}:`, error);
      throw error;
    }
  }

  public async deleteProduct(id: string): Promise<boolean> {
    try {
      const response = await this.apiCall(`/products/${id}`, {
        method: "DELETE",
      });
      return response.success;
    } catch (error) {
      console.error(`Failed to delete product ${id}:`, error);
      return false;
    }
  }

  // Categories
  public async getCategories(): Promise<ProductCategory[]> {
    try {
      const response = await this.apiCall("/categories");
      return response.success ? response.data : [];
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return [];
    }
  }

  public async createCategory(category: Partial<ProductCategory>): Promise<ProductCategory> {
    try {
      const response = await this.apiCall("/categories", {
        method: "POST",
        body: JSON.stringify(category),
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create category");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  }

  // Invoice methods
  public async getInvoices(): Promise<Invoice[]> {
    try {
      const response = await this.apiCall("/invoices");
      return response.success ? response.data : [];
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      return [];
    }
  }

  public async getInvoice(id: string): Promise<Invoice | null> {
    try {
      const response = await this.apiCall(`/invoices/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Failed to fetch invoice ${id}:`, error);
      return null;
    }
  }

  public async createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
    try {
      const response = await this.apiCall("/invoices", {
        method: "POST",
        body: JSON.stringify(invoice),
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create invoice");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create invoice:", error);
      throw error;
    }
  }

  // Quotation methods
  public async getQuotations(): Promise<Quotation[]> {
    try {
      console.log("🔍 MySQLBusinessDataService.getQuotations() called");
      const response = await this.apiCall("/quotations");
      console.log("🔍 Quotations API response:", response);

      if (!response.success) {
        console.error("🔍 Quotations API failed:", response.error);
        throw new Error(response.error || "Failed to fetch quotations");
      }

      const quotations = Array.isArray(response.data) ? response.data : [];
      console.log("🔍 Returning quotations:", quotations);
      return quotations;
    } catch (error) {
      console.error("🔍 MySQLBusinessDataService.getQuotations() error:", error);
      throw error;
    }
  }

  public async getQuotation(id: string): Promise<Quotation | null> {
    try {
      const response = await this.apiCall(`/quotations/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Failed to fetch quotation ${id}:`, error);
      return null;
    }
  }

  public async createQuotation(quotation: Partial<Quotation>): Promise<Quotation> {
    try {
      const response = await this.apiCall("/quotations", {
        method: "POST",
        body: JSON.stringify(quotation),
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create quotation");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create quotation:", error);
      throw error;
    }
  }

  public async updateQuotation(
    id: string,
    quotation: Partial<Quotation>,
  ): Promise<Quotation> {
    try {
      const response = await this.apiCall(`/quotations/${id}`, {
        method: "PUT",
        body: JSON.stringify(quotation),
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to update quotation");
      }

      return response.data;
    } catch (error) {
      console.error(`Failed to update quotation ${id}:`, error);
      throw error;
    }
  }

  public async deleteQuotation(id: string): Promise<boolean> {
    try {
      const response = await this.apiCall(`/quotations/${id}`, {
        method: "DELETE",
      });
      return response.success;
    } catch (error) {
      console.error(`Failed to delete quotation ${id}:`, error);
      return false;
    }
  }

  // Proforma Invoice methods
  public async getProformaInvoices(): Promise<ProformaInvoice[]> {
    try {
      const response = await this.apiCall("/proformas");
      return response.success ? response.data : [];
    } catch (error) {
      console.error("Failed to fetch proforma invoices:", error);
      return [];
    }
  }

  public async getProformaInvoice(id: string): Promise<ProformaInvoice | null> {
    try {
      const response = await this.apiCall(`/proformas/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Failed to fetch proforma invoice ${id}:`, error);
      return null;
    }
  }

  public async createProformaInvoice(
    proforma: Partial<ProformaInvoice>,
  ): Promise<ProformaInvoice> {
    try {
      const response = await this.apiCall("/proformas", {
        method: "POST",
        body: JSON.stringify(proforma),
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create proforma invoice");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create proforma invoice:", error);
      throw error;
    }
  }

  public async updateProformaInvoice(
    id: string,
    proforma: Partial<ProformaInvoice>,
  ): Promise<ProformaInvoice> {
    try {
      const response = await this.apiCall(`/proformas/${id}`, {
        method: "PUT",
        body: JSON.stringify(proforma),
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to update proforma invoice");
      }

      return response.data;
    } catch (error) {
      console.error(`Failed to update proforma invoice ${id}:`, error);
      throw error;
    }
  }

  public async deleteProformaInvoice(id: string): Promise<boolean> {
    try {
      const response = await this.apiCall(`/proformas/${id}`, {
        method: "DELETE",
      });
      return response.success;
    } catch (error) {
      console.error(`Failed to delete proforma invoice ${id}:`, error);
      return false;
    }
  }

  // Payment methods
  public async getPayments(): Promise<Payment[]> {
    try {
      const response = await this.apiCall("/payments");
      return response.success ? response.data : [];
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      return [];
    }
  }

  public async getPayment(id: string): Promise<Payment | null> {
    try {
      const response = await this.apiCall(`/payments/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Failed to fetch payment ${id}:`, error);
      return null;
    }
  }

  public async createPayment(payment: Partial<Payment>): Promise<Payment> {
    try {
      const response = await this.apiCall("/payments", {
        method: "POST",
        body: JSON.stringify(payment),
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create payment");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create payment:", error);
      throw error;
    }
  }

  // Sample data creation
  public async createSampleData(): Promise<void> {
    try {
      const response = await this.apiCall("/create-sample-direct", {
        method: "POST",
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create sample data");
      }

      console.log("✅ Sample data created successfully");
    } catch (error) {
      console.error("❌ Failed to create sample data:", error);
      throw error;
    }
  }

  // Dashboard methods
  public async getDashboardMetrics(): Promise<DashboardMetrics> {
    // Prevent concurrent calls by returning the existing promise
    if (this.dashboardMetricsPromise) {
      console.log("🔄 Dashboard metrics call already in progress, waiting for existing call...");
      try {
        return await this.dashboardMetricsPromise;
      } catch (error) {
        // Reset the promise on error so we can retry
        this.dashboardMetricsPromise = null;
        throw error;
      }
    }

    // Create and cache the promise
    this.dashboardMetricsPromise = this.getDashboardMetricsInternal();

    try {
      const result = await this.dashboardMetricsPromise;
      // Clear the promise on success so future calls can be made
      this.dashboardMetricsPromise = null;
      return result;
    } catch (error) {
      // Clear the promise on error so we can retry
      this.dashboardMetricsPromise = null;
      throw error;
    }
  }

  private async getDashboardMetricsInternal(): Promise<DashboardMetrics> {
    try {
      console.log("🔍 Starting getDashboardMetrics call...");

      // First test basic connectivity
      const connectivityTest = await this.testBasicConnectivity();
      console.log("🧪 Basic connectivity test result:", connectivityTest);

      // Also test health endpoint
      try {
        console.log("🏥 Testing health endpoint...");
        const healthResponse = await this.apiCall("/health");
        console.log("🏥 Health endpoint response:", healthResponse);
      } catch (healthError) {
        console.error("���� Health endpoint failed:", healthError);
      }

      if (!connectivityTest) {
        console.warn("⚠️ Basic connectivity test failed, but proceeding with dashboard metrics call...");
      }

      console.log("🔄 Making dashboard metrics API call...");
      let response;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          response = await this.apiCall("/dashboard/metrics");
          break; // Success, exit retry loop
        } catch (error) {
          retryCount++;
          console.log(`⚠️ Dashboard metrics API call failed (attempt ${retryCount}/${maxRetries}):`, error.message);

          if (retryCount >= maxRetries) {
            throw error; // Re-throw the error after max retries
          }

          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
          console.log(`🔄 Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      console.log("✅ Dashboard metrics response received:", response);

      if (!response || !response.data) {
        console.error("❌ Invalid response structure:", response);
        throw new Error("Invalid response structure from dashboard metrics API");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch dashboard metrics:", error);
      console.error("❌ Error type:", typeof error);
      console.error("❌ Error constructor:", error.constructor?.name);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);

      // Log additional diagnostic information
      console.error("🔍 Diagnostic information:");
      console.error("   - Current URL:", window.location.href);
      console.error("   - Base URL:", this.baseUrl);
      console.error("   - Has fetch interference:", this.hasDetectedFetchInterference);
      console.error("   - User agent:", navigator.userAgent);
      console.error("   - Connection type:", (navigator as any).connection?.effectiveType || 'unknown');

      // Check if this is specifically a "Failed to fetch" error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error("🚨 This is a 'Failed to fetch' error - likely network or CORS issue");

        // Try one more time with a direct XMLHttpRequest approach
        try {
          console.log("🔄 Attempting final XMLHttpRequest fallback...");
          const fallbackResponse = await this.xmlHttpRequestFetch(`${this.baseUrl}/dashboard/metrics`, {
            headers: {
              "Content-Type": "application/json",
              "x-company-id": localStorage.getItem("user_data")
                ? JSON.parse(localStorage.getItem("user_data")!).companyId
                : "00000000-0000-0000-0000-000000000001"
            }
          });

          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            console.log("✅ XMLHttpRequest fallback succeeded!");
            return data.data || data;
          }
        } catch (fallbackError) {
          console.error("❌ XMLHttpRequest fallback also failed:", fallbackError);
        }
      }

      // Throw a more descriptive error for better error handling upstream
      throw new Error(`Failed to fetch dashboard metrics from database: ${error.message}`);
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

  public async createSupplier(supplier: Partial<Supplier>): Promise<Supplier> {
    try {
      const response = await this.apiCall("/suppliers", {
        method: "POST",
        body: JSON.stringify(supplier),
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create supplier");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create supplier:", error);
      throw error;
    }
  }

  public async updateSupplier(
    id: string,
    supplier: Partial<Supplier>,
  ): Promise<Supplier> {
    try {
      const response = await this.apiCall(`/suppliers/${id}`, {
        method: "PUT",
        body: JSON.stringify(supplier),
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to update supplier");
      }

      return response.data;
    } catch (error) {
      console.error(`Failed to update supplier ${id}:`, error);
      throw error;
    }
  }

  public async deleteSupplier(id: string): Promise<boolean> {
    try {
      const response = await this.apiCall(`/suppliers/${id}`, {
        method: "DELETE",
      });
      return response.success;
    } catch (error) {
      console.error(`Failed to delete supplier ${id}:`, error);
      return false;
    }
  }

  // Activity log
  public async getActivityLog(limit: number = 50): Promise<any[]> {
    try {
      const response = await this.apiCall(`/activity-log?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch activity log:", error);
      return [];
    }
  }

  // Stock movements
  public async getStockMovements(
    productId?: string,
    limit: number = 50,
  ): Promise<any[]> {
    try {
      const url = productId
        ? `/stock-movements?productId=${productId}&limit=${limit}`
        : `/stock-movements?limit=${limit}`;
      const response = await this.apiCall(url);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch stock movements:", error);
      return [];
    }
  }

  // Customer statement
  public async getCustomerStatement(
    customerId: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<any> {
    try {
      let url = `/statement?customerId=${customerId}`;
      if (fromDate) url += `&fromDate=${fromDate}`;
      if (toDate) url += `&toDate=${toDate}`;

      const response = await this.apiCall(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch customer statement:", error);
      return null;
    }
  }

  // Credit notes
  public async getCreditNotes(): Promise<any[]> {
    try {
      const response = await this.apiCall("/credit-notes");
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch credit notes:", error);
      return [];
    }
  }

  public async getCreditNote(id: string): Promise<any | null> {
    try {
      const response = await this.apiCall(`/credit-notes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch credit note ${id}:`, error);
      return null;
    }
  }

  public async createCreditNote(creditNote: any): Promise<any> {
    try {
      const response = await this.apiCall("/credit-notes", {
        method: "POST",
        body: JSON.stringify(creditNote),
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create credit note");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create credit note:", error);
      throw error;
    }
  }
}

export default MySQLBusinessDataService;
