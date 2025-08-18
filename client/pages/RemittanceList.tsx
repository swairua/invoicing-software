import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  FileEdit,
  Trash2,
  Download,
  Receipt,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface RemittanceAdvice {
  id: string;
  remittanceNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  totalPayment: number;
  itemCount: number;
  status: "draft" | "sent";
  createdAt: string;
  updatedAt: string;
}

export default function RemittanceList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [remittances, setRemittances] = useState<RemittanceAdvice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration - in real app this would come from API
  useEffect(() => {
    const mockData: RemittanceAdvice[] = [
      {
        id: "1",
        remittanceNumber: "RA2501001",
        date: "2025-01-15",
        customerName: "ABC Electronics Ltd",
        customerEmail: "orders@abcelectronics.co.ke",
        totalPayment: 125000,
        itemCount: 3,
        status: "sent",
        createdAt: "2025-01-15T10:30:00Z",
        updatedAt: "2025-01-15T10:30:00Z",
      },
      {
        id: "2",
        remittanceNumber: "RA2501002",
        date: "2025-01-18",
        customerName: "Digital Solutions Co",
        customerEmail: "info@digitalsolutions.co.ke",
        totalPayment: 89500,
        itemCount: 2,
        status: "draft",
        createdAt: "2025-01-18T14:20:00Z",
        updatedAt: "2025-01-18T14:20:00Z",
      },
    ];
    setRemittances(mockData);
  }, []);

  const filteredRemittances = remittances.filter(
    (remittance) =>
      remittance.remittanceNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      remittance.customerName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "draft":
        return "secondary";
      case "sent":
        return "default";
      default:
        return "secondary";
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this remittance advice? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Implement API call to delete remittance
      setRemittances((prev) => prev.filter((r) => r.id !== id));
      toast({
        title: "Success",
        description: "Remittance advice deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting remittance:", error);
      toast({
        title: "Error",
        description: "Failed to delete remittance advice.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = (remittance: RemittanceAdvice) => {
    navigate("/remittance-advice/new", {
      state: {
        duplicateFrom: remittance,
      },
    });
  };

  const handleDownload = (remittance: RemittanceAdvice) => {
    toast({
      title: "Download Started",
      description: `Downloading ${remittance.remittanceNumber}.pdf`,
    });
  };

  // Calculate summary statistics
  const totalRemittances = remittances.length;
  const sentRemittances = remittances.filter((r) => r.status === "sent").length;
  const draftRemittances = remittances.filter(
    (r) => r.status === "draft",
  ).length;
  const totalValue = remittances.reduce((sum, r) => sum + r.totalPayment, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Remittance Advice
          </h1>
          <p className="text-muted-foreground">
            Manage your remittance advice documents
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => navigate("/remittance-advice/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Remittance
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Remittances
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRemittances}</div>
            <p className="text-xs text-muted-foreground">
              All remittance advice
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentRemittances}</div>
            <p className="text-xs text-muted-foreground">Completed documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftRemittances}</div>
            <p className="text-xs text-muted-foreground">Work in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">Total payment value</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search remittance advice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remittances Table */}
      <Card>
        <CardHeader>
          <CardTitle>Remittance Advice Documents</CardTitle>
          <CardDescription>
            {filteredRemittances.length} of {totalRemittances} remittance advice
            documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Remittance Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRemittances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No remittance advice found
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/remittance-advice/new")}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Remittance
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRemittances.map((remittance) => (
                    <TableRow key={remittance.id}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/remittance-advice/${remittance.id}`}
                          className="text-primary hover:underline"
                        >
                          {remittance.remittanceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {remittance.customerName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {remittance.customerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(remittance.date)}</TableCell>
                      <TableCell>{remittance.itemCount} items</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(remittance.totalPayment)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusColor(remittance.status) as any}
                        >
                          {remittance.status.toUpperCase()}
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
                              <Link to={`/remittance-advice/${remittance.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                to={`/remittance-advice/${remittance.id}/edit`}
                              >
                                <FileEdit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(remittance)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDownload(remittance)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(remittance.id)}
                              className="text-destructive"
                              disabled={isLoading}
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
