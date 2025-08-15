import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
} from "lucide-react";
import { Customer } from "@shared/types";
import { getDataService } from "../services/dataServiceFactory";
import { safeIncludes } from "../lib/search-utils";

const dataService = getDataService();

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSampleData, setIsLoadingSampleData] = useState(false);

  // Load sample data function
  const loadSampleData = async () => {
    try {
      setIsLoadingSampleData(true);
      setError(null);
      console.log("Loading sample data...");

      const response = await fetch('/api/seed/sample-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create sample data');
      }

      const result = await response.json();
      console.log("Sample data created:", result);

      // Reload customers
      const data = await dataService.getCustomers();
      setCustomers(data);

    } catch (err) {
      console.error("Failed to load sample data:", err);
      setError("Failed to load sample data");
    } finally {
      setIsLoadingSampleData(false);
    }
  };

  // Load customers from database
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Loading customers from data service...");
        const data = await dataService.getCustomers();
        console.log("Customers loaded:", data);
        setCustomers(data);
      } catch (err) {
        console.error("Failed to load customers:", err);
        setError("Failed to load customers from database");
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      safeIncludes(customer.name, searchTerm) ||
      safeIncludes(customer.email, searchTerm) ||
      safeIncludes(customer.kraPin, searchTerm),
  );

  const getCustomerInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const customerData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        kraPin: formData.get("kraPin") as string,
        address: formData.get("address") as string,
        creditLimit: parseFloat(formData.get("creditLimit") as string) || 0,
        balance: 0,
        isActive: true,
        companyId: "1",
      };

      const newCustomer = await dataService.createCustomer(customerData);
      setCustomers([newCustomer, ...customers]);
      setIsCreateDialogOpen(false);
    } catch (err) {
      console.error("Failed to create customer:", err);
      setError("Failed to create customer");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer database and track relationships
          </p>
        </div>
        <div className="flex gap-2">
          {customers.length === 0 && !loading && (
            <Button
              variant="outline"
              onClick={loadSampleData}
              disabled={isLoadingSampleData}
            >
              {isLoadingSampleData ? "Loading..." : "Load Sample Data"}
            </Button>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Create a new customer profile. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCustomer} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kraPin">KRA PIN</Label>
                  <Input id="kraPin" name="kraPin" placeholder="P051234567A" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="contact@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" placeholder="+254700123456" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Enter business address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Credit Limit (KES)</Label>
                <Input
                  id="creditLimit"
                  name="creditLimit"
                  type="number"
                  placeholder="500000"
                  min="0"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Customer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">+2</span> from last
              month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter((c) => c.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (customers.filter((c) => c.isActive).length /
                  customers.length) *
                  100,
              )}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Balance
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(customers.reduce((sum, c) => sum + c.balance, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Total receivables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Limit</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                customers.reduce((sum, c) => sum + c.creditLimit, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total credit extended
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>
            A comprehensive list of all your business customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>

          {/* Customer Table */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>KRA PIN</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Credit Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getCustomerInitials(customer?.name || "N/A")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {customer?.name || "Unknown Customer"}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {customer.address?.split(",")[1]?.trim() ||
                                "No location"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="text-sm flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="text-sm flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.kraPin ? (
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {customer.kraPin}
                          </code>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`font-medium ${customer.balance > 0 ? "text-warning" : "text-muted-foreground"}`}
                        >
                          {formatCurrency(customer.balance)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(customer.creditLimit)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={customer.isActive ? "default" : "secondary"}
                        >
                          {customer.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/customers/${customer.id}`);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/customers/${customer.id}/edit`);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // TODO: Implement customer deletion
                                console.log("Delete customer:", customer.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Customer
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

          {!loading && filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No customers found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : error
                    ? "Unable to load customers from database."
                    : "Get started by adding your first customer."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
