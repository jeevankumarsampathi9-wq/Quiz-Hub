import { Activity, ArrowRight, Award, BookOpenCheck, ChartNoAxesCombined, Clock3, Flame, NotebookPen, Star, Target, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, QuizCard, StatCard, ButtonLink, EmptyState } from '../components/UI.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { getAttempts, getQuizzes } from '../utils/storage.js'
import { calculateStreak, getAchievements, getDailyQuizCount, getStudentProgress, localDateKey } from '../utils/studentProgress.js'

const dailyQuizGoal = 2

function getCalendarDays(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const dayCount = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return [...Array(firstDay).fill(null), ...Array.from({ length: dayCount }, (_, index) => index + 1)]
}

function findActiveQuiz(quizzes, userId) {
  for (const quiz of quizzes) {
    try {
      const saved = sessionStorage.getItem(`quizhub.active.${userId}.${quiz.id}`)
      const attempt = saved ? JSON.parse(saved) : null
      if (attempt?.startedAt && !attempt.submitted) return quiz
    } catch (error) {
      console.error(`Unable to check the saved session for ${quiz.id}.`, error)
    }
  }
  return null
}

function PerformanceChart({ attempts }) {
  const points = attempts.slice(0, 7).reverse()
  const values = points.map((attempt) => attempt.percentage)
  const pointsString = values.map((value, index) => `${25 + index * 50},${120 - value}`).join(' ')
  return <div className="chart-wrap">
    <div className="chart-y-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
    <div className="chart-main">
      <div className="chart-grid"><i /><i /><i /><i /><i /></div>
      {points.length ? <svg viewBox="0 0 325 130" preserveAspectRatio="none" role="img" aria-label="Quiz score trend">
        <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--maroon)" stopOpacity=".22" /><stop offset="100%" stopColor="var(--maroon)" stopOpacity="0" /></linearGradient></defs>
        <polygon points={`25,130 ${pointsString} ${25 + (values.length - 1) * 50},130`} fill="url(#chartFill)" />
        <polyline points={pointsString} fill="none" stroke="var(--maroon)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((value, index) => <circle key={index} cx={25 + index * 50} cy={120 - value} r="4" fill="white" stroke="var(--maroon)" strokeWidth="3" />)}
      </svg> : <div className="chart-empty-state">Complete a quiz to see your score trend.</div>}
      <div className="chart-x-labels">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div>
    </div>
  </div>
}

