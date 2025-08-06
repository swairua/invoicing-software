import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  ArrowLeft,
  Edit,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MapPin,
  Tag,
  Barcode,
  Weight,
  Ruler,
  Box,
  History,
  Plus,
  Minus,
  ShoppingCart,
  RotateCcw,
  FileText,
  Trash2,
  Eye,
  Copy,
  Image as ImageIcon,
  Download,
  Upload
} from 'lucide-react';
import { Product, StockMovement } from '@shared/types';
import { dataServiceFactory } from '../services/dataServiceFactory';
import { useToast } from '../hooks/use-toast';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [stockMovementType, setStockMovementType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockNotes, setStockNotes] = useState('');

  const dataService = dataServiceFactory.getDataService();

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        const products = await dataService.getProducts();
        const foundProduct = products.find(p => p.id === id);
        
        if (!foundProduct) {
          toast({
            title: "Product Not Found",
            description: "The requested product could not be found.",
            variant: "destructive",
          });
          navigate('/products');
          return;
        }

        setProduct(foundProduct);

        // Get stock movements for this product
        const allMovements = dataService.getStockMovements?.() || [];
        const productMovements = allMovements.filter(m => m.productId === id);
        setStockMovements(productMovements);
      } catch (error) {
        console.error('Error loading product:', error);
        toast({
          title: "Error",
          description: "Failed to load product details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProductData();
    }
  }, [id, dataService, navigate, toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'discontinued': return 'bg-red-500';
      case 'out_of_stock': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) return { status: 'Out of Stock', color: 'destructive', icon: AlertTriangle };
    if (product.currentStock <= (product.reorderLevel || product.minStock)) return { status: 'Low Stock', color: 'warning', icon: TrendingDown };
    if (product.currentStock >= product.maxStock) return { status: 'Overstock', color: 'secondary', icon: TrendingUp };
    return { status: 'In Stock', color: 'success', icon: Package };
  };

  const handleStockMovement = async () => {
    if (!product || !stockQuantity) return;

    const quantity = parseInt(stockQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity.",
        variant: "destructive",
      });
      return;
    }

    const newStock = stockMovementType === 'in' 
      ? product.currentStock + quantity
      : stockMovementType === 'out'
      ? Math.max(0, product.currentStock - quantity)
      : quantity; // adjustment sets absolute value

    const movement: StockMovement = {
      id: Date.now().toString(),
      productId: product.id,
      type: stockMovementType,
      quantity,
      previousStock: product.currentStock,
      newStock,
      reference: `MANUAL-${Date.now()}`,
      notes: stockNotes || `Manual ${stockMovementType} adjustment`,
      createdBy: '1',
      createdAt: new Date()
    };

    // Update product stock
    const updatedProduct = {
      ...product,
      currentStock: newStock,
      availableStock: newStock - (product.reservedStock || 0),
      updatedAt: new Date()
    };

    setProduct(updatedProduct);
    setStockMovements(prev => [movement, ...prev]);
    
    // Reset form
    setStockQuantity('');
    setStockNotes('');
    setIsStockDialogOpen(false);

    toast({
      title: "Stock Updated",
      description: `Stock ${stockMovementType} recorded successfully.`,
    });
  };

  const duplicateProduct = () => {
    if (!product) return;
    
    // Navigate to new product page with pre-filled data
    navigate('/products/new', { 
      state: { 
        duplicateFrom: {
          ...product,
          name: product.name + ' (Copy)',
          sku: product.sku + '-COPY',
          id: undefined
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <p className="text-muted-foreground mb-4">The requested product could not be found.</p>
        <Button asChild>
          <Link to="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  const stockStatus = getStockStatus(product);
  const StockIcon = stockStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground">
              SKU: {product.sku} • Category: {product.category}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={duplicateProduct}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/products/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Package className="mr-2 h-4 w-4" />
                Adjust Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stock Movement</DialogTitle>
                <DialogDescription>
                  Adjust stock levels for {product.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={stockMovementType === 'in' ? 'default' : 'outline'}
                    onClick={() => setStockMovementType('in')}
                    className="flex items-center"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Stock In
                  </Button>
                  <Button
                    variant={stockMovementType === 'out' ? 'default' : 'outline'}
                    onClick={() => setStockMovementType('out')}
                    className="flex items-center"
                  >
                    <Minus className="mr-2 h-4 w-4" />
                    Stock Out
                  </Button>
                  <Button
                    variant={stockMovementType === 'adjustment' ? 'default' : 'outline'}
                    onClick={() => setStockMovementType('adjustment')}
                    className="flex items-center"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Adjust
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Current Stock: {product.currentStock} {product.unit}</Label>
                  <Label htmlFor="quantity">
                    {stockMovementType === 'adjustment' ? 'New Stock Level' : 'Quantity'}
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder={stockMovementType === 'adjustment' ? 'Enter new stock level' : 'Enter quantity'}
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={stockNotes}
                    onChange={(e) => setStockNotes(e.target.value)}
                    placeholder="Reason for stock movement..."
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStockMovement}>
                    Update Stock
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            <StockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{product.currentStock} {product.unit}</div>
            <Badge variant={stockStatus.color as any} className="mt-1">
              {stockStatus.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selling Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(product.sellingPrice)}</div>
            <p className="text-xs text-muted-foreground">
              Cost: {formatCurrency(product.purchasePrice)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(product.currentStock * product.sellingPrice)}
            </div>
            <p className="text-xs text-muted-foreground">
              At current selling price
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <div className={`h-2 w-2 rounded-full ${getStatusColor(product.status)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{product.status.replace('_', ' ')}</div>
            <p className="text-xs text-muted-foreground">
              {product.isActive ? 'Active' : 'Inactive'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Costs</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Product Name</Label>
                  <p className="text-sm text-muted-foreground">{product.name}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">
                    {product.description || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Barcode className="h-3 w-3" />
                      SKU
                    </Label>
                    <p className="text-sm text-muted-foreground font-mono">{product.sku}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Barcode</Label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {product.barcode || 'Not assigned'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Subcategory</Label>
                    <p className="text-sm text-muted-foreground">
                      {product.subcategory || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Brand</Label>
                    <p className="text-sm text-muted-foreground">
                      {product.brand || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Unit</Label>
                    <p className="text-sm text-muted-foreground">{product.unit}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Physical Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Weight className="h-3 w-3" />
                    Weight
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {product.weight ? `${product.weight} kg` : 'Not specified'}
                  </p>
                </div>

                {product.dimensions && (
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Ruler className="h-3 w-3" />
                      Dimensions
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {product.location || 'Not specified'}
                    {product.binLocation && ` (${product.binLocation})`}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Supplier</Label>
                  <p className="text-sm text-muted-foreground">
                    {product.supplier || 'Not specified'}
                  </p>
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Tags
                    </Label>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {product.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {product.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm text-muted-foreground">{product.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Structure</CardTitle>
              <CardDescription>
                Price levels and cost information for this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Cost Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Purchase Price:</span>
                      <span className="font-medium">{formatCurrency(product.purchasePrice)}</span>
                    </div>
                    {product.costPrice && product.costPrice !== product.purchasePrice && (
                      <div className="flex justify-between">
                        <span className="text-sm">Cost Price:</span>
                        <span className="font-medium">{formatCurrency(product.costPrice)}</span>
                      </div>
                    )}
                    {product.markup && (
                      <div className="flex justify-between">
                        <span className="text-sm">Markup:</span>
                        <span className="font-medium">{product.markup}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Selling Prices</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Selling Price:</span>
                      <span className="font-medium">{formatCurrency(product.sellingPrice)}</span>
                    </div>
                    {product.wholesalePrice && (
                      <div className="flex justify-between">
                        <span className="text-sm">Wholesale Price:</span>
                        <span className="font-medium">{formatCurrency(product.wholesalePrice)}</span>
                      </div>
                    )}
                    {product.retailPrice && product.retailPrice !== product.sellingPrice && (
                      <div className="flex justify-between">
                        <span className="text-sm">Retail Price:</span>
                        <span className="font-medium">{formatCurrency(product.retailPrice)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">Tax Information</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Taxable:</span>
                    <Badge variant={product.taxable ? 'default' : 'secondary'}>
                      {product.taxable ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {product.taxable && product.taxRate && (
                    <div className="flex justify-between">
                      <span className="text-sm">Tax Rate:</span>
                      <span className="font-medium">{product.taxRate}%</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stock Levels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Current Stock</Label>
                    <p className="text-lg font-bold">{product.currentStock} {product.unit}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Available Stock</Label>
                    <p className="text-lg font-bold">
                      {product.availableStock || product.currentStock} {product.unit}
                    </p>
                  </div>
                </div>

                {product.reservedStock && product.reservedStock > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Reserved Stock</Label>
                    <p className="text-lg font-bold">{product.reservedStock} {product.unit}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Minimum Stock</Label>
                    <p className="text-sm text-muted-foreground">{product.minStock} {product.unit}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Maximum Stock</Label>
                    <p className="text-sm text-muted-foreground">{product.maxStock} {product.unit}</p>
                  </div>
                </div>

                {product.reorderLevel && (
                  <div>
                    <Label className="text-sm font-medium">Reorder Level</Label>
                    <p className="text-sm text-muted-foreground">{product.reorderLevel} {product.unit}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Track Inventory:</span>
                  <Badge variant={product.trackInventory ? 'default' : 'secondary'}>
                    {product.trackInventory ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Allow Backorders:</span>
                  <Badge variant={product.allowBackorders ? 'default' : 'secondary'}>
                    {product.allowBackorders ? 'Yes' : 'No'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Has Variants:</span>
                  <Badge variant={product.hasVariants ? 'default' : 'secondary'}>
                    {product.hasVariants ? 'Yes' : 'No'}
                  </Badge>
                </div>

                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium">Stock Alerts</Label>
                  <div className="mt-2 space-y-2">
                    {product.currentStock === 0 && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Out of stock</span>
                      </div>
                    )}
                    {product.currentStock > 0 && product.currentStock <= (product.reorderLevel || product.minStock) && (
                      <div className="flex items-center gap-2 text-yellow-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Low stock - reorder needed</span>
                      </div>
                    )}
                    {product.currentStock >= product.maxStock && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">Overstock warning</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="variants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>
                Different variations of this product with their own pricing and stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.hasVariants && product.variants && product.variants.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variant</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Attributes</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.variants.map((variant) => (
                        <TableRow key={variant.id}>
                          <TableCell className="font-medium">{variant.name}</TableCell>
                          <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {Object.entries(variant.attributes).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {variant.price ? formatCurrency(variant.price) : 'Same as parent'}
                          </TableCell>
                          <TableCell>
                            {variant.stock !== undefined ? `${variant.stock} ${product.unit}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={variant.isActive ? 'default' : 'secondary'}>
                              {variant.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Box className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Variants</h3>
                  <p className="text-muted-foreground">
                    This product doesn't have any variants configured.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement History</CardTitle>
              <CardDescription>
                Track all stock movements for this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stockMovements.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Before</TableHead>
                        <TableHead>After</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockMovements.slice(0, 10).map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {movement.createdAt.toLocaleDateString()} {movement.createdAt.toLocaleTimeString()}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={movement.type === 'in' ? 'default' : movement.type === 'out' ? 'destructive' : 'secondary'}
                            >
                              {movement.type.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}{movement.quantity} {product.unit}
                          </TableCell>
                          <TableCell>{movement.previousStock} {product.unit}</TableCell>
                          <TableCell>{movement.newStock} {product.unit}</TableCell>
                          <TableCell className="font-mono text-sm">{movement.reference}</TableCell>
                          <TableCell>{movement.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Stock Movements</h3>
                  <p className="text-muted-foreground">
                    No stock movements have been recorded for this product yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
