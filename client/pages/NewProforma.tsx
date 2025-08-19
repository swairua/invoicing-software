import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
  Link,
  useSearchParams,
  useParams,
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
import { Customer, Product } from "@shared/types";
import { dataServiceFactory } from "../services/dataServiceFactory";
import DynamicLineItems, { LineItem } from "../components/DynamicLineItems";
import { useToast } from "../hooks/use-toast";

interface ProformaFormData {
  customerId: string;
  issueDate: string;
  validUntil: string;
  notes: string;
}

// Using LineItem interface from DynamicLineItems component

export default function NewProforma() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProforma, setEditingProforma] = useState<ProformaInvoice | null>(null);
  const isEditing = Boolean(id);
  // Product filtering handled by DynamicLineItems component

  const duplicateData = location.state?.duplicateFrom;
  const convertData = location.state?.sourceData;
  const preselectedCustomerId = searchParams.get("customer");

  const [formData, setFormData] = useState<ProformaFormData>({
    customerId:
      preselectedCustomerId ||
      duplicateData?.customerId ||
      convertData?.customerId ||
      "",
    issueDate: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 15 days from now
    notes: duplicateData?.notes || convertData?.notes || "",
  });

  const [items, setItems] = useState<LineItem[]>(
    (duplicateData?.items || convertData?.items)?.map(
      (item: any, index: number) => ({
        id: `item-${index}`,
        productId: item.productId,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        discount: item.discount.toString(),
        lineItemTaxes: item.lineItemTaxes || [],
      }),
    ) || [],
  );

  // Using DynamicLineItems component for item management

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

        // If editing, load the proforma data
        if (isEditing && id) {
          const proforma = await dataService.getProformaInvoiceById(id);
          if (proforma) {
            setEditingProforma(proforma);
            setFormData({
              customerId: proforma.customerId,
              issueDate: proforma.issueDate.split('T')[0],
              validUntil: proforma.validUntil.split('T')[0],
              notes: proforma.notes || '',
            });
            setItems(proforma.items?.map((item: any, index: number) => ({
              id: `item-${index}`,
              productId: item.productId,
              quantity: item.quantity.toString(),
              unitPrice: item.unitPrice.toString(),
              discount: item.discount.toString(),
              lineItemTaxes: item.lineItemTaxes || [],
            })) || []);
          } else {
            toast({
              title: "Error",
              description: "Proforma not found.",
              variant: "destructive",
            });
            navigate('/proforma');
            return;
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load data.",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [dataService, toast, isEditing, id, navigate]);

  // Product filtering handled by DynamicLineItems component

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

    items
      .filter((item) => item.productId)
      .forEach((item) => {
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

  // Item management functions handled by DynamicLineItems component

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

    const validItems = items.filter((item) => item.productId);
    if (validItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item to the proforma.",
        variant: "destructive",
      });
      return;
    }

    const totals = calculateTotals();

    if (totals.total <= 0) {
      toast({
        title: "Validation Error",
        description: "Proforma total must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would normally call a create proforma API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Proforma Created",
        description: `Proforma invoice has been created successfully.`,
      });

      if (sendImmediately) {
        toast({
          title: "Proforma Sent",
          description: "Proforma invoice has been sent to the customer.",
        });
      }

      navigate("/proforma");
    } catch (error) {
      console.error("Error creating proforma:", error);
      toast({
        title: "Error",
        description: "Failed to create proforma. Please try again.",
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
            <Link to="/proforma">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Proforma Invoices
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {duplicateData
                ? "Duplicate Proforma"
                : convertData
                  ? "Convert to Proforma"
                  : "New Proforma Invoice"}
            </h1>
            <p className="text-muted-foreground">
              {convertData
                ? `Convert ${convertData.quoteNumber || "quotation"} to proforma invoice`
                : duplicateData
                  ? "Create a copy of an existing proforma"
                  : "Create a new proforma invoice for your customer"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/proforma">Cancel</Link>
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
                  disabled={!!convertData}
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
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Proforma Details
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
                  <Label htmlFor="validUntil">Valid Until</Label>
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Additional notes for this proforma..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items - Using DynamicLineItems component */}
        <DynamicLineItems
          items={items}
          products={products}
          onItemsChange={setItems}
          formatCurrency={formatCurrency}
          calculateItemTotal={calculateItemTotal}
        />

        {/* Summary */}
        {items.filter((item) => item.productId).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Proforma Summary
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
