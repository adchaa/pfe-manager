import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Calendar, Info, Users, FileText } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import authService from "@/services/auth.service";
import type { GlobalReport, TeamMember } from "@/types/htmlreport.types";
import { StatusDistribution } from "./status-distribution";
import { TimelineView } from "./TimelineDisplay";
import { SprintsSummary } from "./sprints-summary";
import { UserStoryList } from "./user-story-list";
import { MeetingsSection } from "./meetings-section";
import { ReportVersions } from "./report-versions";

interface GlobalReportViewProps {
  report?: GlobalReport;
  isLoading: boolean;
  error: Error | null;
  project?: any;
}

export function GlobalReportView({ report, isLoading, error, project }: GlobalReportViewProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleBack = () => {
    navigate("/projects");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
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
        <AlertDescription>Generating global report...</AlertDescription>
      </Alert>
    );
  }

  const stats = report.statistics.global;

  return (
    <div className="space-y-6">
     

     <ReportHeader 
        title="Global Project Report"
        generatedAt={report.generatedAt}
        projectTitle={project?.title}
        onBack={handleBack}
        onLogout={handleLogout}
      />
      <ProjectInfo project={report.project} />
      <TeamSection team={report.project.team} />
      <StatsCards stats={[
        {
          label: "Overall Progress",
          value: `${stats.progress}%`,
          progress: stats.progress
        },
        {
          label: "Total Tasks",
          value: stats.totalTasks,
          subtext: `${stats.doneTasks} completed`
        },
        {
          label: "Sprints",
          value: stats.sprintsCount,
          subtext: `${stats.userStoriesCount} user stories`
        },
        {
          label: "Hours",
          value: stats.totalEstimatedHours,
          subtext: `${stats.completedHours} completed`
        },
      ]} />
      <GlobalMetricsCards stats={stats} />

      <StatusDistribution 
        byStatus={report.statistics.byStatus}
        totalTasks={stats.totalTasks}
      />
      <PendingValidationsAlert pendingValidations={report.pendingValidations} />

      {report.dashboard?.timeline && report.dashboard.timeline.length > 0 && (
        <TimelineView events={report.dashboard.timeline} />
      )}

      {report.sprints.length > 0 && (
        <SprintsSummary sprints={report.sprints} />
      )}

      <UserStoryList 
        userStories={report.userStories.map(us => ({
          ...us,
          sprintOrder: us.sprintId ? report.sprints.find(s => s.id === us.sprintId)?.order : undefined
        }))} 
      />

      {report.meetings.length > 0 && (
        <MeetingsSection meetings={report.meetings} />
      )}

      {report.dashboard?.latestReports && report.dashboard.latestReports.length > 0 && (
        <ReportVersions versions={report.dashboard.latestReports} title="Latest Reports" />
      )}
    </div>
  );
}


//en tête du rapport
function ReportHeader({ 
  title, 
  generatedAt, 
  projectTitle,
 
}: { 
  title: string; 
  generatedAt: string;
  projectTitle?: string;
  onBack?: () => void;
  onLogout?: () => void;
}) {
  return (
    <div className="mb-6">
      

      <div className="flex items-center gap-3 mb-2">
        <FileText className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete overview of {projectTitle || 'project'}
          </p>
        </div>
      </div>
      
      <div className="mt-2 flex justify-between items-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Global Report
        </span>
        <p className="text-sm text-muted-foreground">
          Generated on {format(new Date(generatedAt), "dd MMMM yyyy 'at' HH:mm")}
        </p>
      </div>
    </div>
  );
}

//informations du projet
function ProjectInfo({ project }: { project: GlobalReport["project"] }) {
  const getStateColor = (state: string) => {
    switch (state) {
      case "ACTIVE":
        return "bg-green-100 text-green-700"
      case "COMPLETED":
        return "bg-blue-100 text-blue-700"
      case "ON_HOLD":
        return "bg-orange-100 text-orange-700"
      case "CANCELLED":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5" />
          Project Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Title</p>
            <p className="font-medium">{project.title}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">State</p>
            <Badge className={getStateColor(project.state)}>
              {project.state}
            </Badge>
          </div>
          {project.description && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{project.description}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-3 w-3" />
              {format(new Date(project.startDate), "dd MMMM yyyy")}
            </div>
          </div>
          {project.endDate && (
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3" />
                {format(new Date(project.endDate), "dd MMMM yyyy")}
              </div>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Created At</p>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-3 w-3" />
              {format(new Date(project.createdAt), "dd MMMM yyyy")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Team Section
function TeamMemberCard({
  role,
  member,
}: {
  role: string
  member?: TeamMember | null
}) {
  if (!member) return null

  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <p className="text-xs text-muted-foreground mb-1">{role}</p>
      <p className="font-medium">
        {member.firstName} {member.lastName}
      </p>
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <Users className="h-3 w-3" />
        <span className="truncate">{member.email}</span>
      </div>
    </div>
  )
}

function TeamSection({ team }: { team: GlobalReport["project"]["team"] }) {
  if (!team.student && !team.academicSupervisor && !team.companySupervisor) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TeamMemberCard role="Student" member={team.student} />
          <TeamMemberCard
            role="Academic Supervisor"
            member={team.academicSupervisor}
          />
          <TeamMemberCard
            role="Company Supervisor"
            member={team.companySupervisor}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Stats Cards
interface StatItem {
  label: string
  value: string | number
  subtext?: string
  progress?: number
}

function StatsCards({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            {stat.subtext && (
              <p className="text-xs text-muted-foreground mt-1">
                {stat.subtext}
              </p>
            )}
            {stat.progress !== undefined && (
              <Progress value={stat.progress} className="mt-2" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

//Global Metrics Cards
function GlobalMetricsCards({
  stats,
}: {
  stats: GlobalReport["statistics"]["global"]
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-600 font-medium">Validated Tasks</p>
        <p className="text-2xl font-bold">{stats.validatedTasks}</p>
        <p className="text-xs text-blue-600 mt-1">
          {stats.validationProgress}% rate
        </p>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-600 font-medium">
          Pending Validations
        </p>
        <p className="text-2xl font-bold">{stats.pendingValidations}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-sm text-purple-600 font-medium">Meetings</p>
        <p className="text-2xl font-bold">{stats.meetingsCount}</p>
      </div>
      <div className="bg-indigo-50 p-4 rounded-lg">
        <p className="text-sm text-indigo-600 font-medium">Report Versions</p>
        <p className="text-2xl font-bold">{stats.reportVersionsCount}</p>
      </div>
    </div>
  )
}

//Pending Validations Alert
function PendingValidationsAlert({
  pendingValidations,
}: {
  pendingValidations: GlobalReport["pendingValidations"]
}) {
  if (!pendingValidations || pendingValidations.total === 0) return null

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <p className="font-medium mb-2">
          {pendingValidations.total} task(s) pending validation
        </p>
        {pendingValidations.tasks.length > 0 && (
          <ul className="list-disc list-inside text-sm">
            {pendingValidations.tasks.slice(0, 3).map((task, index) => (
              <li key={index}>{task.taskTitle}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  )
}
