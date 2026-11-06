import { useMemo } from 'react'
import { Activity, Award, Check, Clock3, Target, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/UI.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { getAttempts, getQuizzes } from '../utils/storage.js'

function percentage(value, total) {
  return total ? Math.round((value / total) * 100) : 0
}

export default function PerformanceAnalytics() {
  const { user } = useAuth()
  const attempts = getAttempts(user.userId)
  const quizzes = getQuizzes()
  const analytics = useMemo(() => {
    const categories = {}
    let attempted = 0
    let correct = 0
    let incorrect = 0
    attempts.forEach((attempt) => {
      const quiz = quizzes.find((item) => item.id === attempt.quizId)
      const subject = attempt.category || quiz?.category || 'General'
      if (!categories[subject]) categories[subject] = { subject, correct: 0, incorrect: 0 }
      ;(Array.isArray(attempt.review) ? attempt.review : []).forEach((item) => {
        if (item.answer === undefined || item.answer === '') return
        attempted += 1
        if (item.correct) {
          correct += 1
          categories[subject].correct += 1
        } else {
          incorrect += 1
          categories[subject].incorrect += 1
        }
      })
    })
    const subjects = Object.values(categories).map((item) => {
      const total = item.correct + item.incorrect
      return { ...item, total, accuracy: percentage(item.correct, total) }
    }).filter((item) => item.total > 0).sort((a, b) => b.accuracy - a.accuracy)
    const durations = attempts.map((attempt) => Number(attempt.durationSeconds)).filter((duration) => Number.isFinite(duration) && duration > 0)
    return {
      quizzes: attempts.length,
      attempted,
      correct,
      incorrect,
      accuracy: percentage(correct, attempted),
      averageScore: attempts.length ? Math.round(attempts.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0) / attempts.length) : 0,
      averageDuration: durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : null,
      subjects,
      strongest: subjects[0],
      improvement: subjects.length ? [...subjects].sort((a, b) => a.accuracy - b.accuracy)[0] : null,
    }
  }, [attempts, quizzes])
  const recentAttempts = [...attempts].reverse().slice(-10)
  const chartPoints = recentAttempts.map((attempt, index) => {
    const count = recentAttempts.length
    const x = count === 1 ? 50 : 8 + (index * 84) / (count - 1)
    return `${x},${92 - (Number(attempt.percentage) || 0) * 0.8}`
  }).join(' ')
  const totalAnswers = analytics.correct + analytics.incorrect
  const correctShare = percentage(analytics.correct, totalAnswers)
  return <div className="learning-page">
    <PageHeader eyebrow="YOUR LEARNING, IN FOCUS" title="Performance Analytics" description="A clear picture of your progress, calculated from your completed quiz attempts." />
    <section className="analytics-stat-grid">
      <article className="analytics-stat panel"><span><Activity size={18} /></span><small>Quizzes completed</small><strong>{analytics.quizzes}</strong></article>
      <article className="analytics-stat panel"><span><Target size={18} /></span><small>Questions attempted</small><strong>{analytics.attempted}</strong></article>
      <article className="analytics-stat panel"><span><Check size={18} /></span><small>Correct answers</small><strong>{analytics.correct}</strong></article>
      <article className="analytics-stat panel"><span><X size={18} /></span><small>Incorrect answers</small><strong>{analytics.incorrect}</strong></article>
      <article className="analytics-stat panel"><span><Award size={18} /></span><small>Overall accuracy</small><strong>{analytics.accuracy}%</strong></article>
      <article className="analytics-stat panel"><span><Clock3 size={18} /></span><small>Average quiz score</small><strong>{analytics.averageScore}%</strong></article>
    </section>
    <div className="analytics-chart-grid">
      <section className="panel analytics-chart-panel"><div className="panel-heading"><div><div className="eyebrow">SUBJECT BREAKDOWN</div><h2>Accuracy by subject</h2></div></div>
        {analytics.subjects.length ? <div className="subject-bars">{analytics.subjects.map((subject) => <div className="subject-bar-row" key={subject.subject}><div><strong>{subject.subject}</strong><span>{subject.correct}/{subject.total} correct · {subject.accuracy}%</span></div><div className="subject-bar-track"><i style={{ width: `${subject.accuracy}%` }} /></div></div>)}</div> : <p className="analytics-empty">Complete quizzes to see subject accuracy.</p>}
      </section>
      <section className="panel analytics-chart-panel"><div className="panel-heading"><div><div className="eyebrow">ANSWER QUALITY</div><h2>Correct vs incorrect</h2></div></div>
        {totalAnswers ? <div className="answer-chart-content"><div className="answer-donut" style={{ '--correct-share': `${correctShare}%` }}><strong>{correctShare}%</strong><small>correct</small></div><div className="answer-legend"><span><i className="legend-correct" /> Correct <strong>{analytics.correct}</strong></span><span><i className="legend-incorrect" /> Incorrect <strong>{analytics.incorrect}</strong></span></div></div> : <p className="analytics-empty">Your answered questions will appear here.</p>}
      </section>
      <section className="panel analytics-chart-panel score-trend-panel"><div className="panel-heading"><div><div className="eyebrow">RECENT RESULTS</div><h2>Quiz scores over time</h2></div><span className="period-pill">Latest {recentAttempts.length}</span></div>
        {recentAttempts.length ? <div className="score-trend-chart"><div className="score-chart-labels"><span>100%</span><span>50%</span><span>0%</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Recent quiz scores"><path d="M 0 92 H 100 M 0 52 H 100 M 0 12 H 100" className="score-grid-line" /><polyline points={chartPoints} fill="none" stroke="var(--maroon)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />{recentAttempts.map((attempt, index) => { const count = recentAttempts.length; const x = count === 1 ? 50 : 8 + (index * 84) / (count - 1); const y = 92 - (Number(attempt.percentage) || 0) * 0.8; return <circle key={attempt.id} cx={x} cy={y} r="1.7" fill="var(--surface)" stroke="var(--maroon)" strokeWidth=".8" vectorEffect="non-scaling-stroke" /> })}</svg></div> : <p className="analytics-empty">Take your first quiz to start your score trend.</p>}
      </section>
      <section className="panel subject-insight-panel"><div className="eyebrow">YOUR NEXT OPPORTUNITY</div>{analytics.strongest ? <><h2>Strongest subject: {analytics.strongest.subject}</h2><p>{analytics.strongest.accuracy}% accuracy across {analytics.strongest.total} answered questions.</p><h3>Room to grow: {analytics.improvement.subject}</h3><p>{analytics.improvement.accuracy}% accuracy so far. Revisit your <Link to="/mistakes">Mistake Notebook</Link> to practice tricky questions.</p></> : <><h2>Your subject insights are on their way</h2><p>Complete a quiz to discover your strongest subject and where to focus next.</p></>}{analytics.averageDuration !== null && <small className="average-time-note">Average time taken: {Math.floor(analytics.averageDuration / 60)}m {analytics.averageDuration % 60}s</small>}</section>
    </div>
  </div>
}
