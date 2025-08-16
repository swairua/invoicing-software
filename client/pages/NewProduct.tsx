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
  Upload,
  Image as ImageIcon,
  Barcode,
  Weight,
  Ruler,
  MapPin,
} from "lucide-react";
import {
  Product,
  ProductDimensions,
  ProductVariant,
  ProductCategory,
} from "@shared/types";
import { UnitConverter } from "@shared/units";
import { dataServiceFactory } from "../services/dataServiceFactory";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/use-auth";

interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  barcode: string;
  category: string;
  subcategory: string;
  brand: string;
  supplier: string;
  unit: string;
  weight: string;
  dimensions: ProductDimensions;
  purchasePrice: string;
  sellingPrice: string;
  wholesalePrice: string;
  retailPrice: string;
  minStock: string;
  maxStock: string;
  currentStock: string;
  reorderLevel: string;
  location: string;
  binLocation: string;
  tags: string;
  taxable: boolean;
  taxRate: string;
  trackInventory: boolean;
  allowBackorders: boolean;
  hasVariants: boolean;
  notes: string;
  status: "active" | "inactive" | "discontinued" | "out_of_stock";
}

interface VariantFormData {
  name: string;
  sku: string;
  attributes: Array<{ key: string; value: string }>;
  price: string;
  stock: string;
  isActive: boolean;
}

