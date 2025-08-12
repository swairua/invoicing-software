import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Invoice,
  Quotation,
  ProformaInvoice,
  Payment,
  DocumentTemplate,
  TemplateDesign,
} from "@shared/types";
import { CompanySettings, defaultCompanySettings } from "@shared/company";

export class PDFService {
  private static companySettings: CompanySettings = defaultCompanySettings;
  private static templates: Map<string, DocumentTemplate> = new Map();
  private static logoDataUrl: string | null = null;
  private static initialized: boolean = false;

  /**
   * Initialize the service with logo loading
   */
  static async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.updateCompanySettings(this.companySettings);
      this.initialized = true;
    }
  }

  /**
   * Register a template for use
   */
  static registerTemplate(template: DocumentTemplate): void {
    const key = `${template.type}_${template.isActive ? "active" : template.id}`;
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
  static async generateInvoicePDF(
    invoice: Invoice,
    download: boolean = true,
    templateId?: string,
  ): Promise<jsPDF> {
    // Ensure service is initialized with logo
    await this.initialize();
    const template = templateId
      ? this.getTemplate(templateId)
      : this.getActiveTemplate("invoice");
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
    doc.setFont(design?.fonts.heading || "helvetica", "bold");
    if (design?.colors.primary) {
      doc.setTextColor(design.colors.primary);
    }
    doc.text(`INVOICE NO. ${invoice.invoiceNumber}`, pageWidth / 2, 80, {
      align: "center",
    });

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
  static async generateQuotationPDF(
    quotation: Quotation,
    download: boolean = true,
  ): Promise<jsPDF> {
    // Ensure service is initialized with logo
    await this.initialize();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Company Logo and Header
    this.addCompanyHeader(doc, pageWidth);

    // Company Information
    this.addCompanyInfo(doc, pageWidth);

    // Quotation Title and Number
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`QUOTATION NO. ${quotation.quoteNumber}`, pageWidth / 2, 80, {
      align: "center",
    });

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
  static async generateProformaPDF(
    proforma: ProformaInvoice,
    download: boolean = true,
  ): Promise<jsPDF> {
    // Ensure service is initialized with logo
    await this.initialize();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Company Logo and Header
    this.addCompanyHeader(doc, pageWidth);

    // Company Information
    this.addCompanyInfo(doc, pageWidth);

    // Proforma Title and Number
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(
      `PROFORMA INVOICE NO. ${proforma.proformaNumber}`,
      pageWidth / 2,
      80,
      { align: "center" },
    );

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
  static async generatePaymentReceiptPDF(
    payment: Payment,
    download: boolean = true,
  ): Promise<jsPDF> {
    // Ensure service is initialized with logo
    await this.initialize();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Company Logo and Header
    this.addCompanyHeader(doc, pageWidth);

    // Company Information
    this.addCompanyInfo(doc, pageWidth);

    // Receipt Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT RECEIPT", pageWidth / 2, 80, { align: "center" });

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
  private static addCompanyHeader(
    doc: jsPDF,
    pageWidth: number,
    design?: TemplateDesign,
  ): void {
    const settings = this.companySettings;

    // Add dynamic logo from company settings
    if (this.logoDataUrl && design?.header?.showLogo !== false) {
      try {
        // Use the preloaded logo data URL
        const logoWidth = 25;
        const logoHeight = 25;
        const logoX = 20;
        const logoY = 15;

        doc.addImage(
          this.logoDataUrl,
          "JPEG",
          logoX,
          logoY,
          logoWidth,
          logoHeight,
        );
      } catch (error) {
        console.warn(
          "Failed to add company logo to PDF, using text fallback:",
          error,
        );
        // Fallback: Show company name initial in a circle
        this.addFallbackLogo(doc, settings);
      }
    } else {
      // Fallback: Simple company initial
      this.addFallbackLogo(doc, settings);
    }

    // Company name
    if (design?.colors?.primary) {
      const rgb = this.hexToRgb(design.colors.primary);
      doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    } else {
      doc.setTextColor(0, 0, 0);
    }
    doc.setFontSize(design?.fonts?.size?.heading || 18);
    doc.setFont(design?.fonts?.heading || "helvetica", "bold");
    doc.text(settings.name.toUpperCase(), 50, 25);

    // Business type or tagline
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Your Medical & Laboratory Supplies Partner", 50, 32);

    // PIN number (right-aligned)
    doc.setFontSize(9);
    doc.text(`PIN No: ${settings.tax.kraPin}`, pageWidth - 20, 25, {
      align: "right",
    });
  }

  /**
   * Add fallback logo when dynamic logo is not available
   */
  private static addFallbackLogo(doc: jsPDF, settings: CompanySettings): void {
    doc.setFillColor(41, 128, 185);
    doc.circle(32.5, 27.5, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(settings.name.charAt(0), 32.5, 32, { align: "center" });
  }

  /**
   * Add company information
   */
  private static addCompanyInfo(
    doc: jsPDF,
    pageWidth: number,
    design?: TemplateDesign,
  ): void {
    const settings = this.companySettings;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // Center-aligned company info
    const centerX = pageWidth / 2;

    doc.text(settings.address.line1, centerX, 50, { align: "center" });
    if (settings.address.line2) {
      doc.text(settings.address.line2, centerX, 55, { align: "center" });
    }

    const contactLine = `Tel: ${settings.contact.phone.join(", ")}`;
    doc.text(contactLine, centerX, 60, { align: "center" });

    doc.text(`E-mail: ${settings.contact.email}`, centerX, 64, {
      align: "center",
    });
    if (settings.contact.website) {
      doc.text(`Website: ${settings.contact.website}`, centerX, 68, {
        align: "center",
      });
    }
  }

  /**
   * Add custom table header design outside the table
   */
  private static addCustomTableHeader(doc: jsPDF, startY: number): void {
    const headers = ["#", "ITEM DESCRIPTION", "QTY", "UNIT", "UNIT PRICE (KSH)", "VAT %", "TOTAL (KSH)"];
    const columnWidths = [12, 65, 15, 18, 25, 15, 30];
    const columnPositions = [20]; // Starting position

    // Calculate column positions
    for (let i = 1; i < columnWidths.length; i++) {
      columnPositions.push(columnPositions[i - 1] + columnWidths[i - 1]);
    }

    // Main header background with gradient effect
    doc.setFillColor(37, 99, 235); // Primary blue
    doc.rect(20, startY, 180, 18, 'F');

    // Add subtle shadow effect
    doc.setFillColor(30, 80, 200); // Darker blue for shadow
    doc.rect(20, startY + 18, 180, 2, 'F');

    // Header border
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1);
    doc.rect(20, startY, 180, 18);

    // Column separators
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    for (let i = 1; i < columnPositions.length; i++) {
      const x = columnPositions[i];
      doc.line(x, startY + 2, x, startY + 16);
    }

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");

    headers.forEach((header, index) => {
      const x = columnPositions[index] + (columnWidths[index] / 2);
      doc.text(header, x, startY + 11, { align: "center" });
    });

    // Reset colors
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);
  }

  /**
   * Add customer and date information
   */
  private static addCustomerAndDateInfo(
    doc: jsPDF,
    document: Invoice | Quotation | ProformaInvoice,
    pageWidth: number,
    design?: TemplateDesign,
  ): void {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Customer info (left side)
    doc.text("To:", 20, 95);
    doc.setFont("helvetica", "bold");
    doc.text(document.customer.name, 20, 102);
    doc.setFont("helvetica", "normal");

    if (document.customer.address) {
      const addressLines = document.customer.address.split(",");
      let yPos = 107;
      addressLines.forEach((line) => {
        doc.text(line.trim(), 20, yPos);
        yPos += 5;
      });
    }

    // Date and document info (right side)
    const dateLabel = "issueDate" in document ? "Date:" : "Date:";
    const date =
      "issueDate" in document ? document.issueDate : document.createdAt;

    doc.text(dateLabel, pageWidth - 80, 95);
    doc.text(this.formatDate(date), pageWidth - 20, 95, { align: "right" });

    // LPO number if available
    if ("invoiceNumber" in document) {
      doc.text("LPO NO.", pageWidth - 80, 102);
      doc.text("N/A", pageWidth - 20, 102, { align: "right" });
    }
  }

  /**
   * Add invoice items table
   */
  private static addInvoiceItemsTable(
    doc: jsPDF,
    invoice: Invoice,
    design?: TemplateDesign,
  ): void {
    const tableData = invoice.items.map((item, index) => [
      index + 1,
      item.product.name,
      item.quantity,
      item.product.unit || "Piece",
      this.formatCurrency(item.unitPrice),
      `${item.vatRate}%`,
      this.formatCurrency(item.total),
    ]);

    // Convert hex to RGB for autoTable
    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : [128, 128, 128];
    };

    const headerColor = design?.table.headerBackgroundColor
      ? hexToRgb(design.table.headerBackgroundColor)
      : [37, 99, 235]; // Force blue color for visibility

    // Custom header design outside the table
    this.addCustomTableHeader(doc, 125);

    // Table without header - starts lower to accommodate external header
    autoTable(doc, {
      startY: 145,
      body: tableData,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [180, 180, 180],
        lineWidth: 0.3,
        textColor: [40, 40, 40],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "left", cellWidth: 65 },
        2: { halign: "center", cellWidth: 15 },
        3: { halign: "center", cellWidth: 18 },
        4: { halign: "right", cellWidth: 25 },
        5: { halign: "center", cellWidth: 15 },
        6: { halign: "right", cellWidth: 30 },
      },
      didParseCell: function (data) {
        // Add subtle hover effect simulation
        if (data.row.index % 2 === 0) {
          data.cell.styles.fillColor = [252, 252, 253];
        }
      },
    });

    // Total Amount - align text and value in one row
    const finalY = (doc as any).lastAutoTable.finalY + 20;

    // Create a bordered total section with proper spacing
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(125, finalY - 5, 70, 15);

    // Add subtle background for total section
    doc.setFillColor(248, 249, 250);
    doc.rect(125, finalY - 5, 70, 15, "F");
    doc.rect(125, finalY - 5, 70, 15);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    // Put text and value on the same line
    doc.text("Total Amount Inc. VAT (Kes)", 128, finalY + 5);
    doc.text(this.formatCurrency(invoice.total), 192, finalY + 5, {
      align: "right",
    });
  }

  /**
   * Add quotation items table
   */
  private static addQuoteItemsTable(doc: jsPDF, quotation: Quotation): void {
    const tableData = quotation.items.map((item, index) => [
      index + 1,
      item.product.name,
      item.quantity,
      item.product.unit || "Piece",
      this.formatCurrency(item.unitPrice),
      `${item.vatRate}%`,
      this.formatCurrency(item.total),
    ]);

    autoTable(doc, {
      startY: 125,
      head: [
        [
          "#",
          "ITEM DESCRIPTION",
          "QTY",
          "UNIT",
          "UNIT PRICE (KSH)",
          "VAT %",
          "TOTAL (KSH)",
        ],
      ],
      body: tableData,
      theme: "striped",
      styles: {
        fontSize: 9,
        cellPadding: 5,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
        textColor: [50, 50, 50],
      },
      headStyles: {
        fillColor: [37, 99, 235], // Force blue color for visibility
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
        halign: "center",
        valign: "middle",
        minCellHeight: 22,
        lineColor: [37, 99, 235],
        lineWidth: 1,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "left", cellWidth: 65 },
        2: { halign: "center", cellWidth: 15 },
        3: { halign: "center", cellWidth: 18 },
        4: { halign: "right", cellWidth: 25 },
        5: { halign: "center", cellWidth: 15 },
        6: { halign: "right", cellWidth: 30 },
      },
    });

    // Total Amount - align text and value in one row
    const finalY = (doc as any).lastAutoTable.finalY + 20;

    // Create a bordered total section with proper spacing
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(125, finalY - 5, 70, 15);

    // Add subtle background for total section
    doc.setFillColor(248, 249, 250);
    doc.rect(125, finalY - 5, 70, 15, "F");
    doc.rect(125, finalY - 5, 70, 15);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    // Put text and value on the same line
    doc.text("Total Amount Inc. VAT (Kes)", 128, finalY + 5);
    doc.text(this.formatCurrency(quotation.total), 192, finalY + 5, {
      align: "right",
    });
  }

  /**
   * Add proforma items table
   */
  private static addProformaItemsTable(
    doc: jsPDF,
    proforma: ProformaInvoice,
  ): void {
    const tableData = proforma.items.map((item, index) => [
      index + 1,
      item.product.name,
      item.quantity,
      item.product.unit || "Piece",
      this.formatCurrency(item.unitPrice),
      `${item.vatRate}%`,
      this.formatCurrency(item.total),
    ]);

    autoTable(doc, {
      startY: 125,
      head: [
        [
          "#",
          "ITEM DESCRIPTION",
          "QTY",
          "UNIT",
          "UNIT PRICE (KSH)",
          "VAT %",
          "TOTAL (KSH)",
        ],
      ],
      body: tableData,
      theme: "striped",
      styles: {
        fontSize: 9,
        cellPadding: 5,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
        textColor: [50, 50, 50],
      },
      headStyles: {
        fillColor: [37, 99, 235], // Force blue color for visibility
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
        halign: "center",
        valign: "middle",
        minCellHeight: 22,
        lineColor: [37, 99, 235],
        lineWidth: 1,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "left", cellWidth: 65 },
        2: { halign: "center", cellWidth: 15 },
        3: { halign: "center", cellWidth: 18 },
        4: { halign: "right", cellWidth: 25 },
        5: { halign: "center", cellWidth: 15 },
        6: { halign: "right", cellWidth: 30 },
      },
    });

    // Total Amount - align text and value in one row
    const finalY = (doc as any).lastAutoTable.finalY + 20;

    // Create a bordered total section with proper spacing
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(125, finalY - 5, 70, 15);

    // Add subtle background for total section
    doc.setFillColor(248, 249, 250);
    doc.rect(125, finalY - 5, 70, 15, "F");
    doc.rect(125, finalY - 5, 70, 15);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    // Put text and value on the same line
    doc.text("Total Amount Inc. VAT (Kes)", 128, finalY + 5);
    doc.text(this.formatCurrency(proforma.total), 192, finalY + 5, {
      align: "right",
    });
  }

  /**
   * Add payment details
   */
  private static addPaymentDetails(
    doc: jsPDF,
    payment: Payment,
    pageWidth: number,
  ): void {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const details = [
      ["Payment Reference:", payment.reference],
      ["Amount:", this.formatCurrency(payment.amount)],
      ["Payment Method:", payment.method.toUpperCase()],
      ["Date:", this.formatDate(payment.createdAt)],
    ];

    let yPos = 95;
    details.forEach(([label, value]) => {
      doc.text(label, 20, yPos);
      doc.setFont("helvetica", "bold");
      doc.text(value, 80, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 10;
    });

    if (payment.notes) {
      yPos += 5;
      doc.text("Notes:", 20, yPos);
      doc.setFont("helvetica", "bold");
      doc.text(payment.notes, 80, yPos);
    }
  }

  /**
   * Add terms and conditions
   */
  private static addTermsAndConditions(
    doc: jsPDF,
    pageWidth: number,
    pageHeight: number,
    design?: TemplateDesign,
  ): void {
    const terms = this.companySettings.invoiceSettings.terms;
    if (!terms || terms.length === 0) return;

    const startY = pageHeight - 80;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Terms and regulations", 20, startY);

    doc.setFont("helvetica", "normal");
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
  private static addSignatureSection(
    doc: jsPDF,
    pageWidth: number,
    pageHeight: number,
    design?: TemplateDesign,
  ): void {
    const signatureY = pageHeight - 25;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    // Prepared by
    doc.text("Prepared By:", 20, signatureY);
    doc.line(45, signatureY, 90, signatureY);

    // Checked by
    doc.text("Checked By:", pageWidth - 90, signatureY);
    doc.line(pageWidth - 65, signatureY, pageWidth - 20, signatureY);
  }

  /**
   * Utility functions
   */
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  private static formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  }

  /**
   * Convert hex color to RGB array
   */
  private static hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  }

  /**
   * Load logo image as data URL for PDF use
   */
  private static async loadLogoAsDataUrl(
    logoUrl: string,
  ): Promise<string | null> {
    try {
      const response = await fetch(logoUrl);
      const blob = await response.blob();

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn("Failed to load logo image:", error);
      return null;
    }
  }

  /**
   * Update company settings and preload logo
   */
  static async updateCompanySettings(settings: CompanySettings): Promise<void> {
    this.companySettings = settings;

    // Preload logo as data URL if available
    if (settings.branding?.logo) {
      this.logoDataUrl = await this.loadLogoAsDataUrl(settings.branding.logo);
    } else {
      this.logoDataUrl = null;
    }
  }

  /**
   * Get current company settings
   */
  static getCompanySettings(): CompanySettings {
    return this.companySettings;
  }
}

export default PDFService;
