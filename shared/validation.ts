import { z } from "zod";

// Product form validation schema
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255, "Name too long"),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU is required").max(100, "SKU too long"),
  barcode: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  categoryId: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  supplier: z.string().optional(),
  supplierId: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  weight: z.number().min(0).optional(),
  
  // Dimensions
  dimensions: z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
    unit: z.enum(["cm", "in", "m"]).default("cm")
  }).optional(),
  
  // Pricing
  purchasePrice: z.number().min(0, "Purchase price must be positive"),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
  wholesalePrice: z.number().min(0).optional(),
  retailPrice: z.number().min(0).optional(),
  markup: z.number().min(0).optional(),
  
  // Inventory
  minStock: z.number().min(0, "Min stock must be positive"),
  maxStock: z.number().min(0, "Max stock must be positive"),
  currentStock: z.number().min(0, "Current stock must be positive"),
  reorderLevel: z.number().min(0).optional(),
  
  // Location
  location: z.string().optional(),
  binLocation: z.string().optional(),
  
  // Settings
  trackInventory: z.boolean().default(true),
  allowBackorders: z.boolean().default(false),
  taxable: z.boolean().default(true),
  taxRate: z.number().min(0).max(100).optional(),
  hasVariants: z.boolean().default(false),
  
  // Tags
  tags: z.string().optional().transform((val) => 
    val ? val.split(",").map(tag => tag.trim()).filter(Boolean) : []
  ),
  
  // Status
  status: z.enum(["active", "inactive", "discontinued", "out_of_stock"]).default("active"),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
}).refine((data) => {
  return data.maxStock >= data.minStock;
}, {
  message: "Max stock must be greater than or equal to min stock",
  path: ["maxStock"]
}).refine((data) => {
  return data.sellingPrice >= data.purchasePrice;
}, {
  message: "Selling price should be greater than or equal to purchase price",
  path: ["sellingPrice"]
});

export type ProductFormData = z.infer<typeof productSchema>;

// Product variant validation schema
export const productVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().min(1, "Variant SKU is required"),
  attributes: z.array(z.object({
    key: z.string().min(1),
    value: z.string().min(1)
  })).default([]),
  price: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  isActive: z.boolean().default(true)
});

export type ProductVariantFormData = z.infer<typeof productVariantSchema>;

// Customer validation schema
export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required").max(255, "Name too long"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  kraPin: z.string().optional().refine((val) => {
    if (!val) return true;
    // KRA PIN validation: Letter followed by 9 digits followed by letter
    return /^[A-Z]\d{9}[A-Z]$/.test(val);
  }, "KRA PIN must be in format: Letter + 9 digits + Letter (e.g., A123456789Z)"),
  address: z.string().optional(),
  creditLimit: z.number().min(0, "Credit limit must be positive").default(0),
  balance: z.number().default(0),
  isActive: z.boolean().default(true)
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// Line item validation schema  
export const lineItemSchema = z.object({
  id: z.string(),
  productId: z.string().min(1, "Product is required"),
  quantity: z.string().min(1, "Quantity is required").transform((val) => parseFloat(val) || 0),
  unitPrice: z.string().min(1, "Unit price is required").transform((val) => parseFloat(val) || 0),
  discount: z.string().transform((val) => parseFloat(val) || 0),
  lineItemTaxes: z.array(z.any()).optional()
}).refine((data) => {
  return data.quantity > 0;
}, {
  message: "Quantity must be greater than 0",
  path: ["quantity"]
}).refine((data) => {
  return data.unitPrice > 0;
}, {
  message: "Unit price must be greater than 0", 
  path: ["unitPrice"]
});

export type LineItemFormData = z.infer<typeof lineItemSchema>;
