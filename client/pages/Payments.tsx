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
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  Download,
  Receipt,
  Smartphone,
  Banknote,
  University,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Payment, Customer, Invoice } from '@shared/types';
import PDFService from '../services/pdfService';
import { useToast } from '../hooks/use-toast';

// Mock data
const mockCustomers: Customer[] = [
  { id: '1', name: 'Acme Corporation Ltd', email: 'contact@acme.com', phone: '+254700123456', kraPin: 'P051234567A', address: '123 Business Ave, Nairobi', creditLimit: 500000, balance: 125000, isActive: true, companyId: '1', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Tech Solutions Kenya', email: 'info@techsolutions.co.ke', phone: '+254722987654', kraPin: 'P051234568B', address: '456 Innovation Hub, Nairobi', creditLimit: 300000, balance: 45000, isActive: true, companyId: '1', createdAt: new Date(), updatedAt: new Date() },
];

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerId: '1',
    customer: mockCustomers[0],
    items: [],
    subtotal: 55000,
    vatAmount: 8800,
    discountAmount: 0,
    total: 63800,
    amountPaid: 63800,
    balance: 0,
    status: 'paid',
    dueDate: new Date('2024-02-15'),
    issueDate: new Date('2024-01-15'),
    companyId: '1',
    createdBy: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customerId: '2',
    customer: mockCustomers[1],
    items: [],
    subtotal: 80000,
    vatAmount: 12800,
    discountAmount: 0,
    total: 92800,
    amountPaid: 50000,
    balance: 42800,
    status: 'sent',
    dueDate: new Date('2024-02-28'),
    issueDate: new Date('2024-01-28'),
    companyId: '1',
    createdBy: '1',
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-01-28'),
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    customerId: '1',
    customer: mockCustomers[0],
    items: [],
    subtotal: 35000,
    vatAmount: 5600,
    discountAmount: 0,
    total: 40600,
    amountPaid: 18500,
    balance: 22100,
    status: 'sent',
    dueDate: new Date('2024-03-15'),
    issueDate: new Date('2024-02-15'),
    companyId: '1',
    createdBy: '1',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
];

const mockPayments: Payment[] = [
  {
    id: '1',
    amount: 63800,
    method: 'mpesa',
    reference: 'QAD7E85F23',
    notes: 'Full payment for INV-2024-001',
    invoiceId: '1',
    customerId: '1',
    companyId: '1',
    createdBy: '1',
    createdAt: new Date('2024-01-16T10:30:00'),
  },
  {
    id: '2',
    amount: 50000,
    method: 'bank',
    reference: 'BT-2024-001',
    notes: 'Partial payment via bank transfer',
    invoiceId: '2',
    customerId: '2',
    companyId: '1',
    createdBy: '1',
    createdAt: new Date('2024-01-22T14:15:00'),
  },
  {
    id: '3',
    amount: 25000,
    method: 'cash',
    reference: 'CASH-001',
    notes: 'Cash payment received',
    customerId: '1',
    companyId: '1',
    createdBy: '1',
    createdAt: new Date('2024-01-25T09:45:00'),
  },
  {
    id: '4',
    amount: 18500,
    method: 'cheque',
    reference: 'CHQ-456789',
    notes: 'Cheque payment - ABC Bank',
    invoiceId: '3',
    customerId: '1',
    companyId: '1',
    createdBy: '1',
    createdAt: new Date('2024-01-20T16:20:00'),
  },
  {
    id: '5',
    amount: 30000,
    method: 'card',
    reference: 'CARD-8901',
    notes: 'Credit card payment',
    customerId: '2',
    companyId: '1',
    createdBy: '1',
    createdAt: new Date('2024-01-18T11:00:00'),
  },
];

