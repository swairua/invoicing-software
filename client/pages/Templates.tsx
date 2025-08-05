import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import {
  Plus,
  FileText,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Palette,
  Layout,
  Type,
  Settings,
  Check,
  Star,
  Download,
} from 'lucide-react';
import { DocumentTemplate, DocumentType, TemplateDesign } from '@shared/types';
import { useToast } from '../hooks/use-toast';
import PDFService from '../services/pdfService';

// Mock templates data
const mockTemplates: DocumentTemplate[] = [
  {
    id: '1',
    name: 'Standard Invoice',
    description: 'Classic professional invoice template',
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
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Modern Quotation',
    description: 'Modern colorful quotation template',
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
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    name: 'Minimal Receipt',
    description: 'Clean minimal receipt template',
    type: 'receipt',
    isActive: false,
    isDefault: false,
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
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
];

interface TemplateFormData {
  name: string;
  description: string;
  type: DocumentType;
  design: TemplateDesign;
}

export default function Templates() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    type: 'invoice',
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
        borderStyle: 'light',
      },
    },
  });
  const { toast } = useToast();

  const documentTypes: { value: DocumentType; label: string; icon: string; description: string }[] = [
    { value: 'invoice', label: 'Invoice', icon: '🧾', description: 'Customer billing documents' },
    { value: 'quotation', label: 'Quotation', icon: '💼', description: 'Price quotes for customers' },
    { value: 'proforma', label: 'Proforma Invoice', icon: '📋', description: 'Preliminary invoices' },
    { value: 'receipt', label: 'Receipt', icon: '🧾', description: 'Payment acknowledgments' },
    { value: 'packing_list', label: 'Packing List', icon: '📦', description: 'Item packaging details' },
    { value: 'delivery_note', label: 'Delivery Note', icon: '🚚', description: 'Delivery confirmations' },
    { value: 'purchase_order', label: 'Purchase Order', icon: '🛒', description: 'Supplier orders' },
    { value: 'credit_note', label: 'Credit Note', icon: '↩️', description: 'Customer credit documents' },
    { value: 'debit_note', label: 'Debit Note', icon: '↪️', description: 'Customer debit documents' },
    { value: 'statement', label: 'Statement', icon: '📊', description: 'Account statements' },
    { value: 'goods_received_note', label: 'Goods Received Note', icon: '📥', description: 'Inventory receipts' },
    { value: 'material_transfer_note', label: 'Material Transfer Note', icon: '🔄', description: 'Internal transfers' },
  ];

  const layoutOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'modern', label: 'Modern' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'corporate', label: 'Corporate' },
  ];

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTemplate: DocumentTemplate = {
      id: Date.now().toString(),
      ...formData,
      isActive: false,
      isDefault: false,
      companyId: '1',
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTemplates(prev => [newTemplate, ...prev]);
    setIsCreateDialogOpen(false);
    resetForm();
    
    toast({
      title: "Template Created",
      description: `Template "${formData.name}" has been created successfully.`,
    });
  };

  const handleActivateTemplate = (templateId: string, type: DocumentType) => {
    setTemplates(prev => prev.map(template => {
      if (template.type === type) {
        return {
          ...template,
          isActive: template.id === templateId,
          isDefault: template.id === templateId,
        };
      }
      return template;
    }));

    const templateName = templates.find(t => t.id === templateId)?.name;
    toast({
      title: "Template Activated",
      description: `"${templateName}" is now the active template for ${type}s.`,
    });
  };

  const handleDuplicateTemplate = (template: DocumentTemplate) => {
    const duplicatedTemplate: DocumentTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isActive: false,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTemplates(prev => [duplicatedTemplate, ...prev]);
    
    toast({
      title: "Template Duplicated",
      description: `Template "${duplicatedTemplate.name}" has been created.`,
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Default templates cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    setTemplates(prev => prev.filter(t => t.id !== templateId));
    
    toast({
      title: "Template Deleted",
      description: "Template has been deleted successfully.",
    });
  };

  const handlePreviewTemplate = (template: DocumentTemplate) => {
    // Generate a sample PDF with the template
    toast({
      title: "Preview Generated",
      description: "Sample PDF has been generated for preview.",
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'invoice',
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
          borderStyle: 'light',
        },
      },
    });
  };

  const getTypeIcon = (type: DocumentType) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType?.icon || '📄';
  };

  const groupedTemplates = documentTypes.reduce((acc, docType) => {
    acc[docType.value] = templates.filter(t => t.type === docType.value);
    return acc;
  }, {} as Record<DocumentType, DocumentTemplate[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Templates</h1>
          <p className="text-muted-foreground">
            Manage and customize your document templates for different business needs
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Design a new document template for your business documents
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTemplate} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Template Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Standard Invoice"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Document Type *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: DocumentType) => setFormData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {documentTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                <span>{type.icon}</span>
                                <div>
                                  <div className="font-medium">{type.label}</div>
                                  <div className="text-xs text-muted-foreground">{type.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this template"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="design" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Layout Style</Label>
                      <Select 
                        value={formData.design.layout} 
                        onValueChange={(value: any) => setFormData(prev => ({ 
                          ...prev, 
                          design: { ...prev.design, layout: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {layoutOptions.map(layout => (
                            <SelectItem key={layout.value} value={layout.value}>
                              {layout.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Border Style</Label>
                      <Select 
                        value={formData.design.table.borderStyle} 
                        onValueChange={(value: any) => setFormData(prev => ({ 
                          ...prev, 
                          design: { 
                            ...prev.design, 
                            table: { ...prev.design.table, borderStyle: value }
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="heavy">Heavy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <Input
                        type="color"
                        value={formData.design.colors.primary}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          design: { 
                            ...prev.design, 
                            colors: { ...prev.design.colors, primary: e.target.value }
                          }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <Input
                        type="color"
                        value={formData.design.colors.secondary}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          design: { 
                            ...prev.design, 
                            colors: { ...prev.design.colors, secondary: e.target.value }
                          }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Accent Color</Label>
                      <Input
                        type="color"
                        value={formData.design.colors.accent}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          design: { 
                            ...prev.design, 
                            colors: { ...prev.design.colors, accent: e.target.value }
                          }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <Input
                        type="color"
                        value={formData.design.colors.text}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          design: { 
                            ...prev.design, 
                            colors: { ...prev.design.colors, text: e.target.value }
                          }
                        }))}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="layout" className="space-y-4">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Header Options</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Show Logo</Label>
                          <Switch
                            checked={formData.design.header.showLogo}
                            onCheckedChange={(checked) => setFormData(prev => ({ 
                              ...prev, 
                              design: { 
                                ...prev.design, 
                                header: { ...prev.design.header, showLogo: checked }
                              }
                            }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Show Company Info</Label>
                          <Switch
                            checked={formData.design.header.showCompanyInfo}
                            onCheckedChange={(checked) => setFormData(prev => ({ 
                              ...prev, 
                              design: { 
                                ...prev.design, 
                                header: { ...prev.design.header, showCompanyInfo: checked }
                              }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Logo Position</Label>
                          <Select 
                            value={formData.design.header.logoPosition} 
                            onValueChange={(value: any) => setFormData(prev => ({ 
                              ...prev, 
                              design: { 
                                ...prev.design, 
                                header: { ...prev.design.header, logoPosition: value }
                              }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Footer Options</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Show Terms</Label>
                          <Switch
                            checked={formData.design.footer.showTerms}
                            onCheckedChange={(checked) => setFormData(prev => ({ 
                              ...prev, 
                              design: { 
                                ...prev.design, 
                                footer: { ...prev.design.footer, showTerms: checked }
                              }
                            }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Show Signature</Label>
                          <Switch
                            checked={formData.design.footer.showSignature}
                            onCheckedChange={(checked) => setFormData(prev => ({ 
                              ...prev, 
                              design: { 
                                ...prev.design, 
                                footer: { ...prev.design.footer, showSignature: checked }
                              }
                            }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Show Page Numbers</Label>
                          <Switch
                            checked={formData.design.footer.showPageNumbers}
                            onCheckedChange={(checked) => setFormData(prev => ({ 
                              ...prev, 
                              design: { 
                                ...prev.design, 
                                footer: { ...prev.design.footer, showPageNumbers: checked }
                              }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Create Template
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates by Type */}
      <div className="space-y-6">
        {documentTypes.map(docType => (
          <Card key={docType.value}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{docType.icon}</span>
                {docType.label} Templates
              </CardTitle>
              <CardDescription>
                {docType.description} - Manage templates for {docType.label.toLowerCase()} documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedTemplates[docType.value]?.map(template => (
                  <div key={template.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {template.name}
                          {template.isDefault && (
                            <Badge variant="default" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handlePreviewTemplate(template)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          {!template.isDefault && (
                            <DropdownMenuItem onClick={() => handleActivateTemplate(template.id, template.type)}>
                              <Check className="mr-2 h-4 w-4" />
                              Set as Active
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {!template.isDefault && (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Layout className="h-3 w-3" />
                      {template.design.layout}
                      <Palette className="h-3 w-3 ml-2" />
                      <div 
                        className="w-3 h-3 rounded-full border" 
                        style={{ backgroundColor: template.design.colors.primary }}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      {!template.isDefault && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleActivateTemplate(template.id, template.type)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!groupedTemplates[docType.value] || groupedTemplates[docType.value].length === 0) && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No templates found for {docType.label.toLowerCase()}</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, type: docType.value }));
                        setIsCreateDialogOpen(true);
                      }}
                    >
                      Create First Template
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
