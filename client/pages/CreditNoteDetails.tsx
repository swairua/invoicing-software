import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Download,
  Edit,
  Check,
  X,
  FileText,
  Calendar,
  User,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { CreditNote } from "@shared/types";
import { dataServiceFactory } from "@/services/dataServiceFactory";
import { toast } from "@/hooks/use-toast";

export default function CreditNoteDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [creditNote, setCreditNote] = useState<CreditNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<"draft" | "issued" | "applied">(
    "draft",
  );

  useEffect(() => {
    if (id) {
      loadCreditNote();
    }
  }, [id]);

  const loadCreditNote = async () => {
    try {
      const dataService = dataServiceFactory.getDataService();
      const creditNoteData = await dataService.getCreditNote(id!);
      setCreditNote(creditNoteData);
      setNewStatus(creditNoteData.status);
    } catch (error) {
      console.error("Error loading credit note:", error);
      toast({
        title: "Error",
        description: "Failed to load credit note details",
        variant: "destructive",
      });
      navigate("/credit-notes");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!creditNote || newStatus === creditNote.status) {
      setStatusUpdateOpen(false);
      return;
    }

    try {
      const dataService = dataServiceFactory.getDataService();
      const updatedCreditNote = await dataService.updateCreditNote(
        creditNote.id,
        {
          ...creditNote,
          status: newStatus,
          updatedAt: new Date(),
        },
      );

      setCreditNote(updatedCreditNote);
      setStatusUpdateOpen(false);

      toast({
        title: "Success",
        description: `Credit note status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update credit note status",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // This would integrate with the PDF service
      toast({
        title: "Download Started",
        description: "Credit note PDF download started",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "outline",
      issued: "default",
      applied: "secondary",
    } as const;

    const colors = {
      draft: "text-gray-600",
      issued: "text-blue-600",
      applied: "text-green-600",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        <span className={colors[status as keyof typeof colors]}>
          {status.toUpperCase()}
        </span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!creditNote) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Credit note not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/credit-notes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Credit Notes
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Credit Note {creditNote.creditNumber}
            </h1>
            <p className="text-muted-foreground">
              Issued to {creditNote.customer.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Credit Note Status</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Status</Label>
                  <div>{getStatusBadge(creditNote.status)}</div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newStatus">New Status</Label>
                  <Select
                    value={newStatus}
                    onValueChange={(value: any) => setNewStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="issued">Issued</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStatusUpdateOpen(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleStatusUpdate}>
                    <Check className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Credit Note Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Credit Note Information</CardTitle>
                {getStatusBadge(creditNote.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Receipt className="h-4 w-4" />
                    Credit Note Number
                  </div>
                  <p className="font-medium">{creditNote.creditNumber}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Issue Date
                  </div>
                  <p className="font-medium">
                    {format(new Date(creditNote.issueDate), "MMMM dd, yyyy")}
                  </p>
                </div>
                {creditNote.invoiceId && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      Related Invoice
                    </div>
                    <p className="font-medium">
                      <Link
                        to={`/invoices/${creditNote.invoiceId}`}
                        className="text-primary hover:underline"
                      >
                        View Invoice
                      </Link>
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Created By
                  </div>
                  <p className="font-medium">{creditNote.createdBy}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Reason for Credit Note</h4>
                <p className="text-sm text-muted-foreground">
                  {creditNote.reason}
                </p>
              </div>

              {creditNote.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Additional Notes</h4>
                    <p className="text-sm text-muted-foreground">
                      {creditNote.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>VAT Rate</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditNote.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {item.product.sku}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        KES {item.unitPrice.toLocaleString()}
                      </TableCell>
                      <TableCell>{item.vatRate}%</TableCell>
                      <TableCell className="text-right">
                        KES {item.total.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">{creditNote.customer.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {creditNote.customer.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {creditNote.customer.phone}
                </p>
              </div>
              <Separator />
              <div>
                <h5 className="font-medium mb-2">Address</h5>
                <p className="text-sm text-muted-foreground">
                  {creditNote.customer.address}
                </p>
              </div>
              <div>
                <h5 className="font-medium mb-2">KRA PIN</h5>
                <p className="text-sm text-muted-foreground">
                  {creditNote.customer.kraPin}
                </p>
              </div>
              <div className="pt-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/customers/${creditNote.customer.id}`}>
                    View Customer Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>KES {creditNote.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT Amount</span>
                  <span>KES {creditNote.vatAmount.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Credit</span>
                  <span>KES {creditNote.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/credit-notes/${creditNote.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Credit Note
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