export default function NewProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const isEditMode = Boolean(id);
  const duplicateData = location.state?.duplicateFrom;

  const [formData, setFormData] = useState<ProductFormData>({
    name: duplicateData?.name || "",
    description: duplicateData?.description || "",
    sku: duplicateData?.sku || "",
    barcode: duplicateData?.barcode || "",
    category: duplicateData?.category || "",
    subcategory: duplicateData?.subcategory || "",
    brand: duplicateData?.brand || "",
    supplier: duplicateData?.supplier || "",
    unit: duplicateData?.unit || "piece",
    weight: duplicateData?.weight?.toString() || "",
    dimensions: duplicateData?.dimensions || {
      length: 0,
      width: 0,
      height: 0,
      unit: "cm",
    },
    purchasePrice: duplicateData?.purchasePrice?.toString() || "",
    sellingPrice: duplicateData?.sellingPrice?.toString() || "",
    wholesalePrice: duplicateData?.wholesalePrice?.toString() || "",
    retailPrice: duplicateData?.retailPrice?.toString() || "",
    minStock: duplicateData?.minStock?.toString() || "",
    maxStock: duplicateData?.maxStock?.toString() || "",
    currentStock: duplicateData?.currentStock?.toString() || "",
    reorderLevel: duplicateData?.reorderLevel?.toString() || "",
    location: duplicateData?.location || "",
    binLocation: duplicateData?.binLocation || "",
    tags: duplicateData?.tags?.join(", ") || "",
    taxable: duplicateData?.taxable ?? true,
    taxRate: duplicateData?.taxRate?.toString() || "16",
    trackInventory: duplicateData?.trackInventory ?? true,
    allowBackorders: duplicateData?.allowBackorders ?? false,
    hasVariants: duplicateData?.hasVariants ?? false,
    notes: duplicateData?.notes || "",
    status: duplicateData?.status || "active",
  });

  const [variants, setVariants] = useState<VariantFormData[]>(
    duplicateData?.variants?.map((v: any) => ({
      name: v.name,
      sku: v.sku,
      attributes: Object.entries(v.attributes).map(([key, value]) => ({
        key,
        value: value as string,
      })),
      price: v.price?.toString() || "",
      stock: v.stock?.toString() || "",
      isActive: v.isActive,
    })) || [],
  );

  const [newVariant, setNewVariant] = useState<VariantFormData>({
    name: "",
    sku: "",
    attributes: [{ key: "", value: "" }],
    price: "",
    stock: "",
    isActive: true,
  });
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  const dataService = dataServiceFactory.getDataService();

  // Load product data when in edit mode
  useEffect(() => {
    const loadProduct = async () => {
      if (!isEditMode || !id) return;

      try {
        setLoading(true);
        const foundProduct = await dataService.getProductById?.(id);

        if (!foundProduct) {
          toast({
            title: "Product Not Found",
            description: "The requested product could not be found.",
            variant: "destructive",
          });
          navigate("/products");
          return;
        }

        setProduct(foundProduct);
        setFormData({
          name: foundProduct.name,
          description: foundProduct.description || "",
          sku: foundProduct.sku,
          barcode: foundProduct.barcode || "",
          category: foundProduct.category,
          subcategory: foundProduct.subcategory || "",
          brand: foundProduct.brand || "",
          supplier: foundProduct.supplier || "",
          unit: foundProduct.unit || "piece",
          weight: foundProduct.weight?.toString() || "",
          dimensions: foundProduct.dimensions || {
            length: 0,
            width: 0,
            height: 0,
            unit: "cm",
          },
          purchasePrice: foundProduct.purchasePrice?.toString() || "",
          sellingPrice: foundProduct.sellingPrice?.toString() || "",
          wholesalePrice: foundProduct.wholesalePrice?.toString() || "",
          retailPrice: foundProduct.retailPrice?.toString() || "",
          minStock: foundProduct.minStock?.toString() || "",
          maxStock: foundProduct.maxStock?.toString() || "",
          currentStock: foundProduct.currentStock?.toString() || "",
          reorderLevel: foundProduct.reorderLevel?.toString() || "",
          location: foundProduct.location || "",
          binLocation: foundProduct.binLocation || "",
          tags: foundProduct.tags?.join(", ") || "",
          taxable: foundProduct.taxable ?? true,
          taxRate: foundProduct.taxRate?.toString() || "16",
          trackInventory: foundProduct.trackInventory ?? true,
          allowBackorders: foundProduct.allowBackorders ?? false,
          hasVariants: foundProduct.hasVariants ?? false,
          notes: foundProduct.notes || "",
          status: foundProduct.status || "active",
        });

        // Set variants if product has them
        if (foundProduct.variants) {
          setVariants(
            foundProduct.variants.map((v) => ({
              name: v.name,
              sku: v.sku,
              attributes: Object.entries(v.attributes).map(([key, value]) => ({
                key,
                value: value as string,
              })),
              price: v.price?.toString() || "",
              stock: v.stock?.toString() || "",
              isActive: v.isActive,
            })),
          );
        }
      } catch (error) {
        console.error("Error loading product:", error);
        toast({
          title: "Error",
          description: "Failed to load product details.",
          variant: "destructive",
        });
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [isEditMode, id, dataService, navigate, toast]);

  // Load categories and units
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, unitsData] = await Promise.all([
          dataService.getCategories(),
          // Get units from UnitConverter for now
          Promise.resolve(UnitConverter.getAllUnits()),
        ]);
        setCategories(categoriesData || []);
        setUnits(unitsData || []);
      } catch (error) {
        console.error("Error loading categories and units:", error);
        toast({
          title: "Warning",
          description: "Could not load categories and units. Using defaults.",
          variant: "destructive",
        });
        // Fallback to hardcoded categories if API fails
        setCategories([
          { id: "1", name: "Medical Supplies", companyId: "1" },
          { id: "2", name: "Electronics", companyId: "1" },
          { id: "3", name: "Office Furniture", companyId: "1" },
          { id: "4", name: "Cleaning Supplies", companyId: "1" },
        ]);
        setUnits(UnitConverter.getAllUnits());
      }
    };
    loadData();
  }, [dataService, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.sku || !formData.category) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields (Name, SKU, Category).",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.sellingPrice) <= 0) {
      toast({
        title: "Validation Error",
        description: "Selling price must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && product) {
        // Update existing product
        const updatedProduct: Product = {
          ...product,
          name: formData.name,
          description: formData.description,
          sku: formData.sku,
          barcode: formData.barcode,
          category: formData.category,
          subcategory:
            formData.subcategory === "none" ? "" : formData.subcategory,
          brand: formData.brand,
          supplier: formData.supplier,
          unit: formData.unit,
          weight: parseFloat(formData.weight) || undefined,
          dimensions: formData.dimensions,
          purchasePrice: parseFloat(formData.purchasePrice) || 0,
          sellingPrice: parseFloat(formData.sellingPrice) || 0,
          markup:
            formData.purchasePrice && formData.sellingPrice
              ? ((parseFloat(formData.sellingPrice) -
                  parseFloat(formData.purchasePrice)) /
                  parseFloat(formData.purchasePrice)) *
                100
              : 0,
          costPrice: parseFloat(formData.purchasePrice) || 0,
          wholesalePrice: parseFloat(formData.wholesalePrice) || undefined,
          retailPrice: parseFloat(formData.retailPrice) || undefined,
          minStock: parseInt(formData.minStock) || 0,
          maxStock: parseInt(formData.maxStock) || 0,
          currentStock: parseInt(formData.currentStock) || 0,
          availableStock: parseInt(formData.currentStock) || 0,
          reorderLevel: parseInt(formData.reorderLevel) || undefined,
          location: formData.location,
          binLocation: formData.binLocation,
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t),
          taxable: formData.taxable,
          taxRate: parseFloat(formData.taxRate) || undefined,
          trackInventory: formData.trackInventory,
          allowBackorders: formData.allowBackorders,
          hasVariants: formData.hasVariants,
          variants: formData.hasVariants
            ? variants.map((v) => ({
                id: v.name + "-" + Date.now().toString(),
                name: v.name,
                sku: v.sku,
                attributes: v.attributes.reduce(
                  (acc, attr) => {
                    if (attr.key && attr.value) {
                      acc[attr.key] = attr.value;
                    }
                    return acc;
                  },
                  {} as Record<string, string>,
                ),
                price: parseFloat(v.price) || undefined,
                stock: parseInt(v.stock) || undefined,
                isActive: v.isActive,
              }))
            : [],
          notes: formData.notes,
          status: formData.status,
          updatedAt: new Date(),
        };

        // Call the real update API
        await dataService.updateProduct(product.id, updatedProduct);

        toast({
          title: "Product Updated",
          description: `Product "${formData.name}" has been updated successfully.`,
        });

        navigate(`/products/${product.id}`);
      } else {
        // Create new product
        const newProduct: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
          name: formData.name,
          description: formData.description,
          sku: formData.sku,
          barcode: formData.barcode,
          category: formData.category,
          subcategory:
            formData.subcategory === "none" ? "" : formData.subcategory,
          brand: formData.brand,
          supplier: formData.supplier,
          unit: formData.unit,
          weight: parseFloat(formData.weight) || undefined,
          dimensions: formData.dimensions,
          purchasePrice: parseFloat(formData.purchasePrice) || 0,
          sellingPrice: parseFloat(formData.sellingPrice) || 0,
          markup:
            formData.purchasePrice && formData.sellingPrice
              ? ((parseFloat(formData.sellingPrice) -
                  parseFloat(formData.purchasePrice)) /
                  parseFloat(formData.purchasePrice)) *
                100
              : 0,
          costPrice: parseFloat(formData.purchasePrice) || 0,
          wholesalePrice: parseFloat(formData.wholesalePrice) || undefined,
          retailPrice: parseFloat(formData.retailPrice) || undefined,
          minStock: parseInt(formData.minStock) || 0,
          maxStock: parseInt(formData.maxStock) || 0,
          currentStock: parseInt(formData.currentStock) || 0,
          availableStock: parseInt(formData.currentStock) || 0,
          reorderLevel: parseInt(formData.reorderLevel) || undefined,
          location: formData.location,
          binLocation: formData.binLocation,
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t),
          taxable: formData.taxable,
          taxRate: parseFloat(formData.taxRate) || undefined,
          trackInventory: formData.trackInventory,
          allowBackorders: formData.allowBackorders,
          hasVariants: formData.hasVariants,
          variants: formData.hasVariants
            ? variants.map((v) => ({
                id: Date.now().toString() + Math.random(),
                name: v.name,
                sku: v.sku,
                attributes: v.attributes.reduce(
                  (acc, attr) => {
                    if (attr.key && attr.value) {
                      acc[attr.key] = attr.value;
                    }
                    return acc;
                  },
                  {} as Record<string, string>,
                ),
                price: parseFloat(v.price) || undefined,
                stock: parseInt(v.stock) || undefined,
                isActive: v.isActive,
              }))
            : [],
          notes: formData.notes,
          isActive: true,
          status: formData.status,
          companyId: user?.companyId || "00000000-0000-0000-0000-000000000001",
        };

        // Call the real create API
        await dataService.createProduct(newProduct);

        toast({
          title: "Product Created",
          description: `Product "${formData.name}" has been created successfully.`,
        });

        navigate("/products");
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} product:`,
        error,
      );
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} product. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addVariant = () => {
    if (!newVariant.name || !newVariant.sku) {
      toast({
        title: "Validation Error",
        description: "Variant name and SKU are required.",
        variant: "destructive",
      });
      return;
    }

    setVariants((prev) => [...prev, { ...newVariant }]);
    setNewVariant({
      name: "",
      sku: "",
      attributes: [{ key: "", value: "" }],
      price: "",
      stock: "",
      isActive: true,
    });
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const addAttributeField = () => {
    setNewVariant((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { key: "", value: "" }],
    }));
  };

  const updateAttribute = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    setNewVariant((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr,
      ),
    }));
  };

  const removeAttribute = (index: number) => {
    setNewVariant((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const generateSKU = () => {
    if (formData.category && formData.name) {
      const categoryCode = formData.category
        .split(" ")
        .map((word) => word.substring(0, 2).toUpperCase())
        .join("");
      const nameCode = formData.name
        .split(" ")
        .slice(0, 2)
        .map((word) => word.substring(0, 2).toUpperCase())
        .join("");
      const timestamp = Date.now().toString().slice(-4);
      const sku = `${categoryCode}-${nameCode}-${timestamp}`;
      setFormData((prev) => ({ ...prev, sku }));
    }
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
            <Link to={isEditMode ? `/products/${id}` : "/products"}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {isEditMode ? "Back to Product" : "Back to Products"}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode
                ? "Edit Product"
                : duplicateData
                  ? "Duplicate Product"
                  : "New Product"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Update product information and settings"
                : duplicateData
                  ? "Create a copy of an existing product"
                  : "Add a new product to your catalog"}
            </p>
            {!isEditMode && categories.length === 0 && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Tip:</strong> Create{" "}
                  <Link to="/categories" className="underline font-medium">
                    Categories
                  </Link>{" "}
                  and{" "}
                  <Link to="/units" className="underline font-medium">
                    Units
                  </Link>{" "}
                  first to organize your products better.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={isEditMode ? `/products/${id}` : "/products"}>
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
                {isEditMode ? "Update Product" : "Create Product"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Information
                  </CardTitle>
                  <CardDescription>
                    Basic details about your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Product description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              sku: e.target.value,
                            }))
                          }
                          placeholder="e.g., PRD-001"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateSKU}
                        >
                          <Barcode className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            barcode: e.target.value,
                          }))
                        }
                        placeholder="Barcode number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                              {category.description && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  - {category.description}
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Select
                        value={formData.subcategory}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            subcategory: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No subcategory</SelectItem>
                          {categories
                            .filter((cat) => {
                              // Show subcategories that belong to the selected category
                              const selectedCategory = categories.find(
                                (c) => c.name === formData.category,
                              );
                              return (
                                selectedCategory &&
                                cat.parentId === selectedCategory.id
                              );
                            })
                            .map((subcategory) => (
                              <SelectItem
                                key={subcategory.id}
                                value={subcategory.name}
                              >
                                {subcategory.name}
                                {subcategory.description && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    - {subcategory.description}
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            brand: e.target.value,
                          }))
                        }
                        placeholder="Brand name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit *</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, unit: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                            Common Units
                          </div>
                          {UnitConverter.getCommonUnits().quantity.map(
                            (unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit?.name || "Unknown Unit"} (
                                {unit?.symbol || "?"})
                              </SelectItem>
                            ),
                          )}
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-2 pt-2">
                            Weight/Mass
                          </div>
                          {UnitConverter.getCommonUnits().weight.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name} ({unit.symbol})
                            </SelectItem>
                          ))}
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-2 pt-2">
                            Volume
                          </div>
                          {UnitConverter.getCommonUnits().volume.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name} ({unit.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Weight className="h-5 w-5" />
                    Physical Properties
                  </CardTitle>
                  <CardDescription>
                    Physical characteristics of the product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          weight: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dimensions (cm)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        placeholder="Length"
                        value={formData.dimensions.length}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dimensions: {
                              ...prev.dimensions,
                              length: parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Width"
                        value={formData.dimensions.width}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dimensions: {
                              ...prev.dimensions,
                              width: parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Height"
                        value={formData.dimensions.height}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dimensions: {
                              ...prev.dimensions,
                              height: parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        placeholder="Warehouse A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="binLocation">Bin Location</Label>
                      <Input
                        id="binLocation"
                        value={formData.binLocation}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            binLocation: e.target.value,
                          }))
                        }
                        placeholder="A-01-B"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          supplier: e.target.value,
                        }))
                      }
                      placeholder="Supplier name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                      placeholder="medical, protective, reusable"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing Information
                </CardTitle>
                <CardDescription>
                  Set pricing and cost information for this product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Cost Information</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="purchasePrice">
                          Purchase Price (KES) *
                        </Label>
                        <Input
                          id="purchasePrice"
                          type="number"
                          value={formData.purchasePrice}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              purchasePrice: e.target.value,
                            }))
                          }
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Selling Prices</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="sellingPrice">
                          Selling Price (KES) *
                        </Label>
                        <Input
                          id="sellingPrice"
                          type="number"
                          value={formData.sellingPrice}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              sellingPrice: e.target.value,
                            }))
                          }
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wholesalePrice">
                          Wholesale Price (KES)
                        </Label>
                        <Input
                          id="wholesalePrice"
                          type="number"
                          value={formData.wholesalePrice}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              wholesalePrice: e.target.value,
                            }))
                          }
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="retailPrice">Retail Price (KES)</Label>
                        <Input
                          id="retailPrice"
                          type="number"
                          value={formData.retailPrice}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              retailPrice: e.target.value,
                            }))
                          }
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Tax Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="taxable">Taxable Product</Label>
                      <Switch
                        id="taxable"
                        checked={formData.taxable}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, taxable: checked }))
                        }
                      />
                    </div>

                    {formData.taxable && (
                      <div className="space-y-2">
                        <Label htmlFor="taxRate">Tax Rate (%)</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          value={formData.taxRate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              taxRate: e.target.value,
                            }))
                          }
                          placeholder="16"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {formData.purchasePrice && formData.sellingPrice && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Pricing Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Markup:</span>
                        <span className="ml-2 font-medium">
                          {parseFloat(formData.purchasePrice) > 0
                            ? (
                                ((parseFloat(formData.sellingPrice) -
                                  parseFloat(formData.purchasePrice)) /
                                  parseFloat(formData.purchasePrice)) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Margin:</span>
                        <span className="ml-2 font-medium">
                          {parseFloat(formData.sellingPrice) > 0
                            ? (
                                ((parseFloat(formData.sellingPrice) -
                                  parseFloat(formData.purchasePrice)) /
                                  parseFloat(formData.sellingPrice)) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Inventory Management
                </CardTitle>
                <CardDescription>
                  Configure stock levels and inventory settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Stock Levels</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentStock">Current Stock</Label>
                        <Input
                          id="currentStock"
                          type="number"
                          value={formData.currentStock}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              currentStock: e.target.value,
                            }))
                          }
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="minStock">Minimum Stock</Label>
                        <Input
                          id="minStock"
                          type="number"
                          value={formData.minStock}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              minStock: e.target.value,
                            }))
                          }
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxStock">Maximum Stock</Label>
                        <Input
                          id="maxStock"
                          type="number"
                          value={formData.maxStock}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              maxStock: e.target.value,
                            }))
                          }
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reorderLevel">Reorder Level</Label>
                        <Input
                          id="reorderLevel"
                          type="number"
                          value={formData.reorderLevel}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              reorderLevel: e.target.value,
                            }))
                          }
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Inventory Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="trackInventory">Track Inventory</Label>
                        <Switch
                          id="trackInventory"
                          checked={formData.trackInventory}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              trackInventory: checked,
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="allowBackorders">
                          Allow Backorders
                        </Label>
                        <Switch
                          id="allowBackorders"
                          checked={formData.allowBackorders}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              allowBackorders: checked,
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="hasVariants">Has Variants</Label>
                        <Switch
                          id="hasVariants"
                          checked={formData.hasVariants}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              hasVariants: checked,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Product Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: any) =>
                            setFormData((prev) => ({ ...prev, status: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
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
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Product Variants
                </CardTitle>
                <CardDescription>
                  Configure different variations of this product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!formData.hasVariants ? (
                  <div className="text-center py-8">
                    <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Variants Enabled</h3>
                    <p className="text-muted-foreground mb-4">
                      Enable variants in the Inventory tab to configure product
                      variations.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Existing Variants */}
                    {variants.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Configured Variants</h4>
                        <div className="space-y-2">
                          {variants.map((variant, index) => (
                            <div
                              key={variant.sku || `variant-${index}`}
                              className="flex items-center gap-4 p-4 border rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="font-medium">
                                  {variant?.name || "Unknown Variant"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  SKU: {variant.sku}
                                </div>
                                <div className="flex gap-1 mt-1">
                                  {variant.attributes.map(
                                    (attr, attrIndex) =>
                                      attr.key &&
                                      attr.value && (
                                        <Badge
                                          key={attrIndex}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {attr.key}: {attr.value}
                                        </Badge>
                                      ),
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {variant.price
                                    ? `KES ${parseFloat(variant.price).toLocaleString()}`
                                    : "Same as parent"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Stock: {variant.stock || "N/A"}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeVariant(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add New Variant */}
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-4">Add New Variant</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Variant Name</Label>
                            <Input
                              value={newVariant.name}
                              onChange={(e) =>
                                setNewVariant((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              placeholder="e.g., Size Large"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Variant SKU</Label>
                            <Input
                              value={newVariant.sku}
                              onChange={(e) =>
                                setNewVariant((prev) => ({
                                  ...prev,
                                  sku: e.target.value,
                                }))
                              }
                              placeholder="e.g., PRD-001-L"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Attributes</Label>
                          {newVariant.attributes.map((attr, index) => (
                            <div
                              key={`attr-${index}-${attr.key}`}
                              className="flex gap-2"
                            >
                              <Input
                                placeholder="Attribute name (e.g., Color)"
                                value={attr.key}
                                onChange={(e) =>
                                  updateAttribute(index, "key", e.target.value)
                                }
                              />
                              <Input
                                placeholder="Attribute value (e.g., Red)"
                                value={attr.value}
                                onChange={(e) =>
                                  updateAttribute(
                                    index,
                                    "value",
                                    e.target.value,
                                  )
                                }
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttribute(index)}
                                disabled={newVariant.attributes.length === 1}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addAttributeField}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Attribute
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Price (KES)</Label>
                            <Input
                              type="number"
                              value={newVariant.price}
                              onChange={(e) =>
                                setNewVariant((prev) => ({
                                  ...prev,
                                  price: e.target.value,
                                }))
                              }
                              placeholder="Leave empty to use parent price"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Stock</Label>
                            <Input
                              type="number"
                              value={newVariant.stock}
                              onChange={(e) =>
                                setNewVariant((prev) => ({
                                  ...prev,
                                  stock: e.target.value,
                                }))
                              }
                              placeholder="0"
                              min="0"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={newVariant.isActive}
                              onCheckedChange={(checked) =>
                                setNewVariant((prev) => ({
                                  ...prev,
                                  isActive: checked,
                                }))
                              }
                            />
                            <Label>Active</Label>
                          </div>
                          <Button type="button" onClick={addVariant}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Variant
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>
                  Extra information and notes about this product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Additional notes about this product..."
                    rows={4}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Product Images</h4>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">
                      Upload Product Images
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Drag and drop images here or click to browse
                    </p>
                    <Button type="button" variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Files
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
