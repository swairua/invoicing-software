import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Calculator } from "lucide-react";
import { cn, safeCurrencyFormat } from "@/lib/utils";

interface VATPeriod {
  id: string;
  name: string;
  rate: number;
  description?: string;
  isDefault?: boolean;
}

interface LineItemVATSelectorProps {
  enabled: boolean;
  selectedRate: number;
  onVATChange: (enabled: boolean, rate: number) => void;
  itemSubtotal: number;
  className?: string;
}

const AVAILABLE_VAT_RATES: VATPeriod[] = [
  { id: "vat-16", name: "Standard VAT", rate: 16, description: "Standard Kenya VAT rate", isDefault: true },
  { id: "vat-0", name: "Zero-rated", rate: 0, description: "Export goods, essential goods" },
  { id: "vat-exempt", name: "VAT Exempt", rate: 0, description: "Medical supplies, educational materials" },
  { id: "vat-8", name: "Reduced VAT", rate: 8, description: "Tourism services (where applicable)" },
];

export default function LineItemVATSelector({
  enabled,
  selectedRate,
  onVATChange,
  itemSubtotal,
  className = "",
}: LineItemVATSelectorProps) {
  const calculateVATAmount = () => {
    if (!enabled) return 0;
    return (itemSubtotal * selectedRate) / 100;
  };

  const selectedVAT = AVAILABLE_VAT_RATES.find(vat => vat.rate === selectedRate) || AVAILABLE_VAT_RATES[0];

  return (
    <div className={cn("space-y-3", className)}>
      {/* VAT Toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Apply VAT
        </Label>
        <div className="flex items-center gap-2">
          <Switch
            checked={enabled}
            onCheckedChange={(checked) => onVATChange(checked, selectedRate)}
          />
          <span className="text-xs text-muted-foreground">
            {enabled ? 'On' : 'Off'}
          </span>
        </div>
      </div>

      {/* VAT Rate Selection */}
      {enabled && (
        <div className="space-y-2">
          <div className="grid gap-2">
            <Label className="text-sm">VAT Rate</Label>
            <Select
              value={selectedRate.toString()}
              onValueChange={(value) => onVATChange(enabled, parseFloat(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select VAT rate" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_VAT_RATES.map((vat) => (
                  <SelectItem key={vat.id} value={vat.rate.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="font-medium">{vat?.name || 'Unknown VAT'}</span>
                        {vat.description && (
                          <span className="text-xs text-muted-foreground">
                            {vat.description}
                          </span>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {vat.rate}%
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* VAT Calculation Display */}
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{safeCurrencyFormat(itemSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>VAT ({selectedRate}%):</span>
                <span>{safeCurrencyFormat(calculateVATAmount())}</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-1">
                <span>Total with VAT:</span>
                <span>{safeCurrencyFormat(itemSubtotal + calculateVATAmount())}</span>
              </div>
            </div>
          </div>

          {/* Selected VAT Info */}
          <div className="flex items-center gap-2">
            <Badge variant={selectedRate === 0 ? "secondary" : "default"}>
              {selectedVAT?.name || 'Unknown VAT'} - {selectedRate}%
            </Badge>
            {selectedVAT.description && (
              <span className="text-xs text-muted-foreground">
                {selectedVAT.description}
              </span>
            )}
          </div>
        </div>
      )}

      {/* No VAT Message */}
      {!enabled && (
        <div className="bg-muted/20 p-2 rounded text-sm text-muted-foreground">
          No VAT will be applied to this line item
        </div>
      )}
    </div>
  );
}
