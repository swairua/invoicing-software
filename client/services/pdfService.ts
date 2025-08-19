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
  private static cacheVersion: number = Date.now();

  /**
   * Initialize the service with logo loading
   */
  static async initialize(): Promise<void> {
    // Force reinitialization to ensure changes are applied
    await this.updateCompanySettings(this.companySettings);
    this.initialized = true;
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

    // Invoice Title and Number (with better spacing)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    if (design?.colors.primary) {
      const rgb = this.hexToRgb(design.colors.primary);
      doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    } else {
      doc.setTextColor(0, 100, 200); // Blue color
    }
    doc.text(`INVOICE NO. ${invoice.invoiceNumber}`, pageWidth / 2, 85, {
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
   * Generate Remittance Advice PDF
   */
  static async generateRemittanceAdvicePDF(
    remittanceData: any,
    download: boolean = true,
  ): Promise<jsPDF> {
    await this.initialize();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Company Logo and Header
    this.addCompanyHeader(doc, pageWidth);

    // Company Information
    this.addCompanyInfo(doc, pageWidth);

    // Remittance Title and Number
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`REMITTANCE ADVICE NO. ${remittanceData.remittanceNumber}`, pageWidth / 2, 80, {
      align: "center",
    });

    // Customer and Date Information
    this.addRemittanceCustomerInfo(doc, remittanceData, pageWidth);

    // Remittance Items Table
    this.addRemittanceItemsTable(doc, remittanceData);

    // Total Amount
    const finalY = (doc as any).lastAutoTable?.finalY || 180;
    this.addRemittanceTotalSection(doc, remittanceData.totalPayment, finalY + 15);

    if (download) {
      doc.save(`${remittanceData.remittanceNumber}.pdf`);
    }

    return doc;
  }

  /**
   * Generate Credit Note PDF
   */
  static async generateCreditNotePDF(
    creditNote: any,
    download: boolean = true,
  ): Promise<jsPDF> {
    await this.initialize();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Company Logo and Header
    this.addCompanyHeader(doc, pageWidth);

    // Company Information
    this.addCompanyInfo(doc, pageWidth);

    // Credit Note Title and Number
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 20, 60); // Crimson color for credit note
    doc.text(`CREDIT NOTE NO. ${creditNote.creditNoteNumber}`, pageWidth / 2, 80, {
      align: "center",
    });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Customer and Date Information
    this.addCustomerAndDateInfo(doc, creditNote, pageWidth);

    // Credit Note Items Table
    this.addCreditNoteItemsTable(doc, creditNote);

    // Credit Amount
    const finalY = (doc as any).lastAutoTable?.finalY || 180;
    this.addCreditNoteTotalSection(doc, creditNote.total, finalY + 15);

    // Reason for credit note
    if (creditNote.reason) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Reason for Credit Note:", 20, finalY + 40);
      doc.setFont("helvetica", "normal");
      doc.text(creditNote.reason, 20, finalY + 50);
    }

    if (download) {
      doc.save(`${creditNote.creditNoteNumber}.pdf`);
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
   * Add company header with three-column layout: logo left, details center, PIN right
   */
  private static addCompanyHeader(
    doc: jsPDF,
    pageWidth: number,
    design?: TemplateDesign,
  ): void {
    const settings = this.companySettings;
    const centerX = pageWidth / 2;

    // LEFT COLUMN: Logo
    if (this.logoDataUrl && design?.header?.showLogo !== false) {
      try {
        const logoWidth = 25;
        const logoHeight = 25;
        const logoX = 20; // Left aligned
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
        this.addFallbackLogo(doc, settings);
      }
    } else {
      this.addFallbackLogo(doc, settings);
    }

    // CENTER COLUMN: Company name and tagline
    if (design?.colors?.primary) {
      const rgb = this.hexToRgb(design.colors.primary);
      doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    } else {
      doc.setTextColor(0, 100, 200); // Blue color
    }
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text((settings?.name || "Company Name").toUpperCase(), centerX, 25, {
      align: "center",
    });

    // Business tagline (centered)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Your Medical & Laboratory Supplies Partner", centerX, 32, {
      align: "center",
    });

    // RIGHT COLUMN: PIN number
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(
      `PIN No: ${settings?.tax?.kraPin || "Not Set"}`,
      pageWidth - 20,
      25,
      {
        align: "right",
      },
    );
  }

  /**
   * Add fallback logo when dynamic logo is not available
   */
  private static addFallbackLogo(doc: jsPDF, settings: CompanySettings): void {
    const logoX = 32.5; // Left aligned position (20 + 12.5 radius)
    doc.setFillColor(41, 128, 185);
    doc.circle(logoX, 27.5, 12.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text((settings?.name || "C").charAt(0), logoX, 32, { align: "center" });
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
    const centerX = pageWidth / 2;
    let yPos = 45; // Start closer to header

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    // Company address (centered with proper spacing)
    doc.text(settings?.address?.line1 || "Address Not Set", centerX, yPos, {
      align: "center",
    });
    yPos += 4;

    if (settings?.address?.line2) {
      doc.text(settings.address.line2, centerX, yPos, { align: "center" });
      yPos += 4;
    }

    // Contact information (centered)
    const contactLine = `Tel: ${settings?.contact?.phone?.join(", ") || "Not Set"}`;
    doc.text(contactLine, centerX, yPos, { align: "center" });
    yPos += 4;

    doc.text(
      `E-mail: ${settings?.contact?.email || "Not Set"}`,
      centerX,
      yPos,
      { align: "center" },
    );
    yPos += 4;

    if (settings?.contact?.website) {
      doc.text(`Website: ${settings.contact.website}`, centerX, yPos, {
        align: "center",
      });
    }

    // No duplicate PIN number - already shown in header
  }

  /**
   * Add custom table header design outside the table
   */
  private static addCustomTableHeader(doc: jsPDF, startY: number): void {
    const headers = [
      "Item No.",
      "Item Description",
      "Qty",
      "Unit Pack",
      "Unit Price (incl) Ksh",
      "Vat",
      "Total Price (incl) Ksh",
    ];
    const columnWidths = [15, 65, 15, 18, 25, 15, 27];
    const columnPositions = [20]; // Starting position

    // Calculate column positions
    for (let i = 1; i < columnWidths.length; i++) {
      columnPositions.push(columnPositions[i - 1] + columnWidths[i - 1]);
    }

    // Dark gray background for better contrast
    doc.setFillColor(200, 200, 200); // Darker gray background
    doc.rect(20, startY, 180, 20, "F");

    // Strong black border for visibility
    doc.setDrawColor(0, 0, 0); // Black border
    doc.setLineWidth(1.5);
    doc.rect(20, startY, 180, 20);

    // Column separators with black lines
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    for (let i = 1; i < columnPositions.length; i++) {
      const x = columnPositions[i];
      doc.line(x, startY, x, startY + 20);
    }

    // Header text - BOLD AND BLACK for maximum visibility
    doc.setTextColor(0, 0, 0); // BLACK TEXT
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");

    headers.forEach((header, index) => {
      const x = columnPositions[index] + columnWidths[index] / 2;
      doc.text(header, x, startY + 13, { align: "center" });
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
    doc.setTextColor(0, 0, 0);

    let startY = 100;

    // Customer info section (left side)
    doc.text("To:", 20, startY);
    doc.setFont("helvetica", "bold");
    doc.text(document.customer?.name || "Unknown Customer", 20, startY + 7);
    doc.setFont("helvetica", "normal");

    if (document.customer?.address) {
      const addressLines = document.customer.address.split(",");
      let yPos = startY + 12;
      addressLines.forEach((line) => {
        if (line.trim()) {
          doc.text(line.trim(), 20, yPos);
          yPos += 5;
        }
      });
    }

    // Date and document info (right side, properly aligned)
    const dateLabel = "issueDate" in document ? "Date:" : "Date:";
    const date =
      "issueDate" in document ? document.issueDate : document.createdAt;

    // Right column starting position
    const rightColumnX = pageWidth - 100;
    const rightValueX = pageWidth - 20;

    doc.text(dateLabel, rightColumnX, startY);
    doc.text(this.formatDate(date), rightValueX, startY, { align: "right" });

    // LPO number if available
    if ("invoiceNumber" in document) {
      doc.text("LPO NO.", rightColumnX, startY + 7);
      doc.text("N/A", rightValueX, startY + 7, { align: "right" });
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

    const tableHeaders = [
      "Item No.",
      "Item Description",
      "Qty",
      "Unit Pack",
      "Unit Price (incl) Ksh",
      "Vat",
      "Total Price (incl) Ksh",
    ];

    // Table with integrated header for perfect alignment
    autoTable(doc, {
      startY: 120,
      head: [tableHeaders],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [128, 128, 128], // Gray background like in the PDF
        textColor: [0, 0, 0], // Black text
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
        valign: "middle",
        lineColor: [0, 0, 0],
        lineWidth: 1,
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        textColor: [40, 40, 40],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { halign: "left", cellWidth: 65 },
        2: { halign: "center", cellWidth: 15 },
        3: { halign: "center", cellWidth: 18 },
        4: { halign: "right", cellWidth: 25 },
        5: { halign: "center", cellWidth: 15 },
        6: { halign: "right", cellWidth: 27 },
      },
      didParseCell: function (data) {
        // Header row styling
        if (data.section === "head") {
          data.cell.styles.fillColor = [128, 128, 128];
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
        // Body row styling
        else if (data.row.index % 2 === 0) {
          data.cell.styles.fillColor = [252, 252, 253];
        }
      },
    });

    // Total Amount - properly spaced and formatted
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Check if we need a new page for the total section
    if (finalY + 40 > doc.internal.pageSize.height - 30) {
      doc.addPage();
      const newFinalY = 30;
      this.addTotalSection(doc, invoice.total, newFinalY);
    } else {
      this.addTotalSection(doc, invoice.total, finalY);
    }
  }

  /**
   * Add total section with proper formatting
   */
  private static addTotalSection(
    doc: jsPDF,
    total: number,
    startY: number,
  ): void {
    // Total section with better spacing
    const boxWidth = 75;
    const boxHeight = 18;
    const rightMargin = 20;
    const boxX = doc.internal.pageSize.width - rightMargin - boxWidth;

    // Create a bordered total section
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.rect(boxX, startY, boxWidth, boxHeight);

    // Add background for total section
    doc.setFillColor(240, 240, 240);
    doc.rect(boxX, startY, boxWidth, boxHeight, "F");
    doc.rect(boxX, startY, boxWidth, boxHeight);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    // Add total label and amount with proper alignment
    doc.text("Total Amount Inc. VAT (Kes)", boxX + 3, startY + 12);
    doc.text(this.formatCurrency(total), boxX + boxWidth - 3, startY + 12, {
      align: "right",
    });
  }

  /**
   * Add quotation items table with integrated header design
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

    const tableHeaders = [
      "Item No.",
      "Item Description",
      "Qty",
      "Unit Pack",
      "Unit Price (incl) Ksh",
      "Vat",
      "Total Price (incl) Ksh",
    ];

    // Table with integrated header for perfect alignment
    autoTable(doc, {
      startY: 120,
      head: [tableHeaders],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [128, 128, 128], // Gray background like in the PDF
        textColor: [0, 0, 0], // Black text
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
        valign: "middle",
        lineColor: [0, 0, 0],
        lineWidth: 1,
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        textColor: [40, 40, 40],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { halign: "left", cellWidth: 65 },
        2: { halign: "center", cellWidth: 15 },
        3: { halign: "center", cellWidth: 18 },
        4: { halign: "right", cellWidth: 25 },
        5: { halign: "center", cellWidth: 15 },
        6: { halign: "right", cellWidth: 27 },
      },
      didParseCell: function (data) {
        // Header row styling
        if (data.section === "head") {
          data.cell.styles.fillColor = [128, 128, 128];
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
        // Body row styling
        else if (data.row.index % 2 === 0) {
          data.cell.styles.fillColor = [252, 252, 253];
        }
      },
    });

    // Total Amount - properly spaced and formatted
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Check if we need a new page for the total section
    if (finalY + 40 > doc.internal.pageSize.height - 30) {
      doc.addPage();
      const newFinalY = 30;
      this.addTotalSection(doc, quotation.total, newFinalY);
    } else {
      this.addTotalSection(doc, quotation.total, finalY);
    }
  }

  /**
   * Add proforma items table with integrated header design
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

    const tableHeaders = [
      "Item No.",
      "Item Description",
      "Qty",
      "Unit Pack",
      "Unit Price (incl) Ksh",
      "Vat",
      "Total Price (incl) Ksh",
    ];

    // Table with integrated header for perfect alignment
    autoTable(doc, {
      startY: 120,
      head: [tableHeaders],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [128, 128, 128], // Gray background like in the PDF
        textColor: [0, 0, 0], // Black text
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
        valign: "middle",
        lineColor: [0, 0, 0],
        lineWidth: 1,
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        textColor: [40, 40, 40],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { halign: "left", cellWidth: 65 },
        2: { halign: "center", cellWidth: 15 },
        3: { halign: "center", cellWidth: 18 },
        4: { halign: "right", cellWidth: 25 },
        5: { halign: "center", cellWidth: 15 },
        6: { halign: "right", cellWidth: 27 },
      },
      didParseCell: function (data) {
        // Header row styling
        if (data.section === "head") {
          data.cell.styles.fillColor = [128, 128, 128];
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
        // Body row styling
        else if (data.row.index % 2 === 0) {
          data.cell.styles.fillColor = [252, 252, 253];
        }
      },
    });

    // Total Amount - properly spaced and formatted
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Check if we need a new page for the total section
    if (finalY + 40 > doc.internal.pageSize.height - 30) {
      doc.addPage();
      const newFinalY = 30;
      this.addTotalSection(doc, proforma.total, newFinalY);
    } else {
      this.addTotalSection(doc, proforma.total, finalY);
    }
  }

  /**
   * Add remittance customer info and date
   */
  private static addRemittanceCustomerInfo(
    doc: jsPDF,
    remittanceData: any,
    pageWidth: number,
  ): void {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    let startY = 100;

    // Customer info (left side)
    doc.text("To:", 20, startY);
    doc.setFont("helvetica", "bold");
    doc.text(remittanceData.customer?.name || "Unknown Customer", 20, startY + 7);
    doc.setFont("helvetica", "normal");

    if (remittanceData.customer?.address) {
      doc.text(remittanceData.customer.address, 20, startY + 14);
    }

    // Date info (right side)
    const rightColumnX = pageWidth - 100;
    const rightValueX = pageWidth - 20;

    doc.text("Date:", rightColumnX, startY);
    doc.text(this.formatDate(new Date(remittanceData.date)), rightValueX, startY, { align: "right" });

    doc.text("Account No.:", rightColumnX, startY + 7);
    doc.text("N/A", rightValueX, startY + 7, { align: "right" });
  }

  /**
   * Add remittance items table
   */
  private static addRemittanceItemsTable(doc: jsPDF, remittanceData: any): void {
    const tableData = (remittanceData.items || []).map((item: any, index: number) => [
      this.formatDate(new Date(item.date)),
      item.reference || "N/A",
      item.type === "invoice" ? "Invoice" : "Credit Note",
      this.formatCurrency(item.amount),
      this.formatCurrency(item.paymentAmount),
    ]);

    const tableHeaders = [
      "Date",
      "Reference",
      "Type",
      "Amount",
      "Payment Amount",
    ];

    autoTable(doc, {
      startY: 120,
      head: [tableHeaders],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [128, 128, 128],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 30 },
        1: { halign: "left", cellWidth: 50 },
        2: { halign: "center", cellWidth: 30 },
        3: { halign: "right", cellWidth: 35 },
        4: { halign: "right", cellWidth: 35 },
      },
    });
  }

  /**
   * Add remittance total section
   */
  private static addRemittanceTotalSection(
    doc: jsPDF,
    total: number,
    startY: number,
  ): void {
    const boxWidth = 80;
    const boxHeight = 20;
    const rightMargin = 20;
    const boxX = doc.internal.pageSize.width - rightMargin - boxWidth;

    // Create bordered total section
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.rect(boxX, startY, boxWidth, boxHeight);

    // Background
    doc.setFillColor(240, 240, 240);
    doc.rect(boxX, startY, boxWidth, boxHeight, "F");
    doc.rect(boxX, startY, boxWidth, boxHeight);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");

    doc.text("Total Payment Amount", boxX + 3, startY + 12);
    doc.text(this.formatCurrency(total), boxX + boxWidth - 3, startY + 12, {
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
    const terms = this.companySettings?.invoiceSettings?.terms;
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
    if (!date) return "Invalid date";

    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid date";

    try {
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(dateObj);
    } catch (error) {
      return "Invalid date";
    }
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
    if (settings?.branding?.logo) {
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
