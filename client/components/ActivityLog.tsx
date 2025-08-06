import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  User,
  FileText,
  DollarSign,
  Package,
  Users,
  Receipt,
  CreditCard,
  RefreshCw,
  Clock,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { dataServiceFactory } from "@/services/dataServiceFactory";

export interface ActivityLogEntry {
  id: string;
  type:
    | "invoice"
    | "payment"
    | "customer"
    | "product"
    | "quotation"
    | "proforma"
    | "credit_note"
    | "system";
  action: "created" | "updated" | "deleted" | "paid" | "sent" | "converted";
  title: string;
  description: string;
  user: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ActivityLogProps {
  limit?: number;
  type?: string;
  showHeader?: boolean;
  className?: string;
}

export default function ActivityLog({
  limit = 10,
  type,
  showHeader = true,
  className = "",
}: ActivityLogProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [type, limit]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const dataService = dataServiceFactory.getDataService();
      const activityData = await dataService.getActivityLog();

      let filteredActivities = activityData;
      if (type) {
        filteredActivities = activityData.filter(
          (activity) => activity.type === type,
        );
      }

      setActivities(filteredActivities.slice(0, limit));
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "invoice":
        return <FileText className="h-4 w-4" />;
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      case "customer":
        return <Users className="h-4 w-4" />;
      case "product":
        return <Package className="h-4 w-4" />;
      case "quotation":
        return <Receipt className="h-4 w-4" />;
      case "proforma":
        return <FileText className="h-4 w-4" />;
      case "credit_note":
        return <RefreshCw className="h-4 w-4" />;
      case "system":
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "invoice":
        return "text-blue-600";
      case "payment":
        return "text-green-600";
      case "customer":
        return "text-purple-600";
      case "product":
        return "text-orange-600";
      case "quotation":
        return "text-indigo-600";
      case "proforma":
        return "text-teal-600";
      case "credit_note":
        return "text-red-600";
      case "system":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getBadgeVariant = (action: string) => {
    switch (action) {
      case "created":
        return "default";
      case "updated":
        return "secondary";
      case "deleted":
        return "destructive";
      case "paid":
        return "default";
      case "sent":
        return "secondary";
      case "converted":
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Log
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={loadActivities}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-6 space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 p-2 rounded-full bg-muted ${getActivityColor(activity.type)}`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getBadgeVariant(activity.action) as any}
                            className="text-xs"
                          >
                            {activity.action}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{activity.user}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span title={format(activity.timestamp, "PPP p")}>
                          {formatDistanceToNow(activity.timestamp, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {index < activities.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Hook for adding activity logs
export const useActivityLog = () => {
  const logActivity = async (
    entry: Omit<ActivityLogEntry, "id" | "timestamp">,
  ) => {
    try {
      const dataService = dataServiceFactory.getDataService();
      await dataService.addActivityLog({
        ...entry,
        id: Date.now().toString(),
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  return { logActivity };
};
