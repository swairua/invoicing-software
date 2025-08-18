import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { dataServiceFactory } from "../services/dataServiceFactory";

export default function CategoryTest() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const dataService = dataServiceFactory.getDataService();

  const loadCategories = async () => {
    try {
      setLoading(true);
      setResult("");

      const categoriesData = await dataService.getCategories();
      console.log("📦 Categories loaded:", categoriesData);
      setCategories(categoriesData || []);
      setResult(`✅ Loaded ${categoriesData?.length || 0} categories`);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setResult(`❌ Error: ${error.message}`);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const setupCategories = async () => {
    try {
      setLoading(true);
      setResult("");

      const response = await fetch("/api/categories/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-company-id": "00000000-0000-0000-0000-000000000001",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ ${data.message}`);
        // Reload categories
        await loadCategories();
      } else {
        setResult(`❌ Error: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to setup categories:", error);
      setResult(`❌ Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Category Test</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-x-2">
            <Button
              onClick={loadCategories}
              disabled={loading}
              variant="outline"
            >
              {loading ? "Loading..." : "Load Categories"}
            </Button>
            <Button onClick={setupCategories} disabled={loading}>
              {loading ? "Setting up..." : "Setup Categories"}
            </Button>
          </div>

          {result && (
            <div
              className={`p-3 rounded ${
                result.startsWith("✅")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {result}
            </div>
          )}

          {categories.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Available Categories:</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-2 border rounded">
                    <div className="font-medium">{cat.name}</div>
                    <div className="text-sm text-gray-600">ID: {cat.id}</div>
                    <div className="text-sm text-gray-500">
                      {cat.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
