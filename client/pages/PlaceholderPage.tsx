import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  module: string;
}

export default function PlaceholderPage({ module }: PlaceholderPageProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card className="text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
            <Construction className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">{module}</CardTitle>
          <CardDescription className="text-base">
            This module is coming soon! We're working hard to bring you this feature.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Our business management system will include a comprehensive {module.toLowerCase()} module with:
          </p>
          
          <div className="bg-muted p-4 rounded-lg text-left">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Full CRUD operations</li>
              <li>• Advanced filtering and search</li>
              <li>• PDF export capabilities</li>
              <li>• Integration with other modules</li>
              <li>• Real-time updates</li>
              <li>• Mobile-responsive design</li>
            </ul>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Want to see this module implemented? Let us know what features are most important to you!
            </p>
            
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link to="/dashboard">
                  Return to Dashboard
                </Link>
              </Button>
              <Button variant="outline">
                Request Feature
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
