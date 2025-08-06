import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Filter,
  Download,
  Upload,
  ShoppingCart,
  Truck,
  Archive,
  Image,
  Tag,
  Ruler,
  Weight,
  MapPin,
  Hash,
  Box,
} from 'lucide-react';
import { Product, ProductStatus, ProductDimensions } from '@shared/types';
import { UnitConverter, UnitCategory } from '@shared/units';
import { useToast } from '../hooks/use-toast';

// Enhanced mock data with comprehensive product attributes
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Latex Rubber Gloves Bicolor Reusable XL',
    description: 'High-quality latex rubber gloves for medical and industrial use',
    sku: 'LRG-XL-001',
    barcode: '1234567890123',
    category: 'Medical Supplies',
    subcategory: 'Protective Equipment',
    brand: 'MedSafe',
    supplier: 'Global Medical Supplies Ltd',
    unit: 'Pair',
    weight: 0.05,
    dimensions: { length: 32, width: 12, height: 1, unit: 'cm' },
    purchasePrice: 400,
    sellingPrice: 500,
    markup: 25,
    costPrice: 380,
    wholesalePrice: 450,
    retailPrice: 500,
    minStock: 10,
    maxStock: 1000,
    currentStock: 450,
    reservedStock: 25,
    availableStock: 425,
    reorderLevel: 50,
    location: 'Warehouse A',
    binLocation: 'A-01-B',
    tags: ['medical', 'gloves', 'latex', 'protective'],
    taxable: true,
    taxRate: 16,
    trackInventory: true,
    allowBackorders: false,
    hasVariants: true,
    variants: [
      { id: 'v1', name: 'Small', sku: 'LRG-S-001', attributes: { size: 'Small' }, price: 450, stock: 120, isActive: true },
      { id: 'v2', name: 'Medium', sku: 'LRG-M-001', attributes: { size: 'Medium' }, price: 480, stock: 200, isActive: true },
      { id: 'v3', name: 'Large', sku: 'LRG-L-001', attributes: { size: 'Large' }, price: 500, stock: 180, isActive: true },
      { id: 'v4', name: 'XL', sku: 'LRG-XL-001', attributes: { size: 'XL' }, price: 500, stock: 150, isActive: true },
    ],
    images: ['gloves1.jpg', 'gloves2.jpg'],
    notes: 'Popular item with steady demand. Check quality regularly.',
    isActive: true,
    status: 'active',
    companyId: '1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Office Chair Executive Ergonomic',
    description: 'Premium ergonomic office chair with lumbar support and adjustable height',
    sku: 'OFC-ERG-002',
    barcode: '2345678901234',
    category: 'Furniture',
    subcategory: 'Office Chairs',
    brand: 'ErgoMax',
    supplier: 'Furniture Depot Kenya',
    unit: 'piece',
    weight: 22.5,
    dimensions: { length: 65, width: 65, height: 120, unit: 'cm' },
    purchasePrice: 12000,
    sellingPrice: 18000,
    markup: 50,
    costPrice: 11500,
    wholesalePrice: 15000,
    retailPrice: 18000,
    minStock: 5,
    maxStock: 30,
    currentStock: 3,
    reservedStock: 1,
    availableStock: 2,
    reorderLevel: 5,
    location: 'Showroom',
    binLocation: 'SR-02-A',
    tags: ['furniture', 'chair', 'office', 'ergonomic'],
    taxable: true,
    taxRate: 16,
    trackInventory: true,
    allowBackorders: true,
    hasVariants: false,
    images: ['chair1.jpg', 'chair2.jpg', 'chair3.jpg'],
    notes: 'High-value item. Requires assembly. Popular among corporate clients.',
    isActive: true,
    status: 'active',
    companyId: '1',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'Wireless Mouse Bluetooth 2.4GHz',
    description: 'Ergonomic wireless mouse with long battery life and precision tracking',
    sku: 'WM-BT-003',
    barcode: '3456789012345',
    category: 'Electronics',
    subcategory: 'Computer Accessories',
    brand: 'TechPro',
    supplier: 'Electronics Hub Ltd',
    unit: 'piece',
    weight: 0.08,
    dimensions: { length: 10, width: 6, height: 3, unit: 'cm' },
    purchasePrice: 800,
    sellingPrice: 1200,
    markup: 50,
    costPrice: 750,
    wholesalePrice: 1000,
    retailPrice: 1200,
    minStock: 20,
    maxStock: 200,
    currentStock: 0,
    reservedStock: 0,
    availableStock: 0,
    reorderLevel: 25,
    location: 'Electronics Store',
    binLocation: 'E-03-C',
    tags: ['electronics', 'mouse', 'wireless', 'bluetooth'],
    taxable: true,
    taxRate: 16,
    trackInventory: true,
    allowBackorders: false,
    hasVariants: true,
    variants: [
      { id: 'v5', name: 'Black', sku: 'WM-BT-003-BLK', attributes: { color: 'Black' }, price: 1200, stock: 0, isActive: true },
      { id: 'v6', name: 'White', sku: 'WM-BT-003-WHT', attributes: { color: 'White' }, price: 1200, stock: 0, isActive: true },
      { id: 'v7', name: 'Silver', sku: 'WM-BT-003-SLV', attributes: { color: 'Silver' }, price: 1250, stock: 0, isActive: true },
    ],
    images: ['mouse1.jpg'],
    notes: 'Out of stock. Popular item, reorder urgently.',
    isActive: true,
    status: 'out_of_stock',
    companyId: '1',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-25'),
  },
];

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
  status: ProductStatus;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    category: '',
    subcategory: '',
    brand: '',
    supplier: '',
    unit: 'piece',
    weight: '',
    dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
    purchasePrice: '',
    sellingPrice: '',
    wholesalePrice: '',
    retailPrice: '',
    minStock: '',
    maxStock: '',
    currentStock: '',
    reorderLevel: '',
    location: '',
    binLocation: '',
    tags: '',
    taxable: true,
    taxRate: '16',
    trackInventory: true,
    allowBackorders: false,
    hasVariants: false,
    notes: '',
    status: 'active',
  });
  const { toast } = useToast();

  const categories = [...new Set(products.map(p => p.category))];
  const statuses: ProductStatus[] = ['active', 'inactive', 'discontinued', 'out_of_stock'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'discontinued': return 'bg-red-500';
      case 'out_of_stock': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) return { status: 'Out of Stock', color: 'destructive' };
    if (product.currentStock <= (product.reorderLevel || product.minStock)) return { status: 'Low Stock', color: 'warning' };
    if (product.currentStock >= product.maxStock) return { status: 'Overstock', color: 'secondary' };
    return { status: 'In Stock', color: 'success' };
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      sku: formData.sku,
      barcode: formData.barcode,
      category: formData.category,
      subcategory: formData.subcategory,
      brand: formData.brand,
      supplier: formData.supplier,
      unit: formData.unit,
      weight: parseFloat(formData.weight) || undefined,
      dimensions: formData.dimensions,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      markup: 0,
      costPrice: parseFloat(formData.purchasePrice) || 0,
      wholesalePrice: parseFloat(formData.wholesalePrice) || 0,
      retailPrice: parseFloat(formData.retailPrice) || 0,
      minStock: parseInt(formData.minStock) || 0,
      maxStock: parseInt(formData.maxStock) || 0,
      currentStock: parseInt(formData.currentStock) || 0,
      availableStock: parseInt(formData.currentStock) || 0,
      reorderLevel: parseInt(formData.reorderLevel) || 0,
      location: formData.location,
      binLocation: formData.binLocation,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      taxable: formData.taxable,
      taxRate: parseFloat(formData.taxRate) || 0,
      trackInventory: formData.trackInventory,
      allowBackorders: formData.allowBackorders,
      hasVariants: formData.hasVariants,
      notes: formData.notes,
      isActive: true,
      status: formData.status,
      companyId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProducts(prev => [newProduct, ...prev]);
    setIsCreateDialogOpen(false);
    resetForm();
    
    toast({
      title: "Product Created",
      description: `Product "${formData.name}" has been created successfully.`,
    });
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      barcode: product.barcode || '',
      category: product.category,
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      supplier: product.supplier || '',
      unit: product.unit,
      weight: product.weight?.toString() || '',
      dimensions: product.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
      purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      wholesalePrice: product.wholesalePrice?.toString() || '',
      retailPrice: product.retailPrice?.toString() || '',
      minStock: product.minStock.toString(),
      maxStock: product.maxStock.toString(),
      currentStock: product.currentStock.toString(),
      reorderLevel: product.reorderLevel?.toString() || '',
      location: product.location || '',
      binLocation: product.binLocation || '',
      tags: product.tags?.join(', ') || '',
      taxable: product.taxable,
      taxRate: product.taxRate?.toString() || '16',
      trackInventory: product.trackInventory,
      allowBackorders: product.allowBackorders,
      hasVariants: product.hasVariants,
      notes: product.notes || '',
      status: product.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const updatedProduct: Product = {
      ...selectedProduct,
      name: formData.name,
      description: formData.description,
      sku: formData.sku,
      barcode: formData.barcode,
      category: formData.category,
      subcategory: formData.subcategory,
      brand: formData.brand,
      supplier: formData.supplier,
      unit: formData.unit,
      weight: parseFloat(formData.weight) || undefined,
      dimensions: formData.dimensions,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      wholesalePrice: parseFloat(formData.wholesalePrice) || 0,
      retailPrice: parseFloat(formData.retailPrice) || 0,
      minStock: parseInt(formData.minStock) || 0,
      maxStock: parseInt(formData.maxStock) || 0,
      currentStock: parseInt(formData.currentStock) || 0,
      reorderLevel: parseInt(formData.reorderLevel) || 0,
      location: formData.location,
      binLocation: formData.binLocation,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      taxable: formData.taxable,
      taxRate: parseFloat(formData.taxRate) || 0,
      trackInventory: formData.trackInventory,
      allowBackorders: formData.allowBackorders,
      hasVariants: formData.hasVariants,
      notes: formData.notes,
      status: formData.status,
      updatedAt: new Date(),
    };

    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
    resetForm();
    
    toast({
      title: "Product Updated",
      description: `Product "${formData.name}" has been updated successfully.`,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({
      title: "Product Deleted",
      description: "Product has been deleted successfully.",
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      barcode: '',
      category: '',
      subcategory: '',
      brand: '',
      supplier: '',
      unit: 'piece',
      weight: '',
      dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
      purchasePrice: '',
      sellingPrice: '',
      wholesalePrice: '',
      retailPrice: '',
      minStock: '',
      maxStock: '',
      currentStock: '',
      reorderLevel: '',
      location: '',
      binLocation: '',
      tags: '',
      taxable: true,
      taxRate: '16',
      trackInventory: true,
      allowBackorders: false,
      hasVariants: false,
      notes: '',
      status: 'active',
    });
  };

  // Calculate metrics
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const lowStockProducts = products.filter(p => p.currentStock <= (p.reorderLevel || p.minStock)).length;
  const outOfStockProducts = products.filter(p => p.currentStock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.sellingPrice), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[900px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Create a new product with comprehensive details
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProduct} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter product name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU *</Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                          placeholder="e.g., PRD-001"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Product description"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
                            <SelectItem value="Furniture">Furniture</SelectItem>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                            <SelectItem value="Cleaning Supplies">Cleaning Supplies</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subcategory">Subcategory</Label>
                        <Input
                          id="subcategory"
                          value={formData.subcategory}
                          onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                          placeholder="Subcategory"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                          placeholder="Brand name"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="barcode">Barcode</Label>
                        <Input
                          id="barcode"
                          value={formData.barcode}
                          onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                          placeholder="Barcode number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {/* Most Common Units */}
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Common Units</div>
                            {UnitConverter.getCommonUnits().quantity.map(unit => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name} ({unit.symbol})
                              </SelectItem>
                            ))}

                            {/* Weight/Mass */}
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-2 pt-2">Weight/Mass</div>
                            {UnitConverter.getCommonUnits().weight.map(unit => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name} ({unit.symbol})
                              </SelectItem>
                            ))}

                            {/* Volume */}
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-2 pt-2">Volume</div>
                            {UnitConverter.getCommonUnits().volume.map(unit => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name} ({unit.symbol})
                              </SelectItem>
                            ))}

                            {/* Length */}
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-2 pt-2">Length</div>
                            {UnitConverter.getCommonUnits().length.map(unit => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name} ({unit.symbol})
                              </SelectItem>
                            ))}

                            {/* Area */}
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-2 pt-2">Area</div>
                            {UnitConverter.getCommonUnits().area.map(unit => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name} ({unit.symbol})
                              </SelectItem>
                            ))}

                            {/* Time */}
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-2 pt-2">Time</div>
                            {UnitConverter.getCommonUnits().time.slice(0, 4).map(unit => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name} ({unit.symbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pricing" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="purchasePrice">Purchase Price (KES) *</Label>
                        <Input
                          id="purchasePrice"
                          type="number"
                          value={formData.purchasePrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sellingPrice">Selling Price (KES) *</Label>
                        <Input
                          id="sellingPrice"
                          type="number"
                          value={formData.sellingPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="wholesalePrice">Wholesale Price (KES)</Label>
                        <Input
                          id="wholesalePrice"
                          type="number"
                          value={formData.wholesalePrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, wholesalePrice: e.target.value }))}
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
                          onChange={(e) => setFormData(prev => ({ ...prev, retailPrice: e.target.value }))}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Taxable</Label>
                        <Switch
                          checked={formData.taxable}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, taxable: checked }))}
                        />
                      </div>
                      
                      {formData.taxable && (
                        <div className="space-y-2">
                          <Label htmlFor="taxRate">Tax Rate (%)</Label>
                          <Input
                            id="taxRate"
                            type="number"
                            value={formData.taxRate}
                            onChange={(e) => setFormData(prev => ({ ...prev, taxRate: e.target.value }))}
                            placeholder="16"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="inventory" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentStock">Current Stock</Label>
                        <Input
                          id="currentStock"
                          type="number"
                          value={formData.currentStock}
                          onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
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
                          onChange={(e) => setFormData(prev => ({ ...prev, reorderLevel: e.target.value }))}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minStock">Minimum Stock</Label>
                        <Input
                          id="minStock"
                          type="number"
                          value={formData.minStock}
                          onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
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
                          onChange={(e) => setFormData(prev => ({ ...prev, maxStock: e.target.value }))}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Warehouse A"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="binLocation">Bin Location</Label>
                        <Input
                          id="binLocation"
                          value={formData.binLocation}
                          onChange={(e) => setFormData(prev => ({ ...prev, binLocation: e.target.value }))}
                          placeholder="A-01-B"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Track Inventory</Label>
                        <Switch
                          checked={formData.trackInventory}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, trackInventory: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label>Allow Backorders</Label>
                        <Switch
                          checked={formData.allowBackorders}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowBackorders: checked }))}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                        placeholder="Supplier name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
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
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            dimensions: { ...prev.dimensions, length: parseFloat(e.target.value) || 0 }
                          }))}
                        />
                        <Input
                          type="number"
                          placeholder="Width"
                          value={formData.dimensions.width}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            dimensions: { ...prev.dimensions, width: parseFloat(e.target.value) || 0 }
                          }))}
                        />
                        <Input
                          type="number"
                          placeholder="Height"
                          value={formData.dimensions.height}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            dimensions: { ...prev.dimensions, height: parseFloat(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="medical, gloves, protective"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value: ProductStatus) => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="discontinued">Discontinued</SelectItem>
                          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes about this product"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    Create Product
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">{activeProducts}</span> active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products need reordering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products unavailable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total stock value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Product categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>
            Manage your complete product inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.description && product.description.length > 50 
                              ? product.description.substring(0, 50) + '...'
                              : product.description}
                          </div>
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {product.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {product.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{product.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-mono text-sm">{product.sku}</div>
                          {product.barcode && (
                            <div className="text-xs text-muted-foreground font-mono">
                              {product.barcode}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{product.category}</div>
                          {product.subcategory && (
                            <div className="text-xs text-muted-foreground">
                              {product.subcategory}
                            </div>
                          )}
                          {product.brand && (
                            <div className="text-xs text-muted-foreground">
                              {product.brand}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {product.currentStock} {product.unit}
                          </div>
                          <Badge variant={stockStatus.color as any} className="text-xs">
                            {stockStatus.status}
                          </Badge>
                          {product.location && (
                            <div className="text-xs text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {product.location}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatCurrency(product.sellingPrice)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Cost: {formatCurrency(product.purchasePrice)}
                          </div>
                          {product.wholesalePrice && (
                            <div className="text-xs text-muted-foreground">
                              Wholesale: {formatCurrency(product.wholesalePrice)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`h-2 w-2 rounded-full ${getStatusColor(product.status)}`} />
                          <Badge variant="outline" className="capitalize">
                            {product.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Stock Movement
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Truck className="mr-2 h-4 w-4" />
                              Reorder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search terms or filters.'
                  : 'Get started by adding your first product.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information and details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-6">
            {/* Same form content as create dialog but with update handler */}
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              {/* Same tab content as create form */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Product Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-sku">SKU *</Label>
                    <Input
                      id="edit-sku"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="e.g., PRD-001"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Product description"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                        <SelectItem value="Cleaning Supplies">Cleaning Supplies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subcategory</Label>
                    <Input
                      value={formData.subcategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                      placeholder="Subcategory"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="Brand name"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Purchase Price (KES) *</Label>
                    <Input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Selling Price (KES) *</Label>
                    <Input
                      type="number"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="inventory" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Stock</Label>
                    <Input
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reorder Level</Label>
                    <Input
                      type="number"
                      value={formData.reorderLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, reorderLevel: e.target.value }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value: ProductStatus) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedProduct(null);
                  resetForm();
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Update Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
