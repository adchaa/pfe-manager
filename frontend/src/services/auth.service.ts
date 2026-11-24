import api from "./api"
import type { User } from "../types/user"
import type { TloginSchema, TsignupSchema } from "../schemas/auth.schema"
import { UserRole } from "@/types/enums"

export interface LoginResponse {
  token: string
  user: User
}

class AuthService {
  async login(data: TloginSchema): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data)
    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))
    }
    return response.data
  }

  async signup(data: Omit<TsignupSchema, "confirmPassword">): Promise<User> {
    const response = await api.post<User>("/auth/signup", data)
    return response.data
  }

  async refreshToken(): Promise<string | null> {
    try {
      const response = await api.post<LoginResponse>("/auth/refresh")
      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        return response.data.token
      }
      return null
    } catch (error) {
      this.logout()
      return null
    }
  }

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  }

  getToken(): string | null {
    return localStorage.getItem("token")
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
  isStudent(): boolean {
    const user = this.getCurrentUser()
    return user?.role === UserRole.ETUDIANT
  }
}

export default new AuthService()

export const useAuthPermissions = () => {
  const user = new AuthService().getCurrentUser()
  const isStudent = user?.role === UserRole.ETUDIANT

  return { isStudent, user }
}
