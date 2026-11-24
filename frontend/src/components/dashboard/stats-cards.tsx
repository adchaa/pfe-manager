// src/components/dashboard/stats-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

const colorStyles = {
  blue: "bg-blue-50 border-blue-200",
  green: "bg-green-50 border-green-200",
  purple: "bg-purple-50 border-purple-200",
  orange: "bg-orange-50 border-orange-200",
  red: "bg-red-50 border-red-200",
};

const iconColorStyles = {
  blue: "text-blue-600",
  green: "text-green-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
  red: "text-red-600",
};

export function StatsCard({ title, value, icon: Icon, description, trend, color = "blue" }: StatsCardProps) {
  return (
    <Card className={cn("border", colorStyles[color])}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
            {trend && (
              <p className={cn("text-xs mt-1", trend.isPositive ? "text-green-600" : "text-red-600")}>
                {trend.isPositive ? "↑" : "↓"} {trend.value}%
              </p>
            )}
          </div>
          <div className={cn("p-2 rounded-full", colorStyles[color])}>
            <Icon className={cn("h-5 w-5", iconColorStyles[color])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}