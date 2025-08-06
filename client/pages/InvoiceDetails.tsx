import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
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
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  ArrowLeft,
  Edit,
  FileText,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  Download,
  Send,
  Copy,
  CheckCircle,
  AlertTriangle,
  Clock,
  Receipt,
  RefreshCw,
  Printer,
  Share,
} from "lucide-react";
import { Invoice, Payment } from "@shared/types";
import { dataServiceFactory } from "../services/dataServiceFactory";
import TemplateManager from "../services/templateManager";
import { useToast } from "../hooks/use-toast";

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "mpesa" | "bank" | "cheque" | "card"
  >("mpesa");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const dataService = dataServiceFactory.getDataService();

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    try {
      const activeTemplate = TemplateManager.getActiveTemplate("invoice");
      await PDFService.generateDocument(
        "invoice",
        invoice,
        activeTemplate || undefined,
      );

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadInvoiceData = async () => {
      try {
        setLoading(true);
        const invoices = await dataService.getInvoices();
        const foundInvoice = invoices.find((inv) => inv.id === id);

        if (!foundInvoice) {
          toast({
            title: "Invoice Not Found",
            description: "The requested invoice could not be found.",
            variant: "destructive",
          });
          navigate("/invoices");
          return;
        }

        setInvoice(foundInvoice);

        // Get payments for this invoice
        const allPayments = dataService.getPayments?.() || [];
        const invoicePayments = allPayments.filter((p) => p.invoiceId === id);
        setPayments(invoicePayments);
      } catch (error) {
        console.error("Error loading invoice:", error);
        toast({
          title: "Error",
          description: "Failed to load invoice details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadInvoiceData();
    }
  }, [id, dataService, navigate, toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "sent":
        return "default";
      case "overdue":
        return "destructive";
      case "draft":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return CheckCircle;
      case "sent":
        return Send;
      case "overdue":
        return AlertTriangle;
      case "draft":
        return Edit;
      case "cancelled":
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  const isOverdue = (invoice: Invoice) => {
    return (
      invoice.status !== "paid" &&
      invoice.status !== "cancelled" &&
      new Date(invoice.dueDate) < new Date()
    );
  };

  const handleRecordPayment = async () => {
    if (!invoice || !paymentAmount || !paymentReference) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required payment fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > invoice.balance) {
      toast({
        title: "Invalid Amount",
        description: `Payment amount must be between 0 and ${formatCurrency(invoice.balance)}.`,
        variant: "destructive",
      });
      return;
    }

    const newPayment: Payment = {
      id: Date.now().toString(),
      amount,
      method: paymentMethod,
      reference: paymentReference,
      notes: paymentNotes || `Payment for ${invoice.invoiceNumber}`,
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      companyId: "1",
      createdBy: "1",
      createdAt: new Date(),
    };

    // Update invoice
    const updatedInvoice = {
      ...invoice,
      amountPaid: invoice.amountPaid + amount,
      balance: invoice.balance - amount,
      status:
        invoice.balance - amount <= 0 ? ("paid" as const) : invoice.status,
      updatedAt: new Date(),
    };

    setInvoice(updatedInvoice);
    setPayments((prev) => [newPayment, ...prev]);

    // Reset form
    setPaymentAmount("");
    setPaymentReference("");
    setPaymentNotes("");
    setIsPaymentDialogOpen(false);

    toast({
      title: "Payment Recorded",
      description: `Payment of ${formatCurrency(amount)} has been recorded successfully.`,
    });
  };

  const duplicateInvoice = () => {
    if (!invoice) return;

    navigate("/invoices/new", {
      state: {
        duplicateFrom: {
          ...invoice,
          invoiceNumber: undefined,
          id: undefined,
        },
      },
    });
  };

  const sendInvoice = () => {
    if (!invoice) return;

    // Simulate sending invoice
    const updatedInvoice = {
      ...invoice,
      status: "sent" as const,
      updatedAt: new Date(),
    };

    setInvoice(updatedInvoice);

    toast({
      title: "Invoice Sent",
      description: `Invoice ${invoice.invoiceNumber} has been sent to the customer.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold">Invoice Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The requested invoice could not be found.
        </p>
        <Button asChild>
          <Link to="/invoices">Back to Invoices</Link>
        </Button>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(invoice.status);
  const overdue = isOverdue(invoice);

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
              {invoice.invoiceNumber}
            </h1>
            <p className="text-muted-foreground">
              {invoice.customer.name} • Issued {formatDate(invoice.issueDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={duplicateInvoice}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {invoice.status === "draft" && (
            <Button onClick={sendInvoice}>
              <Send className="mr-2 h-4 w-4" />
              Send Invoice
            </Button>
          )}
          {invoice.balance > 0 && invoice.status !== "cancelled" && (
            <Dialog
              open={isPaymentDialogOpen}
              onOpenChange={setIsPaymentDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Receipt className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>
                    Record a payment for invoice {invoice.invoiceNumber}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Outstanding Balance</Label>
                      <p className="text-lg font-bold">
                        {formatCurrency(invoice.balance)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Payment Amount (KES) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        max={invoice.balance}
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Payment Method *</Label>
                      <Select
                        value={paymentMethod}
                        onValueChange={(value: any) => setPaymentMethod(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="mpesa">M-Pesa</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="card">Card Payment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reference">Reference Number *</Label>
                      <Input
                        id="reference"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="Payment reference"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Payment notes (optional)"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsPaymentDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleRecordPayment}>
                      Record Payment
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {overdue && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">
              This invoice is overdue
            </span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Due date was {formatDate(invoice.dueDate)}. Consider following up
            with the customer.
          </p>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <StatusIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {invoice.status}
            </div>
            <Badge
              variant={getStatusColor(invoice.status) as any}
              className="mt-1"
            >
              {invoice.status.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(invoice.total)}
            </div>
            <p className="text-xs text-muted-foreground">
              Subtotal: {formatCurrency(invoice.subtotal)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(invoice.amountPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((invoice.amountPaid / invoice.total) * 100).toFixed(1)}% of
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(invoice.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Due: {formatDate(invoice.dueDate)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Invoice Details</TabsTrigger>
          <TabsTrigger value="items">Line Items</TabsTrigger>
          <TabsTrigger value="payments">
            Payments ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="customer">Customer Info</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Invoice Number
                    </Label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {invoice.invoiceNumber}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={getStatusColor(invoice.status) as any}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Issue Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(invoice.issueDate)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Due Date</Label>
                    <p
                      className={`text-sm ${overdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}
                    >
                      {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                </div>

                {invoice.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm text-muted-foreground">
                      {invoice.notes}
                    </p>
                  </div>
                )}

                {invoice.etimsStatus && (
                  <div>
                    <Label className="text-sm font-medium">eTIMS Status</Label>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          invoice.etimsStatus === "accepted"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {invoice.etimsStatus.toUpperCase()}
                      </Badge>
                      {invoice.etimsCode && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {invoice.etimsCode}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.subtotal)}
                    </span>
                  </div>
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">Discount:</span>
                      <span className="font-medium">
                        -{formatCurrency(invoice.discountAmount)}
                      </span>
                    </div>
                  )}
                  {invoice.vatAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">VAT:</span>
                      <span className="font-medium">
                        {formatCurrency(invoice.vatAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount Paid:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(invoice.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Balance Due:</span>
                    <span
                      className={`font-bold ${invoice.balance > 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {formatCurrency(invoice.balance)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
              <CardDescription>
                Products and services included in this invoice
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
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {item.product.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {item.product.sku}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.quantity} {item.product.unit}
                        </TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{item.discount}%</TableCell>
                        <TableCell>{item.vatRate}%</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                All payments received for this invoice
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.createdAt)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {payment.method.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment.reference}
                          </TableCell>
                          <TableCell>{payment.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Payments</h3>
                  <p className="text-muted-foreground">
                    No payments have been recorded for this invoice yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Customer Name</Label>
                <p className="text-sm text-muted-foreground">
                  {invoice.customer.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    {invoice.customer.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">
                    {invoice.customer.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Address</Label>
                <p className="text-sm text-muted-foreground">
                  {invoice.customer.address || "Not provided"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">KRA PIN</Label>
                <p className="text-sm text-muted-foreground font-mono">
                  {invoice.customer.kraPin || "Not provided"}
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button asChild>
                  <Link to={`/customers/${invoice.customer.id}`}>
                    View Customer Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
