import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { dataServiceFactory } from "../services/dataServiceFactory";

interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId?: string;
  category?: string;
}

export default function ProductTest() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const dataService = dataServiceFactory.getDataService();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await dataService.getProducts({ page: 1, limit: 10 });
      console.log("📦 Products loaded:", result);
      setProducts(result.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
      setError("Failed to load products: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testProductById = async (productId: string) => {
    try {
      console.log("🔍 Testing product:", productId);
      const product = await dataService.getProductById(productId);
      console.log("📦 Product result:", product);
      alert(`Product ${productId}: ${product ? 'Found' : 'Not found'}`);
    } catch (error) {
      console.error("Error testing product:", error);
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Loading Products...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Product Database Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Available Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p>No products found in database</p>
          ) : (
            <div className="space-y-2">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between border p-3 rounded">
                  <div>
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-gray-600">
                      ID: {product.id} | SKU: {product.sku}
                    </div>
                    <div className="text-sm text-gray-500">
                      Category: {product.category || product.categoryId || 'None'}
                    </div>
                  </div>
                  <div className="space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => testProductById(product.id)}
                    >
                      Test API
                    </Button>
                    <Button size="sm" asChild>
                      <Link to={`/products/${product.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    <Button size="sm" variant="secondary" asChild>
                      <Link to={`/products/${product.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild>
            <Link to="/products/new">Create New Product</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/products">View All Products</Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => testProductById("00000000-0000-0000-0000-000000000001")}
          >
            Test Missing Product ID
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
