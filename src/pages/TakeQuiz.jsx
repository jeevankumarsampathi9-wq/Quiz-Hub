import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Clock3, Flag, HelpCircle, Sparkles } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getAttempts, getQuiz, saveAttempt } from '../utils/storage.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { scoreAttempt, shuffle } from '../utils/quiz.js'
import { recordQuizCompletion } from '../utils/studentProgress.js'

function getAttemptState(quiz, userId) {
  const key = `quizhub.active.${userId}.${quiz.id}`
  try {
    const saved = sessionStorage.getItem(key)
    if (saved) return JSON.parse(saved)
  } catch (error) {
    console.error('Unable to restore the current quiz session.', error)
  }
  const questions = quiz.shuffleQuestions ? shuffle(quiz.questions) : [...quiz.questions]
  const optionOrders = Object.fromEntries(quiz.questions.map((question) => [
    question.id,
    question.type === 'multiple-choice' && quiz.shuffleAnswers ? shuffle(question.options).map((option) => option.id) : question.options.map((option) => option.id),
  ]))
  return { attemptId: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`, userId, questionIds: questions.map((question) => question.id), optionOrders, answers: {}, currentIndex: 0, startedAt: null, submitted: false }
}

function persist(quizId, userId, state) {
  try { sessionStorage.setItem(`quizhub.active.${userId}.${quizId}`, JSON.stringify(state)) }
  catch (error) { console.error('Unable to save the current quiz session.', error) }
}

export default function TakeQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const quiz = useMemo(() => getQuiz(id), [id])
  const [attempt, setAttempt] = useState(() => {
    if (location.state?.retry && quiz) {
      sessionStorage.removeItem(`quizhub.active.${user.userId}.${quiz.id}`)
      return getAttemptState(quiz, user.userId)
    }
    return quiz ? getAttemptState(quiz, user.userId) : null
  })
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const submittedRef = useRef(false)
  const attemptRef = useRef(attempt)
  attemptRef.current = attempt
  const questions = useMemo(() => quiz && attempt ? attempt.questionIds.map((questionId) => quiz.questions.find((item) => item.id === questionId)).filter(Boolean) : [], [quiz, attempt?.questionIds])

  useEffect(() => {
    if (!quiz) navigate('/library', { replace: true })
  }, [quiz, navigate])
  useEffect(() => {
    if (quiz && attempt && !attempt.startedAt && !location.state?.fromLesson) {
      navigate(`/learn/${quiz.id}`, { replace: true, state: { retry: Boolean(location.state?.retry) } })
    }
  }, [quiz, attempt?.startedAt, location.state, navigate])
  useEffect(() => {
    if (quiz && attempt && location.state?.fromLesson && !attempt.startedAt) {
      setAttempt((current) => ({ ...current, startedAt: Date.now() }))
    }
  }, [quiz, attempt?.startedAt, location.state])
  useEffect(() => {
    if (quiz && attempt?.submitted && attempt.resultId) {
      navigate(`/results/${attempt.resultId}`, { replace: true })
    }
  }, [quiz, attempt?.submitted, attempt?.resultId, navigate])
  useEffect(() => { if (quiz && attempt) persist(quiz.id, user.userId, attempt) }, [quiz, user.userId, attempt])
  const finish = (automatic = false) => {
    const currentAttempt = attemptRef.current
    if (!quiz || !currentAttempt || currentAttempt.submitted || submitting || submittedRef.current || !currentAttempt.startedAt) return
    if (!automatic && !window.confirm('Submit your quiz now? You won’t be able to change your answers afterward.')) return
    submittedRef.current = true
    setSubmitting(true)
    const result = { ...scoreAttempt(quiz, currentAttempt.answers, currentAttempt.startedAt, Date.now()), category: quiz.category || 'General' }
    try {
      saveAttempt(result, user.userId)
      recordQuizCompletion(user.userId, result, quiz, getAttempts(user.userId))
      const finished = { ...currentAttempt, submitted: true, resultId: result.id }
      persist(quiz.id, user.userId, finished)
      setAttempt(finished)
      navigate(`/results/${result.id}`, { replace: true })
    } catch (error) {
      submittedRef.current = false
      window.alert(error.message || 'Your result could not be saved. Please try again.')
      setSubmitting(false)
    }
  }
  useEffect(() => {
    if (!quiz || !attempt?.startedAt || attempt.submitted) return undefined
    const expiry = attempt.startedAt + Number(quiz.timeLimit || 8) * 60000
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((expiry - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0) finish(true)
    }
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [quiz, attempt?.startedAt, attempt?.submitted])
  if (!quiz || !attempt || !questions.length) return null
  const currentIndex = Math.min(attempt.currentIndex, questions.length - 1)
  const question = questions[currentIndex]
  const answeredCount = Object.values(attempt.answers).filter((value) => value !== '').length
  const remainingLabel = `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`
  const updateAttempt = (changes) => setAttempt((current) => ({ ...current, ...changes }))
  const selectAnswer = (value) => updateAttempt({ answers: { ...attempt.answers, [question.id]: value } })
  const begin = () => {
    const startedAt = Date.now()
    updateAttempt({ startedAt })
  }
  return <div className="take-quiz-page">
    <header className="quiz-taking-header"><div className="quiz-taking-brand"><span className="brand-mark"><Sparkles size={17} /></span>Quiz<span>Hub</span></div><div className="quiz-taking-title">{quiz.title}</div><div className={`quiz-timer ${timeLeft < 60 ? 'timer-low' : ''}`}><Clock3 size={16} /><span>{attempt.startedAt ? remainingLabel : `${quiz.timeLimit || 8}:00`}</span></div></header>
    {!attempt.startedAt ? <section className="quiz-ready-card"><span className="ready-sparkle"><Sparkles size={25} /></span><div className="eyebrow">{quiz.category} · {quiz.difficulty}</div><h1>{quiz.title}</h1><p>{quiz.description || 'A little quiz to stretch your curiosity.'}</p>{quiz.instructions && <div className="ready-instructions"><strong>Before you begin</strong><span>{quiz.instructions}</span></div>}<div className="ready-meta"><span><HelpCircle size={16} />{questions.length} questions</span><span><Clock3 size={16} />{quiz.timeLimit || 8} minutes</span><span><Flag size={16} />{quiz.questions.reduce((sum, item) => sum + (Number(item.marks) || 1), 0)} points</span></div><button className="button button-primary" onClick={begin}>I’m ready, let’s go <ArrowRight size={17} /></button><small>Your timer starts when you begin. Have fun!</small></section>
      : <><div className="quiz-progress-shell"><div className="quiz-progress-label"><span>YOUR PROGRESS</span><strong>{answeredCount} of {questions.length} answered</strong></div><div className="quiz-progress-track"><span style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} /></div></div>
        <div className="quiz-taking-grid"><section className="question-panel"><div className="question-panel-top"><span>QUESTION {String(currentIndex + 1).padStart(2, '0')} <span className="slash">/</span> {String(questions.length).padStart(2, '0')}</span><span className="points-pill">{question.marks || 1} point{Number(question.marks) === 1 ? '' : 's'}</span></div><h1>{question.text}</h1><p className="answer-guidance">{question.type === 'multiple-choice' ? 'Choose the answer that feels right.' : question.type === 'true-false' ? 'Decide if this statement is true or false.' : 'Write your answer in the space below.'}</p>
          {question.type === 'multiple-choice' && (attempt.optionOrders[question.id] || question.options.map((item) => item.id)).map((optionId, index) => {
            const option = question.options.find((item) => item.id === optionId)
            if (!option) return null
            const selected = attempt.answers[question.id] === option.id
            return <button key={option.id} className={`quiz-answer-choice ${selected ? 'selected' : ''}`} onClick={() => selectAnswer(option.id)}><span className="choice-letter">{String.fromCharCode(65 + index)}</span><span>{option.text}</span>{selected && <span className="answer-check"><Check size={15} /></span>}</button>
          })}
          {question.type === 'true-false' && <div className="true-false-options">{['true', 'false'].map((value) => <button key={value} className={`quiz-answer-choice ${attempt.answers[question.id] === value ? 'selected' : ''}`} onClick={() => selectAnswer(value)}><span className="choice-letter">{value === 'true' ? 'T' : 'F'}</span><span>{value === 'true' ? 'True' : 'False'}</span>{attempt.answers[question.id] === value && <span className="answer-check"><Check size={15} /></span>}</button>)}</div>}
          {question.type === 'short-answer' && <textarea className="short-answer-input" rows="4" value={attempt.answers[question.id] || ''} onChange={(event) => selectAnswer(event.target.value)} placeholder="Type your answer here..." />}
          <div className="question-nav-buttons"><button className="button button-secondary" disabled={currentIndex === 0} onClick={() => updateAttempt({ currentIndex: currentIndex - 1 })}><ArrowLeft size={16} /> Previous</button><button className="button button-primary" onClick={() => currentIndex < questions.length - 1 ? updateAttempt({ currentIndex: currentIndex + 1 }) : finish(false)}>{currentIndex === questions.length - 1 ? 'Review & submit' : 'Next question'} <ArrowRight size={16} /></button></div>
        </section><aside className="question-nav-panel"><div className="eyebrow">QUESTION MAP</div><h3>Jump to a question</h3><div className="question-number-grid">{questions.map((item, index) => <button key={item.id} onClick={() => updateAttempt({ currentIndex: index })} className={`${index === currentIndex ? 'current' : ''} ${attempt.answers[item.id] ? 'answered' : ''}`} aria-label={`Go to question ${index + 1}`}>{index + 1}</button>)}</div><div className="question-legend"><span><i className="legend-answered" />Answered</span><span><i className="legend-current" />Current</span><span><i className="legend-unanswered" />Not answered</span></div><div className="unanswered-note"><Flag size={16} /><span><strong>{questions.length - answeredCount} unanswered</strong><small>You can come back to these.</small></span></div><button className="submit-quiz-button" onClick={() => finish(false)}>Submit quiz <ArrowRight size={15} /></button></aside></div>
      </>}
    <footer className="quiz-taking-footer"><button onClick={() => window.confirm('Leave this quiz? Your current answers will be saved in this browser session.') && navigate('/library')}><ArrowLeft size={15} /> Leave quiz</button><span>Take your time. You’ve got this. <span>✦</span></span></footer>
  </div>
}
