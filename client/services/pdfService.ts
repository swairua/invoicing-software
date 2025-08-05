import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Quotation, ProformaInvoice, Payment, DocumentTemplate, TemplateDesign } from '@shared/types';
import { CompanySettings, defaultCompanySettings } from '@shared/company';

export class PDFService {
  private static companySettings: CompanySettings = defaultCompanySettings;
  private static templates: Map<string, DocumentTemplate> = new Map();

  /**
   * Register a template for use
   */
  static registerTemplate(template: DocumentTemplate): void {
    const key = `${template.type}_${template.isActive ? 'active' : template.id}`;
    this.templates.set(key, template);
  }

  /**
   * Get active template for document type
   */
  static getActiveTemplate(type: string): DocumentTemplate | null {
    return this.templates.get(`${type}_active`) || null;
  }

  /**
   * Get template by ID
   */
  static getTemplate(id: string): DocumentTemplate | null {
    for (const template of this.templates.values()) {
      if (template.id === id) return template;
    }
    return null;
  }

  /**
   * Generate Invoice PDF matching the document design
   */
  static generateInvoicePDF(invoice: Invoice, download: boolean = true, templateId?: string): jsPDF {
    const template = templateId ? this.getTemplate(templateId) : this.getActiveTemplate('invoice');
    const design = template?.design;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Apply template colors if available
    if (design) {
      doc.setTextColor(design.colors.text);
    }

    // Company Logo and Header
    this.addCompanyHeader(doc, pageWidth, design);

    // Company Information
    this.addCompanyInfo(doc, pageWidth, design);

    // Invoice Title and Number
    doc.setFontSize(design?.fonts.size.heading || 16);
    doc.setFont(design?.fonts.heading || 'helvetica', 'bold');
    if (design?.colors.primary) {
      doc.setTextColor(design.colors.primary);
    }
    doc.text(`INVOICE NO. ${invoice.invoiceNumber}`, pageWidth / 2, 80, { align: 'center' });

    // Reset text color
    if (design?.colors.text) {
      doc.setTextColor(design.colors.text);
    }

    // Customer Information and Date
    this.addCustomerAndDateInfo(doc, invoice, pageWidth, design);

    // Invoice Items Table
    this.addInvoiceItemsTable(doc, invoice, design);

    // Terms and Conditions
    if (design?.footer.showTerms !== false) {
      this.addTermsAndConditions(doc, pageWidth, pageHeight, design);
    }

    // Signature Section
    if (design?.footer.showSignature !== false) {
      this.addSignatureSection(doc, pageWidth, pageHeight, design);
    }

    if (download) {
      doc.save(`${invoice.invoiceNumber}.pdf`);
    }

    return doc;
  }

  /**
   * Generate Quotation PDF
   */
  static generateQuotationPDF(quotation: Quotation, download: boolean = true): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Company Logo and Header
    this.addCompanyHeader(doc, pageWidth);

    // Company Information
    this.addCompanyInfo(doc, pageWidth);

