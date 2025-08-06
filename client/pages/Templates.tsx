import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
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
  Search,
  Filter,
  Upload,
  Save,
  X,
} from "lucide-react";
import { DocumentTemplate, DocumentType, TemplateDesign } from "@shared/types";
import { useToast } from "../hooks/use-toast";
import TemplateManager from "../services/templateManager";
import PDFService from "../services/pdfService";

const DOCUMENT_TYPES: {
  value: DocumentType;
  label: string;
  description: string;
}[] = [
  {
    value: "invoice",
    label: "Invoice",
    description: "Customer billing documents",
  },
  {
    value: "quotation",
    label: "Quotation",
    description: "Price quotations and estimates",
  },
  {
    value: "proforma",
    label: "Proforma Invoice",
    description: "Preliminary billing documents",
  },
  {
    value: "receipt",
    label: "Receipt",
    description: "Payment acknowledgment documents",
  },
  {
    value: "packing_list",
    label: "Packing List",
    description: "Item listing for shipments",
  },
  {
    value: "delivery_note",
    label: "Delivery Note",
    description: "Delivery confirmation documents",
  },
  {
    value: "purchase_order",
    label: "Purchase Order",
    description: "Supplier ordering documents",
  },
  {
    value: "credit_note",
    label: "Credit Note",
    description: "Customer credit adjustments",
  },
  {
    value: "debit_note",
    label: "Debit Note",
    description: "Customer debit adjustments",
  },
  { value: "statement", label: "Statement", description: "Account statements" },
  {
    value: "goods_received_note",
    label: "Goods Received Note",
    description: "Inventory receipt tracking",
  },
  {
    value: "material_transfer_note",
    label: "Material Transfer Note",
    description: "Internal transfers",
  },
];

const LAYOUT_OPTIONS = [
  {
    value: "standard",
    label: "Standard",
    description: "Classic business layout",
  },
  {
    value: "modern",
    label: "Modern",
    description: "Contemporary design with colors",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Clean and simple layout",
  },
  {
    value: "corporate",
    label: "Corporate",
    description: "Professional corporate style",
  },
];

const FONT_OPTIONS = [
  { value: "helvetica", label: "Helvetica" },
  { value: "times", label: "Times Roman" },
  { value: "courier", label: "Courier" },
];

const BORDER_STYLES = [
  { value: "none", label: "None" },
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "heavy", label: "Heavy" },
];

const COLOR_PRESETS = [
  {
    name: "Blue Professional",
    colors: {
      primary: "#2563eb",
      secondary: "#64748b",
      accent: "#059669",
      text: "#1f2937",
    },
  },
  {
    name: "Purple Modern",
    colors: {
      primary: "#7c3aed",
      secondary: "#64748b",
      accent: "#f59e0b",
      text: "#374151",
    },
  },
  {
    name: "Green Corporate",
    colors: {
      primary: "#059669",
      secondary: "#64748b",
      accent: "#10b981",
      text: "#1f2937",
    },
  },
  {
    name: "Red Statement",
    colors: {
      primary: "#dc2626",
      secondary: "#64748b",
      accent: "#f87171",
      text: "#1f2937",
    },
  },
  {
    name: "Gray Minimal",
    colors: {
      primary: "#374151",
      secondary: "#6b7280",
      accent: "#9ca3af",
      text: "#111827",
    },
  },
];

