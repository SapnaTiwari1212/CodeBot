/**
 * Single place where the backend is configured and every HTTP call is made.
 *
 * Two rules are enforced here rather than in each screen:
 *   1. The JWT is attached to every outgoing request by a request interceptor,
 *      so no component ever has to remember to add the header.
 *   2. Every failure becomes an ApiError with a message that is safe to show a
 *      user, so screens never have to dig through axios internals and never
 *      display a raw stack trace.
 */
import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

const TOKEN_STORAGE_KEY = 'codebot_token'

/** Error type carrying the HTTP status so callers can branch on 401 or 404. */
export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
})

// Attach the JWT to every request when the user is signed in.
api.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Turn axios failures into ApiError with a readable message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const data = error.response?.data

    // FastAPI reports validation problems as { detail: [{ msg, loc }] }.
    const detail = Array.isArray(data?.detail)
      ? data.detail.map((item) => item.msg).join('. ')
      : data?.detail

    let message = 'Something went wrong. Please try again.'

    if (!error.response) {
      message =
        error.code === 'ECONNABORTED'
          ? 'The request timed out. The AI may be taking longer than usual.'
          : 'Cannot reach the CodeBot API. Check that the backend is running.'
    } else if (status === 400 || status === 422) {
      message = detail ?? 'The request was rejected by the API.'
    } else if (status === 401) {
      message = detail ?? 'Your session has expired. Please sign in again.'
      // An expired or invalid token is useless: drop it so the app falls back
      // to the signed out state instead of retrying with a bad token.
      clearToken()
    } else if (status === 403) {
      message = detail ?? 'You do not have access to this resource.'
    } else if (status === 404) {
      message = detail ?? 'That resource could not be found.'
    } else if (status === 409) {
      message = detail ?? 'That resource already exists.'
    } else if (status === 429) {
      message = detail ?? 'Too many requests. Wait a moment and try again.'
    } else if (status >= 500) {
      message = 'The CodeBot API ran into a problem. Please try again.'
    }

    return Promise.reject(new ApiError(message, status, detail))
  },
)

export default api