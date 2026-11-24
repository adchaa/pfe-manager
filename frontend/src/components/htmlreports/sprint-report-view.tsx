import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Calendar, CheckCircle2, FileText } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useNavigate } from "react-router-dom";
import authService from "@/services/auth.service";
import type { SprintReport } from "@/types/htmlreport.types";
import { StatusDistribution } from "./status-distribution";
import { UserStoryList } from "./user-story-list";
import { TaskHistory } from "./task-history";

interface SprintReportViewProps {
  report?: SprintReport;
  isLoading: boolean;
  error: Error | null;
  project?: any;
  selectedSprint?: any;
}

export function SprintReportView({ report, isLoading, error, project, selectedSprint }: SprintReportViewProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleBack = () => {
    navigate(`/sprints?projectId=${project?._id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error loading report: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!report) {
    return (
      <Alert>
        <AlertDescription>Select a sprint to view the report.</AlertDescription>
      </Alert>
    );
  }

  // Utiliser selectedSprint ou report.sprint
  const sprint = selectedSprint || report.sprint;

  return (
    <div className="space-y-6">
      {/* Report Header avec date de génération */}
      <ReportHeader 
        title={`Sprint ${sprint?.order} Report`}
        generatedAt={report?.generatedAt || new Date().toISOString()}
        sprintTitle={sprint?.title}
        sprintOrder={sprint?.order}
        onBack={handleBack}
        onLogout={handleLogout}
      />

      {/* Sprint Info */}
      <SprintInfo sprint={report.sprint} />

      {/* Validation Stats */}
      <SprintValidationStats statistics={report.statistics} />

      {/* Statistics Cards */}
      <StatsCards stats={[
        {
          label: "Total Tasks",
          value: report.statistics.totalTasks,
          subtext: `${report.statistics.userStoriesCount} user stories`
        },
        {
          label: "Progress",
          value: `${report.statistics.progress}%`,
          progress: report.statistics.progress
        },
        {
          label: "Completed",
          value: report.statistics.doneTasks,
          subtext: `${Math.round((report.statistics.doneTasks / report.statistics.totalTasks) * 100) || 0}% of total`
        },
        {
          label: "Remaining",
          value: report.statistics.todoTasks + report.statistics.inProgressTasks + report.statistics.standbyTasks,
          subtext: `${report.statistics.todoTasks} to do, ${report.statistics.inProgressTasks} in progress`
        }
      ]} />

      {/* Status Distribution */}
      <StatusDistribution 
        byStatus={{
          done: report.statistics.doneTasks,
          inProgress: report.statistics.inProgressTasks,
          standby: report.statistics.standbyTasks,
          todo: report.statistics.todoTasks
        }}
        totalTasks={report.statistics.totalTasks}
      />

      {/* User Stories */}
      <UserStoryList userStories={report.userStories} />

      {/* Task History */}
      {report.taskHistory && report.taskHistory.length > 0 && (
        <TaskHistory history={report.taskHistory} />
      )}
    </div>
  );
}

// Sous-composants internes
function ReportHeader({ 
  title, 
  generatedAt,
  sprintTitle,
  sprintOrder,
  
}: { 
  title: string; 
  generatedAt: string;
  sprintTitle?: string;
  sprintOrder?: number;
  onBack?: () => void;
  onLogout?: () => void;
}) {
  return (
    <div className="mb-6">
      

      <div className="flex items-center gap-3 mb-2">
        <FileText className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {sprintTitle && sprintOrder 
              ? `Sprint ${sprintOrder}: ${sprintTitle}`
              : sprintTitle || 'Sprint Report'}
          </p>
        </div>
      </div>
      
      <div className="mt-2 flex justify-between items-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Sprint Report
        </span>
        <p className="text-sm text-muted-foreground">
          Generated on {format(new Date(generatedAt), "dd MMMM yyyy 'at' HH:mm")}
        </p>
      </div>
    </div>
  );
}
const statusColors = {
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  PLANNED: "bg-gray-100 text-gray-700 border-gray-200",
  Done: "bg-red-100 text-red-700 border-red-200",
}
function SprintInfo({ sprint }: { sprint: SprintReport['sprint'] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Sprint Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Sprint</p>
            <p className="font-medium ">Sprint {sprint.order}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Title</p>
            <p className="font-medium">{sprint.title || 'Untitled Sprint'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge className={statusColors[sprint.status as keyof typeof statusColors]}>
              {sprint.status}
            </Badge> 
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-3 w-3" />
              {sprint.startDate && sprint.endDate ? (
                <>
                  {format(new Date(sprint.startDate), "dd MMM")} -{" "}
                  {format(new Date(sprint.endDate), "dd MMM yyyy")}
                </>
              ) : (
                'Date not set'
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SprintValidationStats({ statistics }: { statistics: SprintReport['statistics'] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-600 font-medium">Validated Tasks</p>
        </div>
        <p className="text-2xl font-bold mt-2">{statistics.validatedTasks}</p>
        <p className="text-xs text-green-600 mt-1">
          {statistics.validationRate}% validation rate
        </p>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-600 font-medium">Pending Validations</p>
        </div>
        <p className="text-2xl font-bold mt-2">{statistics.pendingValidations}</p>
      </div>
    </div>
  );
}

function StatsCards({ stats }: { stats: Array<{ label: string; value: string | number; subtext?: string; progress?: number }> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            {stat.subtext && (
              <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
            )}
            {stat.progress !== undefined && (
              <Progress value={stat.progress} className="mt-2" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}