import { useState } from 'react'
import { Award, BookCheck, BookOpen, Check, Compass, Flame, Star, Target, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/UI.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { getAttempts } from '../utils/storage.js'
import { getAchievements } from '../utils/studentProgress.js'

const icons = { Target, Star, Compass, BookOpen, Flame, Trophy, Award, BookCheck }

export default function Achievements() {
  const { user } = useAuth()
  const attempts = getAttempts(user.userId)
  const [badges] = useState(() => getAchievements(user.userId, attempts))
  const earned = badges.filter((badge) => badge.earned)
  return <div className="learning-page">
    <PageHeader eyebrow="LITTLE MILESTONES, BIG MOMENTUM" title="Achievements" description="Every badge is earned through your real quizzes, practice, and learning streaks." />
    <section className="achievement-highlight panel"><span className="achievement-highlight-icon"><Award size={22} /></span><div><strong>{earned.length} of {badges.length} badges unlocked</strong><p>Keep learning at your own pace. Your next milestone is closer than you think.</p></div></section>
    {earned.length > 0 && <section className="recent-badges-section"><div className="section-title-row"><div><div className="eyebrow">RECENTLY EARNED</div><h2>Your latest badges</h2></div></div><div className="recent-badges">{[...earned].sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt)).slice(0, 3).map((badge) => { const Icon = icons[badge.icon] || Award; return <div className="recent-badge panel" key={badge.id}><span><Icon size={20} /></span><strong>{badge.title}</strong><small>{new Date(badge.earnedAt).toLocaleDateString()}</small></div> })}</div></section>}
    <section className="achievement-grid">{badges.map((badge) => {
      const Icon = icons[badge.icon] || Award
      const progress = badge.earned ? 100 : Math.min(100, Math.round((badge.value / badge.goal) * 100))
      return <article className={`achievement-card panel ${badge.earned ? 'achievement-earned' : ''}`} key={badge.id}>
        <div className={`achievement-medal ${badge.earned ? '' : 'locked'}`}><Icon size={25} />{badge.earned && <span><Check size={12} /></span>}</div>
        <div className="achievement-copy"><div className="achievement-badge-state">{badge.earned ? 'UNLOCKED' : 'LOCKED'}</div><h2>{badge.title}</h2><p>{badge.description}</p></div>
        {!badge.earned && <div className="achievement-progress"><div className="achievement-progress-track"><i style={{ width: `${progress}%` }} /></div><small>{badge.value} / {badge.goal}</small></div>}
        {badge.earned && <small className="achievement-date">Earned {new Date(badge.earnedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</small>}
      </article>
    })}</section>
    {!attempts.length && <div className="achievement-first-step"><p>Your first badge is waiting.</p><Link className="button button-primary" to="/library">Complete a quiz</Link></div>}
  </div>
}
