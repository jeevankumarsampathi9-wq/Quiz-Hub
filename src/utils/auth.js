import { createId } from './quiz.js'

const USERS_KEY = 'quizhub.users'
const AUTH_KEY = 'quizhub.auth'

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch (error) {
    console.error(`Unable to read ${key} from localStorage.`, error)
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Unable to save ${key} to localStorage.`, error)
    throw new Error('Your browser could not save this demo account.')
  }
}

export const getAuth = () => {
  const auth = read(AUTH_KEY, null)
  return auth?.loggedIn && auth.userId ? auth : null
}

export const saveAuth = (auth) => write(AUTH_KEY, auth)

export function registerUser({ name, email, password }) {
  const users = read(USERS_KEY, [])
  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists. Try logging in instead.')
  }
  const user = { id: createId(), name: name.trim(), email: email.trim().toLowerCase(), password }
  write(USERS_KEY, [...users, user])
  return user
}

export function authenticateUser(identifier, password) {
  const users = read(USERS_KEY, [])
  const normalized = identifier.trim().toLowerCase()
  const user = users.find((item) => item.email.toLowerCase() === normalized || item.name.trim().toLowerCase() === normalized)
  if (!user || user.password !== password) {
    throw new Error('We couldn’t find an account with those details. Check your email and password, or sign up.')
  }
  return { userId: user.id, name: user.name, email: user.email, loggedIn: true }
}

export function updateAuthProfile(user) {
  const auth = getAuth()
  if (!auth || auth.userId !== user.id) return
  const users = read(USERS_KEY, [])
  if (users.some((item) => item.id !== user.id && item.email.toLowerCase() === user.email.toLowerCase())) {
    throw new Error('That email is already used by another demo account.')
  }
  write(AUTH_KEY, { ...auth, name: user.name, email: user.email })
  write(USERS_KEY, users.map((item) => item.id === user.id ? { ...item, name: user.name, email: user.email } : item))
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY)
}

export function resetUserDemoData(userId) {
  const attempts = read('quizhub.attempts', [])
  write('quizhub.attempts', attempts.filter((attempt) => attempt.userId !== userId))
  localStorage.removeItem(`quizhub.profile.${userId}`)
  localStorage.removeItem(`quizhub.studentProgress.${userId}`)
  const activePrefix = `quizhub.active.${userId}.`
  for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = sessionStorage.key(index)
    if (key?.startsWith(activePrefix)) sessionStorage.removeItem(key)
  }
}
