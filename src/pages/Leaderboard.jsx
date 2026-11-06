import { useMemo } from 'react'
import { Crown, Medal, Trophy } from 'lucide-react'
import { PageHeader } from '../components/UI.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { getAttempts } from '../utils/storage.js'

const demoPlayers = [
  { name: 'Jamie Rivera', score: 98, time: '02:18', avatar: 'J', color: 'lavender' },
  { name: 'Avery Chen', score: 94, time: '03:42', avatar: 'A', color: 'mint' },
  { name: 'Morgan Patel', score: 91, time: '04:05', avatar: 'M', color: 'peach' },
  { name: 'Taylor Kim', score: 88, time: '03:21', avatar: 'T', color: 'sky' },
  { name: 'Riley Brooks', score: 84, time: '05:13', avatar: 'R', color: 'rose' },
  { name: 'Casey Johnson', score: 80, time: '04:49', avatar: 'C', color: 'lemon' },
]

export default function Leaderboard() {
  const { user } = useAuth()
  const attempts = getAttempts(user.userId)
  const players = useMemo(() => [...demoPlayers, ...attempts.map((attempt) => ({
    name: `${user.name} (you)`, score: attempt.percentage, time: `${Math.floor(attempt.durationSeconds / 60).toString().padStart(2, '0')}:${(attempt.durationSeconds % 60).toString().padStart(2, '0')}`,
    avatar: 'Y', color: 'violet', user: true,
  }))].sort((a, b) => b.score - a.score), [attempts, user.name])
  const top = players.slice(0, 3)
  return <div><PageHeader eyebrow="A FRIENDLY LITTLE CHALLENGE" title="The leaderboard." description="A little inspiration from curious minds around the QuizHub community." />
    <div className="demo-banner"><span>✦</span><div><strong>Demo leaderboard</strong><small>These sample rankings are for demonstration only. No real accounts or prizes.</small></div></div>
    <section className="leaderboard-card"><div className="podium">{[top[1], top[0], top[2]].map((player, index) => player && <div className={`podium-person podium-place-${index === 0 ? 2 : index === 1 ? 1 : 3}`} key={`${player.name}-${index}`}><div className={`podium-avatar ${player.color}`}>{index === 1 && <Crown size={15} />}{player.avatar}</div><strong>{player.name}</strong><span>{player.score}% average</span><div className="podium-block"><span>{index === 1 ? '01' : index === 0 ? '02' : '03'}</span><Medal size={18} /></div></div>)}</div>
      <div className="leaderboard-list-head"><span>RANK & LEARNER</span><span>TOP SCORE</span><span>TIME</span></div><div className="leaderboard-list">{players.map((player, index) => <div className={`leaderboard-row ${player.user ? 'your-row' : ''}`} key={`${player.name}-${index}`}><span className="rank-number">{String(index + 1).padStart(2, '0')}</span><span className={`leader-avatar ${player.color}`}>{player.avatar}</span><span className="leader-name">{player.name}{player.user && <small>that’s you!</small>}</span><strong>{player.score}%</strong><span>{player.time}</span></div>)}</div>
    </section>
    <p className="leaderboard-footnote"><Trophy size={15} /> Friendly reminder: learning is its own reward. This leaderboard is just for fun.</p>
  </div>
}
