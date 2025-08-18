import React, { useState, useEffect } from "react";
import { useFieldArray, Control } from "react-hook-form";
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
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "./ui/form";
import { Plus, Trash2, Search, Package } from "lucide-react";
import { Product, LineItemTax } from "@shared/types";
import LineItemTaxSelector from "./LineItemTaxSelector";
import { getAvailableTaxes } from "@shared/taxUtils";
import { useToast } from "../hooks/use-toast";
import { LineItemFormData } from "@shared/validation";

export interface LineItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineItemTaxes?: LineItemTax[];
}

interface DynamicLineItemsHookFormProps {
  control: Control<any>;
  name: string;
  products: Product[];
  formatCurrency: (amount: number) => string;
  calculateItemTotal: (item: LineItem) => number;
}

export default function DynamicLineItemsHookForm({
  control,
  name,
  products,
  formatCurrency,
  calculateItemTotal,
}: DynamicLineItemsHookFormProps) {
  const { toast } = useToast();
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name,
  });

  // Auto-generate new empty item when last item is filled
  const [nextId, setNextId] = useState(1);

  // Initialize with one empty item if none exist
  useEffect(() => {
    if (fields.length === 0) {
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
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      lineItemTaxes: [],
    };
    append(newItem);
    setNextId(nextId + 1);
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
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
      const currentItem = fields[index] as LineItem;
      update(index, {
        ...currentItem,
        productId,
        unitPrice: product.sellingPrice,
      });
    }
  };

  const duplicateItem = (index: number) => {
    const itemToDuplicate = fields[index] as LineItem;
    const duplicatedItem: LineItem = {
      ...itemToDuplicate,
      id: `item-${nextId}`,
    };
    append(duplicatedItem);
    setNextId(nextId + 1);
  };

  const handleAutoAddNewItem = (index: number, item: LineItem) => {
    const isLastItem = index === fields.length - 1;
    const hasEssentialData = item.productId && item.quantity > 0 && item.unitPrice > 0;

    if (isLastItem && hasEssentialData) {
      setTimeout(() => addNewEmptyItem(), 100);
    }
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
              {fields.map((field, index) => {
                const item = field as LineItem;
                const product = products.find((p) => p.id === item.productId);
                const itemTotal = item.productId ? calculateItemTotal(item) : 0;
                const isEmptyItem = !item.productId;

                return (
                  <TableRow
                    key={field.id}
                    className={isEmptyItem ? "bg-muted/20" : ""}
                  >
                    <TableCell>
                      <div className="space-y-2">
                        <FormField
                          control={control}
                          name={`${name}.${index}.productId`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormControl>
                                <Select
                                  value={formField.value}
                                  onValueChange={(value) => {
                                    formField.onChange(value);
                                    handleProductSelect(index, value);
                                  }}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select product" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[200px]">
                                    {filteredProducts.slice(0, 30).map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        <div>
                                          <div className="font-medium">
                                            {product?.name || 'Unknown Product'}
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
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                      <FormField
                        control={control}
                        name={`${name}.${index}.quantity`}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                {...formField}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  formField.onChange(value);
                                  handleAutoAddNewItem(index, { ...item, quantity: value });
                                }}
                                className="w-20"
                                min="0.01"
                                step="0.01"
                                placeholder="1"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`${name}.${index}.unitPrice`}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                {...formField}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  formField.onChange(value);
                                  handleAutoAddNewItem(index, { ...item, unitPrice: value });
                                }}
                                className="w-24"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`${name}.${index}.discount`}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                {...formField}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  formField.onChange(value);
                                }}
                                className="w-16"
                                min="0"
                                max="100"
                                step="0.01"
                                placeholder="0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      {!isEmptyItem && (
                        <FormField
                          control={control}
                          name={`${name}.${index}.lineItemTaxes`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormControl>
                                <LineItemTaxSelector
                                  selectedTaxes={formField.value || []}
                                  availableTaxes={getAvailableTaxes()}
                                  onTaxesChange={formField.onChange}
                                  itemSubtotal={
                                    item.quantity * item.unitPrice -
                                    (item.quantity * item.unitPrice * item.discount) / 100
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
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
                          disabled={fields.length === 1}
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

        {fields.filter((field) => (field as LineItem).productId).length === 0 && (
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
