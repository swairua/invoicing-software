import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  CreditCard,
  Building,
} from "lucide-react";
import { Customer } from "@shared/types";
import { dataServiceFactory } from "../services/dataServiceFactory";
import { useToast } from "../hooks/use-toast";

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  kraPin: string;
  address: string;
  creditLimit: string;
  isActive: boolean;
}

export default function NewCustomer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);

  const isEditMode = Boolean(id);
  const duplicateData = location.state?.duplicateFrom;

  const [formData, setFormData] = useState<CustomerFormData>({
    name: duplicateData?.name || "",
    email: duplicateData?.email || "",
    phone: duplicateData?.phone || "",
    kraPin: duplicateData?.kraPin || "",
    address: duplicateData?.address || "",
    creditLimit: duplicateData?.creditLimit?.toString() || "0",
    isActive: duplicateData?.isActive ?? true,
  });

  const dataService = dataServiceFactory.getDataService();

  // Load customer data when in edit mode
  useEffect(() => {
    const loadCustomer = async () => {
      if (!isEditMode || !id) return;

      try {
        setLoading(true);
        const customers = await dataService.getCustomers();
        const foundCustomer = customers.find((c) => c.id === id);

        if (!foundCustomer) {
          toast({
            title: "Customer Not Found",
            description: "The requested customer could not be found.",
            variant: "destructive",
          });
          navigate("/customers");
          return;
        }

        setCustomer(foundCustomer);
        setFormData({
          name: foundCustomer.name,
          email: foundCustomer.email || "",
          phone: foundCustomer.phone || "",
          kraPin: foundCustomer.kraPin || "",
          address: foundCustomer.address || "",
          creditLimit: foundCustomer.creditLimit?.toString() || "0",
          isActive: foundCustomer.isActive,
        });
      } catch (error) {
        console.error("Error loading customer:", error);
        toast({
          title: "Error",
          description: "Failed to load customer details.",
          variant: "destructive",
        });
        navigate("/customers");
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [isEditMode, id, dataService, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Customer name is required.",
        variant: "destructive",
      });
      return;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && customer) {
        // Update existing customer - only send updateable fields
        const updateData: Partial<Customer> = {
          name: formData.name,
          creditLimit: parseFloat(formData.creditLimit) || 0,
          isActive: formData.isActive,
        };

        // Only include optional fields if they have values
        if (formData.email && formData.email.trim()) {
          updateData.email = formData.email.trim();
        }
        if (formData.phone && formData.phone.trim()) {
          updateData.phone = formData.phone.trim();
        }
        if (formData.kraPin && formData.kraPin.trim()) {
          updateData.kraPin = formData.kraPin.trim();
        }
        if (formData.address && formData.address.trim()) {
          updateData.address = formData.address.trim();
        }

        // Call the actual update API using URL parameter ID
        if (!id) {
          throw new Error("No customer ID provided");
        }

        console.log("Updating customer with id:", id);
        console.log("Update data:", updateData);
        await dataService.updateCustomer(id, updateData);

        toast({
          title: "Customer Updated",
          description: `Customer "${formData.name}" has been updated successfully.`,
        });

        navigate(`/customers/${id}`);
      } else {
        // Create new customer
        const newCustomer: Omit<Customer, "id" | "createdAt" | "updatedAt"> = {
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          kraPin: formData.kraPin || undefined,
          address: formData.address || undefined,
          creditLimit: parseFloat(formData.creditLimit) || 0,
          balance: 0,
          isActive: formData.isActive,
          companyId: "1",
        };

        // Call the actual create API
        await dataService.createCustomer(newCustomer);

        toast({
          title: "Customer Created",
          description: `Customer "${formData.name}" has been created successfully.`,
        });

        navigate("/customers");
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} customer:`,
        error,
      );
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} customer. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatKraPin = (value: string) => {
    if (!value) return "";
    // Remove any non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    // Format as P000000000A (P + 9 digits + A)
    if (cleaned.length <= 1) return cleaned;
    if (cleaned.length <= 10)
      return cleaned.substring(0, 1) + cleaned.substring(1);
    return (
      cleaned.substring(0, 1) +
      cleaned.substring(1, 10) +
      cleaned.substring(10, 11)
    );
  };

  const handleKraPinChange = (value: string) => {
    const formatted = formatKraPin(value);
    setFormData((prev) => ({ ...prev, kraPin: formatted }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to={isEditMode ? `/customers/${id}` : "/customers"}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {isEditMode ? "Back to Customer" : "Back to Customers"}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode
                ? "Edit Customer"
                : duplicateData
                  ? "Duplicate Customer"
                  : "New Customer"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Update customer information and settings"
                : duplicateData
                  ? "Create a copy of an existing customer"
                  : "Add a new customer to your database"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={isEditMode ? `/customers/${id}` : "/customers"}>
              Cancel
            </Link>
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? "Update Customer" : "Create Customer"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
            <CardDescription>Basic details about the customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="customer@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+254 700 123 456"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kraPin">KRA PIN</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="kraPin"
                    value={formData.kraPin}
                    onChange={(e) => handleKraPinChange(e.target.value)}
                    placeholder="P000000000A"
                    className="pl-10 font-mono"
                    maxLength={11}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Format: P000000000A (Letter + 9 digits + Letter)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="P.O Box 12345, City, Country"
                    className="pl-10 min-h-[80px]"
                    rows={3}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Credit & Account Settings
            </CardTitle>
            <CardDescription>
              Credit limits and account configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="creditLimit">Credit Limit (KES)</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="creditLimit"
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      creditLimit: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum amount this customer can owe at any time
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active Customer</Label>
                <p className="text-xs text-muted-foreground">
                  Active customers can place orders and receive invoices
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Account Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isEditMode ? "Current Balance:" : "Initial Balance:"}
                  </span>
                  <span className="font-medium">
                    KES{" "}
                    {isEditMode && customer
                      ? customer.balance.toLocaleString()
                      : "0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credit Limit:</span>
                  <span className="font-medium">
                    KES{" "}
                    {parseFloat(formData.creditLimit || "0").toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Available Credit:
                  </span>
                  <span className="font-medium text-green-600">
                    KES{" "}
                    {(
                      parseFloat(formData.creditLimit || "0") -
                      (isEditMode && customer ? customer.balance : 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Getting Started</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Customer will be created with zero balance</li>
                <li>• You can create invoices immediately after creation</li>
                <li>• Credit limit helps manage outstanding balances</li>
                <li>• All customer data can be edited later</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form validation summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Required Fields</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Customer name is mandatory</li>
                <li>• Other fields are optional but recommended</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">KRA PIN Format</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Should start with 'P' for individuals</li>
                <li>• Format: P000000000A</li>
                <li>• Required for tax compliance</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Credit Management</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Set appropriate credit limits</li>
                <li>• Monitor outstanding balances</li>
                <li>• Review credit terms regularly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
