import React, { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function DatabaseMigration() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState<any>(null);

  const runMigration = async () => {
    setStatus("loading");
    setMessage("");
    setDetails(null);

    try {
      const response = await fetch("/api/migration/run-migration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        setDetails(data.data);
      } else {
        setStatus("error");
        setMessage(data.error || "Migration failed");
        setDetails(data.details);
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to run migration");
      setDetails(error.message);
    }
  };

  const checkStatus = async () => {
    setStatus("loading");
    setMessage("");
    setDetails(null);

    try {
      const response = await fetch("/api/migration/status");
      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage("Database status checked successfully");
        setDetails(data.data);
      } else {
        setStatus("error");
        setMessage(data.error || "Status check failed");
        setDetails(data.details);
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to check database status");
      setDetails(error.message);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Database Migration</h1>
        <p className="text-muted-foreground mt-2">
          Run database migrations to create missing tables and fix product
          connectivity issues.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Migration</CardTitle>
            <CardDescription>
              This will create all necessary database tables including products,
              categories, customers, and more.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={runMigration}
                disabled={status === "loading"}
                className="flex items-center gap-2"
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Run Migration
              </Button>
              <Button
                variant="outline"
                onClick={checkStatus}
                disabled={status === "loading"}
                className="flex items-center gap-2"
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Check Status
              </Button>
            </div>

            {status === "success" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {details && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Migration Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(details, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What this fixes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>
                Creates the missing <code>products</code> table for product
                storage
              </li>
              <li>
                Creates the missing <code>product_categories</code> table for
                category dropdowns
              </li>
              <li>
                Creates all other required tables (customers, invoices, etc.)
              </li>
              <li>Fixes the "relation does not exist" errors in the logs</li>
              <li>
                Connects the frontend product forms to the actual database
              </li>
              <li>Enables real product creation, editing, and storage</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
