import { 
  Customer, Product, Invoice, Quotation, ProformaInvoice, Payment, 
  PurchaseOrder, DeliveryNote, PackingList, CreditNote, StockMovement,
  DashboardMetrics, InvoiceItem, Supplier
} from '@shared/types';

// Live simulation data with realistic business operations
class BusinessDataService {
  private static instance: BusinessDataService;
  private customers: Customer[] = [];
  private products: Product[] = [];
  private invoices: Invoice[] = [];
  private quotations: Quotation[] = [];
  private proformas: ProformaInvoice[] = [];
  private payments: Payment[] = [];
  private purchaseOrders: PurchaseOrder[] = [];
  private deliveryNotes: DeliveryNote[] = [];
  private packingLists: PackingList[] = [];
  private creditNotes: CreditNote[] = [];
  private stockMovements: StockMovement[] = [];
  private suppliers: Supplier[] = [];
  
  // Simulation state
  private isSimulating = false;
  private simulationInterval: NodeJS.Timeout | null = null;
  
  public static getInstance(): BusinessDataService {
    if (!BusinessDataService.instance) {
      BusinessDataService.instance = new BusinessDataService();
    }
    return BusinessDataService.instance;
  }

  constructor() {
    this.initializeBaseData();
  }

  private initializeBaseData() {
    // Initialize customers
    this.customers = [
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
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
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
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '3',
        name: 'Safaricom PLC',
        email: 'supplier@safaricom.co.ke',
        phone: '+254700000000',
        kraPin: 'P051234569C',
        address: 'Safaricom House, Waiyaki Way',
        creditLimit: 1000000,
        balance: 250000,
        isActive: true,
        companyId: '1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '4',
        name: 'Kenya Medical Centre',
        email: 'procurement@kmc.co.ke',
        phone: '+254733111222',
        kraPin: 'P051234570D',
        address: 'Upper Hill, Nairobi',
        creditLimit: 750000,
        balance: 89000,
        isActive: true,
        companyId: '1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    // Initialize suppliers
    this.suppliers = [
      {
        id: '1',
        name: 'Medical Supplies International',
        email: 'orders@medisupplies.com',
        phone: '+254700555666',
        kraPin: 'P051234580E',
        address: 'Industrial Area, Nairobi',
        balance: 150000,
        isActive: true,
        companyId: '1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '2',
        name: 'Office Furniture Solutions',
        email: 'sales@officefurniture.co.ke',
        phone: '+254722333444',
        kraPin: 'P051234581F',
        address: 'Mombasa Road, Nairobi',
        balance: 89000,
        isActive: true,
        companyId: '1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    // Initialize products
    this.products = [
      {
        id: '1',
        name: 'Latex Rubber Gloves Bicolor Reusable XL',
        description: 'High-quality latex rubber gloves for medical and industrial use',
        sku: 'LRG-001',
        barcode: '1234567890123',
        category: 'Medical Supplies',
        subcategory: 'Personal Protective Equipment',
        brand: 'MediSafe',
        supplier: 'Medical Supplies International',
        unit: 'Pair',
        weight: 0.05,
        dimensions: { length: 30, width: 12, height: 2, unit: 'cm' },
        purchasePrice: 400,
        sellingPrice: 500,
        markup: 25,
        costPrice: 350,
        wholesalePrice: 450,
        retailPrice: 500,
        minStock: 50,
        maxStock: 1000,
        currentStock: 450,
        reservedStock: 0,
        availableStock: 450,
        reorderLevel: 100,
        location: 'Warehouse A',
        binLocation: 'A-1-001',
        tags: ['medical', 'protective', 'reusable'],
        taxable: false,
        taxRate: 0,
        trackInventory: true,
        allowBackorders: true,
        hasVariants: true,
        variants: [
          { id: '1', name: 'Size S', sku: 'LRG-001-S', attributes: { size: 'Small' }, price: 480, stock: 100, isActive: true },
          { id: '2', name: 'Size M', sku: 'LRG-001-M', attributes: { size: 'Medium' }, price: 490, stock: 150, isActive: true },
          { id: '3', name: 'Size L', sku: 'LRG-001-L', attributes: { size: 'Large' }, price: 500, stock: 120, isActive: true },
          { id: '4', name: 'Size XL', sku: 'LRG-001-XL', attributes: { size: 'Extra Large' }, price: 520, stock: 80, isActive: true }
        ],
        images: ['/products/latex-gloves-1.jpg', '/products/latex-gloves-2.jpg'],
        notes: 'Popular item with consistent demand',
        isActive: true,
        status: 'active',
        companyId: '1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '2',
        name: 'Executive Office Chair with Lumbar Support',
        description: 'Ergonomic executive chair with adjustable lumbar support and armrests',
        sku: 'EOC-002',
        barcode: '2345678901234',
        category: 'Office Furniture',
        subcategory: 'Seating',
        brand: 'ComfortDesk',
        supplier: 'Office Furniture Solutions',
        unit: 'piece',
        weight: 25,
        dimensions: { length: 70, width: 70, height: 120, unit: 'cm' },
        purchasePrice: 12000,
        sellingPrice: 18000,
        markup: 50,
        costPrice: 10500,
        wholesalePrice: 15000,
        retailPrice: 18000,
        minStock: 5,
        maxStock: 50,
        currentStock: 12,
        reservedStock: 2,
        availableStock: 10,
        reorderLevel: 8,
        location: 'Warehouse B',
        binLocation: 'B-2-005',
        tags: ['furniture', 'office', 'ergonomic'],
        taxable: true,
        taxRate: 16,
        trackInventory: true,
        allowBackorders: false,
        hasVariants: true,
        variants: [
          { id: '1', name: 'Black Leather', sku: 'EOC-002-BL', attributes: { color: 'Black', material: 'Leather' }, price: 18000, stock: 8, isActive: true },
          { id: '2', name: 'Brown Leather', sku: 'EOC-002-BR', attributes: { color: 'Brown', material: 'Leather' }, price: 18500, stock: 4, isActive: true }
        ],
        images: ['/products/office-chair-1.jpg', '/products/office-chair-2.jpg'],
        notes: 'High-margin product, popular with corporate clients',
        isActive: true,
        status: 'active',
        companyId: '1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '3',
        name: 'Digital Blood Pressure Monitor',
        description: 'Automatic digital blood pressure monitor with memory function',
        sku: 'DBP-003',
        barcode: '3456789012345',
        category: 'Medical Equipment',
        subcategory: 'Diagnostic Equipment',
        brand: 'HealthTech',
        supplier: 'Medical Supplies International',
        unit: 'piece',
        weight: 1.2,
        dimensions: { length: 15, width: 10, height: 8, unit: 'cm' },
        purchasePrice: 4500,
        sellingPrice: 6500,
        markup: 44,
        costPrice: 4200,
        wholesalePrice: 5800,
        retailPrice: 6500,
        minStock: 10,
        maxStock: 100,
        currentStock: 35,
        reservedStock: 5,
        availableStock: 30,
        reorderLevel: 15,
        location: 'Warehouse A',
        binLocation: 'A-3-012',
        tags: ['medical', 'diagnostic', 'digital'],
        taxable: false,
        taxRate: 0,
        trackInventory: true,
        allowBackorders: true,
        hasVariants: false,
        variants: [],
        images: ['/products/bp-monitor-1.jpg'],
        notes: 'Medical equipment exempt from VAT',
        isActive: true,
        status: 'active',
        companyId: '1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '4',
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium wireless headphones with noise cancellation',
        sku: 'WBH-004',
        barcode: '4567890123456',
        category: 'Electronics',
        subcategory: 'Audio Equipment',
        brand: 'SoundMax',
        supplier: '',
        unit: 'piece',
        weight: 0.3,
        dimensions: { length: 20, width: 18, height: 8, unit: 'cm' },
        purchasePrice: 3500,
        sellingPrice: 5500,
        markup: 57,
        costPrice: 3200,
        wholesalePrice: 4800,
        retailPrice: 5500,
        minStock: 20,
        maxStock: 200,
        currentStock: 85,
        reservedStock: 10,
        availableStock: 75,
        reorderLevel: 30,
        location: 'Warehouse C',
        binLocation: 'C-1-008',
        tags: ['electronics', 'audio', 'wireless'],
        taxable: true,
        taxRate: 16,
        trackInventory: true,
        allowBackorders: true,
        hasVariants: true,
        variants: [
          { id: '1', name: 'Black', sku: 'WBH-004-BK', attributes: { color: 'Black' }, price: 5500, stock: 50, isActive: true },
          { id: '2', name: 'White', sku: 'WBH-004-WH', attributes: { color: 'White' }, price: 5500, stock: 35, isActive: true }
        ],
        images: ['/products/headphones-1.jpg', '/products/headphones-2.jpg'],
        isActive: true,
        status: 'active',
        companyId: '1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '5',
        name: 'Surgical Face Masks (Box of 50)',
        description: '3-layer disposable surgical face masks, medical grade',
        sku: 'SFM-005',
        barcode: '5678901234567',
        category: 'Medical Supplies',
        subcategory: 'Personal Protective Equipment',
        brand: 'MediSafe',
        supplier: 'Medical Supplies International',
        unit: 'Box',
        weight: 0.5,
        dimensions: { length: 20, width: 15, height: 5, unit: 'cm' },
        purchasePrice: 800,
        sellingPrice: 1200,
        markup: 50,
        costPrice: 750,
        wholesalePrice: 1000,
        retailPrice: 1200,
        minStock: 100,
        maxStock: 2000,
        currentStock: 45,
        reservedStock: 15,
        availableStock: 30,
        reorderLevel: 50,
        location: 'Warehouse A',
        binLocation: 'A-1-015',
        tags: ['medical', 'protective', 'disposable'],
        taxable: false,
        taxRate: 0,
        trackInventory: true,
        allowBackorders: false,
        hasVariants: false,
        variants: [],
        images: ['/products/face-masks-1.jpg'],
        notes: 'Low stock alert - reorder needed',
        isActive: true,
        status: 'active',
        companyId: '1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    this.initializeTransactionData();
  }

  private initializeTransactionData() {
    // Initialize some base quotations
    this.quotations = [
      {
        id: '1',
        quoteNumber: 'QUO-2024-001',
        customerId: '1',
        customer: this.customers[0],
        items: [
          { 
            id: '1', 
            productId: '1', 
            product: this.products[0], 
            quantity: 50, 
            unitPrice: 500, 
            discount: 0, 
            vatRate: 0, 
            total: 25000 
          }
        ],
        subtotal: 25000,
        vatAmount: 0,
        discountAmount: 0,
        total: 25000,
        status: 'sent',
        validUntil: new Date('2024-02-15'),
        issueDate: new Date('2024-01-15'),
        notes: 'Bulk order discount available for 100+ pieces',
        companyId: '1',
        createdBy: '1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        quoteNumber: 'QUO-2024-002',
        customerId: '2',
        customer: this.customers[1],
        items: [
          { 
            id: '2', 
            productId: '2', 
            product: this.products[1], 
            quantity: 5, 
            unitPrice: 18000, 
            discount: 5, 
            vatRate: 16, 
            total: 104040 
          }
        ],
        subtotal: 90000,
        vatAmount: 14400,
        discountAmount: 4500,
        total: 99900,
        status: 'accepted',
        validUntil: new Date('2024-02-20'),
        issueDate: new Date('2024-01-20'),
        notes: 'Installation and setup included in price',
        companyId: '1',
        createdBy: '1',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-22'),
      }
    ];

    // Initialize some proforma invoices
    this.proformas = [
      {
        id: '1',
        proformaNumber: 'PRO-2024-001',
        customerId: '3',
        customer: this.customers[2],
        items: [
          { 
            id: '1', 
            productId: '3', 
            product: this.products[2], 
            quantity: 10, 
            unitPrice: 6500, 
            discount: 0, 
            vatRate: 0, 
            total: 65000 
          }
        ],
        subtotal: 65000,
        vatAmount: 0,
        discountAmount: 0,
        total: 65000,
        status: 'sent',
        validUntil: new Date('2024-02-25'),
        issueDate: new Date('2024-01-25'),
        notes: 'Medical equipment - VAT exempt',
        companyId: '1',
        createdBy: '1',
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25'),
      }
    ];

    // Initialize some invoices
    this.invoices = [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        customerId: '1',
        customer: this.customers[0],
        items: [
          { 
            id: '1', 
            productId: '1', 
            product: this.products[0], 
            quantity: 24, 
            unitPrice: 500, 
            discount: 0, 
            vatRate: 0, 
            total: 12000 
          }
        ],
        subtotal: 12000,
        vatAmount: 0,
        discountAmount: 0,
        total: 12000,
        amountPaid: 12000,
        balance: 0,
        status: 'paid',
        dueDate: new Date('2024-02-18'),
        issueDate: new Date('2024-01-18'),
        notes: 'Payment received via M-Pesa',
        etimsStatus: 'accepted',
        etimsCode: 'ETIMS-001-2024',
        companyId: '1',
        createdBy: '1',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-19'),
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        customerId: '4',
        customer: this.customers[3],
        items: [
          { 
            id: '2', 
            productId: '5', 
            product: this.products[4], 
            quantity: 20, 
            unitPrice: 1200, 
            discount: 0, 
            vatRate: 0, 
            total: 24000 
          }
        ],
        subtotal: 24000,
        vatAmount: 0,
        discountAmount: 0,
        total: 24000,
        amountPaid: 12000,
        balance: 12000,
        status: 'sent',
        dueDate: new Date('2024-02-22'),
        issueDate: new Date('2024-01-22'),
        notes: 'Partial payment received, balance due',
        etimsStatus: 'accepted',
        etimsCode: 'ETIMS-002-2024',
        companyId: '1',
        createdBy: '1',
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-23'),
      }
    ];

    // Initialize some payments
    this.payments = [
      {
        id: '1',
        amount: 12000,
        method: 'mpesa',
        reference: 'QK81P2X9M',
        notes: 'Full payment for INV-2024-001',
        invoiceId: '1',
        customerId: '1',
        companyId: '1',
        createdBy: '1',
        createdAt: new Date('2024-01-19'),
      },
      {
        id: '2',
        amount: 12000,
        method: 'bank',
        reference: 'BT20240123001',
        notes: 'Partial payment for INV-2024-002',
        invoiceId: '2',
        customerId: '4',
        companyId: '1',
        createdBy: '1',
        createdAt: new Date('2024-01-23'),
      }
    ];
  }

  // Simulation methods
  public startSimulation() {
    if (this.isSimulating) return;
    
    this.isSimulating = true;
    this.simulationInterval = setInterval(() => {
      this.simulateBusinessActivity();
    }, 30000); // Every 30 seconds
    
    console.log('Business simulation started');
  }

  public stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isSimulating = false;
    console.log('Business simulation stopped');
  }

  private simulateBusinessActivity() {
    const activities = [
      'createRandomQuotation',
      'updateQuotationStatus',
      'convertQuotationToProforma',
      'convertProformaToInvoice',
      'processPayment',
      'updateStockLevels',
      'createPurchaseOrder'
    ];

    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
    try {
      switch (randomActivity) {
        case 'createRandomQuotation':
          this.createRandomQuotation();
          break;
        case 'updateQuotationStatus':
          this.updateRandomQuotationStatus();
          break;
        case 'convertQuotationToProforma':
          this.convertRandomQuotationToProforma();
          break;
        case 'convertProformaToInvoice':
          this.convertRandomProformaToInvoice();
          break;
        case 'processPayment':
          this.processRandomPayment();
          break;
        case 'updateStockLevels':
          this.updateRandomStockLevels();
          break;
        case 'createPurchaseOrder':
          this.createRandomPurchaseOrder();
          break;
      }
    } catch (error) {
      console.error('Simulation activity error:', error);
    }
  }

  private createRandomQuotation() {
    const customer = this.customers[Math.floor(Math.random() * this.customers.length)];
    const product = this.products[Math.floor(Math.random() * this.products.length)];
    const quantity = Math.floor(Math.random() * 20) + 1;
    const unitPrice = product.sellingPrice;
    const vatRate = product.taxable ? 16 : 0;
    const total = quantity * unitPrice;
    const vatAmount = total * (vatRate / 100);

    const newQuotation: Quotation = {
      id: Date.now().toString(),
      quoteNumber: `QUO-2024-${String(this.quotations.length + 1).padStart(3, '0')}`,
      customerId: customer.id,
      customer,
      items: [{
        id: '1',
        productId: product.id,
        product,
        quantity,
        unitPrice,
        discount: 0,
        vatRate,
        total: total + vatAmount
      }],
      subtotal: total,
      vatAmount,
      discountAmount: 0,
      total: total + vatAmount,
      status: 'draft',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      issueDate: new Date(),
      notes: 'Auto-generated quotation',
      companyId: '1',
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.quotations.unshift(newQuotation);
    console.log(`Created quotation ${newQuotation.quoteNumber} for ${customer.name}`);
  }

  private updateRandomQuotationStatus() {
    const pendingQuotations = this.quotations.filter(q => q.status === 'sent');
    if (pendingQuotations.length === 0) return;

    const quotation = pendingQuotations[Math.floor(Math.random() * pendingQuotations.length)];
    const statuses: Array<'accepted' | 'rejected'> = ['accepted', 'rejected'];
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

    quotation.status = newStatus;
    quotation.updatedAt = new Date();

    console.log(`Quotation ${quotation.quoteNumber} status updated to ${newStatus}`);
  }

  // Conversion methods
  public convertQuotationToProforma(quotationId: string): ProformaInvoice | null {
    const quotation = this.quotations.find(q => q.id === quotationId);
    if (!quotation || quotation.status !== 'accepted') return null;

    const proforma: ProformaInvoice = {
      id: Date.now().toString(),
      proformaNumber: `PRO-2024-${String(this.proformas.length + 1).padStart(3, '0')}`,
      customerId: quotation.customerId,
      customer: quotation.customer,
      items: quotation.items,
      subtotal: quotation.subtotal,
      vatAmount: quotation.vatAmount,
      discountAmount: quotation.discountAmount,
      total: quotation.total,
      status: 'draft',
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      issueDate: new Date(),
      notes: `Converted from quotation ${quotation.quoteNumber}`,
      companyId: '1',
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.proformas.unshift(proforma);
    
    // Update quotation status
    quotation.status = 'accepted';
    quotation.notes = `Converted to proforma ${proforma.proformaNumber}`;
    quotation.updatedAt = new Date();

    console.log(`Converted quotation ${quotation.quoteNumber} to proforma ${proforma.proformaNumber}`);
    return proforma;
  }

  public convertProformaToInvoice(proformaId: string): Invoice | null {
    const proforma = this.proformas.find(p => p.id === proformaId);
    if (!proforma || proforma.status !== 'sent') return null;

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-2024-${String(this.invoices.length + 1).padStart(3, '0')}`,
      customerId: proforma.customerId,
      customer: proforma.customer,
      items: proforma.items,
      subtotal: proforma.subtotal,
      vatAmount: proforma.vatAmount,
      discountAmount: proforma.discountAmount,
      total: proforma.total,
      amountPaid: 0,
      balance: proforma.total,
      status: 'sent',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      issueDate: new Date(),
      notes: `Converted from proforma ${proforma.proformaNumber}`,
      etimsStatus: 'pending',
      companyId: '1',
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.invoices.unshift(invoice);
    
    // Update proforma status
    proforma.status = 'converted';
    proforma.notes = `Converted to invoice ${invoice.invoiceNumber}`;
    proforma.updatedAt = new Date();

    // Update stock levels
    invoice.items.forEach(item => {
      const product = this.products.find(p => p.id === item.productId);
      if (product && product.trackInventory) {
        product.currentStock = Math.max(0, product.currentStock - item.quantity);
        product.availableStock = Math.max(0, (product.availableStock || product.currentStock) - item.quantity);
        
        // Create stock movement
        this.stockMovements.push({
          id: Date.now().toString() + Math.random(),
          productId: product.id,
          type: 'out',
          quantity: item.quantity,
          previousStock: product.currentStock + item.quantity,
          newStock: product.currentStock,
          reference: invoice.invoiceNumber,
          notes: 'Sale',
          createdBy: '1',
          createdAt: new Date()
        });
      }
    });

    console.log(`Converted proforma ${proforma.proformaNumber} to invoice ${invoice.invoiceNumber}`);
    return invoice;
  }

  public convertQuotationToInvoice(quotationId: string): Invoice | null {
    const quotation = this.quotations.find(q => q.id === quotationId);
    if (!quotation || quotation.status !== 'accepted') return null;

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-2024-${String(this.invoices.length + 1).padStart(3, '0')}`,
      customerId: quotation.customerId,
      customer: quotation.customer,
      items: quotation.items,
      subtotal: quotation.subtotal,
      vatAmount: quotation.vatAmount,
      discountAmount: quotation.discountAmount,
      total: quotation.total,
      amountPaid: 0,
      balance: quotation.total,
      status: 'sent',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      issueDate: new Date(),
      notes: `Converted from quotation ${quotation.quoteNumber}`,
      etimsStatus: 'pending',
      companyId: '1',
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.invoices.unshift(invoice);
    
    // Update quotation status
    quotation.status = 'accepted';
    quotation.notes = `Converted to invoice ${invoice.invoiceNumber}`;
    quotation.updatedAt = new Date();

    // Update stock levels
    invoice.items.forEach(item => {
      const product = this.products.find(p => p.id === item.productId);
      if (product && product.trackInventory) {
        product.currentStock = Math.max(0, product.currentStock - item.quantity);
        product.availableStock = Math.max(0, (product.availableStock || product.currentStock) - item.quantity);
        
        // Create stock movement
        this.stockMovements.push({
          id: Date.now().toString() + Math.random(),
          productId: product.id,
          type: 'out',
          quantity: item.quantity,
          previousStock: product.currentStock + item.quantity,
          newStock: product.currentStock,
          reference: invoice.invoiceNumber,
          notes: 'Direct sale from quotation',
          createdBy: '1',
          createdAt: new Date()
        });
      }
    });

    console.log(`Converted quotation ${quotation.quoteNumber} to invoice ${invoice.invoiceNumber}`);
    return invoice;
  }

  private convertRandomQuotationToProforma() {
    const acceptedQuotations = this.quotations.filter(q => q.status === 'accepted');
    if (acceptedQuotations.length === 0) return;

    const quotation = acceptedQuotations[Math.floor(Math.random() * acceptedQuotations.length)];
    this.convertQuotationToProforma(quotation.id);
  }

  private convertRandomProformaToInvoice() {
    const sentProformas = this.proformas.filter(p => p.status === 'sent');
    if (sentProformas.length === 0) return;

    const proforma = sentProformas[Math.floor(Math.random() * sentProformas.length)];
    this.convertProformaToInvoice(proforma.id);
  }

  private processRandomPayment() {
    const unpaidInvoices = this.invoices.filter(i => i.balance > 0);
    if (unpaidInvoices.length === 0) return;

    const invoice = unpaidInvoices[Math.floor(Math.random() * unpaidInvoices.length)];
    const paymentMethods: Array<'cash' | 'mpesa' | 'bank' | 'cheque' | 'card'> = ['cash', 'mpesa', 'bank', 'cheque', 'card'];
    const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    // Random payment amount (partial or full)
    const isFullPayment = Math.random() > 0.3; // 70% chance of full payment
    const paymentAmount = isFullPayment ? invoice.balance : Math.min(invoice.balance, Math.floor(Math.random() * invoice.balance) + 1000);

    this.processPayment(invoice.id, paymentAmount, method, 'AUTO' + Date.now());
  }

  public processPayment(invoiceId: string, amount: number, method: 'cash' | 'mpesa' | 'bank' | 'cheque' | 'card', reference: string, notes?: string): Payment | null {
    const invoice = this.invoices.find(i => i.id === invoiceId);
    if (!invoice || amount <= 0 || amount > invoice.balance) return null;

    const payment: Payment = {
      id: Date.now().toString(),
      amount,
      method,
      reference,
      notes: notes || `Payment for ${invoice.invoiceNumber}`,
      invoiceId,
      customerId: invoice.customerId,
      companyId: '1',
      createdBy: '1',
      createdAt: new Date(),
    };

    this.payments.unshift(payment);

    // Update invoice
    invoice.amountPaid += amount;
    invoice.balance -= amount;
    
    if (invoice.balance <= 0) {
      invoice.status = 'paid';
      invoice.balance = 0;
    }
    
    invoice.updatedAt = new Date();

    // Update customer balance
    const customer = this.customers.find(c => c.id === invoice.customerId);
    if (customer) {
      customer.balance = Math.max(0, customer.balance - amount);
      customer.updatedAt = new Date();
    }

    console.log(`Processed payment of ${amount} for invoice ${invoice.invoiceNumber}`);
    return payment;
  }

  private updateRandomStockLevels() {
    const product = this.products[Math.floor(Math.random() * this.products.length)];
    if (!product.trackInventory) return;

    const movementType = Math.random() > 0.3 ? 'in' : 'out'; // 70% chance of stock in
    const quantity = Math.floor(Math.random() * 50) + 1;
    const previousStock = product.currentStock;

    if (movementType === 'in') {
      product.currentStock += quantity;
      product.availableStock = (product.availableStock || product.currentStock) + quantity;
    } else {
      product.currentStock = Math.max(0, product.currentStock - quantity);
      product.availableStock = Math.max(0, (product.availableStock || product.currentStock) - quantity);
    }

    const movement: StockMovement = {
      id: Date.now().toString(),
      productId: product.id,
      type: movementType,
      quantity,
      previousStock,
      newStock: product.currentStock,
      reference: 'SIM-' + Date.now(),
      notes: movementType === 'in' ? 'Stock replenishment' : 'Stock adjustment',
      createdBy: '1',
      createdAt: new Date()
    };

    this.stockMovements.push(movement);
    product.updatedAt = new Date();

    console.log(`Stock ${movementType} for ${product.name}: ${quantity} units`);
  }

  private createRandomPurchaseOrder() {
    if (this.suppliers.length === 0) return;

    const supplier = this.suppliers[Math.floor(Math.random() * this.suppliers.length)];
    const productsToOrder = this.products.filter(p => p.currentStock <= p.reorderLevel);
    
    if (productsToOrder.length === 0) return;

    const product = productsToOrder[Math.floor(Math.random() * productsToOrder.length)];
    const quantity = Math.max(product.minStock - product.currentStock, 20);

    // Simulate creating a purchase order (not fully implemented in this example)
    console.log(`Created PO for ${quantity} units of ${product.name} from ${supplier.name}`);
  }

  // Getter methods for data access
  public getCustomers(): Promise<Customer[]> {
    return Promise.resolve([...this.customers]);
  }

  public getProducts(): Promise<Product[]> {
    return Promise.resolve([...this.products]);
  }

  public getInvoices(): Promise<Invoice[]> {
    return Promise.resolve([...this.invoices]);
  }

  public getQuotations(): Quotation[] {
    return [...this.quotations];
  }

  public getProformas(): ProformaInvoice[] {
    return [...this.proformas];
  }

  public getPayments(): Payment[] {
    return [...this.payments];
  }

  public getSuppliers(): Supplier[] {
    return [...this.suppliers];
  }

  public getStockMovements(): StockMovement[] {
    return [...this.stockMovements];
  }

  public getLowStockProducts(): Product[] {
    return this.products.filter(p => p.currentStock <= p.reorderLevel);
  }

  public getDashboardMetrics(): DashboardMetrics {
    const totalRevenue = this.invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const outstandingInvoices = this.invoices.reduce((sum, inv) => sum + inv.balance, 0);
    const lowStockAlerts = this.getLowStockProducts().length;
    const recentPayments = this.payments
      .filter(p => p.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalRevenue,
      outstandingInvoices,
      lowStockAlerts,
      recentPayments,
      salesTrend: this.generateSalesTrend(),
      topProducts: this.getTopProducts(),
      recentActivities: this.getRecentActivities()
    };
  }

  private generateSalesTrend(): Array<{ date: string; amount: number }> {
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const amount = Math.floor(Math.random() * 50000) + 10000;
      trends.push({
        date: date.toISOString().split('T')[0],
        amount
      });
    }
    return trends;
  }

  private getTopProducts(): Array<{ name: string; sales: number }> {
    return this.products
      .map(product => ({
        name: product.name,
        sales: Math.floor(Math.random() * 100000) + 10000
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }

  private getRecentActivities(): Array<{ id: string; type: string; description: string; timestamp: Date }> {
    const activities = [];
    const types = ['invoice', 'payment', 'quotation', 'stock'];
    
    for (let i = 0; i < 10; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      activities.push({
        id: `activity-${i}`,
        type,
        description: this.generateActivityDescription(type),
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      });
    }
    
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private generateActivityDescription(type: string): string {
    switch (type) {
      case 'invoice':
        return `New invoice INV-2024-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')} created`;
      case 'payment':
        return `Payment of KES ${(Math.floor(Math.random() * 50000) + 5000).toLocaleString()} received`;
      case 'quotation':
        return `Quotation QUO-2024-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')} sent to customer`;
      case 'stock':
        return `Stock updated for ${this.products[Math.floor(Math.random() * this.products.length)].name}`;
      default:
        return 'System activity';
    }
  }

  // Utility methods
  public getCustomerById(id: string): Customer | undefined {
    return this.customers.find(c => c.id === id);
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  public getInvoiceById(id: string): Invoice | undefined {
    return this.invoices.find(i => i.id === id);
  }

  public getQuotationById(id: string): Quotation | undefined {
    return this.quotations.find(q => q.id === id);
  }

  public getProformaById(id: string): ProformaInvoice | undefined {
    return this.proformas.find(p => p.id === id);
  }

  public isSimulationRunning(): boolean {
    return this.isSimulating;
  }
}

export default BusinessDataService;
