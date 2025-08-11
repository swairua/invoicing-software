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
} from "lucide-react";
import {
  Customer,
  Product,
  Invoice,
  InvoiceItem,
  LineItemTax,
} from "@shared/types";
import {
  getAvailableTaxes,
  calculateLineItemTaxes,
  updateLineItemTaxAmounts,
} from "@shared/taxUtils";
import { dataServiceFactory } from "../services/dataServiceFactory";
import TemplateSelector from "../components/TemplateSelector";
import DynamicLineItems, { LineItem } from "../components/DynamicLineItems";
import { useToast } from "../hooks/use-toast";

interface InvoiceFormData {
  customerId: string;
  issueDate: string;
  dueDate: string;
  notes: string;
}

// Using LineItem interface from DynamicLineItems component

export default function NewInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  // Removed unnecessary state - handled by DynamicLineItems component

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

  const [items, setItems] = useState<LineItem[]>(
    duplicateData?.items?.map((item: any, index: number) => ({
      id: `item-${index}`,
      productId: item.productId,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      discount: item.discount.toString(),
      lineItemTaxes: item.lineItemTaxes || [],
    })) || [],
  );

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

  // Product filtering is now handled by DynamicLineItems component

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateItemTotal = (item: LineItem) => {
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
    let additionalTaxAmount = 0;

    items.filter(item => item.productId).forEach((item) => {
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

      // Calculate additional line item taxes
      if (item.lineItemTaxes && item.lineItemTaxes.length > 0) {
        const itemTaxAmount = item.lineItemTaxes.reduce((taxSum, tax) => {
          return taxSum + afterDiscount * (tax.rate / 100);
        }, 0);
        additionalTaxAmount += itemTaxAmount;
      }
    });

    const total = subtotal - discountAmount + vatAmount + additionalTaxAmount;

    return {
      subtotal,
      discountAmount,
      vatAmount,
      additionalTaxAmount,
      total,
    };
  };

  // Item management is now handled by DynamicLineItems component

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

    const validItems = items.filter(item => item.productId);
    if (validItems.length === 0) {
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

      const invoiceItems: InvoiceItem[] = validItems.map((item, index) => {
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
          lineItemTaxes: item.lineItemTaxes || [],
          total,
        };
      });

      const newInvoice = {
        customerId: customer.id,
        items: invoiceItems,
        dueDate: new Date(formData.dueDate),
        notes: formData.notes,
        additionalTaxAmount: totals.additionalTaxAmount,
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

        {/* Invoice Items - Using DynamicLineItems component */}
        <DynamicLineItems
          items={items}
          products={products}
          onItemsChange={setItems}
          formatCurrency={formatCurrency}
          calculateItemTotal={calculateItemTotal}
        />

        {/* Invoice Summary */}
        {items.filter(item => item.productId).length > 0 && (
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
                {totals.additionalTaxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Additional Taxes:</span>
                    <span className="font-medium">
                      {formatCurrency(totals.additionalTaxAmount)}
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
