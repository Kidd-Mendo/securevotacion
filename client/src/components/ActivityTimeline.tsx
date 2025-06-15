import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  UserPlus, 
  Settings, 
  Vote,
  Shield,
  Users,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ActivityItem {
  id: string;
  type: "vote" | "user_action" | "system" | "election" | "security";
  user: string;
  action: string;
  timestamp: Date;
  details?: string;
}

export default function ActivityTimeline() {
  // Mock activity data - in real app this would come from API
  const activities: ActivityItem[] = [
    {
      id: "1",
      type: "vote",
      user: "María González",
      action: "emitió su voto en \"Representante Estudiantil\"",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
    {
      id: "2",
      type: "user_action",
      user: "Admin",
      action: "registró 12 nuevos estudiantes",
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    },
    {
      id: "3",
      type: "system",
      user: "Sistema",
      action: "actualizó configuración de seguridad",
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    },
    {
      id: "4",
      type: "election",
      user: "Admin",
      action: "creó nueva elección \"Consejo Académico\"",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "5",
      type: "vote",
      user: "Carlos Mendoza",
      action: "emitió su voto en \"Representante Estudiantil\"",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
    {
      id: "6",
      type: "security",
      user: "Sistema",
      action: "completó verificación de integridad",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "vote":
        return <CheckCircle className="w-5 h-5 text-white" />;
      case "user_action":
        return <UserPlus className="w-5 h-5 text-white" />;
      case "system":
        return <Settings className="w-5 h-5 text-white" />;
      case "election":
        return <Vote className="w-5 h-5 text-white" />;
      case "security":
        return <Shield className="w-5 h-5 text-white" />;
      default:
        return <AlertCircle className="w-5 h-5 text-white" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "vote":
        return "bg-secondary";
      case "user_action":
        return "bg-primary";
      case "system":
        return "bg-accent";
      case "election":
        return "bg-purple-500";
      case "security":
        return "bg-green-600";
      default:
        return "bg-gray-500";
    }
  };

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return "Hace unos segundos";
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? "s" : ""}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
    } else {
      return format(timestamp, "d MMM, HH:mm", { locale: es });
    }
  };

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">No hay actividad reciente</p>
        </div>
      ) : (
        activities.map((activity, index) => (
          <div key={activity.id} className="activity-timeline-item">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span>{" "}
                <span>{activity.action}</span>
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-gray-500">
                  {getRelativeTime(activity.timestamp)}
                </p>
                {activity.details && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-xs text-gray-500">{activity.details}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        ))
      )}
      
      {activities.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <button className="text-xs text-primary hover:text-primary-dark font-medium">
            Ver toda la actividad →
          </button>
        </div>
      )}
    </div>
  );
}
