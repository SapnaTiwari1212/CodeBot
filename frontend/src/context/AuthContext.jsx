/**
 * Auth state for the whole app.
 *
 * The token lives in localStorage and the user object in memory. On start the
 * context calls /auth/me once: if that succeeds the stored token is still valid,
 * if it returns 401 the token is stale and the user is signed out. That single
 * check is what keeps protected routes honest across a page refresh.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'

import * as authService from '../services/authService.js'
import { clearToken, setToken } from '../services/api.js'
import { AuthContext } from './authContext.js'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  // loading is true until the first /auth/me call settles, so protected routes
  // do not flash the login page for a user who is actually signed in.
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    clearToken()
    setCurrentUser(null)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      try {
        const user = await authService.fetchCurrentUser()

        if (!cancelled) setCurrentUser(user)
      } catch {
        // No token, expired token, or API unreachable: either way there is no
        // signed in user to restore.
        if (!cancelled) setCurrentUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    restoreSession()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials)

    setToken(data.access_token)
    setCurrentUser(data.user)

    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload)

    setToken(data.access_token)
    setCurrentUser(data.user)

    return data.user
  }, [])

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      isAuthenticated: Boolean(currentUser),
      login,
      register,
      logout,
    }),
    [currentUser, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}