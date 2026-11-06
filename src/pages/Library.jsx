import { useMemo, useState } from 'react'
import { BookOpen, Search, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState, PageHeader, QuizCard } from '../components/UI.jsx'
import { getQuizzes } from '../utils/storage.js'

const categories = ['All', 'Programming', 'AI & ML', 'Web Development', 'Computer Science']
const difficulties = ['All', 'Easy', 'Medium', 'Hard']

export default function Library() {
  const quizzes = getQuizzes()
  const [params, setParams] = useSearchParams()
  const initialCategory = categories.includes(params.get('category')) ? params.get('category') : 'All'
  const [category, setCategory] = useState(initialCategory)
  const [difficulty, setDifficulty] = useState('All')
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => quizzes.filter((quiz) => {
    const lessonText = quiz.learningContent.sections
      .flatMap((section) => [section.title, section.body, ...(section.points || [])])
      .join(' ')
    const matchesText = `${quiz.title} ${quiz.description} ${quiz.category} ${lessonText}`.toLowerCase().includes(search.toLowerCase())
    return matchesText && (category === 'All' || quiz.category === category) && (difficulty === 'All' || quiz.difficulty === difficulty)
  }), [quizzes, search, category, difficulty])
  const selectCategory = (value) => {
    setCategory(value)
    const nextParams = new URLSearchParams(params)
    if (value === 'All') nextParams.delete('category')
    else nextParams.set('category', value)
    setParams(nextParams, { replace: true })
  }
  const clearFilters = () => {
    setSearch('')
    setDifficulty('All')
    selectCategory('All')
  }

  return <div>
    <PageHeader eyebrow="THE QUIZ COLLECTION" title="Learn a little. Quiz yourself." description="Ten focused mini-lessons, each followed by a 15-question knowledge check." />
    <div className="library-intro">
      <div className="library-total"><span>{filtered.length.toString().padStart(2, '0')}</span> quizzes to explore</div>
      <div className="library-search-row">
        <label className="search-field"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search quizzes or lesson topics..." aria-label="Search quizzes" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}</label>
      </div>
    </div>
    <div className="library-filters">
      <div className="filter-chips" aria-label="Filter by category">{categories.map((value) => <button key={value} onClick={() => selectCategory(value)} className={`filter-chip ${category === value ? 'selected' : ''}`}>{value}</button>)}</div>
      <div className="filter-chips difficulty-filters" aria-label="Filter by difficulty">{difficulties.map((value) => <button key={value} onClick={() => setDifficulty(value)} className={`filter-chip ${difficulty === value ? 'selected' : ''}`}>{value === 'All' ? 'Any level' : value}</button>)}</div>
    </div>
    {filtered.length
      ? <div className="library-grid">{filtered.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)}</div>
      : <EmptyState icon={BookOpen} title="No quizzes found just yet" description="Try a different search or clear your filters to see all the good stuff." action={<button className="button button-secondary" onClick={clearFilters}>Clear filters</button>} />}
  </div>
}
