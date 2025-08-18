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

export default function TestUpdate() {
  const [productId, setProductId] = useState(
    "b4ca8c2d-7c1a-11f0-a984-365070d15890",
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const testUpdateProduct = async () => {
    try {
      setLoading(true);
      setResult("");

      const updateData = {
        name: `Updated Product ${new Date().toLocaleTimeString()}`,
        description: `Test update at ${new Date().toLocaleString()}`,
        category: "", // This would cause the original error
        categoryId: null,
      };

      console.log("🧪 Testing safe update endpoint...");

      const response = await fetch(`/api/test-update/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-company-id": "00000000-0000-0000-0000-000000000001",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(
          `✅ SUCCESS! Product updated successfully!\n\nResponse: ${JSON.stringify(data, null, 2)}`,
        );
        console.log("✅ Update successful:", data);
      } else {
        setResult(
          `❌ Error: ${data.error || "Unknown error"}\nDetails: ${data.details || "No details"}`,
        );
        console.error("❌ Update failed:", data);
      }
    } catch (error) {
      console.error("Failed to test update:", error);
      setResult(`❌ Network Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testOriginalEndpoint = async () => {
    try {
      setLoading(true);
      setResult("");

      const updateData = {
        name: `Test Original ${new Date().toLocaleTimeString()}`,
        description: `Original endpoint test at ${new Date().toLocaleString()}`,
        category: "", // This should cause the 500 error
        categoryId: null,
      };

      console.log("🧪 Testing original endpoint...");

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
        setResult(
          `✅ Original endpoint worked: ${JSON.stringify(data, null, 2)}`,
        );
      } else {
        setResult(
          `❌ Original endpoint failed (expected): ${response.status}\nError: ${data.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Original endpoint test failed:", error);
      setResult(`❌ Original endpoint error (expected): ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Test Product Update Fix</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Product Update Test</CardTitle>
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
            <Button
              onClick={testUpdateProduct}
              disabled={loading}
              variant="default"
            >
              {loading ? "Testing..." : "Test Safe Update (NEW)"}
            </Button>
            <Button
              onClick={testOriginalEndpoint}
              disabled={loading}
              variant="outline"
            >
              {loading ? "Testing..." : "Test Original Endpoint"}
            </Button>
          </div>

          {result && (
            <div
              className={`p-3 rounded whitespace-pre-wrap font-mono text-sm ${
                result.startsWith("✅")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {result}
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p>
              <strong>Safe Update:</strong> Uses the new test endpoint with
              forced null category
            </p>
            <p>
              <strong>Original Endpoint:</strong> Uses the problematic original
              endpoint (should fail)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
