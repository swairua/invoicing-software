import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import jsPDF from 'jspdf';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  Download,
  FileText,
  DollarSign,
  Users,
  Package,
  Calendar,
  Filter,
  RefreshCw,
  PieChart,
  LineChart,
} from 'lucide-react';

// Mock data for reports
const mockSalesData = {
  totalSales: 450000,
  totalInvoices: 45,
  averageInvoiceValue: 10000,
  topProducts: [
    { name: 'Wireless Bluetooth Headphones', quantity: 120, revenue: 660000 },
    { name: 'Office Chair Executive', quantity: 15, revenue: 270000 },
    { name: 'A4 Copy Paper', quantity: 500, revenue: 325000 },
  ],
  topCustomers: [
    { name: 'Acme Corporation Ltd', invoiceCount: 12, totalAmount: 180000 },
    { name: 'Tech Solutions Kenya', invoiceCount: 8, totalAmount: 145000 },
    { name: 'Global Trading Co.', invoiceCount: 6, totalAmount: 95000 },
  ],
  monthlySales: [
    { month: 'Jan', amount: 85000 },
    { month: 'Feb', amount: 92000 },
    { month: 'Mar', amount: 78000 },
    { month: 'Apr', amount: 105000 },
    { month: 'May', amount: 118000 },
    { month: 'Jun', amount: 132000 },
  ]
};

const mockAgedReceivables = [
  { customerName: 'Acme Corporation Ltd', current: 25000, days30: 15000, days60: 5000, days90: 0, over90: 0, total: 45000 },
  { customerName: 'Tech Solutions Kenya', current: 35000, days30: 0, days60: 0, days90: 8000, over90: 2000, total: 45000 },
  { customerName: 'Global Trading Co.', current: 0, days30: 0, days60: 0, days90: 0, over90: 0, total: 0 },
  { customerName: 'Local Retail Store', current: 0, days30: 12000, days60: 15000, days90: 8000, over90: 5000, total: 40000 },
];

const mockStockReport = {
  lowStockProducts: [
    { name: 'Office Chair Executive', currentStock: 3, minStock: 5, category: 'Furniture' },
    { name: 'Laptop Stand Adjustable', currentStock: 0, minStock: 15, category: 'Electronics' },
  ],
  overstockProducts: [
    { name: 'A4 Copy Paper', currentStock: 235, maxStock: 200, category: 'Stationery' },
  ],
  totalStockValue: 890000,
  categoryBreakdown: [
    { category: 'Electronics', value: 450000, percentage: 51 },
    { category: 'Furniture', value: 315000, percentage: 35 },
    { category: 'Stationery', value: 125000, percentage: 14 },
  ]
};

const mockTaxReport = {
  totalVATCollected: 72000,
  totalVATRate: 16,
  vatByMonth: [
    { month: 'Jan', vat: 13600 },
    { month: 'Feb', vat: 14720 },
    { month: 'Mar', vat: 12480 },
    { month: 'Apr', vat: 16800 },
    { month: 'May', vat: 18880 },
    { month: 'Jun', vat: 21120 },
  ],
  etimsSubmissions: {
    accepted: 38,
    pending: 5,
    rejected: 2,
  }
};

