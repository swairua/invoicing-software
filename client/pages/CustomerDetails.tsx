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
import { Label } from "../components/ui/label";
import {
  ArrowLeft,
  Edit,
  User,
  CreditCard,
  FileText,
  TrendingUp,
  TrendingDown,
  Phone,
  Mail,
  MapPin,
  Hash,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  Plus,
} from "lucide-react";
import { Customer, Invoice, Payment, Quotation } from "@shared/types";
import { dataServiceFactory } from "../services/dataServiceFactory";
import { useToast } from "../hooks/use-toast";

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const dataService = dataServiceFactory.getDataService();

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading(true);
        const customers = await dataService.getCustomers();
        console.log("All customers:", customers);
        console.log("Looking for customer with ID:", id);

        const foundCustomer = customers.find((c) => c.id === id);
        console.log("Found customer:", foundCustomer);

        if (!foundCustomer) {
          console.error(`Customer with ID ${id} not found in:`, customers);
          toast({
            title: "Customer Not Found",
            description:
              "The requested customer could not be found. Redirecting to customers list.",
            variant: "destructive",
          });
          navigate("/customers");
          return;
        }

        setCustomer(foundCustomer);

        // Get customer-related data
        const allInvoices = await dataService.getInvoices();
        const customerInvoices = Array.isArray(allInvoices)
          ? allInvoices.filter((inv) => inv.customerId === id)
          : [];
        setInvoices(customerInvoices);

        const allQuotations = await dataService.getQuotations();
        const customerQuotations = Array.isArray(allQuotations)
          ? allQuotations.filter((q) => q.customerId === id)
          : [];
        setQuotations(customerQuotations);

        const allPayments = dataService.getPayments?.() || [];
        const customerPayments = Array.isArray(allPayments)
          ? allPayments.filter((p) => p.customerId === id)
          : [];
        setPayments(customerPayments);
      } catch (error) {
        console.error("Error loading customer:", error);
        toast({
          title: "Error",
          description: "Failed to load customer details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCustomerData();
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
      case "accepted":
        return "success";
      case "rejected":
        return "destructive";
      case "expired":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getCreditStatus = (customer: Customer) => {
    const utilizationRate =
      customer.creditLimit > 0
        ? (customer.balance / customer.creditLimit) * 100
        : 0;

    if (utilizationRate >= 90)
      return { status: "Critical", color: "destructive", icon: AlertTriangle };
    if (utilizationRate >= 70)
      return { status: "High", color: "warning", icon: TrendingUp };
    if (utilizationRate >= 50)
      return { status: "Moderate", color: "default", icon: TrendingUp };
    return { status: "Good", color: "success", icon: CheckCircle };
  };

  const duplicateCustomer = () => {
    if (!customer) return;

    navigate("/customers/new", {
      state: {
        duplicateFrom: {
          ...customer,
          name: customer.name + " (Copy)",
          id: undefined,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold">Customer Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The requested customer could not be found.
        </p>
        <Button asChild>
          <Link to="/customers">Back to Customers</Link>
        </Button>
      </div>
    );
  }

  const creditStatus = getCreditStatus(customer);
  const CreditIcon = creditStatus.icon;

  // Calculate totals
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((inv) => inv.status === "paid").length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const outstandingBalance = invoices.reduce(
    (sum, inv) => sum + inv.balance,
    0,
  );
  const lastPayment =
    payments.length > 0
      ? payments.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0]
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/customers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {customer.name}
            </h1>
            <p className="text-muted-foreground">
              Customer ID: {customer.id} • Member since{" "}
              {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={duplicateCustomer}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/customers/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/invoices/new?customer=${id}`}>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {totalInvoices} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Balance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(outstandingBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((inv) => inv.balance > 0).length} unpaid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Status</CardTitle>
            <CreditIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(customer.creditLimit - customer.balance)}
            </div>
            <Badge variant={creditStatus.color as any} className="mt-1">
              {creditStatus.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalInvoices > 0
                ? Math.round((paidInvoices / totalInvoices) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {paidInvoices} of {totalInvoices} paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Customer Details</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({totalInvoices})</TabsTrigger>
          <TabsTrigger value="quotations">
            Quotations ({quotations.length})
          </TabsTrigger>
          <TabsTrigger value="payments">
            Payments ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="credit">Credit & Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Customer Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {customer.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {customer.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Phone
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {customer.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Address
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {customer.address || "Not provided"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    KRA PIN
                  </Label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {customer.kraPin || "Not provided"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Account Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Credit Limit</Label>
                    <p className="text-lg font-bold">
                      {formatCurrency(customer.creditLimit)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Current Balance
                    </Label>
                    <p className="text-lg font-bold">
                      {formatCurrency(customer.balance)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Available Credit
                  </Label>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(customer.creditLimit - customer.balance)}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Account Status</Label>
                  <Badge
                    variant={customer.isActive ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {customer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {lastPayment && (
                  <div>
                    <Label className="text-sm font-medium">Last Payment</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(lastPayment.amount)} on{" "}
                      {formatDate(lastPayment.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      via {lastPayment.method.toUpperCase()} • Ref:{" "}
                      {lastPayment.reference}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span>Created:</span> {formatDate(customer.createdAt)}
                  </div>
                  <div>
                    <span>Updated:</span> {formatDate(customer.updatedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Invoices</CardTitle>
              <CardDescription>All invoices for this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <Link
                              to={`/invoices/${invoice.id}`}
                              className="font-mono hover:underline"
                            >
                              {invoice.invoiceNumber}
                            </Link>
                          </TableCell>
                          <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                          <TableCell>{formatCurrency(invoice.total)}</TableCell>
                          <TableCell>
                            {formatCurrency(invoice.amountPaid)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(invoice.balance)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusColor(invoice.status) as any}
                            >
                              {invoice.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Invoices</h3>
                  <p className="text-muted-foreground mb-4">
                    This customer doesn't have any invoices yet.
                  </p>
                  <Button asChild>
                    <Link to={`/invoices/new?customer=${id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Invoice
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Quotations</CardTitle>
              <CardDescription>
                All quotations for this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quotations.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quote Number</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotations.map((quotation) => (
                        <TableRow key={quotation.id}>
                          <TableCell>
                            <Link
                              to={`/quotations/${quotation.id}`}
                              className="font-mono hover:underline"
                            >
                              {quotation.quoteNumber}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {formatDate(quotation.issueDate)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(quotation.total)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusColor(quotation.status) as any}
                            >
                              {quotation.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(quotation.validUntil)}
                          </TableCell>
                          <TableCell>
                            {quotation.status === "accepted" && (
                              <Button size="sm" variant="outline" asChild>
                                <Link
                                  to={`/invoices/new?quotation=${quotation.id}`}
                                >
                                  Convert to Invoice
                                </Link>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Quotations</h3>
                  <p className="text-muted-foreground mb-4">
                    This customer doesn't have any quotations yet.
                  </p>
                  <Button asChild>
                    <Link to={`/quotations/new?customer=${id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Quotation
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                All payments received from this customer
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
                        <TableHead>Invoice</TableHead>
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
                          <TableCell>
                            {payment.invoiceId && (
                              <Link
                                to={`/invoices/${payment.invoiceId}`}
                                className="text-blue-600 hover:underline"
                              >
                                View Invoice
                              </Link>
                            )}
                          </TableCell>
                          <TableCell>{payment.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Payments</h3>
                  <p className="text-muted-foreground">
                    No payments have been recorded for this customer yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Credit Management</CardTitle>
              <CardDescription>
                Credit limit and utilization information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Credit Overview</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Credit Limit:</span>
                      <span className="font-medium">
                        {formatCurrency(customer.creditLimit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Current Balance:</span>
                      <span className="font-medium">
                        {formatCurrency(customer.balance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Available Credit:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(
                          customer.creditLimit - customer.balance,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Utilization Rate:</span>
                      <span className="font-medium">
                        {customer.creditLimit > 0
                          ? (
                              (customer.balance / customer.creditLimit) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Credit Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CreditIcon className="h-4 w-4" />
                      <Badge variant={creditStatus.color as any}>
                        {creditStatus.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Credit Usage</span>
                        <span>
                          {customer.creditLimit > 0
                            ? (
                                (customer.balance / customer.creditLimit) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (customer.balance / customer.creditLimit) * 100 >=
                            90
                              ? "bg-red-500"
                              : (customer.balance / customer.creditLimit) *
                                    100 >=
                                  70
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(100, customer.creditLimit > 0 ? (customer.balance / customer.creditLimit) * 100 : 0)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {(customer.balance / customer.creditLimit) * 100 >= 70 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            High Credit Utilization
                          </span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">
                          Consider reviewing credit terms or collecting
                          outstanding balances.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
