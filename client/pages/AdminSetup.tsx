import React, { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function AdminSetup() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

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
        console.log("Categories setup result:", data);
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

  const testCategoriesAPI = async () => {
    try {
      setLoading(true);
      setResult("");

      const response = await fetch("/api/categories", {
        headers: {
          "x-company-id": "00000000-0000-0000-0000-000000000001",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(
          `✅ Found ${data.data.length} categories:\n${data.data.map((c) => `- ${c.name} (${c.id})`).join("\n")}`,
        );
        console.log("Categories:", data);
      } else {
        setResult(`❌ Error: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setResult(`❌ Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Admin Setup</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Database Setup Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Create sample product categories if none exist
            </p>
            <Button
              onClick={setupCategories}
              disabled={loading}
              className="mr-2"
            >
              {loading ? "Setting up..." : "Setup Categories"}
            </Button>
            <Button
              onClick={testCategoriesAPI}
              disabled={loading}
              variant="outline"
            >
              {loading ? "Loading..." : "Test Categories API"}
            </Button>
          </div>

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