export default function Dashboard() {
  const { user } = useAuth()
  const attempts = getAttempts(user.userId)
  const quizzes = getQuizzes()
  const progress = getStudentProgress(user.userId)
  const streak = calculateStreak(progress.learningDates)
  const todayKey = localDateKey()
  const dailyCount = getDailyQuizCount(attempts)
  const attemptCounts = attempts.reduce((counts, attempt) => {
    counts[attempt.quizId] = (counts[attempt.quizId] || 0) + 1
    return counts
  }, {})
  const completedQuizIds = new Set(attempts.map((attempt) => attempt.quizId))
  const nextQuiz = quizzes.find((quiz) => !completedQuizIds.has(quiz.id))
  const activeQuiz = findActiveQuiz(quizzes, user.userId)
  const continueQuiz = activeQuiz || nextQuiz || (attempts.length ? quizzes.find((quiz) => quiz.id === attempts[0].quizId) : quizzes[0])
  const continueState = !activeQuiz && !nextQuiz && attempts.length ? { retry: true } : undefined
  const popular = [...quizzes].sort((a, b) => (attemptCounts[b.id] || 0) - (attemptCounts[a.id] || 0)).slice(0, 3)
  const recommended = quizzes.filter((quiz) => !completedQuizIds.has(quiz.id)).slice(0, 3)
  const average = attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.percentage, 0) / attempts.length) : 0
  const lastWeek = attempts.filter((attempt) => Date.now() - new Date(attempt.submittedAt).getTime() < 7 * 86400000).length
  const analytics = attempts.reduce((counts, attempt) => {
    ;(Array.isArray(attempt.review) ? attempt.review : []).forEach((item) => {
      if (item.answer === undefined || item.answer === '') return
      counts.attempted += 1
      if (item.correct) counts.correct += 1
    })
    return counts
  }, { attempted: 0, correct: 0 })
  const accuracy = analytics.attempted ? Math.round((analytics.correct / analytics.attempted) * 100) : 0
  const achievements = getAchievements(user.userId, attempts)
    .filter((badge) => badge.earned)
    .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
    .slice(0, 3)
  const challengeIndex = [...`${todayKey}${user.userId}`].reduce((sum, character) => sum + character.charCodeAt(0), 0) % quizzes.length
  const dailyChallenge = quizzes[challengeIndex]
  const calendarDate = new Date()
  const completedDays = new Set(progress.learningDates)
  const encouragement = dailyCount >= dailyQuizGoal
    ? 'Daily goal complete. Wonderful work showing up for yourself!'
    : streak.current > 0
      ? 'You’re on a roll. One more quiz keeps the momentum going.'
      : 'A quiz today is a lovely way to start a new streak.'
  return <div>
    <PageHeader eyebrow="YOUR LEARNING SPACE" title={`Good to see you, ${user.name.split(' ')[0]}!`} description="A little progress adds up. Here’s how your learning is going." action={<ButtonLink to="/library" icon={BookOpenCheck}>Explore quizzes</ButtonLink>} />
    <section className="stats-grid">
      <StatCard icon={BookOpenCheck} label="Quizzes available" value={quizzes.length} note="Ready when you are" color="blue" />
      <StatCard icon={Activity} label="Quizzes attempted" value={attempts.length} note={lastWeek ? `${lastWeek} this week` : 'Your first one is waiting'} color="violet" />
      <StatCard icon={Target} label="Average score" value={`${average}%`} note={attempts.length ? 'Across completed quizzes' : 'Complete a quiz to begin'} color="mint" />
      <StatCard icon={Flame} label="Best score" value={`${Math.max(0, ...attempts.map((item) => item.percentage))}%`} note={attempts.length ? 'Keep reaching higher' : 'Make it a personal best'} color="peach" />
      <StatCard icon={ChartNoAxesCombined} label="Overall accuracy" value={`${accuracy}%`} note={analytics.attempted ? `${analytics.correct} correct answers` : 'Complete a quiz to begin'} color="violet" />
    </section>
    <section className="dashboard-main-grid">
      <div className="panel performance-panel"><div className="panel-heading"><div><div className="eyebrow">YOUR MOMENTUM</div><h2>Performance over time</h2></div><span className="period-pill">Last 7 days</span></div><PerformanceChart attempts={attempts} /><div className="chart-footnote"><span><i /> Quiz scores</span><strong>{attempts.length ? `+${average}% average` : 'Your journey starts here'}</strong></div></div>
      <div className="panel quick-panel"><div className="eyebrow">MAKE IT A GOOD ONE</div><h2>What sounds fun?</h2><p>Pick up where you left off, or try something completely new.</p>
        <Link className="quick-action" to="/library"><span className="quick-action-icon blue"><BookOpenCheck size={18} /></span><span><strong>Explore quizzes</strong><small>Find a new topic to love</small></span><ArrowRight size={17} /></Link>
        <Link className="quick-action" to="/attempts"><span className="quick-action-icon violet"><Activity size={19} /></span><span><strong>My attempts</strong><small>Review your learning history</small></span><ArrowRight size={17} /></Link>
        <Link className="quick-action" to="/leaderboard"><span className="quick-action-icon peach"><Trophy size={18} /></span><span><strong>See the leaderboard</strong><small>Demo rankings, just for fun</small></span><ArrowRight size={17} /></Link>
        <Link className="quick-action" to="/mistakes"><span className="quick-action-icon peach"><NotebookPen size={18} /></span><span><strong>Mistake Notebook</strong><small>Revisit tricky questions</small></span><ArrowRight size={17} /></Link>
        <Link className="quick-action" to="/analytics"><span className="quick-action-icon violet"><ChartNoAxesCombined size={18} /></span><span><strong>Performance analytics</strong><small>See your subject insights</small></span><ArrowRight size={17} /></Link>
      </div>
    </section>
    <section className="learning-momentum-grid">
      <div className="panel streak-panel">
        <div className="panel-heading"><div><div className="eyebrow">YOUR DAILY MOMENTUM</div><h2><Flame size={18} /> {streak.current}-day streak</h2></div><span className="period-pill">Best: {streak.longest} days</span></div>
        <p>{encouragement}</p>
        <div className="daily-goal-row"><span>Daily goal · {dailyCount} of {dailyQuizGoal} quizzes</span><strong>{Math.min(dailyCount, dailyQuizGoal)}/{dailyQuizGoal}</strong></div>
        <div className="daily-goal-track"><i style={{ width: `${Math.min(100, (dailyCount / dailyQuizGoal) * 100)}%` }} /></div>
        <div className="streak-calendar-heading"><strong>{calendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong><span>Completed days</span></div>
        <div className="streak-calendar">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span className="calendar-weekday" key={`${day}-${index}`}>{day}</span>)}
          {getCalendarDays(calendarDate).map((day, index) => <span key={day || `blank-${index}`} className={`calendar-day ${day && completedDays.has(localDateKey(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day))) ? 'complete' : ''} ${day && day === calendarDate.getDate() ? 'today' : ''}`}>{day || ''}</span>)}
        </div>
      </div>
      <div className="panel dashboard-challenge-panel">
        <div className="eyebrow">TODAY’S DAILY CHALLENGE</div><span className="challenge-sparkle"><Star size={19} /></span><h2>{dailyChallenge.title}</h2><p>{dailyChallenge.description}</p><div className="challenge-meta">{dailyChallenge.category} · {dailyChallenge.questions.length} questions</div><Link className="button button-primary" to={`/learn/${dailyChallenge.id}`} state={{ retry: completedQuizIds.has(dailyChallenge.id) }}>Take today’s challenge <ArrowRight size={15} /></Link>
        <div className="dashboard-recent-badges"><div className="recent-badges-title"><strong>Recent achievements</strong><Link to="/achievements">View all <ArrowRight size={13} /></Link></div>{achievements.length ? achievements.map((badge) => <div className="dashboard-badge-row" key={badge.id}><span><Award size={15} /></span><strong>{badge.title}</strong><small>{new Date(badge.earnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</small></div>) : <small className="no-dashboard-badges">Complete quizzes and build your streak to earn your first badge.</small>}</div>
      </div>
    </section>
    <section className="dashboard-bottom-grid"><div className="panel activity-panel"><div className="panel-heading"><div><div className="eyebrow">THE LATEST</div><h2>Recent activity</h2></div><Link className="text-link" to="/attempts">All attempts <ArrowRight size={15} /></Link></div>
      {attempts.length ? <div className="activity-list">{attempts.slice(0, 4).map((attempt) => <div className="activity-row" key={attempt.id}><span className="activity-check"><Target size={17} /></span><span className="activity-detail"><strong>{attempt.quizTitle}</strong><small>{new Date(attempt.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · <Clock3 size={12} /> {Math.floor(attempt.durationSeconds / 60)} min</small></span><strong className="activity-score">{attempt.percentage}%</strong></div>)}</div> : <EmptyState icon={Activity} title="Your story starts here" description="Finish a quiz and your activity will show up here." action={<ButtonLink to="/library" variant="secondary">Find a quiz</ButtonLink>} />}
    </div><div className="dashboard-pick"><div className="eyebrow">YOUR NEXT STEP</div><h2>Continue learning</h2>{continueQuiz && <QuizCard quiz={continueQuiz} compact state={continueState} />}{attempts[0] && <div className="dashboard-progress"><span>Your latest score</span><strong>{attempts[0].percentage}%</strong><i><b style={{ width: `${attempts[0].percentage}%` }} /></i></div>}</div></section>
    <section className="dashboard-quiz-section">
      <div className="section-title-row"><div><div className="eyebrow">LEARN SOMETHING NEW</div><h2>Popular quizzes</h2></div><Link className="text-link" to="/library">Explore all <ArrowRight size={15} /></Link></div>
      <div className="featured-grid">{popular.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)}</div>
    </section>
    <section className="dashboard-quiz-section">
      <div className="section-title-row"><div><div className="eyebrow">PICKED FOR YOU</div><h2>Recommended</h2></div><Link className="text-link" to="/library">Browse topics <ArrowRight size={15} /></Link></div>
      {recommended.length ? <div className="featured-grid">{recommended.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)}</div> : <div className="dashboard-complete-note">You’ve tried every quiz — explore the library to revisit a favorite.</div>}
    </section>
    <section className="dashboard-quiz-section all-quizzes-section">
      <div className="section-title-row"><div><div className="eyebrow">YOUR LEARNING LIBRARY</div><h2>All quizzes <span className="dashboard-count">{quizzes.length}</span></h2></div><Link className="text-link" to="/library">Search & filter <ArrowRight size={15} /></Link></div>
      <div className="dashboard-all-quizzes">{quizzes.map((quiz) => <Link key={quiz.id} to={`/learn/${quiz.id}`} className="dashboard-quiz-row"><img src={quiz.image} alt="" /><span><strong>{quiz.title}</strong><small>{quiz.category} · {quiz.difficulty} · {quiz.questions.length} questions</small></span>{completedQuizIds.has(quiz.id) && <em>Attempted</em>}<ArrowRight size={16} /></Link>)}</div>
    </section>
  </div>
}
