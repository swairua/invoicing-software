import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Database, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function SampleDataCreator() {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const createSampleData = async () => {
    setIsCreating(true);
    setResult(null);

    try {
      const response = await fetch('/api/seed/sample-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-company-id': '550e8400-e29b-41d4-a716-446655440000',
          'x-user-id': '550e8400-e29b-41d4-a716-446655440001'
        }
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        toast({
          title: "Success!",
          description: `Created ${data.data.customers} customers and ${data.data.products} products`,
        });
      } else {
        throw new Error(data.error || 'Failed to create sample data');
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      toast({
        title: "Error",
        description: "Failed to create sample data. Please check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sample Data Creator</h1>
        <p className="text-muted-foreground">Create sample customers and products for testing</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Create Sample Data
          </CardTitle>
          <CardDescription>
            This will create 3 sample customers and 3 sample products in your database for testing purposes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Sample data includes:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 3 customers: Acme Corporation Ltd, Safari Digital Agency, East Africa Logistics</li>
              <li>• 3 products: Website Design Package, Digital Marketing Campaign, Business Logo Design</li>
            </ul>
          </div>

          <Button 
            onClick={createSampleData} 
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Sample Data...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Create Sample Data
              </>
            )}
          </Button>

          {result && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully created {result.data.customers} customers and {result.data.products} products!
                You can now navigate to the Customers and Products pages to see the sample data.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
