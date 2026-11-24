import { Button } from "@/components/ui/button"
import authService from "@/services/auth.service"
import { useNavigate } from "react-router-dom"

export default function HomePage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.logout()
    navigate("/login")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome Home!</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        This is an empty index page where you're redirected after a successful
        login.
      </p>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  )
}
