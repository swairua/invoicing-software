import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  Save,
  Receipt,
  User,
  FileText,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Customer, Invoice, Payment } from '@shared/types';
import { dataServiceFactory } from '../services/dataServiceFactory';
import { useToast } from '../hooks/use-toast';

interface PaymentFormData {
  customerId: string;
  invoiceId: string;
  amount: string;
  method: 'cash' | 'mpesa' | 'bank' | 'cheque' | 'card';
  reference: string;
  notes: string;
}

export default function RecordPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);

  const preselectedInvoiceId = searchParams.get('invoice');
  const preselectedCustomerId = searchParams.get('customer');

  const [formData, setFormData] = useState<PaymentFormData>({
    customerId: preselectedCustomerId || '',
    invoiceId: preselectedInvoiceId || '',
    amount: '',
    method: 'mpesa',
    reference: '',
    notes: '',
  });

  const dataService = dataServiceFactory.getDataService();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customerData, invoiceData] = await Promise.all([
          dataService.getCustomers(),
          dataService.getInvoices()
        ]);
        setCustomers(customerData);
        setInvoices(invoiceData);

        // If invoice is preselected, set the customer
        if (preselectedInvoiceId) {
          const invoice = invoiceData.find(inv => inv.id === preselectedInvoiceId);
          if (invoice) {
            setFormData(prev => ({
              ...prev,
              customerId: invoice.customerId,
              amount: invoice.balance.toString()
            }));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load data.",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [dataService, preselectedInvoiceId, toast]);

  useEffect(() => {
    if (formData.customerId) {
      const customerInvoices = invoices.filter(inv => 
        inv.customerId === formData.customerId && inv.balance > 0
      );
      setFilteredInvoices(customerInvoices);
    } else {
      setFilteredInvoices([]);
    }
  }, [formData.customerId, invoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return Banknote;
      case 'mpesa': return Smartphone;
      case 'bank': return Building;
      case 'cheque': return FileText;
      case 'card': return CreditCard;
      default: return Receipt;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'mpesa': return 'bg-blue-100 text-blue-800';
      case 'bank': return 'bg-purple-100 text-purple-800';
      case 'cheque': return 'bg-yellow-100 text-yellow-800';
      case 'card': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const methodPrefix = formData.method.toUpperCase().substring(0, 2);
    return `${methodPrefix}${timestamp}${random}`;
  };

  const handleMethodChange = (method: 'cash' | 'mpesa' | 'bank' | 'cheque' | 'card') => {
    setFormData(prev => ({
      ...prev,
      method,
      reference: prev.reference || generateReference()
    }));
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setFormData(prev => ({
        ...prev,
        invoiceId,
        amount: invoice.balance.toString()
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId || !formData.amount || !formData.reference) {
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

    // Validate against invoice balance if invoice is selected
    if (formData.invoiceId) {
      const invoice = invoices.find(inv => inv.id === formData.invoiceId);
      if (invoice && amount > invoice.balance) {
        toast({
          title: "Amount Too High",
          description: `Payment amount cannot exceed the outstanding balance of ${formatCurrency(invoice.balance)}.`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const newPayment: Omit<Payment, 'id' | 'createdAt'> = {
        amount,
        method: formData.method,
        reference: formData.reference,
        notes: formData.notes || undefined,
        invoiceId: formData.invoiceId || undefined,
        customerId: formData.customerId,
        companyId: '1',
        createdBy: '1',
      };

      // Here you would normally call a create payment API
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Payment Recorded",
        description: `Payment of ${formatCurrency(amount)} has been recorded successfully.`,
      });

      navigate('/payments');
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const selectedInvoice = invoices.find(inv => inv.id === formData.invoiceId);
  const MethodIcon = getMethodIcon(formData.method);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/payments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payments
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Record Payment</h1>
            <p className="text-muted-foreground">
              Record a payment received from a customer
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/payments">Cancel</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Recording...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Record Payment
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer and Invoice Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer & Invoice
              </CardTitle>
              <CardDescription>
                Select the customer and optionally link to an invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select 
                  value={formData.customerId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value, invoiceId: '' }))}
                  disabled={!!preselectedCustomerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Balance: {formatCurrency(customer.balance)}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice">Invoice (Optional)</Label>
                <Select 
                  value={formData.invoiceId} 
                  onValueChange={handleInvoiceSelect}
                  disabled={!formData.customerId || !!preselectedInvoiceId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an invoice or leave blank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific invoice</SelectItem>
                    {filteredInvoices.map(invoice => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        <div>
                          <div className="font-medium">{invoice.invoiceNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            Due: {formatDate(invoice.dueDate)} • Balance: {formatCurrency(invoice.balance)}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Link this payment to a specific invoice, or leave blank for general payment
                </p>
              </div>

              {selectedCustomer && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Customer Summary</h4>
                  <div className="space-y-1 text-xs">
                    <div>Outstanding Balance: {formatCurrency(selectedCustomer.balance)}</div>
                    <div>Credit Limit: {formatCurrency(selectedCustomer.creditLimit)}</div>
                    <div>Available Credit: {formatCurrency(selectedCustomer.creditLimit - selectedCustomer.balance)}</div>
                  </div>
                </div>
              )}

              {selectedInvoice && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 text-blue-800">Selected Invoice</h4>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div>Invoice: {selectedInvoice.invoiceNumber}</div>
                    <div>Total Amount: {formatCurrency(selectedInvoice.total)}</div>
                    <div>Amount Paid: {formatCurrency(selectedInvoice.amountPaid)}</div>
                    <div className="font-medium">Outstanding: {formatCurrency(selectedInvoice.balance)}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Enter the payment amount and method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount (KES) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                {selectedInvoice && parseFloat(formData.amount) > selectedInvoice.balance && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs">Amount exceeds invoice balance</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'cash', label: 'Cash', icon: Banknote },
                    { value: 'mpesa', label: 'M-Pesa', icon: Smartphone },
                    { value: 'bank', label: 'Bank Transfer', icon: Building },
                    { value: 'cheque', label: 'Cheque', icon: FileText },
                    { value: 'card', label: 'Card Payment', icon: CreditCard },
                  ].map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      type="button"
                      variant={formData.method === value ? 'default' : 'outline'}
                      onClick={() => handleMethodChange(value as any)}
                      className="justify-start h-12"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number *</Label>
                <div className="flex gap-2">
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Payment reference"
                    required
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFormData(prev => ({ ...prev, reference: generateReference() }))}
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Transaction ID, receipt number, or other reference
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this payment..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        {formData.amount && parseFloat(formData.amount) > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Payment Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-bold text-lg">{formatCurrency(parseFloat(formData.amount))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Method:</span>
                      <div className="flex items-center gap-2">
                        <MethodIcon className="h-4 w-4" />
                        <span className="capitalize">{formData.method}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Reference:</span>
                      <span className="font-mono text-xs">{formData.reference}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Impact</h4>
                  <div className="space-y-2 text-sm">
                    {selectedCustomer && (
                      <>
                        <div className="flex justify-between">
                          <span>Current Customer Balance:</span>
                          <span>{formatCurrency(selectedCustomer.balance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>After Payment:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(Math.max(0, selectedCustomer.balance - parseFloat(formData.amount)))}
                          </span>
                        </div>
                      </>
                    )}
                    {selectedInvoice && (
                      <>
                        <div className="flex justify-between">
                          <span>Invoice Balance:</span>
                          <span>{formatCurrency(selectedInvoice.balance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>After Payment:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(Math.max(0, selectedInvoice.balance - parseFloat(formData.amount)))}
                          </span>
                        </div>
                        {parseFloat(formData.amount) >= selectedInvoice.balance && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">Invoice will be marked as paid</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
