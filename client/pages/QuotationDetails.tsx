import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  ArrowLeft,
  Edit,
  FileText,
  Send,
  Copy,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
} from "lucide-react";
import { Quotation } from "@shared/types";
import { dataServiceFactory } from "../services/dataServiceFactory";
import { useToast } from "../hooks/use-toast";
import { safeFormatDateKE } from "@/lib/utils";

export default function QuotationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);

  const dataService = dataServiceFactory.getDataService();

  useEffect(() => {
    const loadQuotationData = async () => {
      try {
        setLoading(true);
        console.log(`Loading quotation details for ID: ${id}`);

        // Use single quotation endpoint to get detailed data with items
        const foundQuotation = await dataService.getQuotation(id!);

        if (!foundQuotation) {
          console.error(`❌ Quotation not found: ${id}`);
          toast({
            title: "Quotation Not Found",
            description: `The quotation ID "${id}" does not exist in the database. Redirecting to quotations list.`,
            variant: "destructive",
          });
          navigate("/quotations");
          return;
        }

        console.log("Loaded quotation details:", foundQuotation);
        setQuotation(foundQuotation);
      } catch (error) {
        console.error("Error loading quotation:", error);
        toast({
          title: "Error",
          description: "Failed to load quotation details.",
          variant: "destructive",
        });
        navigate("/quotations");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadQuotationData();
    }
  }, [id, dataService, navigate, toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Use safe date formatting to prevent RangeError: Invalid time value
  const formatDate = safeFormatDateKE;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "success";
      case "sent":
        return "default";
      case "rejected":
        return "destructive";
      case "draft":
        return "secondary";
      case "expired":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return CheckCircle;
      case "sent":
        return Send;
      case "rejected":
        return AlertTriangle;
      case "draft":
        return Edit;
      case "expired":
        return Clock;
      default:
        return FileText;
    }
  };

  const isExpired = (quotation: Quotation) => {
    return new Date(quotation.validUntil) < new Date();
  };

  const convertToInvoice = () => {
    if (!quotation) return;

    navigate("/invoices/new", {
      state: {
        convertFrom: "quotation",
        sourceData: quotation,
      },
    });
  };

  const convertToProforma = () => {
    if (!quotation) return;

    navigate("/proforma/new", {
      state: {
        convertFrom: "quotation",
        sourceData: quotation,
      },
    });
  };

  const handleDuplicate = () => {
    if (!quotation) return;

    navigate("/quotations/new", {
      state: {
        duplicateFrom: quotation,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold">Quotation Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The requested quotation could not be found.
        </p>
        <Button asChild>
          <Link to="/quotations">Back to Quotations</Link>
        </Button>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(quotation.status);
  const expired = isExpired(quotation);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/quotations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quotations
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {quotation.quoteNumber}
            </h1>
            <p className="text-muted-foreground">
              {quotation.customer.name} • Created{" "}
              {formatDate(quotation.issueDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/quotations/${quotation.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Quotation ✏️
            </Link>
          </Button>
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          {quotation.status === "accepted" && (
            <>
              <Button variant="outline" onClick={convertToProforma}>
                Convert to Proforma
              </Button>
              <Button onClick={convertToInvoice}>Convert to Invoice</Button>
            </>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {expired &&
        quotation.status !== "accepted" &&
        quotation.status !== "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">
                This quotation has expired
              </span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Valid until {formatDate(quotation.validUntil)}. Consider extending
              the validity or creating a new quotation.
            </p>
          </div>
        )}

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Quotation Details</TabsTrigger>
          <TabsTrigger value="items">Line Items</TabsTrigger>
          <TabsTrigger value="customer">Customer Info</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quotation Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Quote Number</label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {quotation.quoteNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-4 w-4" />
                      <Badge variant={getStatusColor(quotation.status) as any}>
                        {quotation.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Issue Date</label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(quotation.issueDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Valid Until</label>
                    <p
                      className={`text-sm ${expired ? "text-red-600 font-medium" : "text-muted-foreground"}`}
                    >
                      {formatDate(quotation.validUntil)}
                    </p>
                  </div>
                </div>

                {quotation.notes && (
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <p className="text-sm text-muted-foreground">
                      {quotation.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(quotation.subtotal)}
                    </span>
                  </div>
                  {quotation.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">Discount:</span>
                      <span className="font-medium">
                        -{formatCurrency(quotation.discountAmount)}
                      </span>
                    </div>
                  )}
                  {quotation.vatAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">VAT:</span>
                      <span className="font-medium">
                        {formatCurrency(quotation.vatAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(quotation.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quotation Items</CardTitle>
              <CardDescription>
                Products and services included in this quotation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>VAT</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotation.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {item.product.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {item.product.sku}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.quantity} {item.product.unit}
                        </TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{item.discount}%</TableCell>
                        <TableCell>{item.vatRate}%</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Customer Name</label>
                <p className="text-sm text-muted-foreground">
                  {quotation.customer.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">
                    {quotation.customer.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-sm text-muted-foreground">
                    {quotation.customer.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Address</label>
                <p className="text-sm text-muted-foreground">
                  {quotation.customer.address || "Not provided"}
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button asChild>
                  <Link to={`/customers/${quotation.customer.id}`}>
                    View Customer Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
