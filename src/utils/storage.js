import { sampleQuizzes } from '../data/sampleQuizzes'

const KEYS = {
  quizzes: 'quizhub.quizzes',
  attempts: 'quizhub.attempts',
  theme: 'quizhub.theme',
}

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch (error) {
    console.error(`Unable to read ${key} from localStorage.`, error)
    return fallback
  }
}

export const getQuizzes = () => sampleQuizzes
export const getQuiz = (id) => getQuizzes().find((quiz) => quiz.id === id)
export const getAttempts = (userId) => userId ? read(KEYS.attempts, []).filter((attempt) => attempt.userId === userId) : []
export const getProfile = (user) => {
  if (!user?.userId) return { name: '', email: '', preference: 'Any difficulty' }
  return read(`quizhub.profile.${user.userId}`, { id: user.userId, name: user.name, email: user.email, preference: 'Any difficulty' })
}
export const getTheme = () => read(KEYS.theme, 'light')

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Unable to save ${key} to localStorage.`, error)
    throw new Error('Your browser could not save this data. Check available storage and try again.')
  }
}

export const saveAttempt = (attempt, userId) => {
  if (!userId) throw new Error('Sign in before saving a quiz result.')
  const attempts = read(KEYS.attempts, [])
  if (attempts.some((saved) => saved.id === attempt.id)) return
  write(KEYS.attempts, [{ ...attempt, userId }, ...attempts])
}
export const saveProfile = (profile, userId) => {
  if (!userId) throw new Error('Sign in before saving your profile.')
  write(`quizhub.profile.${userId}`, { ...profile, id: userId })
}
