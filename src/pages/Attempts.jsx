import { ArrowRight, Clock3, RotateCcw, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { EmptyState, PageHeader } from '../components/UI.jsx'
import { getAttempts, getQuiz } from '../utils/storage.js'

function formatDuration(seconds = 0) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return minutes ? `${minutes}m ${remainder}s` : `${remainder}s`
}

export default function Attempts() {
  const { user } = useAuth()
  const attempts = getAttempts(user.userId)
  return <div>
    <PageHeader eyebrow="YOUR LEARNING HISTORY" title="My attempts." description="Every quiz you finish is another step forward." />
    {attempts.length ? <section className="attempt-history">{attempts.map((attempt) => {
      const quiz = getQuiz(attempt.quizId)
      return <article className="attempt-row" key={attempt.id}>
        <span className="attempt-icon"><Target size={19} /></span>
        <div className="attempt-info"><h2>{attempt.quizTitle}</h2><p>{new Date(attempt.submittedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} <span>·</span> <Clock3 size={12} /> {formatDuration(attempt.durationSeconds)}</p></div>
        <div className="attempt-score"><strong>{attempt.percentage}%</strong><small>{attempt.score}/{attempt.maxScore} points</small></div>
        <div className="attempt-actions"><Link to={`/results/${attempt.id}`} className="attempt-review">Review <ArrowRight size={14} /></Link>{quiz && <Link to={`/learn/${quiz.id}`} state={{ retry: true }} className="attempt-retry" aria-label={`Retry ${quiz.title}`}><RotateCcw size={15} /></Link>}</div>
      </article>
    })}</section> : <EmptyState icon={Target} title="Your first attempt is waiting" description="Pick a topic, take a quiz, and your results will be saved here." action={<Link className="button button-primary" to="/library">Explore quizzes</Link>} />}
  </div>
}
