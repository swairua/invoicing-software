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
  User,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { ProformaInvoice } from "@shared/types";
import { dataServiceFactory } from "../services/dataServiceFactory";
import { useToast } from "../hooks/use-toast";
import { safeFormatDateKE } from "@/lib/utils";
import { PDFService } from "../services/pdfService";

export default function ProformaDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [proforma, setProforma] = useState<ProformaInvoice | null>(null);
  const [loading, setLoading] = useState(true);

  const dataService = dataServiceFactory.getDataService();

  useEffect(() => {
    const loadProformaData = async () => {
      if (!id) {
        toast({
          title: "Invalid Proforma",
          description: "No proforma ID provided.",
          variant: "destructive",
        });
        navigate("/proforma");
        return;
      }

      try {
        setLoading(true);
        const foundProforma = await dataService.getProformaInvoiceById(id);

        if (!foundProforma) {
          toast({
            title: "Proforma Not Found",
            description: "The requested proforma invoice could not be found.",
            variant: "destructive",
          });
          navigate("/proforma");
          return;
        }

        setProforma(foundProforma);
      } catch (error) {
        console.error("Error loading proforma:", error);
        toast({
          title: "Error",
          description: "Failed to load proforma details.",
          variant: "destructive",
        });
        navigate("/proforma");
      } finally {
        setLoading(false);
      }
    };

    loadProformaData();
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
      case "converted":
        return "success";
      case "sent":
        return "default";
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
      case "converted":
        return CheckCircle;
      case "sent":
        return Send;
      case "draft":
        return Edit;
      case "expired":
        return Clock;
      default:
        return FileText;
    }
  };

  const isExpired = (proforma: ProformaInvoice) => {
    return new Date(proforma.validUntil) < new Date();
  };

  const convertToInvoice = () => {
    if (!proforma) return;

    navigate("/invoices/new", {
      state: {
        convertFrom: "proforma",
        sourceData: proforma,
      },
    });
  };

  const handleDownloadPDF = async () => {
    if (!proforma) return;

    try {
      await PDFService.generateProformaPDF(proforma, true);
      toast({
        title: "PDF Downloaded",
        description: "Proforma PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    if (!proforma) return;
    navigate(`/proforma/${proforma.id}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!proforma) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold">Proforma Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The requested proforma invoice could not be found.
        </p>
        <Button asChild>
          <Link to="/proforma">Back to Proforma Invoices</Link>
        </Button>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(proforma.status);
  const expired = isExpired(proforma);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/proforma">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Proforma Invoices
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {proforma.proformaNumber}
            </h1>
            <p className="text-muted-foreground">
              {proforma.customer?.name || "Unknown Customer"} • Created{" "}
              {formatDate(proforma.issueDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          {proforma.status === "sent" && !expired && (
            <Button onClick={convertToInvoice}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Convert to Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {expired && proforma.status !== "converted" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">
              This proforma has expired
            </span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Valid until {formatDate(proforma.validUntil)}. Consider creating a
            new proforma or converting to invoice.
          </p>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Proforma Details</TabsTrigger>
          <TabsTrigger value="items">Line Items</TabsTrigger>
          <TabsTrigger value="customer">Customer Info</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Proforma Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Proforma Number
                    </label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {proforma.proformaNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-4 w-4" />
                      <Badge variant={getStatusColor(proforma.status) as any}>
                        {proforma.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Issue Date</label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(proforma.issueDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Valid Until</label>
                    <p
                      className={`text-sm ${expired ? "text-red-600 font-medium" : "text-muted-foreground"}`}
                    >
                      {formatDate(proforma.validUntil)}
                    </p>
                  </div>
                </div>

                {proforma.notes && (
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <p className="text-sm text-muted-foreground">
                      {proforma.notes}
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
                      {formatCurrency(proforma.subtotal)}
                    </span>
                  </div>
                  {proforma.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">Discount:</span>
                      <span className="font-medium">
                        -{formatCurrency(proforma.discountAmount)}
                      </span>
                    </div>
                  )}
                  {proforma.vatAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">VAT:</span>
                      <span className="font-medium">
                        {formatCurrency(proforma.vatAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(proforma.total)}
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
              <CardTitle>Proforma Items</CardTitle>
              <CardDescription>
                Products and services included in this proforma invoice
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
                    {proforma.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {item.product?.name || item.product_name || 'Unknown Product'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.product_description || item.product?.description || 'No description'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.quantity} {item.product?.unit || 'units'}
                        </TableCell>
                        <TableCell>{formatCurrency(item.unit_price || item.unitPrice || 0)}</TableCell>
                        <TableCell>{item.discount_percentage || item.discount || 0}%</TableCell>
                        <TableCell>{item.tax_rate || item.vatRate || 0}%</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.line_total || item.total || 0)}
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
                  {proforma.customer.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">
                    {proforma.customer.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-sm text-muted-foreground">
                    {proforma.customer.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Address</label>
                <p className="text-sm text-muted-foreground">
                  {proforma.customer.address || "Not provided"}
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button asChild>
                  <Link to={`/customers/${proforma.customer.id}`}>
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
