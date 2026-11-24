import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LoginPage from "@/pages/login"
import SignupPage from "@/pages/signup"
import HomePage from "@/pages/index"
import SprintsPage from "@/pages/sprints/SprintsPage"

import { AuthGuard } from "@/components/auth-guard"
import ProjectsList from "./pages/projects/ProjectsPage"
import UserStoriesPage from "./pages/userStories/UserStoriesPage"
import ReportsPage from "./pages/reportsVersions/ReportsPage"
import TasksPage from "./pages/tasks/TasksPage"
import { Toaster } from "sonner"
import HtmlReportsPage from "./pages/htmlReports/HtmlReportsPage"
import { UserRole } from "./types/enums"
import MeetingsPage from "./pages/meetings/MeetingsPage"
import DashboardPage from './pages/dashboard/dashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        ***projects*****
        <Route path="/projects" element={<ProjectsList />} />
        ***sprints*****
        <Route path="/sprints" element={<SprintsPage />} />
        
        <Route path="/user-stories" element={ <AuthGuard> <UserStoriesPage /> </AuthGuard>} />

        <Route
          path="/reports"
          element={
            <AuthGuard>
              <ReportsPage />
            </AuthGuard>
          }
        />
        
        {/* Tasks */}
        <Route
          path="/tasks"
          element={
            <AuthGuard>
              <TasksPage />
            </AuthGuard>
          }
        />
        <Route
          path="/html-reports"
          element={
            <AuthGuard allowedRoles={[UserRole.ETUDIANT]}>
              <HtmlReportsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/meetings"
          element={
            <AuthGuard
              allowedRoles={[
                UserRole.ETUDIANT,
                UserRole.ENCADRANT_ENTREPRISE,
                UserRole.ENCADRANT_UNIVERSITAIRE,
              ]}
            >
              <MeetingsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/"
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          }
        />
      </Routes>
      <Toaster position="top-right" richColors />
    </Router>
  )
}

export default App
