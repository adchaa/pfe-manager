import { Navigate, useLocation } from "react-router-dom"
import authService from "@/services/auth.service"
import type { UserRole } from "@/types/user"
import type { ReactNode } from "react"

interface AuthGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
}

export const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const location = useLocation()
  const isAuthenticated = authService.isAuthenticated()
  const user = authService.getCurrentUser()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
