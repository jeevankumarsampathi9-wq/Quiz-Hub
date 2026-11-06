import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './layouts/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Library from './pages/Library.jsx'
import TakeQuiz from './pages/TakeQuiz.jsx'
import Learn from './pages/Learn.jsx'
import Results from './pages/Results.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Attempts from './pages/Attempts.jsx'
import Auth from './pages/Auth.jsx'
import Profile from './pages/Profile.jsx'
import Help from './pages/Help.jsx'
import MistakeNotebook from './pages/MistakeNotebook.jsx'
import PerformanceAnalytics from './pages/PerformanceAnalytics.jsx'
import Achievements from './pages/Achievements.jsx'
import { useStoredState } from './hooks/useStoredState.js'
import { getTheme } from './utils/storage.js'
import { useAuth } from './auth/AuthContext.jsx'
import { CreatorOnly, PublicOnly, RequireAuth } from './components/RouteGuards.jsx'

export default function App() {
  const [theme, setTheme] = useStoredState('quizhub.theme', getTheme)
  const location = useLocation()
  const { user } = useAuth()
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  const immersive = location.pathname.startsWith('/quiz/') && !location.pathname.endsWith('/results')
  return (
    <Routes>
      <Route path="/" element={<PublicOnly><Auth /></PublicOnly>} />
      <Route path="/login" element={<PublicOnly><Auth /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><Auth /></PublicOnly>} />
      <Route path="/register" element={<Navigate to="/signup" replace />} />
      <Route element={<RequireAuth><Layout theme={theme} setTheme={setTheme} immersive={immersive} /></RequireAuth>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/learn/:id" element={<Learn />} />
        <Route path="/quiz/:id" element={<TakeQuiz />} />
        <Route path="/quiz/:id/results" element={<Results />} />
        <Route path="/results" element={<Results />} />
        <Route path="/results/:attemptId" element={<Results />} />
        <Route path="/attempts" element={<Attempts />} />
        <Route path="/mistakes" element={<MistakeNotebook />} />
        <Route path="/analytics" element={<PerformanceAnalytics />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile theme={theme} setTheme={setTheme} />} />
        <Route path="/help" element={<Help />} />
        <Route path="/builder" element={<CreatorOnly />} />
        <Route path="/builder/*" element={<CreatorOnly />} />
        <Route path="/my-quizzes" element={<CreatorOnly />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  )
}
