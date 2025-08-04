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
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Copy,
  ArrowRight,
} from 'lucide-react';
import { Quotation, Customer, Product } from '@shared/types';
import PDFService from '../services/pdfService';

// Mock data
const mockCustomers: Customer[] = [
  { id: '1', name: 'Acme Corporation Ltd', email: 'contact@acme.com', phone: '+254700123456', kraPin: 'P051234567A', address: '123 Business Ave, Nairobi', creditLimit: 500000, balance: 125000, isActive: true, companyId: '1', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Tech Solutions Kenya', email: 'info@techsolutions.co.ke', phone: '+254722987654', kraPin: 'P051234568B', address: '456 Innovation Hub, Nairobi', creditLimit: 300000, balance: 45000, isActive: true, companyId: '1', createdAt: new Date(), updatedAt: new Date() },
];

const mockProducts: Product[] = [
  { id: '1', name: 'Wireless Bluetooth Headphones', description: 'High-quality wireless headphones', sku: 'WBH-001', category: 'Electronics', unit: 'piece', purchasePrice: 3500, sellingPrice: 5500, minStock: 10, maxStock: 100, currentStock: 45, isActive: true, companyId: '1', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Office Chair Executive', description: 'Ergonomic office chair', sku: 'OFC-002', category: 'Furniture', unit: 'piece', purchasePrice: 12000, sellingPrice: 18000, minStock: 5, maxStock: 30, currentStock: 3, isActive: true, companyId: '1', createdAt: new Date(), updatedAt: new Date() },
];

const mockQuotations: Quotation[] = [
  {
    id: '1',
    quoteNumber: 'QUO-2024-001',
    customerId: '1',
    customer: mockCustomers[0],
    items: [
      { id: '1', productId: '1', product: mockProducts[0], quantity: 10, unitPrice: 5500, discount: 0, vatRate: 16, total: 55000 }
    ],
    subtotal: 55000,
    vatAmount: 8800,
    discountAmount: 0,
    total: 63800,
    status: 'sent',
    validUntil: new Date('2024-02-15'),
    issueDate: new Date('2024-01-15'),
    notes: 'Bulk order discount available',
    companyId: '1',
    createdBy: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    quoteNumber: 'QUO-2024-002',
    customerId: '2',
    customer: mockCustomers[1],
    items: [
      { id: '2', productId: '2', product: mockProducts[1], quantity: 5, unitPrice: 18000, discount: 5, vatRate: 16, total: 85500 }
    ],
    subtotal: 90000,
    vatAmount: 14400,
    discountAmount: 4500,
    total: 99900,
    status: 'accepted',
    validUntil: new Date('2024-02-20'),
    issueDate: new Date('2024-01-20'),
    notes: 'Installation included',
    companyId: '1',
    createdBy: '1',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: '3',
    quoteNumber: 'QUO-2024-003',
    customerId: '1',
    customer: mockCustomers[0],
    items: [
      { id: '3', productId: '1', product: mockProducts[0], quantity: 25, unitPrice: 5500, discount: 10, vatRate: 16, total: 123750 }
    ],
    subtotal: 137500,
    vatAmount: 22000,
    discountAmount: 13750,
    total: 145750,
    status: 'draft',
    validUntil: new Date('2024-02-25'),
    issueDate: new Date('2024-01-25'),
    notes: 'Volume discount applied',
    companyId: '1',
    createdBy: '1',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
];

export default function Quotations() {
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    
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
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'expired': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-3 w-3" />;
      case 'sent': return <Send className="h-3 w-3" />;
      case 'accepted': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      case 'expired': return <Clock className="h-3 w-3" />;
      default: return null;
    }
  };

  const isExpiringSoon = (validUntil: Date) => {
    const today = new Date();
    const diffDays = Math.ceil((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateDialogOpen(false);
  };

  const handleConvertToProforma = (quotationId: string) => {
    // Navigate to create proforma with pre-filled data
    console.log('Converting quotation to proforma:', quotationId);
  };

  const handleConvertToInvoice = (quotationId: string) => {
    // Navigate to create invoice with pre-filled data
    console.log('Converting quotation to invoice:', quotationId);
  };

  const handleDownloadPDF = (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId);
    if (quotation) {
      PDFService.generateQuotationPDF(quotation);
    }
  };

  const totalQuotations = quotations.length;
  const acceptedQuotations = quotations.filter(q => q.status === 'accepted').length;
  const pendingQuotations = quotations.filter(q => q.status === 'sent').length;
  const totalValue = quotations.reduce((sum, q) => sum + q.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground">
            Create and manage sales quotations with conversion tracking
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Quotation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Create New Quotation</DialogTitle>
              <DialogDescription>
                Generate a new sales quotation for your customer
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateQuotation} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until *</Label>
                  <Input id="validUntil" type="date" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes or terms" />
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
                        {mockProducts.map(product => (
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
                  Create Quotation
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
            <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuotations}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">+3</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{acceptedQuotations}</div>
            <p className="text-xs text-muted-foreground">
              {totalQuotations > 0 ? Math.round((acceptedQuotations / totalQuotations) * 100) : 0}% acceptance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Response</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingQuotations}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting customer response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Combined quotation value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Quotation Management</CardTitle>
          <CardDescription>
            Track and manage your sales quotations with conversion pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quotations..."
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
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export</Button>
          </div>

          {/* Quotations Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell>
                      <div className="font-medium">{quotation.quoteNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {quotation.items.length} item(s)
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {quotation.customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{quotation.customer.name}</div>
                          <div className="text-sm text-muted-foreground">{quotation.customer.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{quotation.issueDate.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className={`text-sm ${isExpiringSoon(quotation.validUntil) ? 'text-warning font-medium' : ''}`}>
                        {quotation.validUntil.toLocaleDateString()}
                      </div>
                      {isExpiringSoon(quotation.validUntil) && (
                        <div className="text-xs text-warning">Expires soon!</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(quotation.total)}</div>
                      {quotation.discountAmount > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Discount: {formatCurrency(quotation.discountAmount)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(quotation.status)} className="capitalize">
                        {getStatusIcon(quotation.status)}
                        <span className="ml-1">{quotation.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {quotation.status === 'accepted' && (
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleConvertToProforma(quotation.id)}
                            className="text-xs"
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Proforma
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleConvertToInvoice(quotation.id)}
                            className="text-xs"
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Invoice
                          </Button>
                        </div>
                      )}
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
                            Edit Quotation
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" />
                            Send to Customer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredQuotations.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No quotations found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search terms or filters.' 
                  : 'Get started by creating your first quotation.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
