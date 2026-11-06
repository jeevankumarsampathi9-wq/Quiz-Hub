import { useState } from 'react'
import { Check, Moon, RotateCcw, Save, Sun, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { resetUserDemoData, updateAuthProfile } from '../utils/auth.js'
import { PageHeader } from '../components/UI.jsx'
import { getProfile, saveProfile } from '../utils/storage.js'

export default function Profile({ theme, setTheme }) {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [profile, setProfile] = useState(() => getProfile(user))
  const [saved, setSaved] = useState(false)
  const update = (key, value) => setProfile((current) => ({ ...current, [key]: value }))
  const submit = (event) => {
    event.preventDefault()
    if (!profile.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) return
    const updated = { ...profile, name: profile.name.trim(), email: profile.email.trim() }
    try {
      updateAuthProfile({ ...user, id: user.userId, name: updated.name, email: updated.email })
      saveProfile(updated, user.userId)
      setUser({ ...user, name: updated.name, email: updated.email })
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch (error) {
      window.alert(error.message || 'Your profile could not be saved.')
    }
  }
  const reset = () => {
    if (!window.confirm('Clear your QuizHub quiz attempts and profile preferences from this browser? Your student account will remain signed in.')) return
    resetUserDemoData(user.userId)
    const nextProfile = { id: user.userId, name: user.name, email: user.email, preference: 'Any difficulty' }
    saveProfile(nextProfile, user.userId)
    setProfile(nextProfile)
    setTheme('light')
    navigate('/dashboard', { replace: true })
  }
  return <div><PageHeader eyebrow="YOUR LITTLE CORNER" title="Profile & settings." description="Make your QuizHub experience feel like yours." />
    <div className="settings-layout"><section className="settings-card"><div className="settings-section-head"><span className="settings-icon"><UserRound size={19} /></span><div><h2>About you</h2><p>Your demo profile stays in this browser.</p></div></div><form onSubmit={submit} className="settings-form"><label className="form-field"><span>Display name</span><input value={profile.name} onChange={(event) => update('name', event.target.value)} required /></label><label className="form-field"><span>Email address</span><input type="email" value={profile.email} onChange={(event) => update('email', event.target.value)} required /></label><label className="form-field"><span>Quiz preference</span><select value={profile.preference} onChange={(event) => update('preference', event.target.value)}><option>Any difficulty</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><button className="button button-primary"><Save size={16} /> Save changes</button>{saved && <span className="saved-message"><Check size={15} /> Your profile is up to date.</span>}</form></section>
      <div className="settings-right"><section className="settings-card"><div className="settings-section-head"><span className="settings-icon violet"><Sun size={19} /></span><div><h2>Look & feel</h2><p>Choose the atmosphere you like best.</p></div></div><div className="theme-options"><button className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}><Sun size={18} /><span><strong>Light</strong><small>Bright and breezy</small></span>{theme === 'light' && <Check size={16} />}</button><button className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}><Moon size={18} /><span><strong>Dark</strong><small>Easy on the eyes</small></span>{theme === 'dark' && <Check size={16} />}</button></div></section>
      <section className="settings-card reset-card"><div className="settings-section-head"><span className="settings-icon peach"><RotateCcw size={19} /></span><div><h2>Reset your quiz activity</h2><p>Clear your attempts and profile preferences.</p></div></div><button className="button button-danger" onClick={reset}><RotateCcw size={15} /> Reset my demo data</button><small>Your student login and sample quizzes will remain.</small></section></div></div>
    <div className="privacy-note"><span>i</span><p><strong>A note about your data</strong> QuizHub is a frontend-only demo. Your student account, profile, and attempts are saved in this browser. Demo authentication and browser storage are not secure or production-grade.</p></div>
  </div>
}
