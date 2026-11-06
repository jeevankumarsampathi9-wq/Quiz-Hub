import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, Clock3, Sparkles } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getQuiz } from '../utils/storage.js'

export default function Learn() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const quiz = getQuiz(id)

  if (!quiz) return <Navigate to="/library" replace />

  const sections = quiz.learningContent?.sections || []
  const startQuiz = () => navigate(`/quiz/${quiz.id}`, {
    state: { fromLesson: true, retry: Boolean(location.state?.retry) },
  })

  return <article className="lesson-page">
    <Link to="/library" className="back-link"><ArrowLeft size={15} /> Explore quizzes</Link>
    <header className="lesson-hero">
      <img src={quiz.image} alt="" className="lesson-hero-image" />
      <div className="lesson-hero-content">
        <div className="lesson-kicker"><span>{quiz.category}</span><span>{quiz.difficulty}</span><span><Clock3 size={14} /> About 15 minutes</span></div>
        <h1>{quiz.title}</h1>
        <p>{quiz.learningContent?.intro || quiz.description}</p>
        <div className="lesson-hero-meta"><span><BookOpenCheck size={16} /> {sections.length} lesson sections</span><span><Sparkles size={16} /> Followed by {quiz.questions.length} questions</span></div>
      </div>
    </header>
    <div className="lesson-flow"><span className="lesson-flow-step active"><i>1</i> Learn</span><span className="lesson-flow-line" /><span className="lesson-flow-step"><i>2</i> Understand</span><span className="lesson-flow-line" /><span className="lesson-flow-step"><i>3</i> Test yourself</span></div>
    <div className="lesson-content-grid">
      <div className="lesson-sections">
        {sections.map((section, index) => <section className="lesson-section" key={section.title}>
          <div className="lesson-section-heading"><span>{String(index + 1).padStart(2, '0')}</span><h2>{section.title}</h2></div>
          <p>{section.body}</p>
          {section.points?.length > 0 && <ul>{section.points.map((point) => <li key={point}><CheckCircle2 size={16} />{point}</li>)}</ul>}
          {section.example && <pre className="lesson-example"><code>{section.example}</code></pre>}
        </section>)}
      </div>
      <aside className="lesson-sidebar">
        <span className="lesson-sidebar-icon"><BookOpenCheck size={21} /></span>
        <div className="eyebrow">READY WHEN YOU ARE</div>
        <h2>Put what you learned to the test.</h2>
        <p>The timed knowledge check has {quiz.questions.length} questions. You can review your answers before you submit.</p>
        <div className="lesson-sidebar-meta"><span>Questions <strong>{quiz.questions.length}</strong></span><span>Time limit <strong>{quiz.timeLimit} min</strong></span></div>
        <button className="button button-primary lesson-start" onClick={startQuiz}>Start quiz <ArrowRight size={17} /></button>
        <small>Your progress and result are saved to your demo account.</small>
      </aside>
    </div>
    <div className="lesson-footer-cta"><Sparkles size={19} /><span><strong>Small steps count.</strong> When you’re ready, take the quiz and see how much you remember.</span><button className="button button-secondary" onClick={startQuiz}>Start quiz <ArrowRight size={16} /></button></div>
  </article>
}
