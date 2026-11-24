// src/components/projects/project-card.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Eye, Edit, Archive, Trash2, Users, GitBranch, CheckCircle2, FileText, CalendarDays } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import type { Project } from "@/types/project.types";
import { ProjectState } from "@/types/enums";

interface ProjectCardProps {
  project: Project;
  isStudent: boolean;
  currentUserId: string;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onArchive: (project: Project) => void;
  onDelete: (project: Project) => void;
  onGenerateReport?: (projectId: string) => void;
  onManageMeetings?: (projectId: string) => void;
}

// Composant pour le badge d'état
const StateBadge = ({ state }: { state: ProjectState }) => {
  const styles: Record<ProjectState, string> = {
    [ProjectState.ACTIVE]: "bg-green-100 text-green-800 border-green-200",
    [ProjectState.ARCHIVED]: "bg-gray-100 text-gray-800 border-gray-200",
    COMPLETED: ""
  };

  const labels: Record<ProjectState, string> = {
    [ProjectState.ACTIVE]: "Active",
    [ProjectState.ARCHIVED]: "Archived",
    COMPLETED: ""
  };

  return (
    <Badge variant="outline" className={styles[state]}>
      {labels[state]}
    </Badge>
  );
};

// Fonction pour obtenir les initiales
const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
};

// Calcul du pourcentage de progression (exemple - à adapter selon vos données)
const getCompletionPercentage = (project: Project): number => {
  // Vous pouvez calculer basé sur les sprints ou les tâches
  // Pour l'instant, exemple avec des valeurs mock
  // Idéalement, ce calcul viendrait des données du backend
  if (project.state === ProjectState.ARCHIVED) return 100;
  return Math.floor(Math.random() * 100);
};

export function ProjectCard({
  project,
  isStudent,
  currentUserId,
  onView,
  onEdit,
  onArchive,
  onDelete,
  onGenerateReport,
  onManageMeetings,
}: ProjectCardProps) {
  const isOwner = isStudent && project.student._id === currentUserId;
  const completionPercentage = getCompletionPercentage(project);

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border border-gray-100">
      {/* En-tête */}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          {/* Titre et lien vers les sprints */}
          <div className="flex-1 min-w-0">
            <Link
              to={`/sprints?projectId=${project._id}`}
              className="inline-block"
            >
              <CardTitle className="text-xl font-bold text-gray-900 hover:text-primary transition-colors line-clamp-1">
                {project.title}
              </CardTitle>
            </Link>
            {project.description && (
              <CardDescription className="mt-1.5 line-clamp-2 text-sm text-gray-500">
                {project.description}
              </CardDescription>
            )}
          </div>
          <StateBadge state={project.state} />
        </div>
      </CardHeader>

      {/* Contenu */}
      <CardContent className="space-y-4">
        {/* Dates */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Start: {format(new Date(project.startDate), "dd MMM yyyy")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>End: {format(new Date(project.endDate), "dd MMM yyyy")}</span>
          </div>
        </div>

        {/* Équipe */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs font-medium text-gray-600">Team</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                  {getInitials(project.academicSupervisor.firstName, project.academicSupervisor.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">
                  {project.academicSupervisor.firstName} {project.academicSupervisor.lastName}
                </p>
                <p className="text-[10px] text-gray-400">Academic</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-green-100 text-green-700">
                  {getInitials(project.companySupervisor.firstName, project.companySupervisor.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">
                  {project.companySupervisor.firstName} {project.companySupervisor.lastName}
                </p>
                <p className="text-[10px] text-gray-400">Company</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] bg-purple-100 text-purple-700">
                {getInitials(project.student.firstName, project.student.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-medium text-gray-700">
                {project.student.firstName} {project.student.lastName}
              </p>
              <p className="text-[10px] text-gray-400">Student</p>
            </div>
          </div>
        </div>

        {/* Progression (si actif) */}
        {project.state === ProjectState.ACTIVE && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Overall Progress</span>
              <span className="font-medium text-gray-700">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-1.5" />
          </div>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="pt-2 pb-4 flex justify-end gap-1 border-t border-gray-50">
        {/* View Details */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(project)}
          className="h-8 px-2 text-gray-500 hover:text-gray-700"
          title="View Details"
        >
          <Eye className="h-4 w-4 mr-1" />
          Details
        </Button>

        {/* Generate Report */}
        {onGenerateReport && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGenerateReport(project._id)}
            className="h-8 px-2 text-gray-500 hover:text-blue-600"
            title="Generate Report"
          >
            <FileText className="h-4 w-4 mr-1" />
            Report
          </Button>
        )}

        {/* Manage Meetings */}
        {onManageMeetings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onManageMeetings(project._id)}
            className="h-8 px-2 text-gray-500 hover:text-purple-600"
            title="Manage Meetings"
          >
            <CalendarDays className="h-4 w-4 mr-1" />
            Meetings
          </Button>
        )}

        {/* Actions propriétaire */}
        {isOwner && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(project)}
              className="h-8 px-2 text-gray-500 hover:text-blue-600"
              title="Edit Project"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            {project.state === ProjectState.ACTIVE && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onArchive(project)}
                className="h-8 px-2 text-gray-500 hover:text-yellow-600"
                title="Archive Project"
              >
                <Archive className="h-4 w-4 mr-1" />
                Archive
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(project)}
              className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
              title="Delete Project"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}