import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  ExternalLink,
  ArrowLeft,
  BarChart3,
  Settings,
  User,
  Truck,
  Package,
  ShoppingCart,
} from "lucide-react";

interface ComingSoonItem {
  name: string;
  path: string;
  status: "placeholder" | "partial" | "complete";
  description: string;
  icon: React.ReactNode;
}

const comingSoonItems: ComingSoonItem[] = [
  {
    name: "Delivery Management",
    path: "/deliveries",
    status: "placeholder",
    description: "Track and manage product deliveries",
    icon: <Truck className="h-5 w-5" />,
  },
  {
    name: "Packing Lists",
    path: "/packing-lists",
    status: "placeholder",
    description: "Create and manage packing lists for shipments",
    icon: <Package className="h-5 w-5" />,
  },
  {
    name: "Purchase Orders",
    path: "/purchase-orders",
    status: "placeholder",
    description: "Manage supplier purchase orders",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    name: "Reports Charts",
    path: "/reports",
    status: "partial",
    description: "Sales and VAT trend charts (recharts integration)",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    name: "User Management (Settings)",
    path: "/settings",
    status: "partial",
    description: "Advanced user management features",
    icon: <User className="h-5 w-5" />,
  },
  {
    name: "System Settings",
    path: "/settings",
    status: "partial",
    description: "System-wide configuration settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export default function ComingSoonTest() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "placeholder":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
        );
      case "partial":
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Partial
          </Badge>
        );
      case "complete":
        return (
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const placeholderItems = comingSoonItems.filter(
    (item) => item.status === "placeholder",
  );
  const partialItems = comingSoonItems.filter(
    (item) => item.status === "partial",
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Coming Soon Features Test
          </h1>
          <p className="text-muted-foreground">
            Test and verify all "coming soon" pages and features are working
            correctly
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Placeholder Pages
            </CardTitle>
            <div className="text-2xl font-bold">{placeholderItems.length}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Full placeholder implementations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Partial Features
            </CardTitle>
            <div className="text-2xl font-bold">{partialItems.length}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Features with some "coming soon" sections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Features
            </CardTitle>
            <div className="text-2xl font-bold">{comingSoonItems.length}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              All tracked coming soon items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Placeholder Pages</CardTitle>
          <CardDescription>
            These pages use the PlaceholderPage component and show a "coming
            soon" message
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {placeholderItems.map((item, index) => (
              <Card key={item.name} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <CardTitle className="text-base">{item.name}</CardTitle>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                  <CardDescription className="text-sm">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild size="sm" className="w-full">
                    <Link to={item.path}>
                      Test Page
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Partial Features */}
      <Card>
        <CardHeader>
          <CardTitle>Partial Features</CardTitle>
          <CardDescription>
            These pages are functional but contain sections marked as "coming
            soon"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {partialItems.map((item, index) => (
              <Card key={index} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <CardTitle className="text-base">{item.name}</CardTitle>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                  <CardDescription className="text-sm">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Link to={item.path}>
                      View Page
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
          <CardDescription>
            Follow these steps to verify all coming soon features are working
            correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold mb-2">Placeholder Pages Testing</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Click on each "Test Page" button above</li>
                <li>
                  • Verify the placeholder page loads with correct module name
                </li>
                <li>• Check that the "Back to Dashboard" button works</li>
                <li>• Ensure the page shows proper "coming soon" messaging</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold mb-2">Partial Features Testing</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Visit the Reports page and check chart placeholders</li>
                <li>
                  • Go to Settings and verify the Users and System tabs show
                  "coming soon"
                </li>
                <li>
                  • Ensure functional parts of these pages still work correctly
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold mb-2">Expected Results</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • All placeholder pages should display with correct module
                  names
                </li>
                <li>• No broken links or 404 errors</li>
                <li>• Proper navigation and consistent UI</li>
                <li>• "Coming soon" messaging is clear and professional</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
