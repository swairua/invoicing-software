import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
  Link,
  useSearchParams,
} from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Save,
  FileText,
  User,
  Calculator,
  Calendar,
  Send,
  Plus,
  Trash2,
  Search,
} from "lucide-react";
import {
  Customer,
  Product,
  Quotation,
  InvoiceItem,
} from "@shared/types";
import { dataServiceFactory } from "../services/dataServiceFactory";
import TemplateSelector from "../components/TemplateSelector";
import LineItemVATSelector from "../components/LineItemVATSelector";
import { useToast } from "../hooks/use-toast";

interface QuotationFormData {
  customerId: string;
  issueDate: string;
  validUntil: string;
  notes: string;
}

interface QuotationItemFormData {
  productId: string;
  quantity: string;
  unitPrice: string;
  discount: string;
  vatEnabled?: boolean;
  vatRate?: number;
}

export default function NewQuotation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");

  const duplicateData = location.state?.duplicateFrom;
  const preselectedCustomerId = searchParams.get("customer");

  const [formData, setFormData] = useState<QuotationFormData>({
    customerId: preselectedCustomerId || duplicateData?.customerId || "",
    issueDate: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 days from now
    notes: duplicateData?.notes || "",
  });

  const [items, setItems] = useState<QuotationItemFormData[]>(
    duplicateData?.items?.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      discount: item.discount.toString(),
      vatEnabled: item.vatRate > 0,
      vatRate: item.vatRate || 16,
    })) || [],
  );

  const [newItem, setNewItem] = useState<QuotationItemFormData>({
    productId: "",
    quantity: "1",
    unitPrice: "",
    discount: "0",
    vatEnabled: false,
    vatRate: 16,
  });

  const dataService = dataServiceFactory.getDataService();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customerData, productData] = await Promise.all([
          dataService.getCustomers(),
          dataService.getProducts(),
        ]);
        setCustomers(Array.isArray(customerData) ? customerData : []);
        setProducts(Array.isArray(productData) ? productData : []);
        setFilteredProducts(Array.isArray(productData) ? productData : []);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load customers and products.",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [dataService, toast]);

  useEffect(() => {
    if (productSearch) {
      const filtered = products.filter(
        (product) =>
          product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.sku?.toLowerCase().includes(productSearch.toLowerCase()),
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [productSearch, products]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateItemTotal = (item: QuotationItemFormData) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const discount = parseFloat(item.discount) || 0;

    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;

    // Use line item VAT settings instead of product defaults
    const vatRate = item.vatEnabled ? (item.vatRate || 16) : 0;
    const vatAmount = (afterDiscount * vatRate) / 100;

    return afterDiscount + vatAmount;
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let discountAmount = 0;
    let vatAmount = 0;

    items.forEach((item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const discount = parseFloat(item.discount) || 0;

      const itemSubtotal = quantity * unitPrice;
      subtotal += itemSubtotal;

      const itemDiscountAmount = (itemSubtotal * discount) / 100;
      discountAmount += itemDiscountAmount;

      const afterDiscount = itemSubtotal - itemDiscountAmount;
      // Use line item VAT settings instead of product defaults
      const vatRate = item.vatEnabled ? (item.vatRate || 16) : 0;
      const itemVatAmount = (afterDiscount * vatRate) / 100;
      vatAmount += itemVatAmount;
    });

    const total = subtotal - discountAmount + vatAmount;

    return {
      subtotal,
      discountAmount,
      vatAmount,
      total,
    };
  };

  const addItem = () => {
    if (!newItem.productId || !newItem.quantity || !newItem.unitPrice) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setItems((prev) => [...prev, { ...newItem }]);

    // Reset form
    setNewItem({
      productId: "",
      quantity: "1",
      unitPrice: "",
      discount: "0",
      vatEnabled: false,
      vatRate: 16,
    });
    setProductSearch("");
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof QuotationItemFormData,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const updateItemVAT = (index: number, enabled: boolean, rate: number) => {
    setItems((prev) => {
      const updatedItems = [...prev];
      updatedItems[index] = {
        ...updatedItems[index],
        vatEnabled: enabled,
        vatRate: rate,
      };
      return updatedItems;
    });
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setNewItem((prev) => ({
        ...prev,
        productId,
        unitPrice: product.sellingPrice.toString(),
        vatEnabled: product.taxable || false,
        vatRate: product.taxRate || 16,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      toast({
        title: "Validation Error",
        description: "Please select a customer.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const customer = customers.find((c) => c.id === formData.customerId)!;

      const quotationItems: InvoiceItem[] = items.map((item, index) => {
        const product = products.find((p) => p.id === item.productId)!;
        const quantity = parseFloat(item.quantity);
        const unitPrice = parseFloat(item.unitPrice);
        const discount = parseFloat(item.discount);
        const vatRate = item.vatEnabled ? (item.vatRate || 16) : 0;

        const subtotal = quantity * unitPrice;
        const discountAmount = (subtotal * discount) / 100;
        const afterDiscount = subtotal - discountAmount;
        const vatAmount = (afterDiscount * vatRate) / 100;
        const total = afterDiscount + vatAmount;

        return {
          id: `item-${index}`,
          productId: product.id,
          product,
          quantity,
          unitPrice,
          discount,
          vatRate,
          total,
        };
      });

      const totals = calculateTotals();

      const quotationData = {
        customerId: formData.customerId,
        items: quotationItems,
        subtotal: totals.subtotal,
        vatAmount: totals.vatAmount,
        discountAmount: totals.discountAmount,
        total: totals.total,
        validUntil: formData.validUntil,
        issueDate: formData.issueDate,
        notes: formData.notes,
        status: "draft",
      };

      await dataService.createQuotation(quotationData);

      toast({
        title: "Success",
        description: "Quotation created successfully.",
      });

      navigate("/quotations");
    } catch (error) {
      console.error("Error creating quotation:", error);
      toast({
        title: "Error",
        description: "Failed to create quotation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/quotations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quotations
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Quotation</h1>
            <p className="text-muted-foreground">
              Create a new quotation for your customer
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Customer & Dates */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="issueDate">Issue Date *</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          issueDate: e.target.value,
                        }))
                      }
                      required
                    />
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
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes..."
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Items
                </CardTitle>
                <CardDescription>
                  Search and add products to your quotation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Product *</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={newItem.productId}
                      onValueChange={handleProductSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {filteredProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {product.sku} •{" "}
                                {formatCurrency(product.sellingPrice)}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          quantity: e.target.value,
                        }))
                      }
                      placeholder="1"
                      min="1"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price (KES)</Label>
                    <Input
                      type="number"
                      value={newItem.unitPrice}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          unitPrice: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount (%)</Label>
                    <Input
                      type="number"
                      value={newItem.discount}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          discount: e.target.value,
                        }))
                      }
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button type="button" onClick={addItem} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </div>

                {/* VAT Selector for new item */}
                {newItem.productId && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <LineItemVATSelector
                      enabled={newItem.vatEnabled || false}
                      selectedRate={newItem.vatRate || 16}
                      onVATChange={(enabled, rate) =>
                        setNewItem((prev) => ({
                          ...prev,
                          vatEnabled: enabled,
                          vatRate: rate,
                        }))
                      }
                      itemSubtotal={
                        (parseFloat(newItem.quantity) || 0) *
                          (parseFloat(newItem.unitPrice) || 0) -
                        ((parseFloat(newItem.quantity) || 0) *
                          (parseFloat(newItem.unitPrice) || 0) *
                          (parseFloat(newItem.discount) || 0)) /
                          100
                      }
                      className="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Items */}
            {items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Quotation Items</CardTitle>
                  <CardDescription>
                    Review and manage your quotation items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>VAT</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => {
                          const product = products.find(
                            (p) => p.id === item.productId,
                          );
                          const itemTotal = calculateItemTotal(item);

                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {product?.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {product?.sku}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(index, "quantity", e.target.value)
                                  }
                                  className="w-20"
                                  min="1"
                                  step="0.01"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) =>
                                    updateItem(index, "unitPrice", e.target.value)
                                  }
                                  className="w-24"
                                  min="0"
                                  step="0.01"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    value={item.discount}
                                    onChange={(e) =>
                                      updateItem(index, "discount", e.target.value)
                                    }
                                    className="w-16"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    %
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <LineItemVATSelector
                                  enabled={item.vatEnabled || false}
                                  selectedRate={item.vatRate || 16}
                                  onVATChange={(enabled, rate) =>
                                    updateItemVAT(index, enabled, rate)
                                  }
                                  itemSubtotal={
                                    parseFloat(item.quantity) *
                                      parseFloat(item.unitPrice) -
                                    (parseFloat(item.quantity) *
                                      parseFloat(item.unitPrice) *
                                      parseFloat(item.discount)) /
                                      100
                                  }
                                  className="w-64"
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatCurrency(itemTotal)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Quotation Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-{formatCurrency(totals.discountAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT:</span>
                    <span>{formatCurrency(totals.vatAmount)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || items.length === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Creating..." : "Create Quotation"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
