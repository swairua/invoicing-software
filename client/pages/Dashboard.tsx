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

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDrillDown, setSelectedDrillDown] = useState<string | null>(
    null,
  );
  const [liveMetrics, setLiveMetrics] = useState<DashboardMetrics | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isCreatingSampleData, setIsCreatingSampleData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load metrics data
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const metrics = await businessData.getDashboardMetrics();
        setLiveMetrics(metrics);
        setIsSimulating(businessData.isSimulationRunning());
        setError(null);
      } catch (error) {
        console.error("Failed to load dashboard metrics:", error);
        setError("Failed to load dashboard data. Please check database connection.");
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
        setError(null);
      } catch (error) {
        console.error("Failed to refresh dashboard metrics:", error);
        setError("Failed to refresh dashboard data. Please check database connection.");
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

  const createSampleData = async () => {
    setIsCreatingSampleData(true);
    try {
      console.log("🚀 Creating sample data...");
      await businessData.createSampleData();
      console.log("✅ Sample data created successfully!");

      // Refresh the metrics to show the new data
      const metrics = await businessData.getDashboardMetrics();
      setLiveMetrics(metrics);

      alert("Sample data created successfully! Check the Customers and Products pages to see the new records.");
    } catch (error) {
      console.error("❌ Failed to create sample data:", error);
      alert("Failed to create sample data. Please check the console for details.");
    } finally {
      setIsCreatingSampleData(false);
    }
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    // Safely convert to number, defaulting to 0 if invalid
    const numericAmount = typeof amount === 'number' ? amount :
                         typeof amount === 'string' ? parseFloat(amount) || 0 : 0;

    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(numericAmount);
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
    if (!liveMetrics) {
      return <div className="text-center py-4">No data available</div>;
    }

    switch (selectedDrillDown) {
      case "revenue":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(liveMetrics.totalRevenue)}
                </div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {formatCurrency(liveMetrics.totalRevenue * 0.85)}
                </div>
                <div className="text-sm text-muted-foreground">Last Month</div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Daily Revenue Breakdown</h4>
              {liveMetrics.salesTrend?.map((day, index) => (
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
              )) || <div>No sales trend data available</div>}
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
                {liveMetrics.outstandingInvoicesList?.map((invoice) => (
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
                )) || (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No outstanding invoices
                    </TableCell>
                  </TableRow>
                )}
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
                {liveMetrics.lowStockItems?.map((item) => (
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
                )) || (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No low stock items
                    </TableCell>
                  </TableRow>
                )}
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
                {liveMetrics.recentPaymentsList?.map((payment) => (
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
                    <TableCell>
                      {safeToLocaleDateString(payment.date)}
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No recent payments
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        );

      default:
        return null;
    }
  };

  // Show error state if database connection fails
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.firstName}!
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <h3 className="text-lg font-semibold">Database Connection Error</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Retry Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while data is being fetched
  if (!liveMetrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Loading dashboard data...
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">---</div>
                <p className="text-xs text-muted-foreground">
                  Loading data...
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
            variant="outline"
            size="sm"
            onClick={createSampleData}
            disabled={isCreatingSampleData}
          >
            <Package className="mr-2 h-4 w-4" />
            {isCreatingSampleData ? "Creating..." : "Create Sample Data"}
          </Button>
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
                  {formatCurrency(liveMetrics.totalRevenue)}
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
                  {formatCurrency(liveMetrics.outstandingInvoices)}
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
                  {liveMetrics.lowStockAlerts}
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
                  {formatCurrency(liveMetrics.recentPayments)}
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
                  <div className="text-lg font-bold">
                    {formatCurrency(
                      liveMetrics.salesTrend?.reduce((sum, d) => sum + (Number(d.amount) || 0), 0) || 0
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Sales
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {liveMetrics.salesTrend?.reduce((sum, d) => sum + (Number(d.orders) || 0), 0) || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Orders
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {formatCurrency(
                      liveMetrics.salesTrend?.length > 0
                        ? liveMetrics.salesTrend.reduce((sum, d) => sum + (Number(d.amount) || 0), 0) /
                          liveMetrics.salesTrend.reduce((sum, d) => sum + (Number(d.orders) || 0), 0)
                        : 0
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg. Order
                  </div>
                </div>
              </div>

              {/* Daily Sales Chart */}
              <div className="space-y-2">
                {liveMetrics.salesTrend?.map((day, index) => {
                  const maxAmount = Math.max(
                    ...liveMetrics.salesTrend!.map((d) => Number(d.amount) || 0),
                  );
                  const percentage = maxAmount > 0 ? (Number(day.amount) || 0) / maxAmount * 100 : 0;

                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-16 text-xs text-muted-foreground">
                        {safeToLocaleDateString(day.date, "en", {
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
                              {Number(day.orders) || 0} orders
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }) || <div className="text-center py-4">No sales trend data available</div>}
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
            {liveMetrics.topProducts?.map((product, index) => (
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
                        {Number(product.quantity) || 0} sold
                      </Badge>
                      <Badge
                        variant={
                          (Number(product.stock) || 0) <= 10 ? "destructive" : "secondary"
                        }
                        className="text-xs"
                      >
                        {Number(product.stock) || 0} in stock
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(product.sales)}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div
                      className={`flex items-center ${(Number(product.growth) || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {(Number(product.growth) || 0) >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      <span className="text-xs font-medium">
                        {(Number(product.growth) || 0) >= 0 ? "+" : ""}
                        {Number(product.growth) || 0}%
                      </span>
                    </div>
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                No product data available
              </div>
            )}
          </div>

          {liveMetrics.topProducts && liveMetrics.topProducts.length > 0 && (
            <div className="mt-6 p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Performance Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    Top {liveMetrics.topProducts.length} products contributing to total sales
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {formatCurrency(
                      liveMetrics.topProducts.reduce(
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
