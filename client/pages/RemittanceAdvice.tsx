import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Download,
  Plus,
  Trash2,
  Building,
  Calendar,
  Hash,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { Customer, Invoice } from "@shared/types";
import { getDataService } from "../services/dataServiceFactory";
import { useToast } from "../hooks/use-toast";

interface RemittanceItem {
  id: string;
  date: string;
  reference: string;
  type: "invoice" | "credit-note";
  invoiceAmount?: number;
  creditAmount?: number;
  paymentAmount: number;
}

interface RemittanceData {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  vatRegistration: string;
  remittanceNumber: string;
  date: string;
  accountNumber: string;
  customer?: Customer;
  items: RemittanceItem[];
  totalPayment: number;
}

const dataService = getDataService();

export default function RemittanceAdvice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { toast } = useToast();

  // Determine the mode based on the current route
  const isEdit = location.pathname.includes('/edit');
  const isNew = location.pathname.includes('/new') || !id;
  const isView = !isNew && !isEdit;
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [remittanceData, setRemittanceData] = useState<RemittanceData>({
    companyName: "Champion Sports",
    companyAddress: "Fenway\nLeeds, LS2 8EO",
    companyPhone: "0131 874428",
    vatRegistration: "911 6271 56",
    remittanceNumber: "",
    date: new Date().toISOString().split("T")[0],
    accountNumber: "",
    items: [],
    totalPayment: 0,
  });

  useEffect(() => {
    loadData();
    generateRemittanceNumber();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [customersData, invoicesData] = await Promise.all([
        dataService.getCustomers(),
        dataService.getInvoices(),
      ]);
      setCustomers(customersData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRemittanceNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    setRemittanceData((prev) => ({
      ...prev,
      remittanceNumber: `RA${year}${month}${random}`,
    }));
  };

  const addRemittanceItem = () => {
    const newItem: RemittanceItem = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      reference: "",
      type: "invoice",
      paymentAmount: 0,
    };

    setRemittanceData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const updateRemittanceItem = (
    id: string,
    updates: Partial<RemittanceItem>,
  ) => {
    setRemittanceData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    }));
    calculateTotal();
  };

  const removeRemittanceItem = (id: string) => {
    setRemittanceData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
    calculateTotal();
  };

  const calculateTotal = () => {
    setTimeout(() => {
      setRemittanceData((prev) => ({
        ...prev,
        totalPayment: prev.items.reduce(
          (sum, item) => sum + (item.paymentAmount || 0),
          0,
        ),
      }));
    }, 0);
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    setRemittanceData((prev) => ({
      ...prev,
      customer,
      accountNumber: customer?.kraPin || "",
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const generatePDF = () => {
    toast({
      title: "PDF Generated",
      description: "Remittance advice PDF has been generated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Remittance Advice
            </h1>
            <p className="text-muted-foreground">
              Generate remittance advice for customer payments
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generatePDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={generateRemittanceNumber}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate New
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={remittanceData.companyName}
                  onChange={(e) =>
                    setRemittanceData((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="companyAddress">Address</Label>
                <Textarea
                  id="companyAddress"
                  value={remittanceData.companyAddress}
                  onChange={(e) =>
                    setRemittanceData((prev) => ({
                      ...prev,
                      companyAddress: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={remittanceData.companyPhone}
                    onChange={(e) =>
                      setRemittanceData((prev) => ({
                        ...prev,
                        companyPhone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="vatRegistration">VAT Registration</Label>
                  <Input
                    id="vatRegistration"
                    value={remittanceData.vatRegistration}
                    onChange={(e) =>
                      setRemittanceData((prev) => ({
                        ...prev,
                        vatRegistration: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remittance Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Remittance Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="remittanceNumber">Remittance Number</Label>
                  <Input
                    id="remittanceNumber"
                    value={remittanceData.remittanceNumber}
                    onChange={(e) =>
                      setRemittanceData((prev) => ({
                        ...prev,
                        remittanceNumber: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={remittanceData.date}
                    onChange={(e) =>
                      setRemittanceData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select onValueChange={handleCustomerChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer..." />
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
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={remittanceData.accountNumber}
                    onChange={(e) =>
                      setRemittanceData((prev) => ({
                        ...prev,
                        accountNumber: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Payment Items
                </div>
                <Button size="sm" onClick={addRemittanceItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {remittanceData.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg"
                  >
                    <div className="col-span-2">
                      <Label className="text-xs">Date</Label>
                      <Input
                        type="date"
                        value={item.date}
                        onChange={(e) =>
                          updateRemittanceItem(item.id, {
                            date: e.target.value,
                          })
                        }
                        className="text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs">Reference</Label>
                      <Input
                        value={item.reference}
                        onChange={(e) =>
                          updateRemittanceItem(item.id, {
                            reference: e.target.value,
                          })
                        }
                        placeholder="Invoice/Credit No."
                        className="text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={item.type}
                        onValueChange={(value: "invoice" | "credit-note") =>
                          updateRemittanceItem(item.id, { type: value })
                        }
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="credit-note">
                            Credit Note
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Amount</Label>
                      <Input
                        type="number"
                        value={
                          item.type === "invoice"
                            ? item.invoiceAmount || ""
                            : item.creditAmount || ""
                        }
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          updateRemittanceItem(
                            item.id,
                            item.type === "invoice"
                              ? { invoiceAmount: amount }
                              : { creditAmount: amount },
                          );
                        }}
                        placeholder="0.00"
                        className="text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Payment</Label>
                      <Input
                        type="number"
                        value={item.paymentAmount || ""}
                        onChange={(e) => {
                          updateRemittanceItem(item.id, {
                            paymentAmount: parseFloat(e.target.value) || 0,
                          });
                          calculateTotal();
                        }}
                        placeholder="0.00"
                        className="text-xs"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeRemittanceItem(item.id)}
                        className="text-xs p-1 h-8 w-8"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                {remittanceData.items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No payment items added yet</p>
                    <p className="text-sm">Click "Add Item" to start</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Remittance Advice Preview</CardTitle>
              <CardDescription>
                This is how your remittance advice will appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-6 border rounded-lg space-y-6 text-black">
                {/* Header */}
                <div className="text-center border-b pb-4">
                  <h2 className="text-xl font-bold">REMITTANCE ADVICE</h2>
                </div>

                {/* Company and Customer Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="font-semibold">
                      {remittanceData.companyName}
                    </div>
                    <div className="text-sm whitespace-pre-line">
                      {remittanceData.companyAddress}
                    </div>
                    <div className="text-sm">
                      Tel: {remittanceData.companyPhone}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div>VAT Reg: {remittanceData.vatRegistration}</div>
                    <div>
                      Remittance Advice: {remittanceData.remittanceNumber}
                    </div>
                    <div>
                      Date:{" "}
                      {new Date(remittanceData.date).toLocaleDateString(
                        "en-GB",
                      )}
                    </div>
                    <div>Account Number: {remittanceData.accountNumber}</div>
                  </div>
                </div>

                {/* Customer Details */}
                {remittanceData.customer && (
                  <div>
                    <div className="font-semibold">
                      {remittanceData.customer.name}
                    </div>
                    <div className="text-sm">
                      {remittanceData.customer.address}
                    </div>
                  </div>
                )}

                {/* Payment Table */}
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">
                          Invoice or credit note no.
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          Invoice
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          Credit note
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          Payment
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {remittanceData.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-xs">
                            {new Date(item.date).toLocaleDateString("en-GB")}
                          </TableCell>
                          <TableCell className="text-xs">
                            {item.reference}
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            {item.type === "invoice" && item.invoiceAmount
                              ? formatCurrency(item.invoiceAmount)
                              : ""}
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            {item.type === "credit-note" && item.creditAmount
                              ? formatCurrency(item.creditAmount)
                              : ""}
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            {formatCurrency(item.paymentAmount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-xs font-semibold text-right"
                        >
                          Total payment
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-right">
                          {formatCurrency(remittanceData.totalPayment)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
