import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import {
  Building2,
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Receipt,
  CreditCard,
  RefreshCw,
  BarChart3,
  Settings,
  Palette,
  Menu,
  LogOut,
  User,
  Bell,
  ChevronDown,
} from "lucide-react";
import { cn } from "../lib/utils";

const MEDPLUS_LOGO_URL = "https://cdn.builder.io/api/v1/image/assets%2Fc5e390f959914debac74ff126a00850a%2Fa161c78db67e443e97c7bf8632216631?format=webp&width=800";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Products", href: "/products", icon: Package },
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "Proforma", href: "/proforma", icon: FileText },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Credit Notes", href: "/credit-notes", icon: RefreshCw },
  { name: "Statement", href: "/statement-of-account", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Templates", href: "/templates", icon: Palette },
  { name: "Settings", href: "/settings", icon: Settings },
];

function NavigationItems({ mobile = false }: { mobile?: boolean }) {
  const location = useLocation();

  return (
    <nav className={cn("space-y-1", mobile && "px-2")}>
      {navigation.map((item) => {
        const isActive = location.pathname.startsWith(item.href);
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
              mobile && "text-base px-4 py-3 mx-2",
            )}
          >
            <item.icon className={cn("mr-3 h-4 w-4", mobile && "h-5 w-5")} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col border-r bg-card">
          <div className="flex h-16 shrink-0 items-center px-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">BusinessERP</h1>
                <p className="text-xs text-muted-foreground">
                  Management System
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-4 px-6">
            <NavigationItems />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 flex flex-col">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex items-center space-x-3 mb-6 px-1">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">BusinessERP</h1>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NavigationItems mobile />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 flex flex-col">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex items-center space-x-3 mb-6 px-1">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">BusinessERP</h1>
                  <p className="text-xs text-muted-foreground">
                    Management System
                  </p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <NavigationItems mobile />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
                <span className="sr-only">View notifications</span>
              </Button>

              {/* Separator */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-3 text-sm"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {user?.role}
                      </Badge>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/settings")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/settings/company")}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Company Settings
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          (window.location.href = "/settings/users")
                        }
                      >
                        <User className="mr-2 h-4 w-4" />
                        Manage Users
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      if (confirm("Are you sure you want to sign out?")) {
                        logout();
                      }
                    }}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 py-4 sm:py-6 lg:py-8">
          <div className="px-4 sm:px-6 lg:px-8 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
