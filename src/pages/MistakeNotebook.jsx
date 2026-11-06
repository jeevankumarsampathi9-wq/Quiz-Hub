import { useMemo, useState } from 'react'
import { BookCheck, Check, CircleCheck, RotateCcw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/UI.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { getStudentProgress, markMistakeReviewed, submitMistakeRetry } from '../utils/studentProgress.js'

export default function MistakeNotebook() {
  const { user } = useAuth()
  const [progress, setProgress] = useState(() => getStudentProgress(user.userId))
  const [filter, setFilter] = useState('All')
  const [retrying, setRetrying] = useState('')
  const [answers, setAnswers] = useState({})
  const [feedback, setFeedback] = useState({})
  const mistakes = useMemo(() => progress.mistakes.filter((item) => {
    if (filter === 'Not Reviewed') return !item.reviewed
    if (filter === 'Reviewed') return item.reviewed
    return true
  }), [progress.mistakes, filter])
  const grouped = mistakes.reduce((groups, item) => {
    const key = `${item.category || 'General'}::${item.quizTitle}`
    if (!groups[key]) groups[key] = { category: item.category || 'General', quizTitle: item.quizTitle, items: [] }
    groups[key].items.push(item)
    return groups
  }, {})
  const refresh = () => setProgress(getStudentProgress(user.userId))
  const review = (item) => {
    markMistakeReviewed(user.userId, item.id)
    refresh()
  }
  const retry = (item) => {
    if (answers[item.id] === undefined || answers[item.id] === '') return
    const correct = submitMistakeRetry(user.userId, item.id, answers[item.id])
    refresh()
    setFeedback((previous) => ({ ...previous, [item.id]: correct ? 'That’s right! This question is now cleared from your active mistakes.' : 'Not quite yet. Review the explanation and give it another try.' }))
    if (correct) setRetrying('')
  }
  const activeCount = progress.mistakes.filter((item) => !item.resolvedAt).length
  return <div className="learning-page">
    <PageHeader eyebrow="LEARN FROM EVERY TRY" title="Mistake Notebook" description="Your tricky questions, saved from completed quizzes so you can revisit and master them." />
    <section className="notebook-summary panel">
      <span className="notebook-summary-icon"><BookCheck size={21} /></span>
      <div><strong>{activeCount} to revisit</strong><p>Questions you answered incorrectly are collected here. Correctly retried questions stay in your reviewed history.</p></div>
    </section>
    <div className="notebook-filters" role="group" aria-label="Filter notebook questions">
      {['All', 'Not Reviewed', 'Reviewed'].map((value) => <button key={value} className={`filter-chip ${filter === value ? 'selected' : ''}`} onClick={() => setFilter(value)}>{value}{value === 'All' ? ` (${progress.mistakes.length})` : value === 'Reviewed' ? ` (${progress.mistakes.filter((item) => item.reviewed).length})` : ` (${progress.mistakes.filter((item) => !item.reviewed).length})`}</button>)}
    </div>
    {mistakes.length ? <div className="notebook-groups">{Object.values(grouped).map((group) => <section key={`${group.category}-${group.quizTitle}`} className="notebook-group">
      <div className="notebook-group-heading"><span className="eyebrow">{group.category}</span><h2>{group.quizTitle}</h2></div>
      {group.items.map((item, index) => <article className={`mistake-card ${item.resolvedAt ? 'mistake-resolved' : ''}`} key={item.id}>
        <div className="mistake-card-heading"><span>QUESTION {String(index + 1).padStart(2, '0')}</span>{item.resolvedAt ? <span className="mistake-status resolved"><CircleCheck size={14} /> Mastered</span> : item.reviewed ? <span className="mistake-status reviewed"><Check size={14} /> Reviewed</span> : <span className="mistake-status">Not reviewed</span>}</div>
        <h3>{item.prompt}</h3>
        <div className="mistake-answer-grid"><div><small>YOUR ANSWER</small><span className="answer-is-wrong">{item.selectedAnswer || 'No answer recorded'}</span></div><div><small>CORRECT ANSWER</small><span className="answer-is-correct">{item.correctAnswer}</span></div></div>
        {item.explanation && <div className="review-explanation"><Sparkles size={15} /><span><strong>Why this is correct</strong>{item.explanation}</span></div>}
        <div className="mistake-card-actions">
          {!item.reviewed && <button className="button button-secondary" onClick={() => review(item)}><Check size={15} /> Mark reviewed</button>}
          {!item.resolvedAt && <button className="button button-primary" onClick={() => { setRetrying(retrying === item.id ? '' : item.id); setFeedback((previous) => ({ ...previous, [item.id]: '' })) }}><RotateCcw size={15} /> Retry question</button>}
          {item.resolvedAt && <span className="mistake-resolved-note">Correctly retried · {new Date(item.resolvedAt).toLocaleDateString()}</span>}
        </div>
        {retrying === item.id && <div className="mistake-retry-panel">
          <strong>Try it again</strong>
          {item.type === 'multiple-choice' && item.options.map((option) => <button key={option.id} className={`quiz-answer-choice ${answers[item.id] === option.id ? 'selected' : ''}`} onClick={() => setAnswers((previous) => ({ ...previous, [item.id]: option.id }))}><span>{option.text}</span>{answers[item.id] === option.id && <Check size={15} />}</button>)}
          {item.type === 'true-false' && ['true', 'false'].map((value) => <button key={value} className={`quiz-answer-choice ${answers[item.id] === value ? 'selected' : ''}`} onClick={() => setAnswers((previous) => ({ ...previous, [item.id]: value }))}><span>{value === 'true' ? 'True' : 'False'}</span>{answers[item.id] === value && <Check size={15} />}</button>)}
          {item.type === 'short-answer' && <input className="short-answer-input" value={answers[item.id] || ''} onChange={(event) => setAnswers((previous) => ({ ...previous, [item.id]: event.target.value }))} placeholder="Type your answer" />}
          <button className="button button-primary" disabled={answers[item.id] === undefined || answers[item.id] === ''} onClick={() => retry(item)}>Check answer</button>
        </div>}
        {feedback[item.id] && <p className={`mistake-feedback ${item.resolvedAt ? 'success' : ''}`} role="status">{feedback[item.id]}</p>}
      </article>)}
    </section>)}</div> : <section className="panel notebook-empty"><BookCheck size={30} /><h2>{progress.mistakes.length ? 'No questions match this filter' : 'Your notebook is ready'}</h2><p>{progress.mistakes.length ? 'Try another filter to see saved questions.' : 'Once you complete a quiz with an incorrect answer, that question and its explanation will appear here.'}</p>{!progress.mistakes.length && <Link className="button button-primary" to="/library">Explore quizzes</Link>}</section>}
  </div>
}
