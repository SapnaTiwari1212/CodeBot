/** History calls. Every endpoint is scoped to the signed in user server side. */
import api from './api.js'

export async function fetchHistory({ operation = '', language = '', page = 1, limit = 20 } = {}) {
  const params = { page, limit }

  if (operation) params.operation = operation
  if (language) params.language = language

  const { data } = await api.get('/history', { params })

  return data
}

export async function fetchSession(id) {
  const { data } = await api.get(`/history/${id}`)

  return data
}

export async function deleteSession(id) {
  const { data } = await api.delete(`/history/${id}`)

  return data
}