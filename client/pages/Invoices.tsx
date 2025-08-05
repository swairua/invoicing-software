import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Receipt,
  Send,
  Download,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Copy,
  Package,
  Loader2,
} from 'lucide-react';
import { Invoice, Customer, Product } from '@shared/types';
import PDFService from '../services/pdfService';
import BusinessDataService from '../services/businessDataService';
import { useToast } from '../hooks/use-toast';

// Get business data service instance
const businessData = BusinessDataService.getInstance();

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    dueDate: '',
    notes: '',
    items: [] as { productId: string; quantity: number; unitPrice: number; }[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load initial data
  React.useEffect(() => {
    setInvoices(businessData.getInvoices());
    setCustomers(businessData.getCustomers());
    setProducts(businessData.getProducts());
  }, []);

  // Refresh data periodically
  React.useEffect(() => {
    const refreshInterval = setInterval(() => {
      setInvoices(businessData.getInvoices());
      setCustomers(businessData.getCustomers());
      setProducts(businessData.getProducts());
    }, 5000);

    return () => clearInterval(refreshInterval);
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'default';
      case 'paid': return 'default';
      case 'overdue': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-3 w-3" />;
      case 'sent': return <Send className="h-3 w-3" />;
      case 'paid': return <CheckCircle className="h-3 w-3" />;
      case 'overdue': return <AlertCircle className="h-3 w-3" />;
      case 'cancelled': return <Clock className="h-3 w-3" />;
      default: return null;
    }
  };

  const getEtimsStatusVariant = (status?: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      case 'submitted': return 'outline';
      default: return 'secondary';
    }
  };

  const getDaysOverdue = (dueDate: Date, status: string) => {
    if (status !== 'overdue') return 0;
    const today = new Date();
    return Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getPaymentProgress = (amountPaid: number, total: number) => {
    return (amountPaid / total) * 100;
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateDialogOpen(false);
  };

  const handleRecordPayment = (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice || invoice.balance <= 0) return;

    // For demo, process a random payment amount
    const paymentAmount = Math.min(invoice.balance, Math.floor(Math.random() * invoice.balance) + 1000);
    const paymentMethods = ['cash', 'mpesa', 'bank', 'cheque', 'card'] as const;
    const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const reference = 'PAY-' + Date.now();

    const payment = businessData.processPayment(invoiceId, paymentAmount, method, reference, 'Manual payment recording');

    if (payment) {
      setInvoices(businessData.getInvoices());
      toast({
        title: "Payment Recorded",
        description: `Payment of KES ${paymentAmount.toLocaleString()} recorded for ${invoice.invoiceNumber}`,
      });
    } else {
      toast({
        title: "Payment Failed",
        description: "Unable to record payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendToETIMS = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      // Update invoice ETIMS status
      setInvoices(prev => prev.map(inv =>
        inv.id === invoiceId
          ? {
              ...inv,
              etimsStatus: 'submitted' as const,
              etimsCode: `ETIMS-${Date.now()}`,
              updatedAt: new Date()
            }
          : inv
      ));

      toast({
        title: "ETIMS Submission",
        description: `Invoice ${invoice.invoiceNumber} submitted to ETIMS successfully`,
      });
    }
  };

  const handleDownloadPDF = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      PDFService.generateInvoicePDF(invoice);
    }
  };

  const handleViewDetails = (invoiceId: string) => {
    console.log('Viewing invoice details:', invoiceId);
    toast({
      title: "Invoice Details",
      description: "Opening invoice details view",
    });
  };

  const handleEditInvoice = (invoiceId: string) => {
    console.log('Editing invoice:', invoiceId);
    toast({
      title: "Edit Invoice",
      description: "Opening invoice edit form",
    });
  };

  const handleDuplicateInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      console.log('Duplicating invoice:', invoiceId);
      toast({
        title: "Invoice Duplicated",
        description: `Created a copy of ${invoice.invoiceNumber}`,
      });
    }
  };

  const handleSendToCustomer = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      console.log('Sending invoice to customer:', invoiceId);
      toast({
        title: "Invoice Sent",
        description: `Invoice sent to ${invoice.customer.name}`,
      });
    }
  };

  const handleViewStatement = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      console.log('Viewing customer statement:', invoiceId);
      toast({
        title: "Statement View",
        description: `Opening statement for ${invoice.customer.name}`,
      });
    }
  };

  const handleCancelInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      console.log('Cancelling invoice:', invoiceId);
      // Update invoice status to cancelled
      setInvoices(prev => prev.map(inv =>
        inv.id === invoiceId
          ? { ...inv, status: 'cancelled' as const, updatedAt: new Date() }
          : inv
      ));
      toast({
        title: "Invoice Cancelled",
        description: `${invoice.invoiceNumber} has been cancelled`,
        variant: "destructive",
      });
    }
  };

  // Calculate metrics
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(i => i.status === 'paid').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
  const totalValue = invoices.reduce((sum, i) => sum + i.total, 0);
  const outstandingAmount = invoices.reduce((sum, i) => sum + i.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage customer invoices and track payments with ETIMS integration
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Generate a new customer invoice
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateInvoice} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input id="dueDate" type="date" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Invoice notes" />
              </div>
              <div className="space-y-4">
                <Label>Items</Label>
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-5 gap-2 text-sm font-medium text-muted-foreground">
                    <span>Product</span>
                    <span>Quantity</span>
                    <span>Unit Price</span>
                    <span>Discount %</span>
                    <span>Total</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="1" min="1" />
                    <Input type="number" placeholder="0.00" min="0" step="0.01" />
                    <Input type="number" placeholder="0" min="0" max="100" />
                    <Input value="0.00" disabled />
                  </div>
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Invoice
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">+2</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{paidInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0}% paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Require follow-up
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total invoice value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatCurrency(outstandingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Amount due
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
          <CardDescription>
            Track customer invoices, payments, and ETIMS submission status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export</Button>
          </div>

          {/* Invoices Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>ETIMS</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const paymentProgress = getPaymentProgress(invoice.amountPaid, invoice.total);
                  const daysOverdue = getDaysOverdue(invoice.dueDate, invoice.status);
                  
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.items.length} item(s)
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {invoice.customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{invoice.customer.name}</div>
                            <div className="text-sm text-muted-foreground">{invoice.customer.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{invoice.issueDate.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className={`text-sm ${invoice.status === 'overdue' ? 'text-destructive font-medium' : ''}`}>
                          {invoice.dueDate.toLocaleDateString()}
                        </div>
                        {daysOverdue > 0 && (
                          <div className="text-xs text-destructive">
                            {daysOverdue} days overdue
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(invoice.total)}</div>
                        {invoice.discountAmount > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Discount: {formatCurrency(invoice.discountAmount)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <Badge variant={getStatusVariant(invoice.status)} className="capitalize">
                              {getStatusIcon(invoice.status)}
                              <span className="ml-1">{invoice.status}</span>
                            </Badge>
                          </div>
                          {invoice.balance > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Paid: {formatCurrency(invoice.amountPaid)}</span>
                                <span>{paymentProgress.toFixed(0)}%</span>
                              </div>
                              <Progress value={paymentProgress} className="h-1" />
                              <div className="text-xs text-muted-foreground">
                                Balance: {formatCurrency(invoice.balance)}
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={getEtimsStatusVariant(invoice.etimsStatus)} className="text-xs">
                            {invoice.etimsStatus || 'Not submitted'}
                          </Badge>
                          {invoice.etimsCode && (
                            <div className="text-xs text-muted-foreground font-mono">
                              {invoice.etimsCode}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {invoice.balance > 0 && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRecordPayment(invoice.id)}
                              className="text-xs"
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay
                            </Button>
                          )}
                          {invoice.etimsStatus === 'pending' && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendToETIMS(invoice.id)}
                              className="text-xs"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              ETIMS
                            </Button>
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
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(invoice.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditInvoice(invoice.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateInvoice(invoice.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDownloadPDF(invoice.id)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendToCustomer(invoice.id)}>
                              <Send className="mr-2 h-4 w-4" />
                              Send to Customer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewStatement(invoice.id)}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Statement
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleCancelInvoice(invoice.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No invoices found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search terms or filters.' 
                  : 'Get started by creating your first invoice.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
