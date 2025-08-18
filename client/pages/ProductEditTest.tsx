import React, { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function ProductEditTest() {
  const [productId, setProductId] = useState(
    "b4ca8c2d-7c1a-11f0-a984-365070d15890",
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [productData, setProductData] = useState<any>(null);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setResult("");

      const response = await fetch(`/api/products/${productId}`, {
        headers: {
          "x-company-id": "00000000-0000-0000-0000-000000000001",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProductData(data.data);
        setResult(`✅ Product loaded: ${data.data.name}`);
        console.log("Product data:", data.data);
      } else {
        setResult(`❌ Error loading product: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to load product:", error);
      setResult(`❌ Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async () => {
    if (!productData) {
      setResult("❌ Load product first");
      return;
    }

    try {
      setLoading(true);
      setResult("");

      // Simple update - just change the description
      const updateData = {
        ...productData,
        description: `Updated at ${new Date().toLocaleTimeString()}`,
        category: "", // Empty category to test the fix
        categoryId: null,
      };

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-company-id": "00000000-0000-0000-0000-000000000001",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Product updated successfully!`);
        console.log("Update result:", data);
        // Reload the product to see changes
        await loadProduct();
      } else {
        setResult(
          `❌ Error updating product: ${data.error || "Unknown error"}\nDetails: ${data.details || "No details"}`,
        );
        console.error("Update error:", data);
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      setResult(`❌ Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Product Edit Test</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Product Update Fix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="productId">Product ID</Label>
            <Input
              id="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Enter product ID"
              className="mt-1"
            />
          </div>

          <div className="space-x-2">
            <Button onClick={loadProduct} disabled={loading} variant="outline">
              {loading ? "Loading..." : "Load Product"}
            </Button>
            <Button onClick={updateProduct} disabled={loading || !productData}>
              {loading ? "Updating..." : "Test Update"}
            </Button>
          </div>

          {productData && (
            <div className="p-3 bg-gray-100 rounded">
              <h3 className="font-semibold">Current Product:</h3>
              <p>
                <strong>Name:</strong> {productData.name}
              </p>
              <p>
                <strong>SKU:</strong> {productData.sku}
              </p>
              <p>
                <strong>Description:</strong> {productData.description}
              </p>
              <p>
                <strong>Category ID:</strong> {productData.categoryId || "null"}
              </p>
              <p>
                <strong>Unit:</strong> {productData.unitOfMeasure}
              </p>
            </div>
          )}

          {result && (
            <div
              className={`p-3 rounded whitespace-pre-wrap ${
                result.startsWith("✅")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {result}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
