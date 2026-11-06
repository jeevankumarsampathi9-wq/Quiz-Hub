import { Link } from 'react-router-dom'
import { ArrowRight, Clock3, HelpCircle, Sparkles } from 'lucide-react'

export function PageHeader({ eyebrow, title, description, action }) {
  return <div className="page-header">
    <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>
    {action && <div className="page-header-action">{action}</div>}
  </div>
}

export function QuizCard({ quiz, compact = false, state }) {
  return <article className={`quiz-card ${compact ? 'quiz-card-compact' : ''}`}>
    <div className={`quiz-art ${quiz.color || 'sky'}`}><img src={quiz.image} alt="" /><span className="quiz-art-tag">{quiz.category}</span><span className="quiz-art-symbol"><Sparkles size={16} /> Mini lesson included</span></div>
    <div className="quiz-card-body">
      <div className="quiz-card-kicker"><span className={`difficulty-dot ${quiz.difficulty?.toLowerCase()}`} />{quiz.difficulty || 'Easy'}<span className="tiny-divider">·</span>{quiz.category}</div>
      <h3>{quiz.title}</h3><p className="quiz-card-description">{quiz.description || 'A quick, fun knowledge check to keep your learning moving.'}</p>
      <div className="quiz-card-meta"><span><HelpCircle size={14} />{quiz.questions.length} questions</span><span><Clock3 size={14} />{quiz.estimatedTime || quiz.timeLimit || 15} min</span></div>
      <Link to={`/learn/${quiz.id}`} state={state} className="quiz-card-link">Learn & start <ArrowRight size={16} /></Link>
    </div>
  </article>
}

export function EmptyState({ icon: Icon = HelpCircle, title, description, action }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={25} /></span><h3>{title}</h3><p>{description}</p>{action}</div>
}

export function StatCard({ icon: Icon, label, value, note, color = 'blue' }) {
  return <div className="stat-card"><span className={`stat-icon ${color}`}><Icon size={19} /></span><div><span className="stat-label">{label}</span><strong>{value}</strong><small>{note}</small></div></div>
}

export function ButtonLink({ to, children, variant = 'primary', icon: Icon }) {
  return <Link className={`button button-${variant}`} to={to}>{Icon && <Icon size={17} />}{children}</Link>
}
