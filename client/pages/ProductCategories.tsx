import React, { useState, useEffect } from "react";
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
import { Textarea } from "../components/ui/textarea";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Plus,
  Search,
  Tag,
  MoreHorizontal,
  Edit,
  Trash2,
  FolderPlus,
  Folder,
  ChevronRight,
  TreePine,
} from "lucide-react";
import { ProductCategory } from "@shared/types";
import { dataServiceFactory } from "../services/dataServiceFactory";
import { useToast } from "../hooks/use-toast";

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
}

// Mock data for now - will be replaced with API calls
const mockCategories: ProductCategory[] = [
  {
    id: "1",
    name: "Medical Supplies",
    description: "Medical and healthcare products",
    companyId: "1",
  },
  {
    id: "2", 
    name: "PPE",
    description: "Personal Protective Equipment",
    companyId: "1",
    parentId: "1",
  },
  {
    id: "3",
    name: "Electronics",
    description: "Electronic devices and accessories",
    companyId: "1",
  },
  {
    id: "4",
    name: "Office Furniture",
    description: "Desks, chairs, and office equipment",
    companyId: "1",
  },
  {
    id: "5",
    name: "Chairs",
    description: "Office seating solutions",
    companyId: "1",
    parentId: "4",
  },
];

export default function ProductCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<ProductCategory[]>(mockCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<ProductCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    parentId: "",
  });

  const businessData = dataServiceFactory.getDataService();

  // Get root categories (no parent)
  const rootCategories = categories.filter(cat => !cat.parentId);
  
  // Get subcategories for a parent
  const getSubcategories = (parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  // Get category hierarchy path
  const getCategoryPath = (category: ProductCategory): string => {
    if (!category.parentId) return category.name;
    
    const parent = categories.find(cat => cat.id === category.parentId);
    if (parent) {
      return `${getCategoryPath(parent)} > ${category.name}`;
    }
    return category.name;
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryPath(category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const categoryData = {
        name: formData.name,
        description: formData.description,
        companyId: "1", // This should come from user context
        ...(formData.parentId && { parentId: formData.parentId }),
      };

      if (editingCategory) {
        // Update existing category
        const updatedCategory = { ...editingCategory, ...categoryData };
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        ));
        toast({
          title: "Success",
          description: "Category updated successfully.",
        });
        setIsEditDialogOpen(false);
        setEditingCategory(null);
      } else {
        // Create new category
        const newCategory: ProductCategory = {
          id: Date.now().toString(),
          ...categoryData,
        };
        setCategories(prev => [...prev, newCategory]);
        toast({
          title: "Success", 
          description: "Category created successfully.",
        });
        setIsCreateDialogOpen(false);
      }

      setFormData({ name: "", description: "", parentId: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      parentId: category.parentId || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;

    try {
      // Check if category has subcategories
      const hasSubcategories = categories.some(cat => cat.parentId === deleteCategory.id);
      if (hasSubcategories) {
        toast({
          title: "Cannot Delete",
          description: "This category has subcategories. Please delete them first.",
          variant: "destructive",
        });
        return;
      }

      setCategories(prev => prev.filter(cat => cat.id !== deleteCategory.id));
      toast({
        title: "Success",
        description: "Category deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteCategory(null);
    }
  };

  const renderCategoryRow = (category: ProductCategory, level: number = 0) => {
    const subcategories = getSubcategories(category.id);
    const hasSubcategories = subcategories.length > 0;

    return (
      <React.Fragment key={category.id}>
        <TableRow>
          <TableCell>
            <div className={`flex items-center gap-2 ${level > 0 ? `ml-${level * 6}` : ''}`}>
              {level > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              {hasSubcategories ? (
                <Folder className="h-4 w-4 text-blue-500" />
              ) : (
                <Tag className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <div className="font-medium">{category.name}</div>
                {category.description && (
                  <div className="text-sm text-muted-foreground">
                    {category.description}
                  </div>
                )}
              </div>
            </div>
          </TableCell>
          <TableCell>
            {level > 0 ? (
              <Badge variant="outline">Subcategory</Badge>
            ) : (
              <Badge variant="default">Root Category</Badge>
            )}
          </TableCell>
          <TableCell>
            <Badge variant="secondary">{hasSubcategories ? subcategories.length : 0} subcategories</Badge>
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEdit(category)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteCategory(category)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {/* Render subcategories */}
        {subcategories.map(subcat => renderCategoryRow(subcat, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories and subcategories for better organization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Add a new product category to organize your inventory
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent">Parent Category</Label>
                  <Select
                    value={formData.parentId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No parent (Root category)</SelectItem>
                      {rootCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Category</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              All categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Root Categories</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rootCategories.length}</div>
            <p className="text-xs text-muted-foreground">
              Top-level categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subcategories</CardTitle>
            <FolderPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter(cat => cat.parentId).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Nested categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Depth</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Category hierarchy depth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            {filteredCategories.length} of {categories.length} categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subcategories</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Tag className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No categories found
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsCreateDialogOpen(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Category
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  searchTerm 
                    ? filteredCategories.map(category => renderCategoryRow(category))
                    : rootCategories.map(category => renderCategoryRow(category))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter category description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-parent">Parent Category</Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No parent (Root category)</SelectItem>
                  {rootCategories
                    .filter(cat => cat.id !== editingCategory?.id)
                    .map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Category</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              category "{deleteCategory?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
