import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Settings,
  Percent,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { dataServiceFactory } from "../services/dataServiceFactory";

interface TaxConfiguration {
  id: string;
  name: string;
  code: string;
  taxType: "vat" | "sales_tax" | "gst" | "custom";
  rate: number;
  calculationMethod: "inclusive" | "exclusive";
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  effectiveStatus: boolean;
  applicableFrom: string;
  applicableUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TaxSettings() {
  const [taxConfigurations, setTaxConfigurations] = useState<
    TaxConfiguration[]
  >([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxConfiguration | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    taxType: "vat" as const,
    rate: 0,
    calculationMethod: "exclusive" as const,
    description: "",
    isDefault: false,
    isActive: true,
    applicableFrom: new Date().toISOString().split("T")[0],
    applicableUntil: "",
  });
  const { toast } = useToast();

  // Load tax configurations
  useEffect(() => {
    loadTaxConfigurations();
  }, []);

  const loadTaxConfigurations = async () => {
    try {
      const dataService = dataServiceFactory.getDataService();
      const configurations = dataService.getTaxConfigurations();
      setTaxConfigurations(configurations);
    } catch (error) {
      console.error("Error loading tax configurations:", error);
      toast({
        title: "Error",
        description: "Failed to load tax configurations",
        variant: "destructive",
      });
    }
  };

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const dataService = dataServiceFactory.getDataService();
      const result = await dataService.createTaxConfiguration(formData);

      if (result.success) {
        await loadTaxConfigurations();
        setIsCreateDialogOpen(false);
        resetForm();
        toast({
          title: "Tax Configuration Created",
          description: `${formData.name} has been created successfully`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error creating tax configuration:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create tax configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTax) return;

    setIsLoading(true);

    try {
      const dataService = dataServiceFactory.getDataService();
      const result = await dataService.updateTaxConfiguration(editingTax.id, formData);

      if (result.success) {
        await loadTaxConfigurations();
        setIsEditDialogOpen(false);
        setEditingTax(null);
        resetForm();
        toast({
          title: "Tax Configuration Updated",
          description: `${formData.name} has been updated successfully`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error updating tax configuration:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update tax configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTax = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const dataService = dataServiceFactory.getDataService();
      const result = await dataService.deleteTaxConfiguration(id);

      if (result.success) {
        await loadTaxConfigurations();
        toast({
          title: "Tax Configuration Deleted",
          description: `${name} has been deleted successfully`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error deleting tax configuration:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete tax configuration",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const dataService = dataServiceFactory.getDataService();
      const result = await dataService.toggleTaxConfigurationStatus(id, !currentStatus);

      if (result.success) {
        await loadTaxConfigurations();
        toast({
          title: "Status Updated",
          description: `Tax configuration ${!currentStatus ? "activated" : "deactivated"} successfully`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (id: string, name: string) => {
    try {
      const dataService = dataServiceFactory.getDataService();
      const result = await dataService.setDefaultTaxConfiguration(id);

      if (result.success) {
        await loadTaxConfigurations();
        toast({
          title: "Default Tax Set",
          description: `${name} is now the default tax configuration`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error setting default:", error);
      toast({
        title: "Error",
        description: "Failed to set default tax configuration",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (tax: TaxConfiguration) => {
    setEditingTax(tax);
    setFormData({
      name: tax.name,
      code: tax.code,
      taxType: tax.taxType,
      rate: tax.rate,
      calculationMethod: tax.calculationMethod,
      description: tax.description || "",
      isDefault: tax.isDefault,
      isActive: tax.isActive,
      applicableFrom: tax.applicableFrom,
      applicableUntil: tax.applicableUntil || "",
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      taxType: "vat",
      rate: 0,
      calculationMethod: "exclusive",
      description: "",
      isDefault: false,
      isActive: true,
      applicableFrom: new Date().toISOString().split("T")[0],
      applicableUntil: "",
    });
  };

  const getStatusBadge = (tax: TaxConfiguration) => {
    if (!tax.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (!tax.effectiveStatus) {
      return <Badge variant="outline">Expired</Badge>;
    }
    if (tax.isDefault) {
      return <Badge variant="default">Default</Badge>;
    }
    return (
      <Badge variant="outline" className="text-green-600">
        Active
      </Badge>
    );
  };

  const getStatusIcon = (tax: TaxConfiguration) => {
    if (!tax.isActive) {
      return <XCircle className="h-4 w-4 text-gray-500" />;
    }
    if (!tax.effectiveStatus) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const TaxForm = ({
    onSubmit,
    submitLabel,
  }: {
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Standard VAT"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, code: e.target.value }))
            }
            placeholder="e.g., VAT-STD"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="taxType">Tax Type</Label>
          <Select
            value={formData.taxType}
            onValueChange={(value: any) =>
              setFormData((prev) => ({ ...prev, taxType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vat">VAT</SelectItem>
              <SelectItem value="sales_tax">Sales Tax</SelectItem>
              <SelectItem value="gst">GST</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">Rate (%) *</Label>
          <Input
            id="rate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.rate}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                rate: parseFloat(e.target.value) || 0,
              }))
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="calculationMethod">Calculation Method</Label>
        <Select
          value={formData.calculationMethod}
          onValueChange={(value: any) =>
            setFormData((prev) => ({ ...prev, calculationMethod: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="exclusive">
              Exclusive (Tax added to subtotal)
            </SelectItem>
            <SelectItem value="inclusive">
              Inclusive (Tax included in price)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="applicableFrom">Applicable From</Label>
          <Input
            id="applicableFrom"
            type="date"
            value={formData.applicableFrom}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                applicableFrom: e.target.value,
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="applicableUntil">Applicable Until (Optional)</Label>
          <Input
            id="applicableUntil"
            type="date"
            value={formData.applicableUntil}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                applicableUntil: e.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Optional description of this tax configuration"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isDefault"
            checked={formData.isDefault}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isDefault: checked }))
            }
          />
          <Label htmlFor="isDefault">Set as Default</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isActive: checked }))
            }
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Settings</h1>
          <p className="text-muted-foreground">
            Configure tax rates and calculation methods for your business
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tax Configuration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Tax Configuration</DialogTitle>
              <DialogDescription>
                Add a new tax configuration for your products and services
              </DialogDescription>
            </DialogHeader>
            <TaxForm
              onSubmit={handleCreateTax}
              submitLabel="Create Tax Configuration"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tax Configurations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tax Configurations
          </CardTitle>
          <CardDescription>
            Manage your business tax rates, calculation methods, and
            applicability periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name & Code</TableHead>
                  <TableHead>Type & Rate</TableHead>
                  <TableHead>Calculation Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applicable Period</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxConfigurations.map((tax) => (
                  <TableRow key={tax.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tax.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {tax.code}
                        </div>
                        {tax.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {tax.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{tax.rate}%</span>
                        <Badge variant="outline" className="text-xs">
                          {tax.taxType.toUpperCase()}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tax.calculationMethod === "exclusive"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {tax.calculationMethod === "exclusive"
                          ? "Exclusive"
                          : "Inclusive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tax)}
                        {getStatusBadge(tax)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          From:{" "}
                          {new Date(tax.applicableFrom).toLocaleDateString()}
                        </div>
                        {tax.applicableUntil && (
                          <div>
                            Until:{" "}
                            {new Date(tax.applicableUntil).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(tax)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {!tax.isDefault && (
                            <DropdownMenuItem
                              onClick={() => handleSetDefault(tax.id, tax.name)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Set as Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleStatus(tax.id, tax.isActive)
                            }
                          >
                            {tax.isActive ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteTax(tax.id, tax.name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {taxConfigurations.length === 0 && (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Tax Configurations</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first tax configuration.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Tax Configuration
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tax Configuration</DialogTitle>
            <DialogDescription>
              Update the tax configuration settings
            </DialogDescription>
          </DialogHeader>
          <TaxForm
            onSubmit={handleUpdateTax}
            submitLabel="Update Tax Configuration"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