export default function Templates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<
    DocumentTemplate[]
  >([]);
  const [selectedType, setSelectedType] = useState<DocumentType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<DocumentTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] =
    useState<DocumentTemplate | null>(null);

  // Form state for creating/editing templates
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "invoice" as DocumentType,
    design: {
      layout: "standard",
      colors: COLOR_PRESETS[0].colors,
      fonts: {
        heading: "helvetica",
        body: "helvetica",
        size: { heading: 16, body: 10, small: 8 },
      },
      spacing: {
        margins: 20,
        lineHeight: 1.5,
        sectionGap: 15,
      },
      header: {
        showLogo: true,
        logoPosition: "left" as const,
        showCompanyInfo: true,
      },
      footer: {
        showTerms: true,
        showSignature: true,
        showPageNumbers: true,
      },
      table: {
        headerBackgroundColor: "#f8fafc",
        alternateRowColor: "#f1f5f9",
        borderStyle: "light" as const,
      },
    } as TemplateDesign,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, selectedType, searchTerm]);

  const loadTemplates = () => {
    const allTemplates = TemplateManager.getAllTemplates();
    setTemplates(allTemplates);
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (selectedType !== "all") {
      filtered = filtered.filter((t) => t.type === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = () => {
    try {
      const template = TemplateManager.createTemplate(
        formData.name,
        formData.description,
        formData.type,
        formData.design,
      );

      loadTemplates();
      setCreateDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: `Template "${template.name}" created successfully`,
      });
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;

    try {
      TemplateManager.updateTemplate(editingTemplate.id, {
        name: formData.name,
        description: formData.description,
        design: formData.design,
      });

      loadTemplates();
      setEditingTemplate(null);
      resetForm();

      toast({
        title: "Success",
        description: `Template "${formData.name}" updated successfully`,
      });
    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = (template: DocumentTemplate) => {
    if (template.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Default templates cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        TemplateManager.deleteTemplate(template.id);
        loadTemplates();

        toast({
          title: "Success",
          description: `Template "${template.name}" deleted successfully`,
        });
      } catch (error) {
        console.error("Error deleting template:", error);
        toast({
          title: "Error",
          description: "Failed to delete template",
          variant: "destructive",
        });
      }
    }
  };

  const handleDuplicateTemplate = (template: DocumentTemplate) => {
    try {
      const duplicate = TemplateManager.duplicateTemplate(template.id);
      if (duplicate) {
        loadTemplates();
        toast({
          title: "Success",
          description: `Template duplicated as "${duplicate.name}"`,
        });
      }
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      });
    }
  };

  const handleSetActiveTemplate = (template: DocumentTemplate) => {
    try {
      TemplateManager.setActiveTemplate(template.type, template.id);
      loadTemplates();

      toast({
        title: "Success",
        description: `"${template.name}" is now the active template for ${template.type}`,
      });
    } catch (error) {
      console.error("Error setting active template:", error);
      toast({
        title: "Error",
        description: "Failed to set active template",
        variant: "destructive",
      });
    }
  };

  const handlePreviewTemplate = (template: DocumentTemplate) => {
    setPreviewTemplate(template);
  };

  const handleDownloadTemplate = async (template: DocumentTemplate) => {
    try {
      // Generate a sample PDF using the template
      const mockData = generateMockDocumentData(template.type);
      await PDFService.generateDocument(template.type, mockData, template);

      toast({
        title: "Success",
        description: "Template preview downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      toast({
        title: "Error",
        description: "Failed to download template preview",
        variant: "destructive",
      });
    }
  };

  const generateMockDocumentData = (type: DocumentType) => {
    // Generate sample data based on document type for preview
    const baseData = {
      id: "SAMPLE",
      customer: {
        name: "Sample Customer Ltd",
        email: "customer@example.com",
        address: "123 Business Street, City, Country",
        phone: "+1 234 567 8900",
      },
      items: [
        {
          name: "Sample Product 1",
          quantity: 2,
          unitPrice: 100,
          total: 200,
        },
        {
          name: "Sample Product 2",
          quantity: 1,
          unitPrice: 50,
          total: 50,
        },
      ],
      subtotal: 250,
      vatAmount: 40,
      total: 290,
      date: new Date(),
    };

    switch (type) {
      case "invoice":
        return { ...baseData, invoiceNumber: "INV-SAMPLE" };
      case "quotation":
        return { ...baseData, quotationNumber: "QUO-SAMPLE" };
      case "proforma":
        return { ...baseData, proformaNumber: "PRO-SAMPLE" };
      case "credit_note":
        return {
          ...baseData,
          creditNumber: "CRN-SAMPLE",
          reason: "Sample credit note reason",
        };
      default:
        return baseData;
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "invoice" as DocumentType,
      design: {
        layout: "standard",
        colors: COLOR_PRESETS[0].colors,
        fonts: {
          heading: "helvetica",
          body: "helvetica",
          size: { heading: 16, body: 10, small: 8 },
        },
        spacing: {
          margins: 20,
          lineHeight: 1.5,
          sectionGap: 15,
        },
        header: {
          showLogo: true,
          logoPosition: "left" as const,
          showCompanyInfo: true,
        },
        footer: {
          showTerms: true,
          showSignature: true,
          showPageNumbers: true,
        },
        table: {
          headerBackgroundColor: "#f8fafc",
          alternateRowColor: "#f1f5f9",
          borderStyle: "light" as const,
        },
      } as TemplateDesign,
    });
  };

  const startEdit = (template: DocumentTemplate) => {
    setFormData({
      name: template.name,
      description: template.description || "",
      type: template.type,
      design: template.design,
    });
    setEditingTemplate(template);
  };

  const templatesByType = DOCUMENT_TYPES.map((docType) => ({
    ...docType,
    templates: filteredTemplates.filter((t) => t.type === docType.value),
    activeTemplate: templates.find(
      (t) => t.type === docType.value && t.isActive,
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Document Templates
          </h1>
          <p className="text-muted-foreground">
            Create and manage templates for all your business documents
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setCreateDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </DialogTitle>
              <DialogDescription>
                Design a custom template for your business documents
              </DialogDescription>
            </DialogHeader>
            <TemplateDesigner
              formData={formData}
              setFormData={setFormData}
              onSave={
                editingTemplate ? handleUpdateTemplate : handleCreateTemplate
              }
              onCancel={() => {
                setCreateDialogOpen(false);
                setEditingTemplate(null);
                resetForm();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={selectedType}
          onValueChange={(value: any) => setSelectedType(value)}
        >
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {DOCUMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates by Category */}
      <div className="space-y-8">
        {templatesByType.map((category) => (
          <Card key={category.value}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {category.label}
                      <Badge variant="outline">
                        {category.templates.length} template
                        {category.templates.length !== 1 ? "s" : ""}
                      </Badge>
                      {category.activeTemplate && (
                        <Badge variant="default" className="text-xs">
                          Active: {category.activeTemplate.name}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {category.templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No templates found for {category.label.toLowerCase()}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        type: category.value,
                      }));
                      setCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create {category.label} Template
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={() => startEdit(template)}
                      onDelete={() => handleDeleteTemplate(template)}
                      onDuplicate={() => handleDuplicateTemplate(template)}
                      onSetActive={() => handleSetActiveTemplate(template)}
                      onPreview={() => handlePreviewTemplate(template)}
                      onDownload={() => handleDownloadTemplate(template)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Modify the design and settings for this template
            </DialogDescription>
          </DialogHeader>
          <TemplateDesigner
            formData={formData}
            setFormData={setFormData}
            onSave={handleUpdateTemplate}
            onCancel={() => setEditingTemplate(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview of "{previewTemplate?.name}" template
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && <TemplatePreview template={previewTemplate} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Template Card Component
function TemplateCard({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onSetActive,
  onPreview,
  onDownload,
}: {
  template: DocumentTemplate;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSetActive: () => void;
  onPreview: () => void;
  onDownload: () => void;
}) {
  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold flex items-center gap-2">
              {template.name}
              {template.isActive && (
                <Badge variant="default" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
              {template.isDefault && (
                <Badge variant="outline" className="text-xs">
                  Default
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
              <DropdownMenuItem onClick={onPreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Sample
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {!template.isActive && (
                <DropdownMenuItem onClick={onSetActive}>
                  <Star className="h-4 w-4 mr-2" />
                  Set as Active
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {!template.isDefault && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layout className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm capitalize">
              {template.design.layout} Layout
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: template.design.colors.primary }}
              />
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: template.design.colors.secondary }}
              />
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: template.design.colors.accent }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onPreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Template Designer Component
function TemplateDesigner({
  formData,
  setFormData,
  onSave,
  onCancel,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const updateDesign = (path: string, value: any) => {
    setFormData((prev: any) => {
      const newData = { ...prev };
      const keys = path.split(".");
      let current = newData.design;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;

      return newData;
    });
  };

  const applyColorPreset = (preset: (typeof COLOR_PRESETS)[0]) => {
    updateDesign("colors", preset.colors);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter template name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe this template"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Document Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <div className="grid gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Layout Style</h4>
              <Select
                value={formData.design.layout}
                onValueChange={(value) => updateDesign("layout", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LAYOUT_OPTIONS.map((layout) => (
                    <SelectItem key={layout.value} value={layout.value}>
                      {layout.label} - {layout.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Color Scheme</h4>
              <div className="grid gap-3">
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PRESETS.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => applyColorPreset(preset)}
                      className="h-auto p-2 flex flex-col items-center gap-1"
                    >
                      <div className="flex gap-1">
                        {Object.values(preset.colors).map((color, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-xs">{preset.name}</span>
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.design.colors.primary}
                        onChange={(e) =>
                          updateDesign("colors.primary", e.target.value)
                        }
                        className="w-12 h-10"
                      />
                      <Input
                        value={formData.design.colors.primary}
                        onChange={(e) =>
                          updateDesign("colors.primary", e.target.value)
                        }
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.design.colors.secondary}
                        onChange={(e) =>
                          updateDesign("colors.secondary", e.target.value)
                        }
                        className="w-12 h-10"
                      />
                      <Input
                        value={formData.design.colors.secondary}
                        onChange={(e) =>
                          updateDesign("colors.secondary", e.target.value)
                        }
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Typography</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heading Font</Label>
                  <Select
                    value={formData.design.fonts.heading}
                    onValueChange={(value) =>
                      updateDesign("fonts.heading", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Body Font</Label>
                  <Select
                    value={formData.design.fonts.body}
                    onValueChange={(value) => updateDesign("fonts.body", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <div className="grid gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Header Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Show Logo</Label>
                  <Switch
                    checked={formData.design.header.showLogo}
                    onCheckedChange={(checked) =>
                      updateDesign("header.showLogo", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Company Info</Label>
                  <Switch
                    checked={formData.design.header.showCompanyInfo}
                    onCheckedChange={(checked) =>
                      updateDesign("header.showCompanyInfo", checked)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo Position</Label>
                  <Select
                    value={formData.design.header.logoPosition}
                    onValueChange={(value) =>
                      updateDesign("header.logoPosition", value)
                    }
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

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Footer Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Show Terms & Conditions</Label>
                  <Switch
                    checked={formData.design.footer.showTerms}
                    onCheckedChange={(checked) =>
                      updateDesign("footer.showTerms", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Signature Area</Label>
                  <Switch
                    checked={formData.design.footer.showSignature}
                    onCheckedChange={(checked) =>
                      updateDesign("footer.showSignature", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Page Numbers</Label>
                  <Switch
                    checked={formData.design.footer.showPageNumbers}
                    onCheckedChange={(checked) =>
                      updateDesign("footer.showPageNumbers", checked)
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Table Style</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Border Style</Label>
                  <Select
                    value={formData.design.table.borderStyle}
                    onValueChange={(value) =>
                      updateDesign("table.borderStyle", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BORDER_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Header Background</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.design.table.headerBackgroundColor}
                      onChange={(e) =>
                        updateDesign(
                          "table.headerBackgroundColor",
                          e.target.value,
                        )
                      }
                      className="w-12 h-10"
                    />
                    <Input
                      value={formData.design.table.headerBackgroundColor}
                      onChange={(e) =>
                        updateDesign(
                          "table.headerBackgroundColor",
                          e.target.value,
                        )
                      }
                      placeholder="#f8fafc"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="text-center text-muted-foreground py-8">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>Template preview will be shown here</p>
              <p className="text-sm">Full preview available after saving</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!formData.name.trim()}>
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
      </DialogFooter>
    </div>
  );
}

// Template Preview Component
function TemplatePreview({ template }: { template: DocumentTemplate }) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-6 bg-white">
        <div
          className="space-y-4"
          style={{
            fontFamily: template.design.fonts.body,
            color: template.design.colors.text,
            lineHeight: template.design.spacing.lineHeight,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 rounded"
            style={{
              backgroundColor:
                template.design.header.backgroundColor || "transparent",
            }}
          >
            {template.design.header.showLogo && (
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                Logo
              </div>
            )}
            {template.design.header.showCompanyInfo && (
              <div
                className={
                  template.design.header.logoPosition === "center"
                    ? "text-center"
                    : "text-right"
                }
              >
                <h3
                  style={{
                    color: template.design.colors.primary,
                    fontSize: template.design.fonts.size.heading,
                    fontFamily: template.design.fonts.heading,
                  }}
                >
                  Your Company Name
                </h3>
                <p>123 Business Street</p>
                <p>City, Country</p>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="text-center py-4">
            <h1
              style={{
                color: template.design.colors.primary,
                fontSize: template.design.fonts.size.heading + 4,
                fontFamily: template.design.fonts.heading,
              }}
            >
              {template.type.toUpperCase().replace("_", " ")}
            </h1>
          </div>

          {/* Sample Table */}
          <div className="overflow-hidden rounded border">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      template.design.table.headerBackgroundColor,
                  }}
                >
                  <th className="text-left p-2 border-b">Item</th>
                  <th className="text-right p-2 border-b">Qty</th>
                  <th className="text-right p-2 border-b">Price</th>
                  <th className="text-right p-2 border-b">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{
                    backgroundColor:
                      template.design.table.alternateRowColor || "transparent",
                  }}
                >
                  <td className="p-2 border-b">Sample Product 1</td>
                  <td className="text-right p-2 border-b">2</td>
                  <td className="text-right p-2 border-b">$100.00</td>
                  <td className="text-right p-2 border-b">$200.00</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">Sample Product 2</td>
                  <td className="text-right p-2 border-b">1</td>
                  <td className="text-right p-2 border-b">$50.00</td>
                  <td className="text-right p-2 border-b">$50.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {(template.design.footer.showTerms ||
            template.design.footer.showSignature) && (
            <div className="pt-8 space-y-4">
              {template.design.footer.showTerms && (
                <p className="text-sm text-muted-foreground">
                  Terms and conditions apply. Please review our payment terms.
                </p>
              )}
              {template.design.footer.showSignature && (
                <div className="flex justify-between">
                  <div>
                    <div className="border-b border-gray-300 w-48 mb-2"></div>
                    <p className="text-sm">Authorized Signature</p>
                  </div>
                  <div>
                    <div className="border-b border-gray-300 w-48 mb-2"></div>
                    <p className="text-sm">Date</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
