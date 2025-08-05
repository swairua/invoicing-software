import { DocumentTemplate, DocumentType, TemplateDesign } from '@shared/types';
import PDFService from './pdfService';

export class TemplateManager {
  private static templates: Map<string, DocumentTemplate> = new Map();
  private static activeTemplates: Map<DocumentType, string> = new Map();

  /**
   * Initialize with default templates
   */
  static initialize(): void {
    const defaultTemplates = this.getDefaultTemplates();
    defaultTemplates.forEach(template => {
      this.registerTemplate(template);
      if (template.isDefault) {
        this.setActiveTemplate(template.type, template.id);
      }
    });
  }

  /**
   * Register a template
   */
  static registerTemplate(template: DocumentTemplate): void {
    this.templates.set(template.id, template);
    
    // Register with PDF service
    PDFService.registerTemplate(template);
    
    if (template.isActive || template.isDefault) {
      this.setActiveTemplate(template.type, template.id);
    }
  }

  /**
   * Get template by ID
   */
  static getTemplate(id: string): DocumentTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Get all templates
   */
  static getAllTemplates(): DocumentTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by type
   */
  static getTemplatesByType(type: DocumentType): DocumentTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.type === type);
  }

  /**
   * Get active template for type
   */
  static getActiveTemplate(type: DocumentType): DocumentTemplate | undefined {
    const activeId = this.activeTemplates.get(type);
    return activeId ? this.templates.get(activeId) : undefined;
  }

  /**
   * Set active template for type
   */
  static setActiveTemplate(type: DocumentType, templateId: string): boolean {
    const template = this.templates.get(templateId);
    if (!template || template.type !== type) {
      return false;
    }

    // Update active templates map
    this.activeTemplates.set(type, templateId);
    
    // Update template status
    this.templates.forEach(t => {
      if (t.type === type) {
        t.isActive = t.id === templateId;
        t.isDefault = t.id === templateId;
      }
    });

    // Re-register with PDF service
    PDFService.registerTemplate({ ...template, isActive: true });
    
    return true;
  }

  /**
   * Delete template
   */
  static deleteTemplate(id: string): boolean {
    const template = this.templates.get(id);
    if (!template || template.isDefault) {
      return false; // Cannot delete default templates
    }

    this.templates.delete(id);
    
    // If this was the active template, set another as active
    if (template.isActive) {
      const alternatives = this.getTemplatesByType(template.type);
      if (alternatives.length > 0) {
        this.setActiveTemplate(template.type, alternatives[0].id);
      }
    }
    
    return true;
  }

  /**
   * Create new template
   */
  static createTemplate(
    name: string,
    description: string,
    type: DocumentType,
    design: TemplateDesign
  ): DocumentTemplate {
    const template: DocumentTemplate = {
      id: Date.now().toString(),
      name,
      description,
      type,
      isActive: false,
      isDefault: false,
      design,
      companyId: '1', // In real app, get from context
      createdBy: '1', // In real app, get from auth
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.registerTemplate(template);
    return template;
  }

  /**
   * Update existing template
   */
  static updateTemplate(id: string, updates: Partial<DocumentTemplate>): boolean {
    const template = this.templates.get(id);
    if (!template) return false;

    const updatedTemplate = {
      ...template,
      ...updates,
      id, // Preserve ID
      updatedAt: new Date(),
    };

    this.templates.set(id, updatedTemplate);
    
    // Re-register with PDF service if active
    if (updatedTemplate.isActive) {
      PDFService.registerTemplate(updatedTemplate);
    }
    
    return true;
  }

  /**
   * Duplicate template
   */
  static duplicateTemplate(id: string, newName?: string): DocumentTemplate | null {
    const original = this.templates.get(id);
    if (!original) return null;

    const duplicate: DocumentTemplate = {
      ...original,
      id: Date.now().toString(),
      name: newName || `${original.name} (Copy)`,
      isActive: false,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.registerTemplate(duplicate);
    return duplicate;
  }

  /**
   * Get default templates
   */
  private static getDefaultTemplates(): DocumentTemplate[] {
    return [
      {
        id: 'default-invoice',
        name: 'Standard Invoice',
        description: 'Professional invoice template with company branding',
        type: 'invoice',
        isActive: true,
        isDefault: true,
        design: {
          layout: 'standard',
          colors: {
            primary: '#2563eb',
            secondary: '#64748b',
            accent: '#059669',
            text: '#1f2937',
          },
          fonts: {
            heading: 'helvetica',
            body: 'helvetica',
            size: { heading: 16, body: 10, small: 8 },
          },
          spacing: {
            margins: 20,
            lineHeight: 1.5,
            sectionGap: 15,
          },
          header: {
            showLogo: true,
            logoPosition: 'left',
            showCompanyInfo: true,
          },
          footer: {
            showTerms: true,
            showSignature: true,
            showPageNumbers: true,
          },
          table: {
            headerBackgroundColor: '#f8fafc',
            alternateRowColor: '#f1f5f9',
            borderStyle: 'light',
          },
        },
        companyId: '1',
        createdBy: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'default-quotation',
        name: 'Modern Quotation',
        description: 'Modern quotation template with colorful design',
        type: 'quotation',
        isActive: true,
        isDefault: true,
        design: {
          layout: 'modern',
          colors: {
            primary: '#7c3aed',
            secondary: '#64748b',
            accent: '#f59e0b',
            text: '#374151',
          },
          fonts: {
            heading: 'helvetica',
            body: 'helvetica',
            size: { heading: 18, body: 11, small: 9 },
          },
          spacing: {
            margins: 25,
            lineHeight: 1.6,
            sectionGap: 20,
          },
          header: {
            showLogo: true,
            logoPosition: 'center',
            showCompanyInfo: true,
            backgroundColor: '#faf5ff',
          },
          footer: {
            showTerms: true,
            showSignature: false,
            showPageNumbers: true,
          },
          table: {
            headerBackgroundColor: '#7c3aed',
            borderStyle: 'medium',
          },
        },
        companyId: '1',
        createdBy: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'default-receipt',
        name: 'Simple Receipt',
        description: 'Clean minimal receipt template',
        type: 'receipt',
        isActive: true,
        isDefault: true,
        design: {
          layout: 'minimal',
          colors: {
            primary: '#000000',
            secondary: '#6b7280',
            accent: '#10b981',
            text: '#111827',
          },
          fonts: {
            heading: 'helvetica',
            body: 'helvetica',
            size: { heading: 14, body: 9, small: 7 },
          },
          spacing: {
            margins: 15,
            lineHeight: 1.4,
            sectionGap: 10,
          },
          header: {
            showLogo: false,
            logoPosition: 'left',
            showCompanyInfo: true,
          },
          footer: {
            showTerms: false,
            showSignature: false,
            showPageNumbers: false,
          },
          table: {
            headerBackgroundColor: '#f9fafb',
            borderStyle: 'none',
          },
        },
        companyId: '1',
        createdBy: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
}

// Initialize with default templates
TemplateManager.initialize();

export default TemplateManager;
