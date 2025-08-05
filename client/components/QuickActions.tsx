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
  Send,
  Truck,
  FileCheck,
  ShoppingCart,
  ClipboardList,
  PackageOpen,
  FileX,
  Calculator,
  Archive,
  Trash2,
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import BusinessDataService from '../services/businessDataService';

interface QuickActionItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  color: string;
  action?: () => void;
  dialog?: boolean;
  category: 'documents' | 'inventory' | 'customers' | 'financial';
}

// Get business data service instance
const businessData = BusinessDataService.getInstance();

export default function QuickActions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string; quantity: number }[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [customers, setCustomers] = useState(businessData.getCustomers());
  const [products, setProducts] = useState(businessData.getProducts());
  const [invoices, setInvoices] = useState(businessData.getInvoices());
  const [quotations, setQuotations] = useState(businessData.getQuotations());

  // Refresh data periodically
  React.useEffect(() => {
    const refreshInterval = setInterval(() => {
      setCustomers(businessData.getCustomers());
      setProducts(businessData.getProducts());
      setInvoices(businessData.getInvoices());
      setQuotations(businessData.getQuotations());
    }, 5000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Enhanced Quick Actions with comprehensive document types
  const quickActions: QuickActionItem[] = [
    // Documents
    {
      title: 'New Invoice',
      description: 'Create a new customer invoice',
      icon: FileText,
      color: 'text-blue-600',
      dialog: true,
      category: 'documents'
    },
    {
      title: 'New Quotation',
      description: 'Send a price quote to customer',
      icon: Calculator,
      color: 'text-purple-600',
      dialog: true,
      category: 'documents'
    },
    {
      title: 'Proforma Invoice',
      description: 'Create preliminary invoice',
      icon: FileCheck,
      color: 'text-indigo-600',
      dialog: true,
      category: 'documents'
    },
    {
      title: 'Delivery Note',
      description: 'Create delivery confirmation',
      icon: Truck,
      color: 'text-green-600',
      dialog: true,
      category: 'documents'
    },
    {
      title: 'Packing List',
      description: 'Generate item packing list',
      icon: PackageOpen,
      color: 'text-orange-600',
      dialog: true,
      category: 'documents'
    },
    {
      title: 'Credit Note',
      description: 'Issue customer credit',
      icon: FileX,
      color: 'text-red-600',
      dialog: true,
      category: 'financial'
    },
    
    // Inventory & Operations
    {
      title: 'Add Product',
      description: 'Add new product to inventory',
      icon: Package,
      href: '/products',
      color: 'text-emerald-600',
      category: 'inventory'
    },
    {
      title: 'Stock Adjustment',
      description: 'Adjust product stock levels',
      icon: Archive,
      color: 'text-yellow-600',
      dialog: true,
      category: 'inventory'
    },
    {
      title: 'Purchase Order',
      description: 'Order from suppliers',
      icon: ShoppingCart,
      color: 'text-cyan-600',
      dialog: true,
      category: 'inventory'
    },
    
    // Customer & Financial
    {
      title: 'Add Customer',
      description: 'Register new customer',
      icon: Users,
      href: '/customers',
      color: 'text-violet-600',
      category: 'customers'
    },
    {
      title: 'Record Payment',
      description: 'Log customer payment',
      icon: CreditCard,
      href: '/payments',
      color: 'text-green-600',
      category: 'financial'
    },
    {
      title: 'Payment Receipt',
      description: 'Generate payment receipt',
      icon: Receipt,
      color: 'text-teal-600',
      dialog: true,
      category: 'financial'
    },
  ];

  const handleQuickAction = (action: QuickActionItem) => {
    if (action.href) {
      navigate(action.href);
    } else if (action.dialog) {
      setOpenDialog(action.title);
    } else if (action.action) {
      action.action();
    }
  };

  const handleCreateDocument = async (documentType: string) => {
    // Validation
    if (!selectedCustomer) {
      toast({
        title: "Validation Error",
        description: "Please select a customer.",
        variant: "destructive",
      });
      return;
    }

    if (selectedProducts.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one product.",
        variant: "destructive",
      });
      return;
    }

    // Validate all products are selected
    const hasInvalidProducts = selectedProducts.some(item => !item.productId || item.quantity <= 0);
    if (hasInvalidProducts) {
      toast({
        title: "Validation Error",
        description: "Please ensure all products are selected with valid quantities.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const customer = customers.find(c => c.id === selectedCustomer);
      const documentNumber = generateDocumentNumber(documentType);

      // Calculate totals
      const subtotal = selectedProducts.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        return sum + (product ? product.sellingPrice * item.quantity : 0);
      }, 0);

      const vatAmount = subtotal * 0.16;
      const total = subtotal + vatAmount;

      // Create document object (this would normally be sent to API)
      const documentData = {
        id: `${documentNumber.toLowerCase()}-${Date.now()}`,
        documentNumber,
        customerId: selectedCustomer,
        customer: customer,
        items: selectedProducts.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            productId: item.productId,
            product: product,
            quantity: item.quantity,
            unitPrice: product?.sellingPrice || 0,
            lineTotal: (product?.sellingPrice || 0) * item.quantity,
          };
        }),
        subtotal,
        vatAmount,
        total,
        notes,
        status: 'draft',
        createdAt: new Date(),
      };

      console.log(`Creating ${documentType}:`, documentData);

      toast({
        title: "Document Created Successfully",
        description: `${documentType} ${documentNumber} created for ${customer?.name} - Total: KES ${total.toLocaleString()}`,
      });

      // Reset form
      setSelectedCustomer('');
      setSelectedProducts([]);
      setSelectedInvoice('');
      setSelectedQuotation('');
      setNotes('');
      setOpenDialog(null);

      // Navigate to appropriate page after a brief delay
      setTimeout(() => {
        const routeMap: { [key: string]: string } = {
          'New Invoice': '/invoices',
          'New Quotation': '/quotations',
          'Proforma Invoice': '/proforma',
          'Delivery Note': '/deliveries',
          'Packing List': '/packing-lists',
          'Credit Note': '/credit-notes',
          'Purchase Order': '/purchase-orders',
          'Payment Receipt': '/payments',
        };

        if (routeMap[documentType]) {
          navigate(routeMap[documentType]);
        }
      }, 1000);

    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Error",
        description: "Failed to create document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateDocumentNumber = (type: string) => {
    const prefix = {
      'New Invoice': 'INV',
      'New Quotation': 'QUO',
      'Proforma Invoice': 'PRO',
      'Delivery Note': 'DEL',
      'Packing List': 'PKG',
      'Credit Note': 'CRN',
    }[type] || 'DOC';
    
    return `${prefix}-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  };

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: '', quantity: 1 }]);
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const updated = selectedProducts.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setSelectedProducts(updated);
  };

  const renderDocumentForm = (documentType: string) => {
    const isDeliveryNote = documentType === 'Delivery Note';
    const isPackingList = documentType === 'Packing List';
    const isFromQuotation = isDeliveryNote || documentType === 'Proforma Invoice';
    const isInvoice = documentType === 'New Invoice';
    const isQuotation = documentType === 'New Quotation';
    const isCredit = documentType === 'Credit Note';

    return (
      <div className="space-y-6 pb-4">
        {/* Customer Selection */}
        <div className="space-y-2">
          <Label htmlFor="customer">Customer *</Label>
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              {customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  <div className="space-y-1">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Document Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="issueDate">
              {isQuotation ? 'Quote Date' : isInvoice ? 'Invoice Date' : 'Issue Date'} *
            </Label>
            <Input
              id="issueDate"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">
              {isQuotation ? 'Valid Until' : isInvoice ? 'Due Date' : 'Valid Until'} *
            </Label>
            <Input
              id="dueDate"
              type="date"
              defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Reference Documents */}
        {isFromQuotation && (
          <div className="space-y-2">
            <Label htmlFor="quotation">Based on Quotation</Label>
            <Select value={selectedQuotation} onValueChange={setSelectedQuotation}>
              <SelectTrigger>
                <SelectValue placeholder="Select quotation (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Create new</SelectItem>
                {mockQuotations.map(quotation => (
                  <SelectItem key={quotation.id} value={quotation.id}>
                    <div className="space-y-1">
                      <div className="font-medium">{quotation.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {quotation.customer} - KES {quotation.amount.toLocaleString()}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {(isDeliveryNote || isPackingList || isCredit) && (
          <div className="space-y-2">
            <Label htmlFor="invoice">
              {isCredit ? 'Credit for Invoice' : 'Related Invoice'} *
            </Label>
            <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
              <SelectTrigger>
                <SelectValue placeholder="Select invoice" />
              </SelectTrigger>
              <SelectContent>
                {mockInvoices.map(invoice => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    <div className="space-y-1">
                      <div className="font-medium">{invoice.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {invoice.customer} - KES {invoice.amount.toLocaleString()}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Products Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Line Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={addProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {selectedProducts.length > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {selectedProducts.map((item, index) => {
                const product = mockProducts.find(p => p.id === item.productId);
                const lineTotal = product ? product.price * item.quantity : 0;

                return (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label className="text-sm">Product</Label>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateProduct(index, 'productId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                              {mockProducts.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  <div className="space-y-1">
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      KES {product.price.toLocaleString()} • {product.stock} in stock
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-sm">Quantity</Label>
                            <Input
                              type="number"
                              placeholder="1"
                              value={item.quantity}
                              onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                              min="1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Unit Price</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={product?.price || 0}
                              disabled
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Line Total</Label>
                            <Input
                              value={`KES ${lineTotal.toLocaleString()}`}
                              disabled
                              className="font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProduct(index)}
                        className="mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedProducts.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No products added yet</p>
              <Button type="button" variant="outline" onClick={addProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          )}
        </div>

        {/* Document Totals */}
        {selectedProducts.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <div className="bg-muted/20 rounded-lg p-4 space-y-2">
              {(() => {
                const subtotal = selectedProducts.reduce((sum, item) => {
                  const product = mockProducts.find(p => p.id === item.productId);
                  return sum + (product ? product.price * item.quantity : 0);
                }, 0);
                const vatAmount = subtotal * 0.16;
                const total = subtotal + vatAmount;

                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>KES {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>VAT (16%):</span>
                      <span>KES {vatAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>KES {total.toLocaleString()}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes & Comments</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or special instructions..."
              rows={3}
              className="resize-none"
            />
          </div>

          {isCredit && (
            <div className="space-y-2">
              <Label htmlFor="creditReason">Reason for Credit Note *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="return">Product Return</SelectItem>
                  <SelectItem value="discount">Additional Discount</SelectItem>
                  <SelectItem value="error">Billing Error</SelectItem>
                  <SelectItem value="damage">Damaged Goods</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpenDialog(null)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleCreateDocument(documentType)}
            disabled={isLoading || !selectedCustomer || selectedProducts.length === 0}
            className="w-full sm:w-auto"
          >
            Save as Draft
          </Button>
          <Button
            onClick={() => handleCreateDocument(documentType)}
            disabled={isLoading || !selectedCustomer || selectedProducts.length === 0}
            className="w-full sm:w-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create & Send {documentType.replace('New ', '')}
          </Button>
        </div>
      </div>
    );
  };

  const groupedActions = quickActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, QuickActionItem[]>);

  const categoryLabels = {
    documents: 'Documents & Reports',
    inventory: 'Inventory Management', 
    customers: 'Customer Management',
    financial: 'Financial Operations'
  };

  const categoryIcons = {
    documents: FileText,
    inventory: Package,
    customers: Users,
    financial: CreditCard
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Quickly create documents and perform common tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedActions).map(([category, actions]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            
            return (
              <div key={category}>
                <div className="flex items-center space-x-2 mb-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </h4>
                </div>
                
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {actions.map((action) => (
                    <div key={action.title}>
                      {action.dialog ? (
                        <Dialog open={openDialog === action.title} onOpenChange={(open) => setOpenDialog(open ? action.title : null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-auto p-4 flex flex-col items-start space-y-2 hover:bg-accent/5"
                              onClick={() => handleQuickAction(action)}
                            >
                              <div className="flex items-center space-x-2 w-full">
                                <action.icon className={`h-5 w-5 ${action.color}`} />
                                <span className="font-medium text-left">{action.title}</span>
                              </div>
                              <p className="text-xs text-muted-foreground text-left w-full">
                                {action.description}
                              </p>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] flex flex-col">
                            <DialogHeader className="flex-shrink-0">
                              <DialogTitle className="flex items-center space-x-2">
                                <action.icon className={`h-5 w-5 ${action.color}`} />
                                <span>{action.title}</span>
                              </DialogTitle>
                              <DialogDescription>
                                {action.description}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto p-1">
                              {renderDocumentForm(action.title)}
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-auto p-4 flex flex-col items-start space-y-2 hover:bg-accent/5"
                          onClick={() => handleQuickAction(action)}
                        >
                          <div className="flex items-center space-x-2 w-full">
                            <action.icon className={`h-5 w-5 ${action.color}`} />
                            <span className="font-medium text-left">{action.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground text-left w-full">
                            {action.description}
                          </p>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
