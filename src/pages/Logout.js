import { useAuth } from "../contexts/Auth"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

const Logout = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const performLogout = () => {
      logout()
      // Navigate to home page after logout
      navigate("/", { replace: true })
    }

    performLogout()
  }, [logout, navigate])

  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Logging out...</p>
    </div>
  )
}

export default Logout
