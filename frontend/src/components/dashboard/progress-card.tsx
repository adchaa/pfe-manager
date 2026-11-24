// src/components/dashboard/progress-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  title: string;
  value: number;
  total: number;
  percentage: number;
  color?: string;
}

export function ProgressCard({ title, value, total, percentage, color }: ProgressCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">of {total}</p>
        </div>
        <Progress value={percentage} className="mt-2" />
        <p className="text-xs text-gray-400 mt-2">{percentage}% completed</p>
      </CardContent>
    </Card>
  );
}