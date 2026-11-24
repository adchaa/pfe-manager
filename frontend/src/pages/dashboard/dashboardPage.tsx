import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  AlertCircle,
  Loader2,
  GitBranch,
  ActivitySquare
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { AppLayout } from "@/components/layout/app-layout";
import { StatsCard } from "@/components/dashboard/stats-cards";
import { ProjectSummaryCard } from "@/components/dashboard/project-summary";
import { ActivityItem } from "@/components/dashboard/activity-item";
import dashboardService from "@/services/dashboard.service";
import { extractErrorMessage } from "@/lib/error";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: overview, isLoading, error } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => dashboardService.getOverview(),
  });

  const { data: timeline } = useQuery({
    queryKey: ["dashboard", "timeline"],
    queryFn: () => dashboardService.getTimeline(),
  });

  const stats = overview?.overallStats;
  const projects = overview?.projects || [];
  const timelineEvents = timeline?.timeline || [];

  if (isLoading) {
    return (
      <AppLayout title="Dashboard" subtitle="Loading your data...">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Loading dashboard...</span>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Dashboard" subtitle="Error loading data">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading dashboard: {extractErrorMessage(error)}
          </AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Dashboard" 
      subtitle={`Welcome back! ${stats?.totalProjects || 0} projects active`}
    >
      {/* Section 1: Key Metrics */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Projects"
            value={stats?.totalProjects || 0}
            icon={FolderKanban}
            description="Active projects"
            color="blue"
          />
          <StatsCard
            title="Task Completion"
            value={`${stats?.completionPercentage || 0}%`}
            icon={TrendingUp}
            description={`${stats?.completedTasks || 0} / ${stats?.totalTasks || 0} tasks done`}
            color="green"
          />
          <StatsCard
            title="Active Sprints"
            value={stats?.totalSprints ? Math.ceil(stats.totalSprints * 0.3) : 0}
            icon={GitBranch}
            description={`${stats?.totalSprints || 0} total sprints`}
            color="purple"
          />
          <StatsCard
            title="Pending Reviews"
            value={stats?.pendingValidations || 0}
            icon={Clock}
            description={`${stats?.upcomingMeetings || 0} meetings upcoming`}
            color="orange"
          />
        </div>
      </div>

      {/* Section 2: Task Distribution */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats?.completedTasks || 0}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ActivitySquare className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats?.tasksInProgress || 0}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats?.tasksBlocked || 0}</p>
              <p className="text-xs text-gray-500">Blocked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats?.tasksTodo || 0}</p>
              <p className="text-xs text-gray-500">To Do</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 3: Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="overview">Projects</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderKanban className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No projects yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {projects.map((project) => (
                <ProjectSummaryCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Latest Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {timelineEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No recent activity
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {timelineEvents.slice(0, 12).map((event) => (
                    <ActivityItem key={event._id} event={event} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}