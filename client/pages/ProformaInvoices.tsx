import React, { useState, useEffect } from "react";
import {
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
  Calendar,
  User,
  Calculator,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import {
  Customer,
  Product,
  ProformaInvoice,
  Invoice,
} from "@shared/types";
import { dataServiceFactory } from "../services/dataServiceFactory";
import { useToast } from "../hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

interface ProformaFormData {
  customerId: string;
  issueDate: string;
  validUntil: string;
  notes: string;
}

export default function ProformaInvoices() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [proformas, setProformas] = useState<ProformaInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ProformaFormData>({
    customerId: "",
    issueDate: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const businessData = dataServiceFactory.getDataService();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [proformasData, customersData, productsData] = await Promise.all([
          businessData.getProformas(),
          businessData.getCustomers(),
          businessData.getProducts()
        ]);
        setProformas(Array.isArray(proformasData) ? proformasData : []);
        setCustomers(Array.isArray(customersData) ? customersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Refresh data periodically
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const [proformasData, customersData, productsData] = await Promise.all([
          businessData.getProformas(),
          businessData.getCustomers(),
          businessData.getProducts()
        ]);
        setProformas(Array.isArray(proformasData) ? proformasData : []);
        setCustomers(Array.isArray(customersData) ? customersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    }, 5000);

    return () => clearInterval(refreshInterval);
  }, []);

  const filteredProformas = proformas.filter((proforma) => {
    const matchesSearch =
      proforma.proformaNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      proforma.customer.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || proforma.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString("en-GB");
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "draft":
        return "secondary";
      case "sent":
        return "default";
      case "converted":
        return "outline";
      case "expired":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleCreateProforma = () => {
    if (!formData.customerId) {
      toast({
        title: "Validation Error",
        description: "Please select a customer.",
        variant: "destructive",
      });
      return;
    }

    navigate("/proformas/new", {
      state: {
        formData,
      },
    });
  };

  const handleDuplicate = (proforma: ProformaInvoice) => {
    navigate("/proformas/new", {
      state: {
        duplicateFrom: proforma,
      },
    });
  };

  const handleConvertToInvoice = async (proforma: ProformaInvoice) => {
    if (proforma.status !== "sent") {
      toast({
        title: "Cannot Convert",
        description: "Only sent proforma invoices can be converted to invoices.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      // Call conversion API
      const invoice = await businessData.convertProformaToInvoice?.(proforma.id);
      
      if (invoice) {
        // Refresh data
        const proformasData = await businessData.getProformas();
        setProformas(Array.isArray(proformasData) ? proformasData : []);

        toast({
          title: "Success",
          description: `Proforma ${proforma.proformaNumber} converted to invoice successfully.`,
        });

        navigate(`/invoices/${invoice.id}`);
      }
    } catch (error) {
      console.error("Error converting proforma:", error);
      toast({
        title: "Error",
        description: "Failed to convert proforma to invoice.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await businessData.deleteProforma?.(id);
      const proformasData = await businessData.getProformas();
      setProformas(Array.isArray(proformasData) ? proformasData : []);
      toast({
        title: "Success",
        description: "Proforma invoice deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting proforma:", error);
      toast({
        title: "Error",
        description: "Failed to delete proforma invoice.",
        variant: "destructive",
      });
    }
  };

  // Calculate summary statistics
  const totalProformas = proformas.length;
  const sentProformas = proformas.filter((p) => p.status === "sent").length;
  const convertedProformas = proformas.filter(
    (p) => p.status === "converted",
  ).length;
  const draftProformas = proformas.filter((p) => p.status === "draft").length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Proforma Invoices
          </h1>
          <p className="text-muted-foreground">
            Manage your proforma invoices and convert them to invoices
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Proforma
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Proforma Invoice</DialogTitle>
                <DialogDescription>
                  Set up basic details for your new proforma invoice
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, customerId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {customer.email}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          issueDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          validUntil: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateProforma}>Continue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Proformas
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProformas}</div>
            <p className="text-xs text-muted-foreground">
              All proforma invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentProformas}</div>
            <p className="text-xs text-muted-foreground">
              Ready for conversion
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convertedProformas}</div>
            <p className="text-xs text-muted-foreground">
              Converted to invoices
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
                proformas
                  .filter((p) => p.status === "sent")
                  .reduce((sum, p) => sum + p.total, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total sent proformas value
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
                  placeholder="Search proformas..."
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
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Proformas Table */}
      <Card>
        <CardHeader>
          <CardTitle>Proforma Invoices</CardTitle>
          <CardDescription>
            {filteredProformas.length} of {totalProformas} proforma invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proforma Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProformas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardList className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No proforma invoices found
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsCreateDialogOpen(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Proforma
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProformas.map((proforma) => (
                    <TableRow key={proforma.id}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/proformas/${proforma.id}`}
                          className="text-primary hover:underline"
                        >
                          {proforma.proformaNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {proforma.customer.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {proforma.customer.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(proforma.issueDate)}</TableCell>
                      <TableCell>{formatDate(proforma.validUntil)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(proforma.total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(proforma.status) as any}>
                          {proforma.status.toUpperCase()}
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
                              <Link to={`/proformas/${proforma.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(proforma)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {proforma.status === "sent" && (
                              <DropdownMenuItem
                                onClick={() => handleConvertToInvoice(proforma)}
                                disabled={isLoading}
                              >
                                <FileEdit className="mr-2 h-4 w-4" />
                                Convert to Invoice
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(proforma.id)}
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
