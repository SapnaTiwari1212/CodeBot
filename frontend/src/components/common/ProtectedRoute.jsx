import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth.js'
import Loader from './Loader.jsx'

/**
 * Gate for signed in only pages.
 *
 * While the session is still being checked it renders a loader instead of
 * redirecting, otherwise a refresh would bounce a signed in user to /login.
 * The attempted path is passed along in router state so login can send the user
 * back where they were heading.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Loader label="Checking your session…" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}