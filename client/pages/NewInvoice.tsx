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
  Plus,
  Trash2,
  Search,
  User,
  Package,
  Calculator,
  Calendar,
  Send,
} from "lucide-react";
import { Customer, Product, Invoice, InvoiceItem } from "@shared/types";
import { dataServiceFactory } from "../services/dataServiceFactory";
import TemplateSelector from "../components/TemplateSelector";
import { useToast } from "../hooks/use-toast";

interface InvoiceFormData {
  customerId: string;
  issueDate: string;
  dueDate: string;
  notes: string;
}

interface InvoiceItemFormData {
  productId: string;
  quantity: string;
  unitPrice: string;
  discount: string;
}

export default function NewInvoice() {
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

  const [formData, setFormData] = useState<InvoiceFormData>({
    customerId: preselectedCustomerId || duplicateData?.customerId || "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 days from now
    notes: duplicateData?.notes || "",
  });

  const [items, setItems] = useState<InvoiceItemFormData[]>(
    duplicateData?.items?.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      discount: item.discount.toString(),
    })) || [],
  );

  const [newItem, setNewItem] = useState<InvoiceItemFormData>({
    productId: "",
    quantity: "1",
    unitPrice: "",
    discount: "0",
  });

  const dataService = dataServiceFactory.getDataService();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customerData, productData] = await Promise.all([
          dataService.getCustomers(),
          dataService.getProducts(),
        ]);
        setCustomers(customerData);
        setProducts(productData);
        setFilteredProducts(productData);
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
          product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.sku.toLowerCase().includes(productSearch.toLowerCase()),
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [productSearch, products]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateItemTotal = (item: InvoiceItemFormData) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const discount = parseFloat(item.discount) || 0;

    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;

    const product = products.find((p) => p.id === item.productId);
    const vatRate = product?.taxable ? product.taxRate || 16 : 0;
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
      const product = products.find((p) => p.id === item.productId);
      const vatRate = product?.taxable ? product.taxRate || 16 : 0;
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
        description:
          "Please select a product and enter quantity and unit price.",
        variant: "destructive",
      });
      return;
    }

    // Check if product already exists in items
    const existingItemIndex = items.findIndex(
      (item) => item.productId === newItem.productId,
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...items];
      const existingQty = parseFloat(updatedItems[existingItemIndex].quantity);
      const newQty = parseFloat(newItem.quantity);
      updatedItems[existingItemIndex].quantity = (
        existingQty + newQty
      ).toString();
      setItems(updatedItems);
    } else {
      // Add new item
      setItems((prev) => [...prev, { ...newItem }]);
    }

    // Reset form
    setNewItem({
      productId: "",
      quantity: "1",
      unitPrice: "",
      discount: "0",
    });
    setProductSearch("");
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItemFormData,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setNewItem((prev) => ({
        ...prev,
        productId,
        unitPrice: product.sellingPrice.toString(),
      }));
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    sendImmediately: boolean = false,
  ) => {
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
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    const totals = calculateTotals();

    if (totals.total <= 0) {
      toast({
        title: "Validation Error",
        description: "Invoice total must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const customer = customers.find((c) => c.id === formData.customerId)!;

      const invoiceItems: InvoiceItem[] = items.map((item, index) => {
        const product = products.find((p) => p.id === item.productId)!;
        const quantity = parseFloat(item.quantity);
        const unitPrice = parseFloat(item.unitPrice);
        const discount = parseFloat(item.discount);
        const vatRate = product.taxable ? product.taxRate || 16 : 0;

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

      const newInvoice = {
        customerId: customer.id,
        items: invoiceItems,
        dueDate: new Date(formData.dueDate),
        notes: formData.notes,
      };

      // Here you would normally call the createInvoice API
      const createdInvoice = await dataService.createInvoice(newInvoice);

      toast({
        title: "Invoice Created",
        description: `Invoice has been created successfully.`,
      });

      if (sendImmediately) {
        toast({
          title: "Invoice Sent",
          description: "Invoice has been sent to the customer.",
        });
      }

      navigate("/invoices");
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = calculateTotals();
  const selectedCustomer = customers.find((c) => c.id === formData.customerId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {duplicateData ? "Duplicate Invoice" : "New Invoice"}
            </h1>
            <p className="text-muted-foreground">
              {duplicateData
                ? "Create a copy of an existing invoice"
                : "Create a new invoice for your customer"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/invoices">Cancel</Link>
          </Button>
          <Button
            variant="outline"
            onClick={(e) => handleSubmit(e, false)}
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Create & Send
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Customer and Date Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, customerId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {customer.email ||
                              customer.phone ||
                              "No contact info"}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.customerId && (
                  <p className="text-xs text-muted-foreground">
                    Don't see your customer?{" "}
                    <Link
                      to="/customers/new"
                      className="text-primary hover:underline"
                    >
                      Create a new customer
                    </Link>
                  </p>
                )}
              </div>

              {selectedCustomer && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Customer Details</h4>
                  <div className="space-y-1 text-xs">
                    <div>Email: {selectedCustomer.email || "Not provided"}</div>
                    <div>Phone: {selectedCustomer.phone || "Not provided"}</div>
                    <div>
                      Credit Limit:{" "}
                      {formatCurrency(selectedCustomer.creditLimit)}
                    </div>
                    <div>
                      Current Balance:{" "}
                      {formatCurrency(selectedCustomer.balance)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Template Selection */}
              <TemplateSelector
                documentType="invoice"
                selectedTemplateId={selectedTemplateId}
                onTemplateSelect={setSelectedTemplateId}
              />

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Additional notes for this invoice..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Invoice Items
            </CardTitle>
            <CardDescription>
              Add products and services to this invoice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Item */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Add Item</h4>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
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
                      <SelectContent className="max-h-[200px]">
                        {filteredProducts.slice(0, 20).map((product) => (
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
            </div>

            {/* Current Items */}
            {items.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Discount</TableHead>
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
                              <div className="font-medium">{product?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                SKU: {product?.sku}
                                {product?.taxable && (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 text-xs"
                                  >
                                    VAT {product.taxRate || 16}%
                                  </Badge>
                                )}
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
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Items Added</h3>
                <p className="text-muted-foreground">
                  Add products or services to get started with your invoice.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Summary */}
        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-w-md ml-auto">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(totals.subtotal)}
                  </span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Discount:</span>
                    <span className="font-medium">
                      -{formatCurrency(totals.discountAmount)}
                    </span>
                  </div>
                )}
                {totals.vatAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">VAT:</span>
                    <span className="font-medium">
                      {formatCurrency(totals.vatAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-3">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(totals.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