interface PaymentFormData {
  customerId: string;
  invoiceId: string;
  amount: string;
  method: string;
  reference: string;
  notes: string;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    customerId: '',
    invoiceId: '',
    amount: '',
    method: '',
    reference: '',
    notes: ''
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const filteredPayments = payments.filter(payment => {
    const customer = mockCustomers.find(c => c.id === payment.customerId);
    const invoice = payment.invoiceId ? invoices.find(i => i.id === payment.invoiceId) : null;

    const matchesSearch = payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice?.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Smartphone className="h-4 w-4" />;
      case 'bank': return <University className="h-4 w-4" />;
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'cheque': return <Receipt className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'mpesa': return 'bg-green-500';
      case 'bank': return 'bg-blue-500';
      case 'cash': return 'bg-orange-500';
      case 'cheque': return 'bg-purple-500';
      case 'card': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.customerId || !formData.amount || !formData.method || !formData.reference) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    // Check if payment amount doesn't exceed invoice balance (if invoice selected)
    if (formData.invoiceId && formData.invoiceId !== 'none' && selectedInvoice) {
      if (amount > selectedInvoice.balance) {
        toast({
          title: "Amount Exceeds Balance",
          description: `Payment amount cannot exceed invoice balance of ${formatCurrency(selectedInvoice.balance)}.`,
          variant: "destructive",
        });
        return;
      }
    }

    // Create new payment
    const newPayment: Payment = {
      id: Date.now().toString(),
      amount,
      method: formData.method as any,
      reference: formData.reference,
      notes: formData.notes || undefined,
      invoiceId: formData.invoiceId === 'none' ? undefined : formData.invoiceId,
      customerId: formData.customerId,
      companyId: '1',
      createdBy: '1',
      createdAt: new Date(),
    };

    // Update payments list
    setPayments(prev => [newPayment, ...prev]);

    // Update invoice if payment is linked to an invoice
    if (formData.invoiceId && formData.invoiceId !== 'none') {
      setInvoices(prev => prev.map(invoice => {
        if (invoice.id === formData.invoiceId) {
          const newAmountPaid = invoice.amountPaid + amount;
          const newBalance = invoice.total - newAmountPaid;
          const newStatus = newBalance <= 0 ? 'paid' : invoice.status;

          return {
            ...invoice,
            amountPaid: newAmountPaid,
            balance: newBalance,
            status: newStatus as any,
            updatedAt: new Date(),
          };
        }
        return invoice;
      }));
    }

    // Reset form and close dialog
    setFormData({
      customerId: '',
      invoiceId: '',
      amount: '',
      method: '',
      reference: '',
      notes: ''
    });
    setSelectedInvoice(null);
    setIsCreateDialogOpen(false);

    toast({
      title: "Payment Recorded",
      description: `Payment of ${formatCurrency(amount)} has been successfully recorded.`,
    });
  };

  const handleCustomerChange = (customerId: string) => {
    setFormData(prev => ({ ...prev, customerId, invoiceId: '' }));
    setSelectedInvoice(null);
  };

  const handleInvoiceChange = (invoiceId: string) => {
    setFormData(prev => ({ ...prev, invoiceId }));
    if (invoiceId && invoiceId !== 'none') {
      const invoice = invoices.find(i => i.id === invoiceId);
      setSelectedInvoice(invoice || null);
    } else {
      setSelectedInvoice(null);
    }
  };

  // Get unpaid/partially paid invoices for selected customer
  const getAvailableInvoices = (customerId: string) => {
    return invoices.filter(invoice =>
      invoice.customerId === customerId &&
      invoice.balance > 0 &&
      invoice.status !== 'cancelled'
    );
  };

  const getCustomerById = (customerId: string) => {
    return mockCustomers.find(c => c.id === customerId);
  };

  const getInvoiceById = (invoiceId?: string) => {
    return invoiceId ? invoices.find(i => i.id === invoiceId) : null;
  };

