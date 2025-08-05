import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Quotations from "./pages/Quotations";
import Invoices from "./pages/Invoices";
import ProformaInvoices from "./pages/ProformaInvoices";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Templates from "./pages/Templates";
import PlaceholderPage from "./pages/PlaceholderPage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/login" element={
      <PublicRoute>
        <Login />
      </PublicRoute>
    } />
    
    {/* Protected Routes */}
    <Route path="/" element={
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    }>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="customers" element={<Customers />} />
      <Route path="customers/:id" element={<PlaceholderPage module="Customer Details" />} />
      <Route path="customers/new" element={<PlaceholderPage module="New Customer" />} />
      <Route path="products" element={<Products />} />
      <Route path="products/:id" element={<PlaceholderPage module="Product Details" />} />
      <Route path="products/new" element={<PlaceholderPage module="New Product" />} />
      <Route path="quotations" element={<Quotations />} />
      <Route path="quotations/:id" element={<PlaceholderPage module="Quotation Details" />} />
      <Route path="quotations/new" element={<PlaceholderPage module="New Quotation" />} />
      <Route path="proforma" element={<ProformaInvoices />} />
      <Route path="proforma/:id" element={<PlaceholderPage module="Proforma Details" />} />
      <Route path="proforma/new" element={<PlaceholderPage module="New Proforma" />} />
      <Route path="invoices" element={<Invoices />} />
      <Route path="invoices/:id" element={<PlaceholderPage module="Invoice Details" />} />
      <Route path="invoices/new" element={<PlaceholderPage module="New Invoice" />} />
      <Route path="payments" element={<Payments />} />
      <Route path="payments/new" element={<PlaceholderPage module="Record Payment" />} />
      <Route path="reports" element={<Reports />} />
      <Route path="reports/sales" element={<Reports />} />
      <Route path="reports/stock" element={<Reports />} />
      <Route path="reports/tax" element={<Reports />} />
      <Route path="settings" element={<Settings />} />
    </Route>
    
    {/* Catch-all redirect */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
