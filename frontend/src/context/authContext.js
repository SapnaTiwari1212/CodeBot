import { createContext } from 'react'

/**
 * The context object lives in its own module so AuthContext.jsx exports only
 * the provider component. Keeping them together would break React Fast
 * Refresh, which can only reload a file that exports components alone.
 */
export const AuthContext = createContext(null)