import { useMemo } from 'react'
import { ArrowLeft, ArrowRight, Check, Clock3, RotateCcw, Sparkles, Target, Trophy, X } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { EmptyState, PageHeader } from '../components/UI.jsx'
import { getAttempts, getQuiz } from '../utils/storage.js'

function formatDuration(seconds = 0) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return minutes ? `${minutes}m ${remainder}s` : `${remainder}s`
}

export default function Results() {
  const { id, attemptId } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const attempts = useMemo(() => getAttempts(user.userId), [user.userId])
  const result = attempts.find((attempt) => attempt.id === attemptId)
    || attempts.find((attempt) => attempt.id === location.state?.attemptId)
    || attempts.find((attempt) => attempt.quizId === id)
    || (id || attemptId ? null : attempts[0])
  const quiz = useMemo(() => getQuiz(result?.quizId || id), [result?.quizId, id])
  if (!result) return <div className="results-empty"><EmptyState icon={Target} title="No result to show yet" description="Take a quiz first and your results will be waiting here." action={<Link className="button button-primary" to="/library">Find a quiz</Link>} /></div>
  const reviewById = Object.fromEntries(result.review.map((item) => [item.questionId, item]))
  const questions = quiz?.questions ?? []
  const encouragement = result.percentage === 100 ? 'A perfect score. You absolutely nailed it!' : result.percentage >= 75 ? 'Look at you go. That’s something to be proud of.' : result.percentage >= 50 ? 'You’re finding your rhythm. Keep that curiosity going.' : 'Every try is a step forward. Ready for another round?'
  return <div className="results-page"><Link to="/library" className="back-link"><ArrowLeft size={15} /> Back to quizzes</Link>
    <section className="result-hero"><div className="result-confetti confetti-one">✦</div><div className="result-confetti confetti-two">✳</div><span className="result-trophy"><Trophy size={25} /></span><div className="eyebrow">QUIZ COMPLETE · {quiz?.category || 'QUIZ'}</div><h1>{result.percentage === 100 ? 'A perfect little victory.' : 'Look at you, showing up.'}</h1><p>{encouragement}</p><div className="score-orb"><div><strong>{result.percentage}<span>%</span></strong><small>YOUR SCORE</small></div></div><div className="result-mini-stats"><span><strong>{result.score}/{result.maxScore}</strong><small>points earned</small></span><i /><span><strong>{formatDuration(result.durationSeconds)}</strong><small>time taken</small></span><i /><span><strong>{result.correctCount}</strong><small>correct answers</small></span></div></section>
    <div className="result-summary-cards"><div className="result-summary-card"><span className="summary-icon correct"><Check size={17} /></span><span><strong>{result.correctCount}</strong><small>Correct</small></span></div><div className="result-summary-card"><span className="summary-icon incorrect"><X size={17} /></span><span><strong>{result.incorrectCount}</strong><small>Incorrect</small></span></div><div className="result-summary-card"><span className="summary-icon unanswered"><Clock3 size={17} /></span><span><strong>{result.unansweredCount}</strong><small>Unanswered</small></span></div></div>
    <div className="result-review-header"><div><div className="eyebrow">THE GOOD STUFF</div><h2>Let’s look back.</h2><p>Every answer is a chance to learn something new.</p></div><Link to={`/learn/${result.quizId}`} state={{ retry: true }} className="button button-secondary"><RotateCcw size={16} /> Try again</Link></div>
    <div className="review-list">{(questions.length ? questions : result.review).map((question, index) => {
      const review = reviewById[question.id] || result.review[index]
      if (!review) return null
      return <article className={`review-card ${review.correct ? 'review-correct' : 'review-incorrect'}`} key={question.id || review.questionId}><div className="review-question-head"><span className={`review-status ${review.correct ? 'correct' : review.answer === '' ? 'unanswered' : 'incorrect'}`}>{review.correct ? <Check size={15} /> : review.answer === '' ? <Clock3 size={15} /> : <X size={15} />}</span><span className="review-count">QUESTION {String(index + 1).padStart(2, '0')}</span><span className={`review-points ${review.correct ? 'won' : ''}`}>{review.correct ? `+${review.marks}` : '0'} / {review.marks} pts</span></div><h3>{review.prompt}</h3><div className="review-answers"><div><small>YOUR ANSWER</small><span className={review.correct ? 'answer-is-correct' : 'answer-is-wrong'}>{review.answerText || 'Not answered'}</span></div>{!review.correct && <div><small>RIGHT ANSWER</small><span className="answer-is-correct">{review.correctAnswer}</span></div>}</div>{review.explanation && <div className="review-explanation"><Sparkles size={15} /><span><strong>A little more context</strong>{review.explanation}</span></div>}</article>
    })}</div>
    <div className="results-bottom-actions"><Link to="/library" className="button button-secondary"><ArrowLeft size={16} /> Find another quiz</Link><Link to="/attempts" className="button button-primary">My attempts <ArrowRight size={16} /></Link></div>
  </div>
}
