/** CodeBot AI calls: run an operation and hold a conversation about the code. */
import api from './api.js'

/**
 * Run one AI operation. The backend validates the operation and language,
 * calls OpenAI, validates the structured reply and stores the session.
 */
export async function runOperation({ operation, language, targetLanguage, code, prompt }) {
  const { data } = await api.post('/codebot/run', {
    operation,
    language,
    target_language: targetLanguage ?? null,
    code,
    prompt: prompt ?? '',
  })

  return data
}

/** Ask a follow up question about the code currently in the editor. */
export async function sendChatMessage({ message, code, language, history = [] }) {
  const { data } = await api.post('/codebot/chat', {
    message,
    code,
    language,
    history,
  })

  return data
}