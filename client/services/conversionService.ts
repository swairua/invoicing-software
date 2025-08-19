import { Quotation, ProformaInvoice, Invoice, InvoiceItem } from '@shared/types';

export interface ConversionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class ConversionService {
  /**
   * Convert a quotation to a proforma invoice
   */
  static async convertQuotationToProforma(quotation: Quotation): Promise<ConversionResult> {
    try {
      const proforma: Partial<ProformaInvoice> = {
        proformaNumber: this.generateProformaNumber(),
        customerId: quotation.customerId,
        customer: quotation.customer,
        items: quotation.items,
        subtotal: quotation.subtotal,
        vatAmount: quotation.vatAmount,
        discountAmount: quotation.discountAmount,
        total: quotation.total,
        status: 'draft',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        issueDate: new Date(),
        notes: `Converted from quotation ${quotation.quoteNumber}`,
        companyId: quotation.companyId,
        createdBy: quotation.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // In a real application, this would make an API call
      
      return {
        success: true,
        data: proforma
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to convert quotation to proforma invoice'
      };
    }
  }

  /**
   * Convert a proforma invoice to a formal invoice
   */
  static async convertProformaToInvoice(proforma: ProformaInvoice): Promise<ConversionResult> {
    try {
      const invoice: Partial<Invoice> = {
        invoiceNumber: this.generateInvoiceNumber(),
        customerId: proforma.customerId,
        customer: proforma.customer,
        items: proforma.items,
        subtotal: proforma.subtotal,
        vatAmount: proforma.vatAmount,
        discountAmount: proforma.discountAmount,
        total: proforma.total,
        amountPaid: 0,
        balance: proforma.total,
        status: 'draft',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        issueDate: new Date(),
        notes: `Converted from proforma ${proforma.proformaNumber}`,
        etimsStatus: 'pending',
        companyId: proforma.companyId,
        createdBy: proforma.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // In a real application, this would make an API call
      
      return {
        success: true,
        data: invoice
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to convert proforma to invoice'
      };
    }
  }

  /**
   * Convert a quotation directly to an invoice (skip proforma)
   */
  static async convertQuotationToInvoice(quotation: Quotation): Promise<ConversionResult> {
    try {
      const invoice: Partial<Invoice> = {
        invoiceNumber: this.generateInvoiceNumber(),
        customerId: quotation.customerId,
        customer: quotation.customer,
        items: quotation.items,
        subtotal: quotation.subtotal,
        vatAmount: quotation.vatAmount,
        discountAmount: quotation.discountAmount,
        total: quotation.total,
        amountPaid: 0,
        balance: quotation.total,
        status: 'draft',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        issueDate: new Date(),
        notes: `Converted from quotation ${quotation.quoteNumber}`,
        etimsStatus: 'pending',
        companyId: quotation.companyId,
        createdBy: quotation.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // In a real application, this would make an API call
      
      return {
        success: true,
        data: invoice
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to convert quotation to invoice'
      };
    }
  }

  /**
   * Generate a unique proforma number
   */
  private static generateProformaNumber(): string {
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PRO-${year}-${sequence}`;
  }

  /**
   * Generate a unique invoice number
   */
  private static generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}-${sequence}`;
  }

  /**
   * Check if a quotation can be converted
   */
  static canConvertQuotation(quotation: Quotation): boolean {
    return quotation.status === 'accepted' && 
           quotation.validUntil > new Date() && 
           quotation.items.length > 0;
  }

  /**
   * Check if a proforma can be converted
   */
  static canConvertProforma(proforma: ProformaInvoice): boolean {
    return proforma.status === 'sent' && 
           proforma.validUntil > new Date() && 
           proforma.items.length > 0;
  }

  /**
   * Get conversion options for a document
   */
  static getConversionOptions(documentType: 'quotation' | 'proforma', document: Quotation | ProformaInvoice) {
    const options = [];

    if (documentType === 'quotation' && this.canConvertQuotation(document as Quotation)) {
      options.push({
        label: 'Convert to Proforma',
        action: 'convert_to_proforma',
        description: 'Create a proforma invoice for advance billing'
      });
      options.push({
        label: 'Convert to Invoice',
        action: 'convert_to_invoice',
        description: 'Create a formal invoice directly'
      });
    }

    if (documentType === 'proforma' && this.canConvertProforma(document as ProformaInvoice)) {
      options.push({
        label: 'Convert to Invoice',
        action: 'convert_to_invoice',
        description: 'Create a formal invoice from this proforma'
      });
    }

    return options;
  }
}

export default ConversionService;
