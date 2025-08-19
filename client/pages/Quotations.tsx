import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Copy,
  FileEdit,
  Trash2,
  Send,
  Download,
  Calendar,
  User,
  Calculator,
  TrendingUp,
  ClipboardList,
  Clock,
} from "lucide-react";
import { Customer, Product, Quotation } from "@shared/types";
import { dataServiceFactory } from "../services/dataServiceFactory";
import { useToast } from "../hooks/use-toast";
import { safeFormatDateGB } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function Quotations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const businessData = dataServiceFactory.getDataService();

  // Helper function to validate quotation existence
  const validateQuotationExists = async (
    quotationId: string,
  ): Promise<boolean> => {
    try {
      const quotation = await businessData.getQuotation(quotationId);
      return !!quotation;
    } catch (error) {
      console.error(`Error validating quotation ${quotationId}:`, error);
      return false;
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [quotationsData, customersData, productsData] = await Promise.all(
          [
            businessData.getQuotations(),
            businessData.getCustomers(),
            businessData.getProducts(),
          ],
        );

        // Filter out invalid quotations and ensure only valid records are displayed
        const quotationsArray = Array.isArray(quotationsData)
          ? quotationsData
          : [];
        const validQuotations = quotationsArray.filter(
          (q) => q && q.id && q.quoteNumber && q.customerId,
        );

        console.log(
          "📋 Initial quotations loaded in component:",
          quotationsArray,
        );
        console.log(
          `📋 Initial load: ${validQuotations.length} valid quotations out of ${quotationsArray.length} total`,
        );
        if (validQuotations.length > 0) {
          console.log("📋 First valid quotation sample:", validQuotations[0]);
        }

        setQuotations(validQuotations);
        setCustomers(Array.isArray(customersData) ? customersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();

    // Start simulation if not already running (only for mock data)
    if (!businessData.isSimulationRunning()) {
      businessData.startSimulation();
    }
  }, []);

  // Refresh data periodically
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const [quotationsData, customersData, productsData] = await Promise.all(
          [
            businessData.getQuotations(),
            businessData.getCustomers(),
            businessData.getProducts(),
          ],
        );
        // Filter out invalid quotations and ensure only valid records are displayed
        const validQuotations = Array.isArray(quotationsData)
          ? quotationsData.filter(
              (q) => q && q.id && q.quoteNumber && q.customerId,
            )
          : [];

        console.log(
          `📋 Periodic refresh: ${validQuotations.length} valid quotations out of ${quotationsData?.length || 0} total`,
        );
        setQuotations(validQuotations);
        setCustomers(Array.isArray(customersData) ? customersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error("Error refreshing data:", error);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  // Refresh data when URL contains refresh parameter
  useEffect(() => {
    const refreshParam = searchParams.get("refresh");
    if (refreshParam === "true") {
      const loadData = async () => {
        try {
          console.log("Refreshing quotations data after creation...");
          const [quotationsData, customersData, productsData] =
            await Promise.all([
              businessData.getQuotations(),
              businessData.getCustomers(),
              businessData.getProducts(),
            ]);
          // Filter out invalid quotations and ensure only valid records are displayed
          const validQuotations = Array.isArray(quotationsData)
            ? quotationsData.filter(
                (q) => q && q.id && q.quoteNumber && q.customerId,
              )
            : [];

          console.log(
            `📋 After creation refresh: ${validQuotations.length} valid quotations out of ${quotationsData?.length || 0} total`,
          );
          setQuotations(validQuotations);
          setCustomers(Array.isArray(customersData) ? customersData : []);
          setProducts(Array.isArray(productsData) ? productsData : []);
          console.log("Quotations data refreshed successfully");
        } catch (error) {
          console.error("Error refreshing data:", error);
        }
      };

      loadData();

      // Clear the refresh parameter from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("refresh");
      navigate({ search: newSearchParams.toString() }, { replace: true });
    }
  }, [searchParams, navigate, businessData]);

  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch =
      quotation.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.customer?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || quotation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Debug log filtering results (moved outside filter function)
  console.log(
    `🔍 Filtering results: ${filteredQuotations.length} of ${quotations.length} quotations shown`,
  );

  const formatCurrency = (
    amount: number | string | null | undefined,
  ): string => {
    try {
      const numAmount =
        typeof amount === "number"
          ? amount
          : typeof amount === "string"
            ? parseFloat(amount) || 0
            : 0;

      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
      }).format(numAmount);
    } catch (error) {
      console.warn("Currency formatting error:", error);
      return "KES 0";
    }
  };

  // Use safe date formatting to prevent RangeError: Invalid time value
  const formatDate = safeFormatDateGB;

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "draft":
        return "secondary";
      case "sent":
        return "default";
      case "accepted":
        return "outline";
      case "rejected":
        return "destructive";
      case "expired":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleDuplicate = (quotation: Quotation) => {
    navigate("/quotations/new", {
      state: {
        duplicateFrom: quotation,
      },
    });
  };

  const handleConvertToProforma = async (quotation: Quotation) => {
    if (quotation.status !== "accepted") {
      toast({
        title: "Cannot Convert",
        description:
          "Only accepted quotations can be converted to proforma invoices.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const proforma = await businessData.convertQuotationToProforma?.(
        quotation.id,
      );

      if (proforma) {
        const quotationsData = await businessData.getQuotations();
        // Filter out invalid quotations and ensure only valid records are displayed
        const validQuotations = Array.isArray(quotationsData)
          ? quotationsData.filter(
              (q) => q && q.id && q.quoteNumber && q.customerId,
            )
          : [];

        console.log(
          `📋 After proforma conversion: ${validQuotations.length} valid quotations out of ${quotationsData?.length || 0} total`,
        );
        setQuotations(validQuotations);

        toast({
          title: "Success",
          description: `Quotation ${quotation.quoteNumber} converted to proforma invoice successfully.`,
        });

        navigate(`/proformas/${proforma.id}`);
      }
    } catch (error) {
      console.error("Error converting quotation:", error);
      toast({
        title: "Error",
        description: "Failed to convert quotation to proforma invoice.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async (quotation: Quotation) => {
    try {
      // Import PDFService
      const PDFService = (await import("../services/pdfService")).default;

      // Generate and download the quotation PDF
      await PDFService.generateQuotationPDF(quotation);

      toast({
        title: "PDF Generated",
        description: `Quotation ${quotation.quoteNumber} PDF downloaded successfully`,
      });
    } catch (error) {
      console.error("Error generating quotation PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate quotation PDF",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await businessData.deleteQuotation?.(id);
      const quotationsData = await businessData.getQuotations();
      setQuotations(Array.isArray(quotationsData) ? quotationsData : []);
      toast({
        title: "Success",
        description: "Quotation deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast({
        title: "Error",
        description: "Failed to delete quotation.",
        variant: "destructive",
      });
    }
  };

  // Calculate summary statistics
  const totalQuotations = quotations.length;
  const acceptedQuotations = quotations.filter(
    (q) => q.status === "accepted",
  ).length;
  const pendingQuotations = quotations.filter(
    (q) => q.status === "sent",
  ).length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground">
            Create and manage customer quotations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link to="/quotations/new">
              <Plus className="mr-2 h-4 w-4" />
              New Quotation
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Quotations
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuotations}</div>
            <p className="text-xs text-muted-foreground">
              All quotations created
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedQuotations}</div>
            <p className="text-xs text-muted-foreground">
              Ready for conversion
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingQuotations}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting customer response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                quotations.reduce((sum, q) => {
                  const total = parseFloat(q.total?.toString() || "0") || 0;
                  return sum + total;
                }, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total quotations value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quotations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quotations</CardTitle>
          <CardDescription>
            {filteredQuotations.length} of {totalQuotations} quotations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardList className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No quotations found
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/quotations/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Your First Quotation
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/quotations/${quotation.id}`}
                          className="text-primary hover:underline"
                        >
                          {quotation.quoteNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {quotation.customer?.name || "Unknown Customer"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {quotation.customer.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(quotation.issueDate)}</TableCell>
                      <TableCell>{formatDate(quotation.validUntil)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(quotation.total)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusColor(quotation.status) as any}
                        >
                          {quotation.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link to={`/quotations/${quotation.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/quotations/${quotation.id}/edit`}>
                                <FileEdit className="mr-2 h-4 w-4" />
                                Edit Quotation
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(quotation)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadPDF(quotation)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {quotation.status === "accepted" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleConvertToProforma(quotation)
                                }
                                disabled={isLoading}
                              >
                                <FileEdit className="mr-2 h-4 w-4" />
                                Convert to Proforma
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(quotation.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
