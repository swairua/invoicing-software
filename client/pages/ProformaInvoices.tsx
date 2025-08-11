import React, { useState } from "react";
import { Link } from "react-router-dom";
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
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogContentLarge,
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
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  Send,
  Download,
  Copy,
  ArrowRight,
  Clock,
  CheckCircle,
  Package,
  Loader2,
} from "lucide-react";
import { ProformaInvoice, Customer, Product } from "@shared/types";
import PDFService from "../services/pdfService";
import BusinessDataService from "../services/businessDataService";
import { useToast } from "../hooks/use-toast";

// Get business data service instance
const businessData = BusinessDataService.getInstance();

// Utility function to safely convert dates
const safeDate = (date: any): Date => {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  return new Date(date);
};

export default function ProformaInvoices() {
  const [proformas, setProformas] = useState<ProformaInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    validUntil: "",
    notes: "",
    items: [] as { productId: string; quantity: number; unitPrice: number }[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load initial data
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [proformasData, customersData, productsData] = await Promise.all([
          businessData.getProformas(),
          businessData.getCustomers(),
          businessData.getProducts(),
        ]);
        setProformas(proformasData);
        setCustomers(customersData);
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Set empty arrays as fallbacks
        setProformas([]);
        setCustomers([]);
        setProducts([]);
      }
    };
    loadData();
  }, []);

  // Refresh data periodically
  React.useEffect(() => {
    const refreshData = async () => {
      try {
        const [proformasData, customersData, productsData] = await Promise.all([
          businessData.getProformas(),
          businessData.getCustomers(),
          businessData.getProducts(),
        ]);
        setProformas(proformasData);
        setCustomers(customersData);
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to refresh data:', error);
      }
    };

    const refreshInterval = setInterval(refreshData, 5000);

    return () => clearInterval(refreshInterval);
  }, []);

  const filteredProformas = (proformas || []).filter((proforma) => {
    const matchesSearch =
      proforma.proformaNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      proforma.customer.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || proforma.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "sent":
        return "default";
      case "converted":
        return "default";
      case "expired":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Edit className="h-3 w-3" />;
      case "sent":
        return <Send className="h-3 w-3" />;
      case "converted":
        return <CheckCircle className="h-3 w-3" />;
      case "expired":
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const isExpiringSoon = (validUntil: Date | string) => {
    const today = new Date();
    const validDate = safeDate(validUntil);
    const diffDays = Math.ceil(
      (validDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays <= 7 && diffDays > 0;
  };

  const addProduct = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeProduct = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleCreateProforma = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId || formData.items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a customer and add at least one product.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Calculate totals
      const subtotal = formData.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      );
      const vatAmount = subtotal * 0.16;
      const total = subtotal + vatAmount;

      // Generate proforma number
      const proformaNumber = `PRO-2024-${String(proformas.length + 1).padStart(3, "0")}`;

      const customer = customers.find((c) => c.id === formData.customerId);

      const newProforma = {
        id: Date.now().toString(),
        proformaNumber,
        customerId: formData.customerId,
        customer: customer!,
        items: formData.items.map((item, index) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            id: `item-${index}`,
            productId: item.productId,
            product: product!,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: 0,
            vatRate: product?.taxable ? 16 : 0,
            total:
              item.unitPrice *
              item.quantity *
              (1 + (product?.taxable ? 0.16 : 0)),
          };
        }),
        subtotal,
        vatAmount,
        discountAmount: 0,
        total,
        status: "draft" as const,
        validUntil: new Date(formData.validUntil),
        issueDate: new Date(),
        notes: formData.notes,
        companyId: "1",
        createdBy: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setProformas((prev) => [newProforma, ...prev]);
      setIsCreateDialogOpen(false);

      // Reset form
      setFormData({
        customerId: "",
        validUntil: "",
        notes: "",
        items: [],
      });

      toast({
        title: "Proforma Created",
        description: `Proforma ${proformaNumber} created successfully for ${customer?.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create proforma. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertToInvoice = (proformaId: string) => {
    const invoice = businessData.convertProformaToInvoice(proformaId);
    if (invoice) {
      setProformas(businessData.getProformas());
      toast({
        title: "Conversion Successful",
        description: `Proforma converted to invoice ${invoice.invoiceNumber}`,
      });
    } else {
      toast({
        title: "Conversion Failed",
        description: "Unable to convert proforma. Make sure it's sent status.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = (proformaId: string) => {
    const proforma = proformas.find((p) => p.id === proformaId);
    if (proforma) {
      PDFService.generateProformaPDF(proforma);
    }
  };

  // Calculate metrics
  const totalProformas = proformas.length;
  const sentProformas = proformas.filter((p) => p.status === "sent").length;
  const convertedProformas = proformas.filter(
    (p) => p.status === "converted",
  ).length;
  const totalValue = proformas.reduce((sum, p) => sum + p.total, 0);
  const conversionRate =
    totalProformas > 0 ? (convertedProformas / totalProformas) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Proforma Invoices
          </h1>
          <p className="text-muted-foreground">
            Create advance invoices and convert them to formal invoices
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Proforma
            </Button>
          </DialogTrigger>
          <DialogContentLarge>
            <DialogHeader className="flex-shrink-0 p-6 pb-0">
              <DialogTitle>Create New Proforma Invoice</DialogTitle>
              <DialogDescription>
                Generate a proforma invoice for advance billing
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form onSubmit={handleCreateProforma} className="space-y-6 p-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer *</Label>
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, customerId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {customer.email}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until *</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          validUntil: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                {/* Products Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Products</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addProduct}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>

                  {formData.items.length > 0 && (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {formData.items.map((item, index) => {
                        const product = products.find(
                          (p) => p.id === item.productId,
                        );
                        const lineTotal = item.unitPrice * item.quantity;

                        return (
                          <div
                            key={index}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <div>
                                <Label className="text-sm">Product</Label>
                                <Select
                                  value={item.productId}
                                  onValueChange={(value) => {
                                    const selectedProduct = products.find(
                                      (p) => p.id === value,
                                    );
                                    updateProduct(index, "productId", value);
                                    if (selectedProduct) {
                                      updateProduct(
                                        index,
                                        "unitPrice",
                                        selectedProduct.sellingPrice,
                                      );
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select product" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products.map((product) => (
                                      <SelectItem
                                        key={product.id}
                                        value={product.id}
                                      >
                                        <div>
                                          <div className="font-medium">
                                            {product.name}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            KES{" "}
                                            {product.sellingPrice.toLocaleString()}
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-sm">Quantity</Label>
                                <Input
                                  type="number"
                                  placeholder="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateProduct(
                                      index,
                                      "quantity",
                                      parseInt(e.target.value) || 1,
                                    )
                                  }
                                  min="1"
                                />
                              </div>
                              <div>
                                <Label className="text-sm">Unit Price</Label>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  value={item.unitPrice}
                                  onChange={(e) =>
                                    updateProduct(
                                      index,
                                      "unitPrice",
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div className="flex items-end gap-2">
                                <div className="flex-1">
                                  <Label className="text-sm">Line Total</Label>
                                  <Input
                                    value={`KES ${lineTotal.toLocaleString()}`}
                                    disabled
                                    className="font-medium"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeProduct(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {formData.items.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">
                        No products added yet
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addProduct}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Product
                      </Button>
                    </div>
                  )}
                </div>

                {/* Document Totals */}
                {formData.items.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="bg-muted/20 rounded-lg p-4 space-y-2">
                      {(() => {
                        const subtotal = formData.items.reduce(
                          (sum, item) => sum + item.unitPrice * item.quantity,
                          0,
                        );
                        const vatAmount = subtotal * 0.16;
                        const total = subtotal + vatAmount;

                        return (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>Subtotal:</span>
                              <span>KES {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>VAT (16%):</span>
                              <span>KES {vatAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                              <span>Total:</span>
                              <span>KES {total.toLocaleString()}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or terms"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isLoading ||
                      !formData.customerId ||
                      formData.items.length === 0
                    }
                    className="w-full sm:w-auto"
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Proforma
                  </Button>
                </div>
              </form>
            </div>
          </DialogContentLarge>
        </Dialog>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Proformas
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProformas}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">+1</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{sentProformas}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {convertedProformas}
            </div>
            <p className="text-xs text-muted-foreground">
              {conversionRate.toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">Combined value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Value</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {formatCurrency(
                proformas
                  .filter((p) => p.status === "sent")
                  .reduce((sum, p) => sum + p.total, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">Not yet converted</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Proforma Management</CardTitle>
          <CardDescription>
            Track advance invoices and manage conversions to formal invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search proformas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export</Button>
          </div>

          {/* Proforma Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proforma Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProformas.map((proforma) => (
                  <TableRow key={proforma.id}>
                    <TableCell>
                      <div className="font-medium">
                        {proforma.proformaNumber}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {proforma.items.length} item(s)
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {proforma.customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {proforma.customer.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {proforma.customer.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {safeDate(proforma.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div
                        className={`text-sm ${isExpiringSoon(proforma.validUntil) ? "text-warning font-medium" : ""}`}
                      >
                        {safeDate(proforma.validUntil).toLocaleDateString()}
                      </div>
                      {isExpiringSoon(proforma.validUntil) && (
                        <div className="text-xs text-warning">
                          Expires soon!
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(proforma.total)}
                      </div>
                      {proforma.discountAmount > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Discount: {formatCurrency(proforma.discountAmount)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(proforma.status)}
                        className="capitalize"
                      >
                        {getStatusIcon(proforma.status)}
                        <span className="ml-1">{proforma.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {proforma.status === "sent" && (
                        <Button
                          size="sm"
                          onClick={() => handleConvertToInvoice(proforma.id)}
                          className="text-xs"
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Convert to Invoice
                        </Button>
                      )}
                      {proforma.status === "converted" && (
                        <Badge variant="outline" className="text-xs">
                          Converted
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Proforma
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDownloadPDF(proforma.id)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" />
                            Send to Customer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {proforma.status === "sent" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleConvertToInvoice(proforma.id)
                              }
                            >
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Convert to Invoice
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
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

          {filteredProformas.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">
                No proforma invoices found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search terms or filters."
                  : "Get started by creating your first proforma invoice."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
