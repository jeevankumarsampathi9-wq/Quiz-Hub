import { BookOpenCheck, Clock3, Layers3, ShieldAlert, Sparkles, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/UI.jsx'

const guides = [
  { icon: BookOpenCheck, title: 'Find something fun', text: 'Head to Explore quizzes, search a topic, or filter by difficulty. Choose a quiz to see its instructions before you start.' },
  { icon: Target, title: 'Play at your pace', text: 'Move between questions, check what’s unanswered, and submit when you’re ready. Your quiz auto-submits when the timer runs out.' },
  { icon: Layers3, title: 'See how you did', text: 'Results show your score, time, and question-by-question answers with explanations. Find all your attempts in My attempts.' },
]

export default function Help() {
  return <div><PageHeader eyebrow="HERE TO HELP" title="A few things to know." description="QuizHub is a friendly place to learn by playing. Here’s the quick tour." />
    <div className="help-note"><span><Sparkles size={18} /></span><p><strong>Welcome to QuizHub.</strong> Log in to explore, take quizzes, and track your own progress. Your demo account and quiz history stay in this browser.</p></div>
    <div className="help-guide-grid">{guides.map(({ icon: Icon, title, text }, index) => <article key={title} className="help-guide-card"><span className="help-guide-icon"><Icon size={20} /></span><span className="help-step">0{index + 1}</span><h2>{title}</h2><p>{text}</p></article>)}</div>
    <section className="about-demo-card"><span className="about-demo-icon"><ShieldAlert size={20} /></span><div><div className="eyebrow">A QUICK NOTE ON DEMO MODE</div><h2>Built to be useful, not production-grade.</h2><p>QuizHub stores demo accounts, passwords, attempts, and profile preferences in this browser’s localStorage. Demo authentication is not secure. The leaderboard uses clearly labeled sample data. No payments, real-money rewards, or external services are involved.</p><Link to="/profile">Your privacy & settings →</Link></div></section>
    <section className="help-bottom"><div><div className="eyebrow">HAVE A QUESTION?</div><h2>Keep exploring. You’re doing great.</h2><p>A fresh quiz is always a nice next step.</p></div><Link className="button button-primary" to="/library"><Clock3 size={16} /> Find a quiz</Link></section>
  </div>
}
