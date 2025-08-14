import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { ErrorBoundary } from "./components/ErrorBoundary";
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
import CompanySettings from "./pages/CompanySettings";
import UserManagement from "./pages/UserManagement";
import Templates from "./pages/Templates";
import UnitsOfMeasure from "./pages/UnitsOfMeasure";
import PlaceholderPage from "./pages/PlaceholderPage";
import ComingSoonTest from "./pages/ComingSoonTest";
import ProductDetails from "./pages/ProductDetails";
import NewProduct from "./pages/NewProduct";
import CustomerDetails from "./pages/CustomerDetails";
import NewCustomer from "./pages/NewCustomer";
import InvoiceDetails from "./pages/InvoiceDetails";
import NewInvoice from "./pages/NewInvoice";
import RecordPayment from "./pages/RecordPayment";
import CreditNotes from "./pages/CreditNotes";
import CreditNoteDetails from "./pages/CreditNoteDetails";
import NewCreditNote from "./pages/NewCreditNote";
import QuotationDetails from "./pages/QuotationDetails";
import NewQuotation from "./pages/NewQuotation";
import ProformaDetails from "./pages/ProformaDetails";
import NewProforma from "./pages/NewProforma";
import StatementOfAccount from "./pages/StatementOfAccount";

const queryClient = new QueryClient();

// Suppress ResizeObserver loop errors - these are benign and don't affect functionality
const resizeObserverErrorSuppressionScript = () => {
  // Store the original console.error
  const originalConsoleError = console.error;

  // Override console.error to filter out ResizeObserver errors
  console.error = (...args) => {
    // Check if it's a ResizeObserver loop error
    if (
      args[0] &&
      typeof args[0] === "string" &&
      args[0].includes(
        "ResizeObserver loop completed with undelivered notifications",
      )
    ) {
      // Suppress this specific error as it's benign
      return;
    }
    // Call the original console.error for all other errors
    originalConsoleError.apply(console, args);
  };

  // Also handle window error events for ResizeObserver
  window.addEventListener("error", (event) => {
    if (
      event.message &&
      event.message.includes(
        "ResizeObserver loop completed with undelivered notifications",
      )
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  });
};

// Apply the error suppression
resizeObserverErrorSuppressionScript();

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
    <Route
      path="/login"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />

    {/* Protected Routes */}
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="customers" element={<Customers />} />
      <Route path="customers/:id" element={<CustomerDetails />} />
      <Route path="customers/:id/edit" element={<NewCustomer />} />
      <Route path="customers/new" element={<NewCustomer />} />
      <Route path="products" element={<Products />} />
      <Route path="products/:id" element={<ProductDetails />} />
      <Route path="products/:id/edit" element={<NewProduct />} />
      <Route path="products/new" element={<NewProduct />} />
      <Route path="quotations" element={<Quotations />} />
      <Route path="quotations/:id" element={<QuotationDetails />} />
      <Route path="quotations/new" element={<NewQuotation />} />
      <Route path="proforma" element={<ProformaInvoices />} />
      <Route path="proforma/:id" element={<ProformaDetails />} />
      <Route path="proforma/new" element={<NewProforma />} />
      <Route path="invoices" element={<Invoices />} />
      <Route path="invoices/:id" element={<InvoiceDetails />} />
      <Route path="invoices/new" element={<NewInvoice />} />
      <Route path="payments" element={<Payments />} />
      <Route path="payments/new" element={<RecordPayment />} />
      <Route path="credit-notes" element={<CreditNotes />} />
      <Route path="credit-notes/:id" element={<CreditNoteDetails />} />
      <Route path="credit-notes/new" element={<NewCreditNote />} />
      <Route path="statement-of-account" element={<StatementOfAccount />} />
      <Route path="reports" element={<Reports />} />
      <Route path="reports/sales" element={<Reports />} />
      <Route path="reports/stock" element={<Reports />} />
      <Route path="reports/tax" element={<Reports />} />
      <Route path="settings" element={<Settings />} />
      <Route path="settings/company" element={<CompanySettings />} />
      <Route path="settings/taxes" element={<TaxSettings />} />
      <Route path="settings/users" element={<UserManagement />} />
      <Route path="templates" element={<Templates />} />
      <Route path="units" element={<UnitsOfMeasure />} />
      <Route path="coming-soon-test" element={<ComingSoonTest />} />
      <Route
        path="deliveries"
        element={<PlaceholderPage module="Delivery Management" />}
      />
      <Route
        path="packing-lists"
        element={<PlaceholderPage module="Packing Lists" />}
      />
      <Route
        path="purchase-orders"
        element={<PlaceholderPage module="Purchase Orders" />}
      />
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
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

// Get the root element
const container = document.getElementById("root")!;

// Create or get existing root
const root = (container as any)._reactRoot || createRoot(container);
if (!(container as any)._reactRoot) {
  (container as any)._reactRoot = root;
}

// Render the app
root.render(<App />);
