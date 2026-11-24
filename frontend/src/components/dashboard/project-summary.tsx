// src/components/dashboard/project-summary-card.tsx
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GitBranch, CheckCircle2, Calendar, Users } from "lucide-react";
import type { DashboardProject } from "@/types/dashboard.types";

interface ProjectSummaryCardProps {
  project: DashboardProject;
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
};

export function ProjectSummaryCard({ project }: ProjectSummaryCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all group">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          {/* MODIFICATION ICI: Lien vers les sprints du projet */}
          <Link 
            to={`/sprints?projectId=${project._id}`} 
            className="hover:underline flex-1"
          >
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {project.title}
            </CardTitle>
          </Link>
          <Badge variant={project.state === "ACTIVE" ? "default" : "secondary"}>
            {project.state}
          </Badge>
        </div>
        {project.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{project.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <GitBranch className="h-3 w-3 text-gray-400" />
            <span>{project.stats.totalSprints} Sprints</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-gray-400" />
            <span>{project.activeSprints} Active</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span>{project.stats.upcomingMeetings} Meetings</span>
          </div>
        </div>

        {/* Progression des tâches */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Tasks Progress</span>
            <span>{project.stats.completionPercentage}%</span>
          </div>
          <Progress value={project.stats.completionPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{project.stats.completedTasks} completed</span>
            <span>{project.stats.totalTasks} total</span>
          </div>
        </div>

        {/* Étudiant */}
        <div className="flex items-center gap-2 pt-1">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[10px] bg-gray-100">
              {getInitials(project.student.firstName, project.student.lastName)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-500">
            {project.student.firstName} {project.student.lastName}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}