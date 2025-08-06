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
import TaxSettings from "./pages/TaxSettings";
import UserManagement from "./pages/UserManagement";
import Templates from "./pages/Templates";
import UnitsOfMeasure from "./pages/UnitsOfMeasure";
import PlaceholderPage from "./pages/PlaceholderPage";
import ProductDetails from "./pages/ProductDetails";
import NewProduct from "./pages/NewProduct";
import CustomerDetails from "./pages/CustomerDetails";
import NewCustomer from "./pages/NewCustomer";
import InvoiceDetails from "./pages/InvoiceDetails";
import NewInvoice from "./pages/NewInvoice";
import RecordPayment from "./pages/RecordPayment";
import QuotationDetails from "./pages/QuotationDetails";
import NewQuotation from "./pages/NewQuotation";

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
      <Route path="customers/:id" element={<CustomerDetails />} />
      <Route path="customers/new" element={<NewCustomer />} />
      <Route path="products" element={<Products />} />
      <Route path="products/:id" element={<ProductDetails />} />
      <Route path="products/new" element={<NewProduct />} />
      <Route path="quotations" element={<Quotations />} />
      <Route path="quotations/:id" element={<QuotationDetails />} />
      <Route path="quotations/new" element={<NewQuotation />} />
      <Route path="proforma" element={<ProformaInvoices />} />
      <Route path="proforma/:id" element={<PlaceholderPage module="Proforma Details" />} />
      <Route path="proforma/new" element={<PlaceholderPage module="New Proforma" />} />
      <Route path="invoices" element={<Invoices />} />
      <Route path="invoices/:id" element={<InvoiceDetails />} />
      <Route path="invoices/new" element={<NewInvoice />} />
      <Route path="payments" element={<Payments />} />
      <Route path="payments/new" element={<RecordPayment />} />
      <Route path="reports" element={<Reports />} />
      <Route path="reports/sales" element={<Reports />} />
      <Route path="reports/stock" element={<Reports />} />
      <Route path="reports/tax" element={<Reports />} />
      <Route path="settings" element={<Settings />} />
      <Route path="settings/taxes" element={<TaxSettings />} />
      <Route path="settings/users" element={<UserManagement />} />
      <Route path="templates" element={<Templates />} />
      <Route path="units" element={<UnitsOfMeasure />} />
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
