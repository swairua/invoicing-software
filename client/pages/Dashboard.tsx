import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import QuickActions from '../components/QuickActions';
import {
  DollarSign,
  FileText,
  AlertTriangle,
  TrendingUp,
  Users,
  Package,
  Receipt,
  BarChart3,
  Plus
} from 'lucide-react';
import { useAuth } from '../hooks/use-auth';

// Mock data for demonstration
const mockMetrics = {
  totalRevenue: 145230.50,
  outstandingInvoices: 23450.75,
  lowStockAlerts: 12,
  recentPayments: 8750.25,
  salesTrend: [
    { date: '2024-01-01', amount: 12500 },
    { date: '2024-01-02', amount: 15600 },
    { date: '2024-01-03', amount: 18200 },
    { date: '2024-01-04', amount: 16800 },
    { date: '2024-01-05', amount: 21400 },
    { date: '2024-01-06', amount: 19300 },
    { date: '2024-01-07', amount: 23200 },
  ],
  topProducts: [
    { name: 'Product A', sales: 45600 },
    { name: 'Product B', sales: 32400 },
    { name: 'Product C', sales: 28900 },
  ],
  recentActivities: [
    { id: '1', type: 'invoice', description: 'Invoice #INV-001 created for Customer ABC', timestamp: new Date() },
    { id: '2', type: 'payment', description: 'Payment received from Customer XYZ - KES 15,000', timestamp: new Date() },
    { id: '3', type: 'stock', description: 'Stock level low for Product A', timestamp: new Date() },
    { id: '4', type: 'quote', description: 'Quotation #QUO-001 sent to Customer DEF', timestamp: new Date() },
  ]
};

const quickActions = [
  { title: 'New Invoice', icon: FileText, href: '/invoices/new', color: 'bg-blue-500' },
  { title: 'New Customer', icon: Users, href: '/customers/new', color: 'bg-green-500' },
  { title: 'New Product', icon: Package, href: '/products/new', color: 'bg-purple-500' },
  { title: 'Record Payment', icon: Receipt, href: '/payments/new', color: 'bg-orange-500' },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName}! Here's what's happening with your business today.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Quick Actions
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {mockMetrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {mockMetrics.outstandingInvoices.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-warning font-medium">-2.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.lowStockAlerts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive font-medium">+3</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {mockMetrics.recentPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">+8.2%</span> from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts and Activities */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Your sales performance over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Sales Chart</p>
                <p className="text-sm">Integration with recharts coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest activities in your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMetrics.recentActivities.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Activities
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
          <CardDescription>
            Your best-selling products this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {mockMetrics.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">Sales this month</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">KES {product.sales.toLocaleString()}</p>
                  <Badge variant="outline">#{index + 1}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