  const handleDownloadReceipt = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      PDFService.generatePaymentReceiptPDF(payment);
    }
  };

  // Calculate metrics
  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const todaysPayments = payments.filter(p => {
    const today = new Date();
    const paymentDate = new Date(p.createdAt);
    return paymentDate.toDateString() === today.toDateString();
  });
  const todaysAmount = todaysPayments.reduce((sum, p) => sum + p.amount, 0);

  const methodBreakdown = payments.reduce((acc, payment) => {
    acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Track customer payments and manage payment methods
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
              <DialogDescription>
                Record a payment received from a customer
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePayment} className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Select value={formData.customerId} onValueChange={handleCustomerChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice">Invoice (Optional)</Label>
                  <Select value={formData.invoiceId} onValueChange={handleInvoiceChange} disabled={!formData.customerId}>
                    <SelectTrigger>
                      <SelectValue placeholder={formData.customerId ? "Select invoice" : "Select customer first"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">General Payment</SelectItem>
                      {formData.customerId && getAvailableInvoices(formData.customerId).map(invoice => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoiceNumber} - Balance: {formatCurrency(invoice.balance)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Invoice Info Alert */}
              {selectedInvoice && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div><strong>Invoice:</strong> {selectedInvoice.invoiceNumber}</div>
                      <div><strong>Total:</strong> {formatCurrency(selectedInvoice.total)}</div>
                      <div><strong>Paid:</strong> {formatCurrency(selectedInvoice.amountPaid)}</div>
                      <div><strong>Balance:</strong> {formatCurrency(selectedInvoice.balance)}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KES) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder={selectedInvoice ? `Max: ${selectedInvoice.balance}` : "0.00"}
                    min="0"
                    step="0.01"
                    max={selectedInvoice?.balance}
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                  {selectedInvoice && formData.amount && parseFloat(formData.amount) > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Remaining balance: {formatCurrency(selectedInvoice.balance - parseFloat(formData.amount || '0'))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method *</Label>
                  <Select value={formData.method} onValueChange={(value) => setFormData(prev => ({ ...prev, method: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">MPESA</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number *</Label>
                <Input
                  id="reference"
                  placeholder="Payment reference/transaction ID"
                  value={formData.reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional payment notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Record Payment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayments}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">+{todaysPayments.length}</span> today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              All time payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Payments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todaysAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {todaysPayments.length} transaction(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPayments > 0 ? totalAmount / totalPayments : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average transaction size
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Invoices</CardTitle>
          <CardDescription>
            Invoices with pending payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.filter(i => i.balance > 0).map(invoice => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {invoice.customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{invoice.invoiceNumber}</div>
                    <div className="text-sm text-muted-foreground">{invoice.customer.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(invoice.balance)}</div>
                  <div className="text-sm text-muted-foreground">
                    of {formatCurrency(invoice.total)}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      customerId: invoice.customerId,
                      invoiceId: invoice.id,
                      amount: invoice.balance.toString()
                    }));
                    setSelectedInvoice(invoice);
                    setIsCreateDialogOpen(true);
                  }}
                >
                  Pay
                </Button>
              </div>
            ))}
            {invoices.filter(i => i.balance > 0).length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p>All invoices are fully paid!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods Breakdown</CardTitle>
          <CardDescription>
            Distribution of payments by method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {Object.entries(methodBreakdown).map(([method, amount]) => (
              <div key={method} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className={`h-8 w-8 rounded-md ${getMethodColor(method)} flex items-center justify-center`}>
                  {getMethodIcon(method)}
                </div>
                <div>
                  <p className="font-medium capitalize">{method}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Complete record of all customer payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mpesa">MPESA</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">Export</Button>
          </div>

          {/* Payments Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const customer = getCustomerById(payment.customerId);
                  const invoice = getInvoiceById(payment.invoiceId);
                  
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {customer?.name.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer?.name || 'Unknown Customer'}</div>
                            <div className="text-sm text-muted-foreground">{customer?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {invoice ? (
                          <div className="space-y-1">
                            <Link to={`/invoices/${invoice.id}`} className="text-primary hover:underline">
                              {invoice.invoiceNumber}
                            </Link>
                            <div className="flex items-center space-x-2">
                              <Badge variant={invoice.balance === 0 ? "default" : "secondary"} className="text-xs">
                                {invoice.balance === 0 ? "Fully Paid" : `${formatCurrency(invoice.balance)} due`}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">General Payment</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-success">
                          {formatCurrency(payment.amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`h-6 w-6 rounded ${getMethodColor(payment.method)} flex items-center justify-center`}>
                            {React.cloneElement(getMethodIcon(payment.method), { className: 'h-3 w-3 text-white' })}
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {payment.method}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {payment.reference}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {payment.notes || '-'}
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Payment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDownloadReceipt(payment.id)}>
                              <Download className="mr-2 h-4 w-4" />
                              Receipt PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Payment
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

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No payments found</h3>
              <p className="text-muted-foreground">
                {searchTerm || methodFilter !== 'all' 
                  ? 'Try adjusting your search terms or filters.' 
                  : 'Get started by recording your first payment.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