    // Quotation Title and Number
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`QUOTATION NO. ${quotation.quoteNumber}`, pageWidth / 2, 80, { align: 'center' });

    // Customer Information and Date
    this.addCustomerAndDateInfo(doc, quotation, pageWidth);

    // Quote Items Table
    this.addQuoteItemsTable(doc, quotation);

    // Terms and Conditions
    this.addTermsAndConditions(doc, pageWidth, pageHeight);

    // Signature Section
    this.addSignatureSection(doc, pageWidth, pageHeight);

    if (download) {
      doc.save(`${quotation.quoteNumber}.pdf`);
    }

    return doc;
  }

  /**
   * Generate Proforma Invoice PDF
   */
  static generateProformaPDF(proforma: ProformaInvoice, download: boolean = true): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Company Logo and Header
    this.addCompanyHeader(doc, pageWidth);

    // Company Information
    this.addCompanyInfo(doc, pageWidth);

    // Proforma Title and Number
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`PROFORMA INVOICE NO. ${proforma.proformaNumber}`, pageWidth / 2, 80, { align: 'center' });

    // Customer Information and Date
    this.addCustomerAndDateInfo(doc, proforma, pageWidth);

    // Proforma Items Table
    this.addProformaItemsTable(doc, proforma);

    // Terms and Conditions
    this.addTermsAndConditions(doc, pageWidth, pageHeight);

    // Signature Section
    this.addSignatureSection(doc, pageWidth, pageHeight);

    if (download) {
      doc.save(`${proforma.proformaNumber}.pdf`);
    }

    return doc;
  }

  /**
   * Generate Payment Receipt PDF
   */
  static generatePaymentReceiptPDF(payment: Payment, download: boolean = true): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Company Logo and Header
    this.addCompanyHeader(doc, pageWidth);

    // Company Information
    this.addCompanyInfo(doc, pageWidth);

    // Receipt Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT RECEIPT', pageWidth / 2, 80, { align: 'center' });

    // Payment Details
    this.addPaymentDetails(doc, payment, pageWidth);

    if (download) {
      doc.save(`Receipt-${payment.reference}.pdf`);
    }

    return doc;
  }

  /**
   * Add company header with logo placeholder
   */
  private static addCompanyHeader(doc: jsPDF, pageWidth: number, design?: TemplateDesign): void {
    // Logo placeholder (shield-like design similar to the document)
    doc.setFillColor(41, 128, 185);
    doc.circle(35, 25, 12, 'F');
    
    doc.setFillColor(46, 204, 113);
    doc.circle(45, 25, 8, 'F');
    
    doc.setFillColor(231, 76, 60);
    doc.rect(25, 30, 25, 15, 'F');
    
    // Company name
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(this.companySettings.name.toUpperCase(), 60, 30);
    
    // Tagline or subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('BUSINESS MANAGEMENT SYSTEM', 60, 38);
  }

  /**
   * Add company information
   */
  private static addCompanyInfo(doc: jsPDF, pageWidth: number): void {
    const settings = this.companySettings;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Center-aligned company info
    const centerX = pageWidth / 2;
    
    doc.text(settings.address.line1, centerX, 50, { align: 'center' });
    if (settings.address.line2) {
      doc.text(settings.address.line2, centerX, 55, { align: 'center' });
    }
    
    const contactLine = `Tel: ${settings.contact.phone.join(', ')}`;
    doc.text(contactLine, centerX, 60, { align: 'center' });
    
    doc.text(`E-mail: ${settings.contact.email}`, centerX, 64, { align: 'center' });
    if (settings.contact.website) {
      doc.text(`Website: ${settings.contact.website}`, centerX, 68, { align: 'center' });
    }
    
    // PIN number (right-aligned)
    doc.text(`PIN No: ${settings.tax.kraPin}`, pageWidth - 20, 50, { align: 'right' });
  }

  /**
   * Add customer and date information
   */
  private static addCustomerAndDateInfo(doc: jsPDF, document: Invoice | Quotation | ProformaInvoice, pageWidth: number): void {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Customer info (left side)
    doc.text('To:', 20, 95);
    doc.setFont('helvetica', 'bold');
    doc.text(document.customer.name, 20, 102);
    doc.setFont('helvetica', 'normal');

    if (document.customer.address) {
      const addressLines = document.customer.address.split(',');
      let yPos = 107;
      addressLines.forEach(line => {
        doc.text(line.trim(), 20, yPos);
        yPos += 5;
      });
    }

    // Date and document info (right side)
    const dateLabel = 'issueDate' in document ? 'Date:' : 'Date:';
    const date = 'issueDate' in document ? document.issueDate : document.createdAt;

    doc.text(dateLabel, pageWidth - 80, 95);
    doc.text(this.formatDate(date), pageWidth - 20, 95, { align: 'right' });

    // LPO number if available
    if ('invoiceNumber' in document) {
      doc.text('LPO NO.', pageWidth - 80, 102);
      doc.text('N/A', pageWidth - 20, 102, { align: 'right' });
    }
  }

  /**
   * Add invoice items table
   */
  private static addInvoiceItemsTable(doc: jsPDF, invoice: Invoice): void {
    const tableData = invoice.items.map((item, index) => [
      index + 1,
      item.product.name,
      item.quantity,
      item.product.unit || 'Piece',
      this.formatCurrency(item.unitPrice),
      `${item.vatRate}%`,
      this.formatCurrency(item.total)
    ]);

    autoTable(doc, {
      startY: 125,
      head: [['Item No.', 'Item Description', 'Qty', 'Unit Pack', 'Unit Price (incl) Ksh', 'Vat', 'Total Price (incl) Ksh']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [128, 128, 128],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 60 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'right', cellWidth: 25 },
        5: { halign: 'center', cellWidth: 15 },
        6: { halign: 'right', cellWidth: 30 }
      }
    });

    // Total Amount - fix positioning to prevent overlap
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    // Create a bordered box for the total
    doc.rect(120, finalY - 8, 70, 12);
    doc.text('Total Amount Inc. VAT (Kes)', 125, finalY);
    doc.text(this.formatCurrency(invoice.total), 185, finalY, { align: 'right' });
  }

  /**
   * Add quotation items table
   */
  private static addQuoteItemsTable(doc: jsPDF, quotation: Quotation): void {
    const tableData = quotation.items.map((item, index) => [
      index + 1,
      item.product.name,
      item.quantity,
      item.product.unit || 'Piece',
      this.formatCurrency(item.unitPrice),
      `${item.vatRate}%`,
      this.formatCurrency(item.total)
    ]);

    autoTable(doc, {
      startY: 125,
      head: [['Item No.', 'Item Description', 'Qty', 'Unit Pack', 'Unit Price (incl) Ksh', 'Vat', 'Total Price (incl) Ksh']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [128, 128, 128],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 60 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'right', cellWidth: 25 },
        5: { halign: 'center', cellWidth: 15 },
        6: { halign: 'right', cellWidth: 30 }
      }
    });

    // Total Amount - fix positioning to prevent overlap
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    // Create a bordered box for the total
    doc.rect(120, finalY - 8, 70, 12);
    doc.text('Total Amount Inc. VAT (Kes)', 125, finalY);
    doc.text(this.formatCurrency(quotation.total), 185, finalY, { align: 'right' });
  }

  /**
   * Add proforma items table
   */
  private static addProformaItemsTable(doc: jsPDF, proforma: ProformaInvoice): void {
    const tableData = proforma.items.map((item, index) => [
      index + 1,
      item.product.name,
      item.quantity,
      item.product.unit || 'Piece',
      this.formatCurrency(item.unitPrice),
      `${item.vatRate}%`,
      this.formatCurrency(item.total)
    ]);

    autoTable(doc, {
      startY: 125,
      head: [['Item No.', 'Item Description', 'Qty', 'Unit Pack', 'Unit Price (incl) Ksh', 'Vat', 'Total Price (incl) Ksh']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [128, 128, 128],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 60 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'right', cellWidth: 25 },
        5: { halign: 'center', cellWidth: 15 },
        6: { halign: 'right', cellWidth: 30 }
      }
    });

    // Total Amount - fix positioning to prevent overlap
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    // Create a bordered box for the total
    doc.rect(120, finalY - 8, 70, 12);
    doc.text('Total Amount Inc. VAT (Kes)', 125, finalY);
    doc.text(this.formatCurrency(proforma.total), 185, finalY, { align: 'right' });
  }

  /**
   * Add payment details
   */
  private static addPaymentDetails(doc: jsPDF, payment: Payment, pageWidth: number): void {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const details = [
      ['Payment Reference:', payment.reference],
      ['Amount:', this.formatCurrency(payment.amount)],
      ['Payment Method:', payment.method.toUpperCase()],
      ['Date:', this.formatDate(payment.createdAt)],
    ];

    let yPos = 95;
    details.forEach(([label, value]) => {
      doc.text(label, 20, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(value, 80, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 10;
    });

    if (payment.notes) {
      yPos += 5;
      doc.text('Notes:', 20, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(payment.notes, 80, yPos);
    }
  }

  /**
   * Add terms and conditions
   */
  private static addTermsAndConditions(doc: jsPDF, pageWidth: number, pageHeight: number): void {
    const terms = this.companySettings.invoiceSettings.terms;
    if (!terms || terms.length === 0) return;

    const startY = pageHeight - 80;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms and regulations', 20, startY);

    doc.setFont('helvetica', 'normal');
    let yPos = startY + 5;
    
    terms.forEach((term, index) => {
      const termText = `${index + 1}) ${term}`;
      const lines = doc.splitTextToSize(termText, pageWidth - 40);
      
      lines.forEach((line: string) => {
        if (yPos > pageHeight - 20) return; // Stop if too close to bottom
        doc.text(line, 20, yPos);
        yPos += 4;
      });
      yPos += 2; // Extra space between terms
    });
  }

  /**
   * Add signature section
   */
  private static addSignatureSection(doc: jsPDF, pageWidth: number, pageHeight: number): void {
    const signatureY = pageHeight - 25;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    // Prepared by
    doc.text('Prepared By:', 20, signatureY);
    doc.line(45, signatureY, 90, signatureY);
    
    // Checked by
    doc.text('Checked By:', pageWidth - 90, signatureY);
    doc.line(pageWidth - 65, signatureY, pageWidth - 20, signatureY);
  }

  /**
   * Utility functions
   */
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  private static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }

  /**
   * Update company settings
   */
  static updateCompanySettings(settings: CompanySettings): void {
    this.companySettings = settings;
  }

  /**
   * Get current company settings
   */
  static getCompanySettings(): CompanySettings {
    return this.companySettings;
  }
}

export default PDFService;
