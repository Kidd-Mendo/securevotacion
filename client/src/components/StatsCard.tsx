import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: "primary" | "secondary" | "accent" | "destructive";
  trend?: "up" | "down";
  trendValue?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  trendValue
}: StatsCardProps) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    accent: "text-accent bg-accent/10",
    destructive: "text-destructive bg-destructive/10",
  };

  const trendColorClasses = {
    up: "text-secondary",
    down: "text-destructive",
  };

  return (
    <Card className="stat-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {(subtitle || trend) && (
              <div className="flex items-center space-x-2 mt-2">
                {trend && (
                  <div className={cn("flex items-center", trendColorClasses[trend])}>
                    {trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {trendValue && <span className="text-sm ml-1">{trendValue}</span>}
                  </div>
                )}
                {subtitle && (
                  <p className={cn("text-sm", trend ? "text-gray-600" : "text-secondary")}>
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", colorClasses[color])}>
            <Icon className="text-xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
