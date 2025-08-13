import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Plus,
  MoreHorizontal,
  FileText,
  Eye,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { CreditNote, Customer, Product } from "@shared/types";
import { dataServiceFactory } from "@/services/dataServiceFactory";
import { toast } from "@/hooks/use-toast";

export default function CreditNotes() {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const dataService = dataServiceFactory.getDataService();
      const [creditNotesData, customersData] = await Promise.all([
        dataService.getCreditNotes(),
        dataService.getCustomers(),
      ]);

      setCreditNotes(creditNotesData);
      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load credit notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this credit note?")) {
      return;
    }

    try {
      const dataService = dataServiceFactory.getDataService();
      await dataService.deleteCreditNote(id);
      setCreditNotes(creditNotes.filter((cn) => cn.id !== id));
      toast({
        title: "Success",
        description: "Credit note deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting credit note:", error);
      toast({
        title: "Error",
        description: "Failed to delete credit note",
        variant: "destructive",
      });
    }
  };

  const filteredCreditNotes = creditNotes.filter(
    (creditNote) =>
      creditNote.creditNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      creditNote.customer?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      creditNote.reason?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "outline",
      issued: "default",
      applied: "secondary",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getTotalStats = () => {
    return {
      total: creditNotes.length,
      draft: creditNotes.filter((cn) => cn.status === "draft").length,
      issued: creditNotes.filter((cn) => cn.status === "issued").length,
      applied: creditNotes.filter((cn) => cn.status === "applied").length,
      totalAmount: creditNotes.reduce((sum, cn) => sum + cn.total, 0),
    };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credit Notes</h1>
          <p className="text-muted-foreground">
            Manage customer credit notes and refunds
          </p>
        </div>
        <Button asChild>
          <Link to="/credit-notes/new">
            <Plus className="h-4 w-4 mr-2" />
            New Credit Note
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Credit Notes
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issued</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.issued}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applied</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {stats.totalAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search credit notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Credit Notes Table */}
      <Card>
        <CardContent className="p-0">
          {filteredCreditNotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No credit notes found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "No credit notes match your search."
                  : "Get started by creating your first credit note."}
              </p>
              <Button asChild>
                <Link to="/credit-notes/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Credit Note
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Credit Note #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCreditNotes.map((creditNote) => (
                  <TableRow key={creditNote.id}>
                    <TableCell className="font-medium">
                      <Link
                        to={`/credit-notes/${creditNote.id}`}
                        className="text-primary hover:underline"
                      >
                        {creditNote.creditNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{creditNote.customer?.name || 'Unknown Customer'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {creditNote.reason}
                    </TableCell>
                    <TableCell>
                      {format(new Date(creditNote.issueDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      KES {creditNote.total.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(creditNote.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/credit-notes/${creditNote.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(creditNote.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
