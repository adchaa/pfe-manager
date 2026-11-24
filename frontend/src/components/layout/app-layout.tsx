import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderKanban, 
  GitBranch, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  Calendar,
  ArrowLeft
} from "lucide-react";

import { Button } from "@/components/ui/button";
import authService from "@/services/auth.service";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  action?: React.ReactNode;
}

export function AppLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = false,
  onBack,
  action 
}: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentUser = authService.getCurrentUser();

  const firstName = currentUser?.firstName || currentUser?.email?.split("@")[0] || "User";
  const initials = currentUser?.firstName && currentUser?.lastName
    ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase()
    : (currentUser?.firstName ? currentUser.firstName[0].toUpperCase() : "U");

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const sidebarLinks = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FolderKanban, label: "Projects", path: "/projects" },
    { icon: GitBranch, label: "Sprints", path: "/sprints" },
    { icon: Calendar, label: "Meetings", path: "/meetings" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Pro</span>
          </div>
          <span className="font-semibold text-gray-900 hidden sm:block">Project Management</span>
        </div>

        <div className="flex-1 text-center hidden md:block">
          <p className="text-sm text-gray-500">
            Hello, <span className="font-semibold text-gray-900">{firstName}</span> 👋
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Logout</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-900">Menu</span>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="mx-4 mt-4 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {currentUser?.firstName} {currentUser?.lastName}
            </p>
            <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
            <span className="inline-block mt-0.5 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {currentUser?.role}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1">
          {sidebarLinks.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              onClick={() => {
                navigate(path);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(path)
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                {label}
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${isActive(path) ? "text-white/60" : "text-gray-400"}`} />
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
      <main className="pt-16">

        {(title || showBackButton || action) && (
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="container mx-auto max-w-7xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                {showBackButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack || (() => navigate(-1))}
                    className="gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                <div>
                  {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
                  {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
              </div>
              {action && <div>{action}</div>}
            </div>
          </div>
        )}
        
        <div className="container mx-auto py-6 px-4 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}