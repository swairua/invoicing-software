import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Plus,
  FileText,
  Users,
  Package,
  Receipt,
  CreditCard,
  Loader2,
} from 'lucide-react';

interface QuickActionItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  color: string;
  action?: () => void;
  dialog?: boolean;
}

// Mock data for dropdowns
const mockCustomers = [
  { id: '1', name: 'Acme Corporation Ltd' },
  { id: '2', name: 'Tech Solutions Kenya' },
  { id: '3', name: 'Global Trading Co.' },
];

const mockProducts = [
  { id: '1', name: 'Wireless Bluetooth Headphones', price: 5500 },
  { id: '2', name: 'Office Chair Executive', price: 18000 },
  { id: '3', name: 'A4 Copy Paper', price: 650 },
];

const mockOutstandingInvoices = [
  { id: '1', number: 'INV-2024-001', customer: 'Acme Corporation Ltd', balance: 63800 },
  { id: '2', number: 'INV-2024-002', customer: 'Tech Solutions Kenya', balance: 49900 },
  { id: '3', number: 'INV-2024-003', customer: 'Global Trading Co.', balance: 145750 },
];

export default function QuickActions() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const closeDialog = (key: string) => {
    setOpenDialogs(prev => ({ ...prev, [key]: false }));
  };

  const openDialog = (key: string) => {
    setOpenDialogs(prev => ({ ...prev, [key]: true }));
  };

  const handleQuickInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    closeDialog('invoice');
    navigate('/invoices');
  };

  const handleQuickCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    closeDialog('customer');
    navigate('/customers');
  };

  const handleQuickProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    closeDialog('product');
    navigate('/products');
  };

  const handleQuickPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    closeDialog('payment');
    navigate('/payments');
  };

  const quickActions: QuickActionItem[] = [
    {
      title: 'New Invoice',
      icon: FileText,
      color: 'bg-blue-500',
      dialog: true,
      action: () => openDialog('invoice'),
    },
    {
      title: 'New Customer',
      icon: Users,
      color: 'bg-green-500',
      dialog: true,
      action: () => openDialog('customer'),
    },
    {
      title: 'New Product',
      icon: Package,
      color: 'bg-purple-500',
      dialog: true,
      action: () => openDialog('product'),
    },
    {
      title: 'Record Payment',
      icon: Receipt,
      color: 'bg-orange-500',
      dialog: true,
      action: () => openDialog('payment'),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used actions to help you manage your business efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Dialog 
                key={index} 
                open={openDialogs[action.title.toLowerCase().replace(' ', '_')] || false} 
                onOpenChange={(open) => {
                  const key = action.title.toLowerCase().replace(' ', '_');
                  setOpenDialogs(prev => ({ ...prev, [key]: open }));
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={action.action}
                  >
                    <div className={`h-8 w-8 rounded-md ${action.color} flex items-center justify-center`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">{action.title}</span>
                  </Button>
                </DialogTrigger>

                {/* Quick Invoice Dialog */}
                {action.title === 'New Invoice' && (
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create Quick Invoice</DialogTitle>
                      <DialogDescription>
                        Quickly create an invoice for an existing customer
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleQuickInvoice} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer">Customer *</Label>
                        <Select>
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="product">Product *</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockProducts.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - {formatCurrency(product.price)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity *</Label>
                          <Input id="quantity" type="number" placeholder="1" min="1" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date *</Label>
                        <Input id="dueDate" type="date" required />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => closeDialog('invoice')}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Invoice
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                )}

                {/* Quick Customer Dialog */}
                {action.title === 'New Customer' && (
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add Quick Customer</DialogTitle>
                      <DialogDescription>
                        Add a new customer to your database
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleQuickCustomer} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Company Name *</Label>
                        <Input id="customerName" placeholder="Enter company name" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="customerEmail">Email</Label>
                          <Input id="customerEmail" type="email" placeholder="contact@company.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customerPhone">Phone</Label>
                          <Input id="customerPhone" placeholder="+254700123456" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="kraPin">KRA PIN</Label>
                          <Input id="kraPin" placeholder="P051234567A" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="creditLimit">Credit Limit (KES)</Label>
                          <Input id="creditLimit" type="number" placeholder="500000" min="0" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => closeDialog('customer')}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add Customer
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                )}

                {/* Quick Product Dialog */}
                {action.title === 'New Product' && (
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add Quick Product</DialogTitle>
                      <DialogDescription>
                        Add a new product to your inventory
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleQuickProduct} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="productName">Product Name *</Label>
                        <Input id="productName" placeholder="Enter product name" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sku">SKU *</Label>
                          <Input id="sku" placeholder="PRD-001" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="electronics">Electronics</SelectItem>
                              <SelectItem value="furniture">Furniture</SelectItem>
                              <SelectItem value="stationery">Stationery</SelectItem>
                              <SelectItem value="office">Office Supplies</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="purchasePrice">Purchase Price</Label>
                          <Input id="purchasePrice" type="number" placeholder="0.00" min="0" step="0.01" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sellingPrice">Selling Price *</Label>
                          <Input id="sellingPrice" type="number" placeholder="0.00" min="0" step="0.01" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="initialStock">Initial Stock</Label>
                          <Input id="initialStock" type="number" placeholder="0" min="0" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => closeDialog('product')}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add Product
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                )}

                {/* Quick Payment Dialog */}
                {action.title === 'Record Payment' && (
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Record Quick Payment</DialogTitle>
                      <DialogDescription>
                        Record a payment received from a customer
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleQuickPayment} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="paymentCustomer">Customer *</Label>
                        <Select>
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
                        <Label htmlFor="paymentInvoice">Invoice (Optional)</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select invoice or general payment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Payment</SelectItem>
                            {mockOutstandingInvoices.map(invoice => (
                              <SelectItem key={invoice.id} value={invoice.id}>
                                {invoice.number} - {invoice.customer} ({formatCurrency(invoice.balance)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentAmount">Amount (KES) *</Label>
                          <Input id="paymentAmount" type="number" placeholder="0.00" min="0" step="0.01" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod">Method *</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Payment method" />
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
                        <Label htmlFor="paymentReference">Reference Number *</Label>
                        <Input id="paymentReference" placeholder="Transaction ID or reference" required />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => closeDialog('payment')}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Record Payment
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                )}
              </Dialog>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
