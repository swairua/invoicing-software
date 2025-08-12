import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import {
  CalendarIcon,
  Download,
  Filter,
  Search,
  FileText,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  CreditCard,
} from "lucide-react";
import { getDataService } from "../services/dataServiceFactory";
import { Customer, Invoice, Payment } from "@shared/types";
import { CompanySettings, defaultCompanySettings } from "@shared/company";

const dataService = getDataService();

interface StatementFilter {
  customerId: string;
  startDate: string;
  endDate: string;
  status: string;
  aging: string;
}

interface StatementEntry {
  id: string;
  date: string;
  type: "invoice" | "payment";
  description: string;
  reference: string;
  debit: number; // Invoice amounts
  credit: number; // Payment amounts
  balance: number;
  status?: "paid" | "overdue" | "current";
  invoiceData?: Invoice;
  paymentData?: Payment;
}

interface AgingData {
  "0-30": number;
  "30-60": number;
  "60-90": number;
  "90-above": number;
}

export default function StatementOfAccount() {
  const [statementEntries, setStatementEntries] = useState<StatementEntry[]>(
    [],
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companySettings] = useState<CompanySettings>(defaultCompanySettings);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatementFilter>({
    customerId: "",
    startDate: "",
    endDate: "",
    status: "all",
    aging: "all",
  });

  // Company information from settings
  const companyInfo = {
    name: companySettings?.name || "Your Company Name",
    address: companySettings?.address?.line1 || "Your Company Address",
    street: companySettings?.address?.line2 || "",
    phone: companySettings?.contact?.phone?.join(", ") || "Your Phone Number",
    email: companySettings?.contact?.email || "your-email@company.com",
    website: companySettings?.contact?.website || "www.yourcompany.com",
    pin: companySettings?.tax?.kraPin || "Your PIN Number",
    logo: "/placeholder.svg",
  };

  const bankingDetails = {
    bankName: "ABSA BANK KENYA PLC",
    accountName: "MEDPLUS AFRICA LIMITED",
    branch: "RONGAI",
    accountNo: "2047138798",
    bankCode: "03",
    branchCode: "52",
  };

  useEffect(() => {
    loadInitialData();
    loadCompanyLogo();
  }, []);

  useEffect(() => {
    if (filter.customerId && invoices.length > 0) {
      generateStatementData();
    }
  }, [filter, invoices, payments]);

  const loadCompanyLogo = async () => {
    try {
      // Use logo from company settings, or fallback to the Medplus Africa logo
      const logoUrl =
        companySettings?.branding?.logo ||
        "https://cdn.builder.io/api/v1/image/assets%2Fc5e390f959914debac74ff126a00850a%2Fa161c78db67e443e97c7bf8632216631?format=webp&width=800";
      setLogoUrl(logoUrl);
    } catch (error) {
      console.warn("Could not load company logo:", error);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all necessary data
      const [customersData, invoicesData, paymentsData] = await Promise.all([
        dataService.getCustomers(),
        dataService.getInvoices(),
        dataService.getPayments?.(),
      ]);

      setCustomers(customersData || []);
      setInvoices(invoicesData || []);
      setPayments(paymentsData || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const generateStatementData = () => {
    try {
      // Filter invoices and payments for selected customer
      const customerInvoices = invoices.filter(
        (inv) => inv.customerId === filter.customerId,
      );
      const customerPayments = payments.filter((p) => {
        // Check if payment has customerId or if it's linked to an invoice for this customer
        return (
          p.customerId === filter.customerId ||
          customerInvoices.some((inv) => inv.id === p.invoiceId)
        );
      });

      // Helper function to safely format dates
      const formatDate = (date: any): string => {
        if (!date) return new Date().toISOString().split("T")[0];

        if (date instanceof Date) {
          return date.toISOString().split("T")[0];
        }

        if (typeof date === "string") {
          try {
            return new Date(date).toISOString().split("T")[0];
          } catch {
            return new Date().toISOString().split("T")[0];
          }
        }

        return new Date().toISOString().split("T")[0];
      };

      // Create statement entries array with both invoices and payments
      const entries: StatementEntry[] = [];

      // Add invoice entries (debits)
      customerInvoices.forEach((invoice) => {
        let status: "paid" | "overdue" | "current" = "current";

        // Calculate total payments for this invoice
        const invoicePayments = customerPayments.filter(
          (p) => p.invoiceId === invoice.id,
        );
        const totalPaid = invoicePayments.reduce((sum, p) => sum + p.amount, 0);
        const balance = invoice.total - totalPaid;

        if (balance <= 0) {
          status = "paid";
        } else if (invoice.dueDate) {
          try {
            const dueDate =
              typeof invoice.dueDate === "string"
                ? new Date(invoice.dueDate)
                : invoice.dueDate;
            if (
              dueDate instanceof Date &&
              !isNaN(dueDate.getTime()) &&
              dueDate < new Date()
            ) {
              status = "overdue";
            }
          } catch {
            // If date parsing fails, keep as current
          }
        }

        entries.push({
          id: invoice.id,
          date: formatDate(invoice.issueDate),
          type: "invoice",
          description: `Invoice ${invoice.invoiceNumber}`,
          reference: invoice.invoiceNumber,
          debit: invoice.total,
          credit: 0,
          balance: 0, // Will be calculated after sorting
          status: status,
          invoiceData: invoice,
        });
      });

      // Add payment entries (credits)
      customerPayments.forEach((payment) => {
        const linkedInvoice = customerInvoices.find(
          (inv) => inv.id === payment.invoiceId,
        );
        const description = linkedInvoice
          ? `Payment for ${linkedInvoice.invoiceNumber}`
          : `Payment - ${payment.method}`;

        entries.push({
          id: payment.id,
          date: formatDate(payment.createdAt),
          type: "payment",
          description: description,
          reference: payment.reference || payment.id,
          debit: 0,
          credit: payment.amount,
          balance: 0, // Will be calculated after sorting
          paymentData: payment,
        });
      });

      // Sort by date chronologically
      entries.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      // Calculate running balance
      let runningBalance = 0;
      entries.forEach((entry) => {
        runningBalance += entry.debit - entry.credit;
        entry.balance = runningBalance;
      });

      // Apply filters
      let filteredEntries = [...entries];

      if (filter.startDate) {
        filteredEntries = filteredEntries.filter(
          (e) => new Date(e.date) >= new Date(filter.startDate),
        );
      }

      if (filter.endDate) {
        filteredEntries = filteredEntries.filter(
          (e) => new Date(e.date) <= new Date(filter.endDate),
        );
      }

      if (filter.status && filter.status !== "all") {
        filteredEntries = filteredEntries.filter((e) => {
          if (e.type === "payment") return filter.status === "paid";
          return e.status === filter.status;
        });
      }

      if (filter.aging && filter.aging !== "all") {
        const now = new Date();
        filteredEntries = filteredEntries.filter((e) => {
          if (e.type === "payment" || e.balance <= 0) return false;

          const daysDiff = Math.floor(
            (now.getTime() - new Date(e.date).getTime()) /
              (1000 * 60 * 60 * 24),
          );

          switch (filter.aging) {
            case "0-30":
              return daysDiff <= 30;
            case "30-60":
              return daysDiff > 30 && daysDiff <= 60;
            case "60-90":
              return daysDiff > 60 && daysDiff <= 90;
            case "90-above":
              return daysDiff > 90;
            default:
              return true;
          }
        });
      }

      setStatementEntries(filteredEntries);
      const customer = customers.find((c) => c.id === filter.customerId);
      setSelectedCustomer(customer || null);
    } catch (err) {
      console.error("Failed to generate statement data:", err);
      setError("Failed to generate statement data");
      setStatementEntries([]);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const getTotalDebits = () => {
    return statementEntries.reduce((sum, e) => sum + e.debit, 0);
  };

  const getTotalCredits = () => {
    return statementEntries.reduce((sum, e) => sum + e.credit, 0);
  };

  const getFinalBalance = () => {
    if (statementEntries.length === 0) return 0;
    return statementEntries[statementEntries.length - 1].balance;
  };

  const getAgingData = (): AgingData => {
    const aging: AgingData = {
      "0-30": 0,
      "30-60": 0,
      "60-90": 0,
      "90-above": 0,
    };

    statementEntries.forEach((entry) => {
      if (
        entry.type === "invoice" &&
        entry.balance > 0 &&
        entry.invoiceData?.dueDate
      ) {
        const daysDiff = Math.floor(
          (new Date().getTime() -
            new Date(entry.invoiceData.dueDate).getTime()) /
            (1000 * 60 * 60 * 24),
        );

        if (daysDiff <= 30) {
          aging["0-30"] += entry.balance;
        } else if (daysDiff <= 60) {
          aging["30-60"] += entry.balance;
        } else if (daysDiff <= 90) {
          aging["60-90"] += entry.balance;
        } else {
          aging["90-above"] += entry.balance;
        }
      }
    });

    return aging;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" className="bg-green-500 text-white">
            Paid
          </Badge>
        );
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "current":
        return (
          <Badge variant="secondary" className="bg-blue-500 text-white">
            Current
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const agingData = getAgingData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Statement of Account
          </h1>
          <p className="text-muted-foreground">
            Generate customer account statements with aging analysis
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Statement Filters
          </CardTitle>
          <CardDescription>
            Select customer and date range to generate statement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={filter.customerId}
                onValueChange={(value) =>
                  setFilter({ ...filter, customerId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filter.startDate}
                onChange={(e) =>
                  setFilter({ ...filter, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filter.endDate}
                onChange={(e) =>
                  setFilter({ ...filter, endDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filter.status}
                onValueChange={(value) =>
                  setFilter({ ...filter, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aging">Aging</Label>
              <Select
                value={filter.aging}
                onValueChange={(value) =>
                  setFilter({ ...filter, aging: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  <SelectItem value="0-30">0-30 Days</SelectItem>
                  <SelectItem value="30-60">30-60 Days</SelectItem>
                  <SelectItem value="60-90">60-90 Days</SelectItem>
                  <SelectItem value="90-above">90+ Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statement Content */}
      {selectedCustomer && (
        <Card className="print:shadow-none print:border-none">
          <CardContent className="p-8">
            {/* Company Header - Using Invoice Template Style */}
            <div className="flex items-start justify-between mb-8">
              {/* LEFT: Logo */}
              <div className="flex items-center">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Company Logo"
                    className="h-16 w-16 object-contain mr-4"
                  />
                ) : (
                  <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {companyInfo.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* CENTER: Company Name and Details */}
              <div className="text-center flex-1">
                <h1 className="text-2xl font-bold text-primary mb-2">
                  {companyInfo.name.toUpperCase()}
                </h1>
                <p className="text-sm text-muted-foreground mb-1">
                  Your Medical & Laboratory Supplies Partner
                </p>
                <div className="text-sm space-y-1">
                  <p>{companyInfo.address}</p>
                  {companyInfo.street && <p>{companyInfo.street}</p>}
                  <p>Tel: {companyInfo.phone}</p>
                  <p>E-mail: {companyInfo.email}</p>
                  {companyInfo.website && <p>Website: {companyInfo.website}</p>}
                </div>
              </div>

              {/* RIGHT: PIN Number */}
              <div className="text-right">
                <p className="text-sm font-bold">PIN No: {companyInfo.pin}</p>
              </div>
            </div>

            {/* Statement Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">STATEMENT OF ACCOUNT</h1>
            </div>

            {/* Customer Information */}
            <div className="flex justify-between mb-6">
              <div>
                <p className="font-semibold">
                  TO : {selectedCustomer.name.toUpperCase()}
                </p>
                <p>{selectedCustomer.address}</p>
              </div>
              <div className="text-right">
                <p>Date: {formatDate(new Date().toISOString())}</p>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="mb-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-600 hover:bg-green-600">
                    <TableHead className="text-white font-bold">DATE</TableHead>
                    <TableHead className="text-white font-bold">
                      DESCRIPTION
                    </TableHead>
                    <TableHead className="text-white font-bold">
                      REFERENCE
                    </TableHead>
                    <TableHead className="text-white font-bold text-right">
                      DEBIT
                    </TableHead>
                    <TableHead className="text-white font-bold text-right">
                      CREDIT
                    </TableHead>
                    <TableHead className="text-white font-bold text-right">
                      BALANCE
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading statement data...
                      </TableCell>
                    </TableRow>
                  ) : statementEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No transactions found for selected criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    statementEntries.map((entry) => (
                      <TableRow key={`${entry.type}-${entry.id}`}>
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {entry.type === "invoice" ? (
                              <FileText className="h-4 w-4 mr-2 text-blue-500" />
                            ) : (
                              <CreditCard className="h-4 w-4 mr-2 text-green-500" />
                            )}
                            {entry.description}
                            {entry.status && (
                              <span className="ml-2">
                                {getStatusBadge(entry.status)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {entry.reference}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {entry.credit > 0
                            ? formatCurrency(entry.credit)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(entry.balance)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {/* Total Row */}
                  {statementEntries.length > 0 && (
                    <TableRow className="font-bold border-t-2">
                      <TableCell colSpan={3} className="text-right">
                        TOTAL
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(getTotalDebits())}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(getTotalCredits())}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(getFinalBalance())}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Aging Analysis */}
            {statementEntries.length > 0 && (
              <div className="mb-6">
                <Table className="w-1/2">
                  <TableHeader>
                    <TableRow className="bg-green-600 hover:bg-green-600">
                      <TableHead className="text-white font-bold text-center">
                        0-30
                      </TableHead>
                      <TableHead className="text-white font-bold text-center">
                        30-60
                      </TableHead>
                      <TableHead className="text-white font-bold text-center">
                        60-90
                      </TableHead>
                      <TableHead className="text-white font-bold text-center">
                        90 and above
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-center font-medium">
                        {agingData["0-30"] > 0
                          ? formatCurrency(agingData["0-30"])
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {agingData["30-60"] > 0
                          ? formatCurrency(agingData["30-60"])
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {agingData["60-90"] > 0
                          ? formatCurrency(agingData["60-90"])
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {agingData["90-above"] > 0
                          ? formatCurrency(agingData["90-above"])
                          : "-"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Banking Details */}
            <div className="border border-gray-300 p-4 inline-block">
              <h3 className="font-bold mb-2 bg-green-600 text-white px-2 py-1">
                BANKING DETAILS
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex">
                  <span className="font-medium w-32">Bank Name :</span>
                  <span>{bankingDetails.bankName}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Account Name :</span>
                  <span>{bankingDetails.accountName}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Branch :</span>
                  <span>{bankingDetails.branch}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Account No :</span>
                  <span>{bankingDetails.accountNo}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Bank code :</span>
                  <span>{bankingDetails.bankCode}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Branch code :</span>
                  <span>{bankingDetails.branchCode}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
