import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Archive,
  Tag,
  Plus,
  X,
  Barcode,
  Weight,
  Ruler,
  MapPin,
} from "lucide-react";
import { Product, ProductCategory } from "@shared/types";
import {
  productSchema,
  ProductFormData,
  productVariantSchema,
  ProductVariantFormData,
} from "@shared/validation";
import { dataServiceFactory } from "../services/dataServiceFactory";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/use-auth";

export default function NewProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const dataService = dataServiceFactory.getDataService();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Main form using React Hook Form
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      barcode: "",
      category: "",
      subcategory: "",
      brand: "",
      supplier: "",
      unit: "piece",
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        unit: "cm",
      },
      purchasePrice: 0,
      sellingPrice: 0,
      wholesalePrice: 0,
      retailPrice: 0,
      minStock: 0,
      maxStock: 1000,
      currentStock: 0,
      reorderLevel: 0,
      location: "",
      binLocation: "",
      tags: "",
      taxable: true,
      taxRate: 16,
      trackInventory: true,
      allowBackorders: false,
      hasVariants: false,
      status: "active",
      isActive: true,
      notes: "",
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadCategories();
    if (id) {
      setIsEditMode(true);
      loadProduct(id);
    }
  }, [id]);

  // Setup categories if none exist
  useEffect(() => {
    if (categories.length === 0) {
      console.log("🔧 Setting up categories automatically...");
      loadCategories();
    }
  }, [categories.length]);

  const loadCategories = async () => {
    try {
      const categoriesData = await dataService.getCategories();
      console.log("📦 Categories loaded:", categoriesData);

      // If no categories, try to set them up automatically
      if (!categoriesData || categoriesData.length === 0) {
        console.log("🔧 No categories found, setting up sample categories...");
        try {
          const setupResponse = await fetch("/api/categories/setup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-company-id":
                user?.companyId || "00000000-0000-0000-0000-000000000001",
            },
          });

          if (setupResponse.ok) {
            const setupData = await setupResponse.json();
            console.log("✅ Categories setup result:", setupData);

            // Reload categories after setup
            const newCategoriesData = await dataService.getCategories();
            setCategories(newCategoriesData || []);
          } else {
            console.log("❌ Failed to setup categories");
            setCategories([]);
          }
        } catch (setupError) {
          console.error("Failed to setup categories:", setupError);
          setCategories([]);
        }
      } else {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      // Set empty array as fallback
      setCategories([]);
      toast({
        title: "Error",
        description: "Failed to load product categories",
        variant: "destructive",
      });
    }
  };

  // Helper function to convert database values to proper booleans
  const toBool = (value: any, defaultValue: boolean = false): boolean => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      const lowerValue = value.toLowerCase();
      return (
        lowerValue === "true" || lowerValue === "1" || lowerValue === "yes"
      );
    }
    return Boolean(value);
  };

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      console.log("🔍 Loading product:", productId);

      const productData = await dataService.getProduct(productId);
      console.log("📦 Received product data:", productData);

      if (!productData) {
        console.log("❌ No product data received");
        toast({
          title: "Product Not Found",
          description:
            "The requested product could not be found. Redirecting to products list.",
          variant: "destructive",
        });
        navigate("/products");
        return;
      }

      console.log("🔍 Category ID:", productData.categoryId);
      console.log("🔍 Unit of Measure:", productData.unitOfMeasure);
      console.log("🔍 Available fields:", Object.keys(productData));

      if (productData) {
        setProduct(productData);

        // Map the product data to form structure
        const formData = {
          name: productData.name,
          description: productData.description || "",
          sku: productData.sku,
          barcode: productData.barcode || "",
          category: productData.categoryId || productData.category || "",
          subcategory: productData.subcategory || "",
          brand: productData.brand || "",
          supplier: productData.supplier || "",
          unit: productData.unitOfMeasure || productData.unit || "piece",
          weight: Number(productData.weight) || 0,
          dimensions: productData.dimensions || {
            length: Number(productData.length) || 0,
            width: Number(productData.width) || 0,
            height: Number(productData.height) || 0,
            unit: productData.dimensionUnit || "cm",
          },
          purchasePrice: Number(productData.purchasePrice) || 0,
          sellingPrice: Number(productData.sellingPrice) || 0,
          wholesalePrice: Number(productData.wholesalePrice) || 0,
          retailPrice: Number(productData.retailPrice) || 0,
          minStock: Number(productData.minStock) || 0,
          maxStock: Number(productData.maxStock) || 1000,
          currentStock: Number(productData.currentStock) || 0,
          reorderLevel: Number(productData.reorderLevel) || 0,
          location: productData.location || "",
          binLocation: productData.binLocation || "",
          tags: Array.isArray(productData.tags)
            ? productData.tags.join(", ")
            : typeof productData.tags === "string"
              ? productData.tags
              : "",
          taxable: toBool(productData.isTaxable ?? productData.taxable, true),
          taxRate: Number(productData.taxRate) || 16,
          trackInventory: toBool(productData.trackInventory, true),
          allowBackorders: toBool(productData.allowBackorders, false),
          hasVariants: toBool(productData.hasVariants, false),
          status: productData.status || "active",
          isActive: toBool(productData.isActive, true),
          notes: productData.notes || "",
        };

        console.log("📋 Mapped form data:", formData);
        console.log("🏷️ Categories available:", categories.length);
        console.log("🏷️ Selected category ID:", formData.category);
        console.log("📦 Unit from database:", productData.unitOfMeasure);
        console.log("📦 Unit mapped to form:", formData.unit);

        // Populate form with existing product data
        console.log("🔄 Resetting form with data:", formData);
        form.reset(formData);

        // Force Select components to update after form reset
        setTimeout(() => {
          console.log("✅ Form values after reset:", form.getValues());
          console.log("🏷️ Category field value:", form.getValues("category"));
          console.log("📦 Unit field value:", form.getValues("unit"));

          // Manually trigger field updates to ensure Select components refresh
          const currentValues = form.getValues();
          form.setValue("category", currentValues.category);
          form.setValue("unit", currentValues.unit);

          console.log("🔄 Forced field updates completed");

          // Force re-render of Select components by triggering state change
          setProduct({ ...productData });
        }, 200);
      }
    } catch (error) {
      console.error("❌ Failed to load product:", error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    console.log("🎯 onSubmit called with data:", data);
    try {
      setLoading(true);

      console.log("🚀 Form submission started");
      console.log("���� Form data:", data);
      console.log("🔧 Is edit mode:", isEditMode);
      console.log("📦 Product:", product);

      if (isEditMode && product) {
        console.log("��️ Updating existing product:", product.id);

        const updateData = {
          ...data,
          categoryId: data.category, // Map category field to categoryId for backend
          id: product.id,
          companyId: product.companyId,
          createdAt: product.createdAt,
          updatedAt: new Date(),
        };

        console.log("📤 Update data:", updateData);

        const result = await dataService.updateProduct(product.id, updateData);

        console.log("✅ Update result:", result);

        toast({
          title: "Product Updated",
          description: `Product "${data.name}" has been updated successfully.`,
        });

        // Refresh the product data to show updated values
        await loadProduct(product.id);
      } else {
        console.log("➕ Creating new product");

        const createData = {
          ...data,
          categoryId: data.category, // Map category field to categoryId for backend
          companyId: user?.companyId || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        console.log("📤 Create data:", createData);

        const newProduct = await dataService.createProduct(createData);

        console.log("✅ Create result:", newProduct);

        toast({
          title: "Product Created",
          description: `Product "${data.name}" has been created successfully.`,
        });

        navigate(`/products/${newProduct.id}`);
      }
    } catch (error) {
      console.error("❌ Failed to save product:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      toast({
        title: "Error",
        description: `Failed to save product: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditMode ? `Edit Product: ${product?.name}` : "Add New Product"}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? "Update product information"
            : "Fill in the details to create a new product"}
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.log("❌ Form validation errors:", errors);
            toast({
              title: "Validation Error",
              description: "Please check the form for errors and try again.",
              variant: "destructive",
            });
          })}
          className="space-y-6"
        >
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">
                <Package className="mr-2 h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="pricing">
                <DollarSign className="mr-2 h-4 w-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="inventory">
                <Archive className="mr-2 h-4 w-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Tag className="mr-2 h-4 w-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the basic details of your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter product name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product SKU" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter product description"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => {
                        const categoryValue =
                          field.value &&
                          field.value !== "" &&
                          field.value !== "null"
                            ? field.value
                            : undefined;
                        console.log(
                          "🏷️ Category field render - field.value:",
                          field.value,
                          "categoryValue:",
                          categoryValue,
                          "categories:",
                          categories.length,
                        );

                        return (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select
                              key={`category-${field.value}-${categories.length}-${Date.now()}`}
                              onValueChange={(value) => {
                                console.log("🏷️ Category changed to:", value);
                                field.onChange(value);
                              }}
                              value={categoryValue}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.length === 0 ? (
                                  <SelectItem value="no-categories" disabled>
                                    No categories available
                                  </SelectItem>
                                ) : (
                                  categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter brand" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => {
                        const unitValue = field.value || "piece"; // Default to "piece" if no value
                        console.log(
                          "📦 Unit field render - field.value:",
                          field.value,
                          "unitValue:",
                          unitValue,
                        );

                        return (
                          <FormItem>
                            <FormLabel>Unit *</FormLabel>
                            <Select
                              key={`unit-${field.value}-${Date.now()}`}
                              onValueChange={(value) => {
                                console.log("📦 Unit changed to:", value);
                                field.onChange(value);
                              }}
                              value={unitValue}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="piece">Piece</SelectItem>
                                <SelectItem value="kg">Kilogram</SelectItem>
                                <SelectItem value="g">Gram</SelectItem>
                                <SelectItem value="l">Liter</SelectItem>
                                <SelectItem value="ml">Milliliter</SelectItem>
                                <SelectItem value="m">Meter</SelectItem>
                                <SelectItem value="cm">Centimeter</SelectItem>
                                <SelectItem value="box">Box</SelectItem>
                                <SelectItem value="bx">Box (bx)</SelectItem>
                                <SelectItem value="pack">Pack</SelectItem>
                                <SelectItem value="pair">Pair</SelectItem>
                                <SelectItem value="set">Set</SelectItem>
                                <SelectItem value="dozen">Dozen</SelectItem>
                                <SelectItem value="unit">Unit</SelectItem>
                                <SelectItem value="bottle">Bottle</SelectItem>
                                <SelectItem value="tube">Tube</SelectItem>
                                <SelectItem value="roll">Roll</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Information</CardTitle>
                  <CardDescription>
                    Set up pricing for your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="purchasePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Price *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sellingPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selling Price *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="wholesalePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wholesale Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="retailPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retail Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="taxable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Taxable Product
                            </FormLabel>
                            <FormDescription>
                              This product is subject to tax
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="16.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>
                    Configure inventory tracking and stock levels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="trackInventory"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Track Inventory
                          </FormLabel>
                          <FormDescription>
                            Monitor stock levels for this product
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="currentStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Stock *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Stock *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Stock *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1000"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Storage Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Warehouse A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="binLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bin Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., A1-B2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>
                    Additional product configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="tag1, tag2, tag3" {...field} />
                        </FormControl>
                        <FormDescription>
                          Separate tags with commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes about this product"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="discontinued">
                              Discontinued
                            </SelectItem>
                            <SelectItem value="out_of_stock">
                              Out of Stock
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              onClick={() => {
                console.log("🖱️ Submit button clicked!");
                console.log("📝 Form state:", form.formState);
                console.log("📝 Form errors:", form.formState.errors);
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              {loading
                ? "Saving..."
                : isEditMode
                  ? "Update Product"
                  : "Create Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
