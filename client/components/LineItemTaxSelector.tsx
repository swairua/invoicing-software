import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { Plus, X, Calculator } from "lucide-react";
import { LineItemTax } from "@shared/types";
import { getAvailableTaxes } from "@shared/taxUtils";

interface LineItemTaxSelectorProps {
  selectedTaxes: LineItemTax[];
  onTaxesChange: (taxes: LineItemTax[]) => void;
  itemTotal: number;
  className?: string;
}

export default function LineItemTaxSelector({
  selectedTaxes,
  onTaxesChange,
  itemTotal,
  className = "",
}: LineItemTaxSelectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availableTaxes] = useState<LineItemTax[]>(getAvailableTaxes());

  const handleTaxToggle = (tax: LineItemTax, checked: boolean) => {
    if (checked) {
      // Add tax with calculated amount
      const taxAmount = itemTotal * (tax.rate / 100);
      const newTax = { ...tax, amount: taxAmount };
      onTaxesChange([...selectedTaxes, newTax]);
    } else {
      // Remove tax
      onTaxesChange(selectedTaxes.filter((t) => t.id !== tax.id));
    }
  };

  const removeTax = (taxId: string) => {
    onTaxesChange(selectedTaxes.filter((t) => t.id !== taxId));
  };

  const calculateTotalTaxAmount = () => {
    return selectedTaxes.reduce(
      (sum, tax) => sum + itemTotal * (tax.rate / 100),
      0,
    );
  };

  const isSelected = (taxId: string) => {
    return selectedTaxes.some((t) => t.id === taxId);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Line Item Taxes</Label>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Tax
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Select Line Item Taxes</DialogTitle>
              <DialogDescription>
                Choose additional taxes to apply to this line item
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Calculator className="h-4 w-4" />
                  <span>
                    Item Total:{" "}
                    <strong>KES {itemTotal.toLocaleString()}</strong>
                  </span>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Tax Name</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableTaxes.map((tax) => {
                    const selected = isSelected(tax.id);
                    const taxAmount = itemTotal * (tax.rate / 100);

                    return (
                      <TableRow key={tax.id}>
                        <TableCell>
                          <Checkbox
                            checked={selected}
                            onCheckedChange={(checked) =>
                              handleTaxToggle(tax, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {tax?.name || 'Unknown Tax'}
                        </TableCell>
                        <TableCell>{tax.rate}%</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tax.isCompoundTax ? "secondary" : "outline"
                            }
                            className="text-xs"
                          >
                            {tax.isCompoundTax ? "Compound" : "Simple"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          KES {taxAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {selectedTaxes.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Additional Tax:</span>
                    <span>
                      KES {calculateTotalTaxAmount().toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Selected Taxes Display */}
      {selectedTaxes.length > 0 ? (
        <div className="space-y-2">
          <div className="grid gap-2">
            {selectedTaxes.map((tax) => {
              const taxAmount = itemTotal * (tax.rate / 100);
              return (
                <div
                  key={tax.id}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{tax.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {tax.rate}%
                    </Badge>
                    {tax.isCompoundTax && (
                      <Badge variant="secondary" className="text-xs">
                        Compound
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      KES {taxAmount.toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTax(tax.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center pt-2 border-t text-sm font-medium">
            <span>Total Additional Tax:</span>
            <span>KES {calculateTotalTaxAmount().toLocaleString()}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No additional taxes selected
        </p>
      )}
    </div>
  );
}
