import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Eye, Palette, Layout, Star } from "lucide-react";
import { DocumentTemplate, DocumentType } from "@shared/types";
import TemplateManager from "../services/templateManager";

interface TemplateSelectorProps {
  documentType: DocumentType;
  selectedTemplateId?: string;
  onTemplateSelect: (templateId: string) => void;
  showPreview?: boolean;
  className?: string;
}

export default function TemplateSelector({
  documentType,
  selectedTemplateId,
  onTemplateSelect,
  showPreview = true,
  className = "",
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [previewTemplate, setPreviewTemplate] =
    useState<DocumentTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [documentType]);

  const loadTemplates = () => {
    const typeTemplates = TemplateManager.getTemplatesByType(documentType);
    setTemplates(typeTemplates);

    // Auto-select active template if none selected
    if (!selectedTemplateId) {
      const activeTemplate = TemplateManager.getActiveTemplate(documentType);
      if (activeTemplate) {
        onTemplateSelect(activeTemplate.id);
      }
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label>Document Template</Label>
        <div className="flex gap-2">
          <Select
            value={selectedTemplateId || ""}
            onValueChange={onTemplateSelect}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    <span>{template?.name || 'Unknown Template'}</span>
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
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showPreview && selectedTemplate && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Template Preview</DialogTitle>
                  <DialogDescription>
                    Preview of "{selectedTemplate.name}" template
                  </DialogDescription>
                </DialogHeader>
                <TemplatePreview template={selectedTemplate} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {selectedTemplate && (
        <Card className="border-muted">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Layout className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">
                    {selectedTemplate.design.layout} Layout
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{
                        backgroundColor: selectedTemplate.design.colors.primary,
                      }}
                    />
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{
                        backgroundColor:
                          selectedTemplate.design.colors.secondary,
                      }}
                    />
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{
                        backgroundColor: selectedTemplate.design.colors.accent,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedTemplate.isActive && (
                  <Badge variant="default" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
                {selectedTemplate.isDefault && (
                  <Badge variant="outline" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>
            </div>
            {selectedTemplate.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {selectedTemplate.description}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Template Preview Component
function TemplatePreview({ template }: { template: DocumentTemplate }) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-6 bg-white max-h-[500px] overflow-y-auto">
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
              <div
                className={`${template.design.header.logoPosition === "center" ? "order-1" : ""}`}
              >
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                  Logo
                </div>
              </div>
            )}
            {template.design.header.showCompanyInfo && (
              <div
                className={`${
                  template.design.header.logoPosition === "center"
                    ? "text-center order-2 flex-1"
                    : template.design.header.logoPosition === "right"
                      ? "text-left"
                      : "text-right"
                }`}
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
                <p style={{ fontSize: template.design.fonts.size.small }}>
                  123 Business Street
                </p>
                <p style={{ fontSize: template.design.fonts.size.small }}>
                  City, Country
                </p>
                <p style={{ fontSize: template.design.fonts.size.small }}>
                  +1 234 567 8900
                </p>
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
            <p
              style={{
                color: template.design.colors.secondary,
                fontSize: template.design.fonts.size.body,
              }}
            >
              #{template.type.toUpperCase()}-0001
            </p>
          </div>

          {/* Document Info */}
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <h4
                style={{
                  color: template.design.colors.primary,
                  fontSize: template.design.fonts.size.body + 1,
                  fontWeight: "bold",
                }}
              >
                Bill To:
              </h4>
              <p style={{ fontSize: template.design.fonts.size.body }}>
                Sample Customer Ltd
              </p>
              <p style={{ fontSize: template.design.fonts.size.small }}>
                456 Customer Avenue
              </p>
              <p style={{ fontSize: template.design.fonts.size.small }}>
                Customer City, Country
              </p>
            </div>
            <div className="text-right">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span style={{ fontSize: template.design.fonts.size.body }}>
                    Date:
                  </span>
                  <span style={{ fontSize: template.design.fonts.size.body }}>
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: template.design.fonts.size.body }}>
                    Due Date:
                  </span>
                  <span style={{ fontSize: template.design.fonts.size.body }}>
                    {new Date(
                      Date.now() + 30 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Table */}
          <div
            className="overflow-hidden rounded border"
            style={{
              borderWidth:
                template.design.table.borderStyle === "none"
                  ? "0"
                  : template.design.table.borderStyle === "light"
                    ? "1px"
                    : template.design.table.borderStyle === "medium"
                      ? "2px"
                      : "3px",
            }}
          >
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      template.design.table.headerBackgroundColor,
                  }}
                >
                  <th
                    className="text-left p-3"
                    style={{
                      fontSize: template.design.fonts.size.body,
                      fontWeight: "bold",
                      color: template.design.colors.text,
                    }}
                  >
                    Description
                  </th>
                  <th
                    className="text-center p-3"
                    style={{
                      fontSize: template.design.fonts.size.body,
                      fontWeight: "bold",
                    }}
                  >
                    Qty
                  </th>
                  <th
                    className="text-right p-3"
                    style={{
                      fontSize: template.design.fonts.size.body,
                      fontWeight: "bold",
                    }}
                  >
                    Rate
                  </th>
                  <th
                    className="text-right p-3"
                    style={{
                      fontSize: template.design.fonts.size.body,
                      fontWeight: "bold",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{
                    backgroundColor:
                      template.design.table.alternateRowColor || "transparent",
                  }}
                >
                  <td
                    className="p-3"
                    style={{ fontSize: template.design.fonts.size.body }}
                  >
                    Sample Product 1
                  </td>
                  <td
                    className="text-center p-3"
                    style={{ fontSize: template.design.fonts.size.body }}
                  >
                    2
                  </td>
                  <td
                    className="text-right p-3"
                    style={{ fontSize: template.design.fonts.size.body }}
                  >
                    $100.00
                  </td>
                  <td
                    className="text-right p-3"
                    style={{ fontSize: template.design.fonts.size.body }}
                  >
                    $200.00
                  </td>
                </tr>
                <tr>
                  <td
                    className="p-3"
                    style={{ fontSize: template.design.fonts.size.body }}
                  >
                    Sample Product 2
                  </td>
                  <td
                    className="text-center p-3"
                    style={{ fontSize: template.design.fonts.size.body }}
                  >
                    1
                  </td>
                  <td
                    className="text-right p-3"
                    style={{ fontSize: template.design.fonts.size.body }}
                  >
                    $50.00
                  </td>
                  <td
                    className="text-right p-3"
                    style={{ fontSize: template.design.fonts.size.body }}
                  >
                    $50.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span style={{ fontSize: template.design.fonts.size.body }}>
                  Subtotal:
                </span>
                <span style={{ fontSize: template.design.fonts.size.body }}>
                  $250.00
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ fontSize: template.design.fonts.size.body }}>
                  Tax (16%):
                </span>
                <span style={{ fontSize: template.design.fonts.size.body }}>
                  $40.00
                </span>
              </div>
              <div className="border-t pt-2">
                <div
                  className="flex justify-between"
                  style={{
                    fontSize: template.design.fonts.size.body + 2,
                    fontWeight: "bold",
                    color: template.design.colors.primary,
                  }}
                >
                  <span>Total:</span>
                  <span>$290.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          {(template.design.footer.showTerms ||
            template.design.footer.showSignature ||
            template.design.footer.customText) && (
            <div
              className="pt-8 space-y-4"
              style={{
                marginTop: template.design.spacing.sectionGap,
              }}
            >
              {template.design.footer.customText && (
                <p
                  style={{
                    fontSize: template.design.fonts.size.small,
                    color: template.design.colors.secondary,
                    textAlign: "center",
                  }}
                >
                  {template.design.footer.customText}
                </p>
              )}
              {template.design.footer.showTerms && (
                <div style={{ fontSize: template.design.fonts.size.small }}>
                  <h4
                    style={{
                      fontWeight: "bold",
                      color: template.design.colors.primary,
                    }}
                  >
                    Terms & Conditions:
                  </h4>
                  <p style={{ color: template.design.colors.secondary }}>
                    Payment is due within 30 days. Late payments may incur
                    additional charges.
                  </p>
                </div>
              )}
              {template.design.footer.showSignature && (
                <div className="flex justify-between pt-8">
                  <div>
                    <div className="border-b border-gray-300 w-48 mb-2"></div>
                    <p style={{ fontSize: template.design.fonts.size.small }}>
                      Authorized Signature
                    </p>
                  </div>
                  <div>
                    <div className="border-b border-gray-300 w-48 mb-2"></div>
                    <p style={{ fontSize: template.design.fonts.size.small }}>
                      Date
                    </p>
                  </div>
                </div>
              )}
              {template.design.footer.showPageNumbers && (
                <div className="text-center pt-4">
                  <p
                    style={{
                      fontSize: template.design.fonts.size.small,
                      color: template.design.colors.secondary,
                    }}
                  >
                    Page 1 of 1
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