export default function Reports() {
  const [dateRange, setDateRange] = useState('last_30_days');
  const [isGenerating, setIsGenerating] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleGenerateReport = async (reportType: string) => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    console.log(`Generating ${reportType} report...`);
  };

  const handleExportReport = (reportType: string, format: string) => {
    console.log(`Exporting ${reportType} as ${format}...`);

    if (format === 'pdf') {
      // Generate report PDF
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(`${reportType.toUpperCase()} REPORT`, 20, 30);

      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);
      doc.text(`Report Period: ${dateRange.replace('_', ' ')}`, 20, 60);

      // Add report content based on type
      switch (reportType) {
        case 'sales':
          doc.text('Sales Summary:', 20, 80);
          doc.text(`Total Sales: KES ${mockSalesData.totalSales.toLocaleString()}`, 20, 95);
          doc.text(`Total Invoices: ${mockSalesData.totalInvoices}`, 20, 105);
          doc.text(`Average Invoice: KES ${mockSalesData.averageInvoiceValue.toLocaleString()}`, 20, 115);
          break;
        case 'receivables':
          doc.text('Aged Receivables Summary:', 20, 80);
          let yPos = 95;
          mockAgedReceivables.forEach(customer => {
            doc.text(`${customer.customerName}: KES ${customer.total.toLocaleString()}`, 20, yPos);
            yPos += 10;
          });
          break;
        case 'inventory':
          doc.text('Inventory Summary:', 20, 80);
          doc.text(`Total Stock Value: KES ${mockStockReport.totalStockValue.toLocaleString()}`, 20, 95);
          doc.text(`Low Stock Items: ${mockStockReport.lowStockProducts.length}`, 20, 105);
          doc.text(`Overstock Items: ${mockStockReport.overstockProducts.length}`, 20, 115);
          break;
        case 'tax':
          doc.text('Tax Summary:', 20, 80);
          doc.text(`Total VAT Collected: KES ${mockTaxReport.totalVATCollected.toLocaleString()}`, 20, 95);
          doc.text(`ETIMS Accepted: ${mockTaxReport.etimsSubmissions.accepted}`, 20, 105);
          doc.text(`ETIMS Pending: ${mockTaxReport.etimsSubmissions.pending}`, 20, 115);
          break;
      }

      doc.save(`${reportType}-report.pdf`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive business insights and financial reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 days</SelectItem>
              <SelectItem value="last_30_days">Last 30 days</SelectItem>
              <SelectItem value="last_3_months">Last 3 months</SelectItem>
              <SelectItem value="last_6_months">Last 6 months</SelectItem>
              <SelectItem value="last_year">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="receivables">Receivables</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="tax">Tax Reports</TabsTrigger>
        </TabsList>

        {/* Sales Reports */}
        <TabsContent value="sales" className="space-y-6">
          {/* Sales Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mockSalesData.totalSales)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success font-medium">+12.5%</span> from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockSalesData.totalInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success font-medium">+8</span> from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Invoice Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mockSalesData.averageInvoiceValue)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success font-medium">+5.2%</span> from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales Growth</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">+12.5%</div>
                <p className="text-xs text-muted-foreground">
                  Compared to last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sales Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Monthly sales performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <div className="text-center text-muted-foreground">
                  <LineChart className="h-12 w-12 mx-auto mb-2" />
                  <p>Sales Trend Chart</p>
                  <p className="text-sm">Integration with recharts coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Products and Customers */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best performing products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSalesData.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {product.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(product.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Highest value customers by total amount</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSalesData.topCustomers.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.invoiceCount} invoices</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(customer.totalAmount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Export Sales Report</CardTitle>
              <CardDescription>Generate and download detailed sales reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleExportReport('sales', 'pdf')}
                  disabled={isGenerating}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleExportReport('sales', 'excel')}
                  disabled={isGenerating}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleGenerateReport('sales')}
                  disabled={isGenerating}
                >
                  {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aged Receivables */}
        <TabsContent value="receivables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aged Receivables Analysis</CardTitle>
              <CardDescription>Track outstanding customer balances by aging periods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>1-30 Days</TableHead>
                      <TableHead>31-60 Days</TableHead>
                      <TableHead>61-90 Days</TableHead>
                      <TableHead>90+ Days</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAgedReceivables.map((customer, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{customer.customerName}</TableCell>
                        <TableCell>{formatCurrency(customer.current)}</TableCell>
                        <TableCell className={customer.days30 > 0 ? 'text-warning' : ''}>
                          {formatCurrency(customer.days30)}
                        </TableCell>
                        <TableCell className={customer.days60 > 0 ? 'text-warning' : ''}>
                          {formatCurrency(customer.days60)}
                        </TableCell>
                        <TableCell className={customer.days90 > 0 ? 'text-destructive' : ''}>
                          {formatCurrency(customer.days90)}
                        </TableCell>
                        <TableCell className={customer.over90 > 0 ? 'text-destructive font-bold' : ''}>
                          {formatCurrency(customer.over90)}
                        </TableCell>
                        <TableCell className="font-bold">{formatCurrency(customer.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Receivables Report</CardTitle>
              <CardDescription>Generate customer statement and receivables reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button onClick={() => handleExportReport('receivables', 'pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  Customer Statements
                </Button>
                <Button variant="outline" onClick={() => handleExportReport('receivables', 'excel')}>
                  <Download className="mr-2 h-4 w-4" />
                  Aged Receivables
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Reports */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Stock Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mockStockReport.totalStockValue)}</div>
                <p className="text-xs text-muted-foreground">
                  Current inventory value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{mockStockReport.lowStockProducts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Need restocking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overstock Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-info">{mockStockReport.overstockProducts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Above maximum levels
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStockReport.categoryBreakdown.length}</div>
                <p className="text-xs text-muted-foreground">
                  Product categories
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stock Issues */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alert</CardTitle>
                <CardDescription>Products below minimum stock levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStockReport.lowStockProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-warning font-bold">{product.currentStock} / {product.minStock}</p>
                        <p className="text-xs text-muted-foreground">Current / Min</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Stock value distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStockReport.categoryBreakdown.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-sm font-medium">{category.percentage}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(category.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Export Inventory Reports</CardTitle>
              <CardDescription>Generate detailed inventory and stock movement reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button onClick={() => handleExportReport('inventory', 'pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  Stock Report
                </Button>
                <Button variant="outline" onClick={() => handleExportReport('inventory', 'excel')}>
                  <Download className="mr-2 h-4 w-4" />
                  Stock Movement
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Reports */}
        <TabsContent value="tax" className="space-y-6">
          {/* VAT Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total VAT Collected</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mockTaxReport.totalVATCollected)}</div>
                <p className="text-xs text-muted-foreground">
                  At {mockTaxReport.totalVATRate}% rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ETIMS Accepted</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{mockTaxReport.etimsSubmissions.accepted}</div>
                <p className="text-xs text-muted-foreground">
                  Successful submissions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ETIMS Pending</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{mockTaxReport.etimsSubmissions.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting submission
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ETIMS Rejected</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{mockTaxReport.etimsSubmissions.rejected}</div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* VAT Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>VAT Collection Trend</CardTitle>
              <CardDescription>Monthly VAT collection over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>VAT Collection Chart</p>
                  <p className="text-sm">Integration with recharts coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Tax Reports</CardTitle>
              <CardDescription>Generate VAT returns and ETIMS compliance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button onClick={() => handleExportReport('tax', 'pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  VAT Return
                </Button>
                <Button variant="outline" onClick={() => handleExportReport('tax', 'excel')}>
                  <Download className="mr-2 h-4 w-4" />
                  ETIMS Report
                </Button>
                <Button variant="outline" onClick={() => handleExportReport('tax', 'pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  Tax Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
