import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import QuickActions from "../components/QuickActions";
import {
  DollarSign,
  FileText,
  AlertTriangle,
  TrendingUp,
  Users,
  Package,
  Receipt,
  BarChart3,
  Plus,
  Eye,
  ArrowUpRight,
  TrendingDown,
  Activity,
  Truck,
  Clock,
  Star,
  Target,
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import ActivityLog from "../components/ActivityLog";
import { DashboardMetrics } from "@shared/types";
import { getDataService } from "../services/dataServiceFactory";
import { safeToLocaleDateString } from "@/lib/utils";

// Get business data service instance
const businessData = getDataService();

// Fallback data for when database is unavailable
const fallbackMetrics = {
  totalRevenue: 145230.5,
  outstandingInvoices: 23450.75,
  lowStockAlerts: 12,
  recentPayments: 8750.25,
  salesTrend: [
    { date: "2024-01-01", amount: 12500, orders: 45 },
    { date: "2024-01-02", amount: 15600, orders: 52 },
    { date: "2024-01-03", amount: 18200, orders: 64 },
    { date: "2024-01-04", amount: 16800, orders: 58 },
    { date: "2024-01-05", amount: 21400, orders: 73 },
    { date: "2024-01-06", amount: 19300, orders: 68 },
    { date: "2024-01-07", amount: 23200, orders: 81 },
  ],
  topProducts: [
    {
      id: "1",
      name: "Wireless Bluetooth Headphones",
      sales: 45600,
      quantity: 152,
      growth: 12.5,
      category: "Electronics",
      stock: 45,
    },
    {
      id: "2",
      name: "Ergonomic Office Chair",
      sales: 32400,
      quantity: 18,
      growth: -2.1,
      category: "Furniture",
      stock: 8,
    },
    {
      id: "3",
      name: "Laptop Stand Adjustable",
      sales: 28900,
      quantity: 89,
      growth: 8.7,
      category: "Accessories",
      stock: 23,
    },
    {
      id: "4",
      name: "Wireless Mouse",
      sales: 22100,
      quantity: 134,
      growth: 15.2,
      category: "Electronics",
      stock: 67,
    },
    {
      id: "5",
      name: "Desk Organizer",
      sales: 18600,
      quantity: 76,
      growth: 4.3,
      category: "Office Supplies",
      stock: 12,
    },
  ],
  recentActivities: [
    {
      id: "1",
      type: "invoice",
      description: "Invoice #INV-2024-001 created for Acme Corporation Ltd",
      timestamp: new Date(Date.now() - 15 * 60000),
      amount: 25600,
      status: "sent",
    },
    {
      id: "2",
      type: "payment",
      description: "Payment received from Tech Solutions Kenya",
      timestamp: new Date(Date.now() - 45 * 60000),
      amount: 15000,
      status: "completed",
    },
    {
      id: "3",
      type: "stock",
      description: "Stock level low for Wireless Bluetooth Headphones",
      timestamp: new Date(Date.now() - 75 * 60000),
      status: "warning",
    },
    {
      id: "4",
      type: "quote",
      description: "Quotation #QUO-2024-001 sent to Global Trading Co.",
      timestamp: new Date(Date.now() - 120 * 60000),
      amount: 42500,
      status: "sent",
    },
    {
      id: "5",
      type: "delivery",
      description: "Delivery completed for Invoice #INV-2024-002",
      timestamp: new Date(Date.now() - 180 * 60000),
      status: "completed",
    },
    {
      id: "6",
      type: "proforma",
      description: "Proforma Invoice #PRO-2024-001 created",
      timestamp: new Date(Date.now() - 240 * 60000),
      amount: 18750,
      status: "draft",
    },
  ],
  outstandingInvoicesList: [
    {
      id: "INV-2024-003",
      customer: "Acme Corporation Ltd",
      amount: 12500,
      dueDate: "2024-02-15",
      days: 5,
    },
    {
      id: "INV-2024-005",
      customer: "Tech Solutions Kenya",
      amount: 8750,
      dueDate: "2024-02-20",
      days: 10,
    },
    {
      id: "INV-2024-007",
      customer: "Global Trading Co.",
      amount: 2200.75,
      dueDate: "2024-02-25",
      days: 15,
    },
  ],
  lowStockItems: [
    {
      id: "1",
      name: "Ergonomic Office Chair",
      currentStock: 8,
      minStock: 15,
      category: "Furniture",
    },
    {
      id: "2",
      name: "Desk Organizer",
      currentStock: 12,
      minStock: 20,
      category: "Office Supplies",
    },
    {
      id: "3",
      name: "Laptop Stand Adjustable",
      currentStock: 23,
      minStock: 30,
      category: "Accessories",
    },
    {
      id: "4",
      name: "Wireless Bluetooth Headphones",
      currentStock: 45,
      minStock: 50,
      category: "Electronics",
    },
  ],
  recentPaymentsList: [
    {
      id: "PAY-001",
      customer: "Tech Solutions Kenya",
      amount: 15000,
      method: "MPESA",
      date: new Date(Date.now() - 30 * 60000),
    },
    {
      id: "PAY-002",
      customer: "Acme Corporation Ltd",
      amount: 25600,
      method: "Bank Transfer",
      date: new Date(Date.now() - 120 * 60000),
    },
    {
      id: "PAY-003",
      customer: "Global Trading Co.",
      amount: 8750,
      method: "Cash",
      date: new Date(Date.now() - 180 * 60000),
    },
  ],
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDrillDown, setSelectedDrillDown] = useState<string | null>(
    null,
  );
  const [liveMetrics, setLiveMetrics] = useState<DashboardMetrics | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Load metrics data
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const metrics = await businessData.getDashboardMetrics();
        setLiveMetrics(metrics);
        setIsSimulating(businessData.isSimulationRunning());
      } catch (error) {
        console.error("Failed to load dashboard metrics:", error);
        // Use fallback metrics when database is unavailable
        setLiveMetrics(fallbackMetrics);
      }
    };
    loadMetrics();
  }, []);

  // Refresh metrics periodically
  useEffect(() => {
    const refreshMetrics = async () => {
      try {
        const metrics = await businessData.getDashboardMetrics();
        setLiveMetrics(metrics);
        setIsSimulating(businessData.isSimulationRunning());
      } catch (error) {
        console.error("Failed to refresh dashboard metrics:", error);
      }
    };

    const refreshInterval = setInterval(refreshMetrics, 3000); // Refresh every 3 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  const toggleSimulation = () => {
    if (isSimulating) {
      businessData.stopSimulation();
    } else {
      businessData.startSimulation();
    }
    setIsSimulating(!isSimulating);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "invoice":
        return <FileText className="h-4 w-4" />;
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      case "stock":
        return <AlertTriangle className="h-4 w-4" />;
      case "quote":
        return <Receipt className="h-4 w-4" />;
      case "delivery":
        return <Truck className="h-4 w-4" />;
      case "proforma":
        return <FileText className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "invoice":
        return "text-blue-600";
      case "payment":
        return "text-green-600";
      case "stock":
        return "text-orange-600";
      case "quote":
        return "text-purple-600";
      case "delivery":
        return "text-cyan-600";
      case "proforma":
        return "text-indigo-600";
      default:
        return "text-gray-600";
    }
  };

  const handleDrillDown = (type: string) => {
    setSelectedDrillDown(type);
  };

  const renderDrillDownContent = () => {
    switch (selectedDrillDown) {
      case "revenue":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  KES 145,230.50
                </div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  KES 129,048.00
                </div>
                <div className="text-sm text-muted-foreground">Last Month</div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Daily Revenue Breakdown</h4>
              {fallbackMetrics.salesTrend.map((day, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <span className="text-sm">
                    {safeToLocaleDateString(day.date)}
                  </span>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(day.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {day.orders} orders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "outstanding":
        return (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fallbackMetrics.outstandingInvoicesList.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        {invoice.id}
                      </Button>
                    </TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.days <= 5
                            ? "destructive"
                            : invoice.days <= 10
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {invoice.days} days
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case "stock":
        return (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fallbackMetrics.lowStockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{item.currentStock}</Badge>
                    </TableCell>
                    <TableCell>{item.minStock}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/products/${item.id}`)}
                      >
                        Reorder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case "payments":
        return (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fallbackMetrics.recentPaymentsList.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        onClick={() => navigate(`/payments/${payment.id}`)}
                      >
                        {payment.id}
                      </Button>
                    </TableCell>
                    <TableCell>{payment.customer}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.method}</Badge>
                    </TableCell>
                    <TableCell>{payment.date.toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName}! Here's what's happening with your
            business today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isSimulating ? "destructive" : "default"}
            size="sm"
            onClick={toggleSimulation}
          >
            <Activity className="mr-2 h-4 w-4" />
            {isSimulating ? "Stop Simulation" : "Start Simulation"}
          </Button>
          <Button
            onClick={() => {
              const quickActionsElement = document.getElementById(
                "quick-actions-section",
              );
              if (quickActionsElement) {
                quickActionsElement.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Key Metrics - Now Clickable */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Dialog>
          <DialogTrigger asChild>
            <Card
              className="cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => handleDrillDown("revenue")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KES{" "}
                  {(
                    liveMetrics?.totalRevenue || fallbackMetrics.totalRevenue
                  ).toLocaleString()}
                  {isSimulating && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Live
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success font-medium">+12.5%</span> from
                  last month
                </p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revenue Breakdown</DialogTitle>
              <DialogDescription>
                Detailed revenue analysis for the current period
              </DialogDescription>
            </DialogHeader>
            {renderDrillDownContent()}
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Card
              className="cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => handleDrillDown("outstanding")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Outstanding Invoices
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KES{" "}
                  {(
                    liveMetrics?.outstandingInvoices ||
                    fallbackMetrics.outstandingInvoices
                  ).toLocaleString()}
                  {isSimulating && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Live
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-warning font-medium">-2.3%</span> from
                  last month
                </p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Outstanding Invoices</DialogTitle>
              <DialogDescription>
                All unpaid invoices requiring attention
              </DialogDescription>
            </DialogHeader>
            {renderDrillDownContent()}
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Card
              className="cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => handleDrillDown("stock")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Low Stock Alerts
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {liveMetrics?.lowStockAlerts || fallbackMetrics.lowStockAlerts}
                  {isSimulating && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Live
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-destructive font-medium">+3</span> from
                  yesterday
                </p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Low Stock Items</DialogTitle>
              <DialogDescription>
                Products that need to be restocked
              </DialogDescription>
            </DialogHeader>
            {renderDrillDownContent()}
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Card
              className="cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => handleDrillDown("payments")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Payments
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KES{" "}
                  {(
                    liveMetrics?.recentPayments || fallbackMetrics.recentPayments
                  ).toLocaleString()}
                  {isSimulating && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Live
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success font-medium">+8.2%</span> from
                  last week
                </p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Recent Payments</DialogTitle>
              <DialogDescription>
                Latest payments received from customers
              </DialogDescription>
            </DialogHeader>
            {renderDrillDownContent()}
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Actions */}
      <div id="quick-actions-section">
        <QuickActions />
      </div>

      {/* Enhanced Charts and Activities */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Enhanced Sales Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Your sales performance over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sales Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold">KES 127,800</div>
                  <div className="text-xs text-muted-foreground">
                    Total Sales
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">441</div>
                  <div className="text-xs text-muted-foreground">
                    Total Orders
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">KES 290</div>
                  <div className="text-xs text-muted-foreground">
                    Avg. Order
                  </div>
                </div>
              </div>

              {/* Daily Sales Chart */}
              <div className="space-y-2">
                {fallbackMetrics.salesTrend.map((day, index) => {
                  const maxAmount = Math.max(
                    ...fallbackMetrics.salesTrend.map((d) => d.amount),
                  );
                  const percentage = (day.amount / maxAmount) * 100;

                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-16 text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString("en", {
                          weekday: "short",
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="h-2 bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-24 text-right">
                            <div className="text-sm font-medium">
                              {formatCurrency(day.amount)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {day.orders} orders
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/reports")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Detailed Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Log */}
        <div className="col-span-3">
          <ActivityLog limit={8} showHeader={true} className="h-full" />
        </div>
      </div>

      {/* Enhanced Top Products with Drill-down */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Top Performing Products</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/products")}
            >
              <Eye className="mr-2 h-4 w-4" />
              View All
            </Button>
          </CardTitle>
          <CardDescription>
            Your best-selling products this month with detailed metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fallbackMetrics.topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-bold text-primary">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {product.category}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {product.quantity} sold
                      </Badge>
                      <Badge
                        variant={
                          product.stock <= 10 ? "destructive" : "secondary"
                        }
                        className="text-xs"
                      >
                        {product.stock} in stock
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(product.sales)}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div
                      className={`flex items-center ${product.growth >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {product.growth >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      <span className="text-xs font-medium">
                        {product.growth >= 0 ? "+" : ""}
                        {product.growth}%
                      </span>
                    </div>
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Performance Summary</h4>
                <p className="text-sm text-muted-foreground">
                  Top 5 products contributing to 68% of total sales
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {formatCurrency(
                    fallbackMetrics.topProducts.reduce(
                      (sum, p) => sum + p.sales,
                      0,
                    ),
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Combined Revenue
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
