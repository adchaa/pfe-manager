import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppLayout } from "@/components/layout/app-layout";

import projectService from "@/services/project.service";
import sprintService from "@/services/sprint.service";
import htmlReportService from "@/services/htmlReport.service";
import { extractErrorMessage } from "@/lib/error";
import { SprintReportView } from "@/components/htmlreports/sprint-report-view";
import { GlobalReportView } from "@/components/htmlreports/global-report-view";

export default function HtmlReportsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get("projectId");
  const sprintIdFromUrl = searchParams.get("sprintId");

  const [isSprintReport, setIsSprintReport] = useState<boolean>(false);

  useEffect(() => {
    setIsSprintReport(!!sprintIdFromUrl);
  }, [sprintIdFromUrl]);

  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useQuery({
    queryKey: ["project", projectIdFromUrl],
    queryFn: () => projectService.getById(projectIdFromUrl!),
    enabled: !!projectIdFromUrl,
  });

  const {
    data: sprints,
    isLoading: isLoadingSprints,
    error: sprintsError,
  } = useQuery({
    queryKey: ["sprints", projectIdFromUrl],
    queryFn: () => sprintService.getSprintsByProject(projectIdFromUrl!),
    enabled: !!projectIdFromUrl && isSprintReport,
  });

  const {
    data: sprintReport,
    isLoading: isLoadingSprintReport,
    error: sprintReportError,
  } = useQuery({
    queryKey: ["sprintReport", projectIdFromUrl, sprintIdFromUrl],
    queryFn: () =>
      htmlReportService.generateSprintReport(
        projectIdFromUrl!,
        sprintIdFromUrl!
      ),
    enabled: !!projectIdFromUrl && !!sprintIdFromUrl && isSprintReport,
  });

  const {
    data: globalReport,
    isLoading: isLoadingGlobalReport,
    error: globalReportError,
  } = useQuery({
    queryKey: ["globalReport", projectIdFromUrl],
    queryFn: () => htmlReportService.generateGlobalReport(projectIdFromUrl!),
    enabled: !!projectIdFromUrl && !isSprintReport,
  });

  const selectedSprint = sprints?.find((s) => s._id === sprintIdFromUrl);

  
  if (isSprintReport && !isLoadingSprints && !selectedSprint) {
    return (
      <AppLayout
        title="Sprint Not Found"
        showBackButton
        onBack={() => navigate(-1)}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Sprint not found in this project. Please select a valid sprint.
          </AlertDescription>
        </Alert>

        <Button className="mt-4" onClick={() => navigate(-1)}>
          Back to Sprints
        </Button>
      </AppLayout>
    );
  }

  if (!projectIdFromUrl) {
    return (
      <AppLayout title="Reports" showBackButton onBack={() => navigate("/projects")}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No project ID Selected</AlertDescription>
        </Alert>

        <Button className="mt-4" onClick={() => navigate("/projects")}>
          Back to Projects
        </Button>
      </AppLayout>
    );
  }

  if (isLoadingProject) {
    return (
      <AppLayout title="Loading..." showBackButton onBack={() => navigate("/projects")}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Loading project...</span>
        </div>
      </AppLayout>
    );
  }

  if (projectError || !project) {
    return (
      <AppLayout title="Error" showBackButton onBack={() => navigate("/projects")}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error: {extractErrorMessage(projectError)}
          </AlertDescription>
        </Alert>

        <Button className="mt-4" onClick={() => navigate("/projects")}>
          Back to Projects
        </Button>
      </AppLayout>
    );
  }

  if (isSprintReport && isLoadingSprints) {
    return (
      <AppLayout title="Loading Sprints..." showBackButton onBack={() => navigate(-1)}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Loading sprints...</span>
        </div>
      </AppLayout>
    );
  }

  if (isSprintReport && sprintsError) {
    return (
      <AppLayout title="Error" showBackButton onBack={() => navigate(-1)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading sprints: {extractErrorMessage(sprintsError)}
          </AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={isSprintReport ? `Sprint Report` : "Global Report"}
      showBackButton
      onBack={() => {
        if (!isSprintReport) {
          navigate("/projects");
        } else {
          navigate(-1);
        }
      }}
    >
      {!isSprintReport ? (
        <GlobalReportView
          report={globalReport}
          isLoading={isLoadingGlobalReport}
          error={globalReportError}
          project={project}
        />
      ) : (
        <SprintReportView
          report={sprintReport}
          isLoading={isLoadingSprintReport}
          error={sprintReportError}
          project={project}
          selectedSprint={selectedSprint}
        />
      )}
    </AppLayout>
  );
}