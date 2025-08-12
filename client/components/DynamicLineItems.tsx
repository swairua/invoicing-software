import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Plus, Trash2, Search, Package } from "lucide-react";
import { Product, LineItemTax } from "@shared/types";
import LineItemTaxSelector from "./LineItemTaxSelector";
import { getAvailableTaxes } from "@shared/taxUtils";
import { useToast } from "../hooks/use-toast";

export interface LineItem {
  id: string;
  productId: string;
  quantity: string;
  unitPrice: string;
  discount: string;
  lineItemTaxes?: LineItemTax[];
}

interface DynamicLineItemsProps {
  items: LineItem[];
  products: Product[];
  onItemsChange: (items: LineItem[]) => void;
  formatCurrency: (amount: number) => string;
  calculateItemTotal: (item: LineItem) => number;
}

export default function DynamicLineItems({
  items,
  products,
  onItemsChange,
  formatCurrency,
  calculateItemTotal,
}: DynamicLineItemsProps) {
  const { toast } = useToast();
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  // Auto-generate new empty item when last item is filled
  const [nextId, setNextId] = useState(1);

  // Initialize with one empty item if none exist
  useEffect(() => {
    if (items.length === 0) {
      addNewEmptyItem();
    }
  }, []);

  useEffect(() => {
    if (productSearch) {
      const filtered = products.filter(
        (product) =>
          product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.sku?.toLowerCase().includes(productSearch.toLowerCase()),
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [productSearch, products]);

  const addNewEmptyItem = () => {
    const newItem: LineItem = {
      id: `item-${nextId}`,
      productId: "",
      quantity: "1",
      unitPrice: "",
      discount: "0",
      lineItemTaxes: [],
    };
    onItemsChange([...items, newItem]);
    setNextId(nextId + 1);
  };

  const updateItem = (
    index: number,
    field: keyof LineItem,
    value: string | LineItemTax[],
  ) => {
    const updatedItems = [...items];
    if (field === "lineItemTaxes") {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value as LineItemTax[],
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value as string,
      };
    }
    onItemsChange(updatedItems);

    // Auto-add new item if this is the last item and it has essential data
    const currentItem = updatedItems[index];
    const isLastItem = index === items.length - 1;
    const hasEssentialData =
      currentItem.productId && currentItem.quantity && currentItem.unitPrice;

    if (isLastItem && hasEssentialData && field !== "lineItemTaxes") {
      setTimeout(() => addNewEmptyItem(), 100);
    }
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      onItemsChange(updatedItems);
    } else {
      toast({
        title: "Cannot Remove",
        description: "At least one item is required.",
        variant: "destructive",
      });
    }
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      updateItem(index, "productId", productId);
      updateItem(index, "unitPrice", product.sellingPrice.toString());
    }
  };

  const duplicateItem = (index: number) => {
    const itemToDuplicate = items[index];
    const duplicatedItem: LineItem = {
      ...itemToDuplicate,
      id: `item-${nextId}`,
    };
    const updatedItems = [...items];
    updatedItems.splice(index + 1, 0, duplicatedItem);
    onItemsChange(updatedItems);
    setNextId(nextId + 1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Line Items
        </CardTitle>
        <CardDescription>
          Add products and services. New item fields will appear automatically
          as you fill them out.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Search */}
        <div className="space-y-2">
          <Label>Search Products</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Discount %</TableHead>
                <TableHead>Additional Taxes</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const product = products.find((p) => p.id === item.productId);
                const itemTotal = item.productId ? calculateItemTotal(item) : 0;
                const isEmptyItem = !item.productId;

                return (
                  <TableRow
                    key={item.id}
                    className={isEmptyItem ? "bg-muted/20" : ""}
                  >
                    <TableCell>
                      <div className="space-y-2">
                        <Select
                          value={item.productId}
                          onValueChange={(value) =>
                            handleProductSelect(index, value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {filteredProducts.slice(0, 30).map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                <div>
                                  <div className="font-medium">
                                    {product.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {product.sku} •{" "}
                                    {formatCurrency(product.sellingPrice)}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {product && (
                          <div className="text-xs text-muted-foreground">
                            SKU: {product.sku}
                            {product.taxable && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                VAT {product.taxRate || 16}%
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                        className="w-20"
                        min="0.01"
                        step="0.01"
                        placeholder="1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(index, "unitPrice", e.target.value)
                        }
                        className="w-24"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.discount}
                        onChange={(e) =>
                          updateItem(index, "discount", e.target.value)
                        }
                        className="w-16"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      {!isEmptyItem && (
                        <LineItemTaxSelector
                          selectedTaxes={item.lineItemTaxes || []}
                          availableTaxes={getAvailableTaxes()}
                          onTaxesChange={(taxes) =>
                            updateItem(index, "lineItemTaxes", taxes)
                          }
                          itemSubtotal={
                            parseFloat(item.quantity || "0") *
                              parseFloat(item.unitPrice || "0") -
                            (parseFloat(item.quantity || "0") *
                              parseFloat(item.unitPrice || "0") *
                              parseFloat(item.discount || "0")) /
                              100
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {!isEmptyItem && formatCurrency(itemTotal)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!isEmptyItem && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateItem(index)}
                            title="Duplicate item"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Manual Add Button */}
        <div className="flex justify-start">
          <Button type="button" variant="outline" onClick={addNewEmptyItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Another Item
          </Button>
        </div>

        {items.filter((item) => item.productId).length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Items Added Yet</h3>
            <p className="text-muted-foreground">
              Select a product from the dropdown above to get started.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
