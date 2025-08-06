import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Plus,
  Search,
  Ruler,
  Weight,
  Droplets,
  Package,
  Clock,
  Thermometer,
  Zap,
  Activity,
  Calculator,
  ArrowRightLeft,
  Edit,
  Trash2,
} from "lucide-react";
import {
  UnitConverter,
  UnitOfMeasure,
  UnitCategory,
  standardUnits,
} from "@shared/units";
import { useToast } from "../hooks/use-toast";

interface UnitFormData {
  name: string;
  symbol: string;
  category: UnitCategory;
  description: string;
}

export default function UnitsOfMeasure() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [customUnits, setCustomUnits] = useState<UnitOfMeasure[]>([]);
  const [formData, setFormData] = useState<UnitFormData>({
    name: "",
    symbol: "",
    category: "quantity",
    description: "",
  });
  const [convertFrom, setConvertFrom] = useState("");
  const [convertTo, setConvertTo] = useState("");
  const [convertValue, setConvertValue] = useState("");
  const [convertResult, setConvertResult] = useState<number | null>(null);
  const { toast } = useToast();

  const allUnits = [...standardUnits, ...customUnits];
  const categories = UnitConverter.getAllCategories();

  const filteredUnits = allUnits.filter((unit) => {
    const matchesSearch =
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || unit.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: UnitCategory) => {
    switch (category) {
      case "length":
        return <Ruler className="h-4 w-4" />;
      case "weight":
        return <Weight className="h-4 w-4" />;
      case "volume":
        return <Droplets className="h-4 w-4" />;
      case "quantity":
        return <Package className="h-4 w-4" />;
      case "time":
        return <Clock className="h-4 w-4" />;
      case "temperature":
        return <Thermometer className="h-4 w-4" />;
      case "energy":
        return <Zap className="h-4 w-4" />;
      case "pressure":
        return <Activity className="h-4 w-4" />;
      case "area":
        return <Ruler className="h-4 w-4" />;
      case "digital":
        return <Calculator className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: UnitCategory) => {
    switch (category) {
      case "length":
        return "bg-blue-100 text-blue-800";
      case "weight":
        return "bg-green-100 text-green-800";
      case "volume":
        return "bg-cyan-100 text-cyan-800";
      case "quantity":
        return "bg-purple-100 text-purple-800";
      case "time":
        return "bg-orange-100 text-orange-800";
      case "temperature":
        return "bg-red-100 text-red-800";
      case "energy":
        return "bg-yellow-100 text-yellow-800";
      case "pressure":
        return "bg-pink-100 text-pink-800";
      case "area":
        return "bg-indigo-100 text-indigo-800";
      case "digital":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.symbol || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newUnit: UnitOfMeasure = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      symbol: formData.symbol,
      category: formData.category,
      description: formData.description,
    };

    setCustomUnits((prev) => [...prev, newUnit]);
    setIsCreateDialogOpen(false);
    resetForm();

    toast({
      title: "Unit Created",
      description: `Custom unit "${formData.name}" has been created successfully.`,
    });
  };

  const handleDeleteUnit = (unitId: string) => {
    if (!unitId.startsWith("custom-")) {
      toast({
        title: "Cannot Delete",
        description: "Standard units cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    setCustomUnits((prev) => prev.filter((u) => u.id !== unitId));
    toast({
      title: "Unit Deleted",
      description: "Custom unit has been deleted successfully.",
    });
  };

  const handleConversion = () => {
    if (!convertFrom || !convertTo || !convertValue) return;

    const value = parseFloat(convertValue);
    if (isNaN(value)) return;

    const result = UnitConverter.convertUnits(value, convertFrom, convertTo);
    setConvertResult(result);

    if (result === null) {
      toast({
        title: "Conversion Error",
        description:
          "Cannot convert between these units. They must be in the same category.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      symbol: "",
      category: "quantity",
      description: "",
    });
  };

  const getCategoryStats = () => {
    return categories.map((category) => ({
      category,
      count: allUnits.filter((u) => u.category === category).length,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Units of Measure
          </h1>
          <p className="text-muted-foreground">
            Manage standard and custom units of measure for your products
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Unit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Unit</DialogTitle>
              <DialogDescription>
                Create a custom unit of measure for your specific needs
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUnit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Unit Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Bundle"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol *</Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        symbol: e.target.value,
                      }))
                    }
                    placeholder="e.g., bnd"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: UnitCategory) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category)}
                          <span className="capitalize">{category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Unit</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {getCategoryStats().map(({ category, count }) => (
          <Card key={category}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {category}
              </CardTitle>
              {getCategoryIcon(category)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground">units available</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Units List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Units</CardTitle>
              <CardDescription>
                Standard and custom units of measure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search units..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category)}
                          <span className="capitalize">{category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUnits.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{unit.name}</div>
                            {unit.baseUnit && (
                              <div className="text-xs text-muted-foreground">
                                Base:{" "}
                                {UnitConverter.getUnitById(unit.baseUnit)?.name}
                                {unit.conversionFactor &&
                                  ` (×${unit.conversionFactor})`}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {unit.symbol}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getCategoryColor(unit.category)}
                          >
                            <div className="flex items-center space-x-1">
                              {getCategoryIcon(unit.category)}
                              <span className="capitalize">
                                {unit.category}
                              </span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {unit.description || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {unit.id.startsWith("custom-") ? (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUnit(unit.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Standard
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredUnits.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No units found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || categoryFilter !== "all"
                      ? "Try adjusting your search terms or filters."
                      : "Start by creating your first custom unit."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Unit Converter */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Unit Converter
              </CardTitle>
              <CardDescription>
                Convert between units of the same category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Select value={convertFrom} onValueChange={setConvertFrom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {categories.map((category) => (
                      <div key={category}>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground capitalize border-t mt-1 pt-1">
                          {category}
                        </div>
                        {UnitConverter.getUnitsByCategory(category).map(
                          (unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name} ({unit.symbol})
                            </SelectItem>
                          ),
                        )}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  placeholder="Enter value"
                  value={convertValue}
                  onChange={(e) => setConvertValue(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>To</Label>
                <Select value={convertTo} onValueChange={setConvertTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {categories.map((category) => (
                      <div key={category}>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground capitalize border-t mt-1 pt-1">
                          {category}
                        </div>
                        {UnitConverter.getUnitsByCategory(category).map(
                          (unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name} ({unit.symbol})
                            </SelectItem>
                          ),
                        )}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleConversion}
                className="w-full"
                disabled={!convertFrom || !convertTo || !convertValue}
              >
                Convert
              </Button>

              {convertResult !== null && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Result:</div>
                  <div className="text-lg font-bold">
                    {convertResult.toLocaleString()}{" "}
                    {UnitConverter.getUnitById(convertTo)?.symbol}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Quick Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium">Common Conversions:</div>
                  <div className="text-muted-foreground space-y-1 mt-1">
                    <div>1 kg = 1000 g</div>
                    <div>1 m = 100 cm</div>
                    <div>1 L = 1000 ml</div>
                    <div>1 dozen = 12 pieces</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium">Categories:</div>
                  <div className="text-muted-foreground">
                    Units can only be converted within the same category
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
