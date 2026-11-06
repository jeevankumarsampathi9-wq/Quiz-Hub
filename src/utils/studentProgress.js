import { createId } from './quiz.js'
import { getQuizzes } from './storage.js'

const STORAGE_PREFIX = 'quizhub.studentProgress.'

export function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseLocalDate(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function shiftDate(date, amount) {
  const shifted = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  shifted.setDate(shifted.getDate() + amount)
  return shifted
}

export function calculateStreak(dates, today = new Date()) {
  const completed = new Set(dates)
  const todayKey = localDateKey(today)
  const yesterdayKey = localDateKey(shiftDate(today, -1))
  const latest = completed.has(todayKey) ? todayKey : completed.has(yesterdayKey) ? yesterdayKey : null
  let current = 0
  if (latest) {
    let date = parseLocalDate(latest)
    while (completed.has(localDateKey(date))) {
      current += 1
      date = shiftDate(date, -1)
    }
  }
  let longest = 0
  const sortedDates = [...completed].sort()
  let run = 0
  let previous = null
  for (const key of sortedDates) {
    const date = parseLocalDate(key)
    run = previous && localDateKey(shiftDate(previous, 1)) === key ? run + 1 : 1
    longest = Math.max(longest, run)
    previous = date
  }
  return { current, longest }
}

function readProgress(userId) {
  if (!userId) return { mistakes: [], learningDates: [], achievements: {}, reviewedIds: [] }
  try {
    const saved = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${userId}`) || '{}')
    return {
      mistakes: Array.isArray(saved.mistakes) ? saved.mistakes : [],
      learningDates: Array.isArray(saved.learningDates) ? saved.learningDates : [],
      achievements: saved.achievements && typeof saved.achievements === 'object' ? saved.achievements : {},
      reviewedIds: Array.isArray(saved.reviewedIds) ? saved.reviewedIds : [],
    }
  } catch (error) {
    console.error('Unable to read student learning progress.', error)
    return { mistakes: [], learningDates: [], achievements: {}, reviewedIds: [] }
  }
}

function writeProgress(userId, progress) {
  if (!userId) throw new Error('Sign in before saving learning progress.')
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(progress))
  } catch (error) {
    console.error('Unable to save student learning progress.', error)
    throw new Error('Your browser could not save learning progress. Check available storage and try again.')
  }
}

export function getStudentProgress(userId) {
  return readProgress(userId)
}

function getBadgeDefinitions(attempts, progress) {
  const completedQuizzes = new Set(attempts.map((attempt) => attempt.quizId)).size
  const completedAttempts = attempts.length
  const reviewedCount = progress.reviewedIds.length
  const subjectStats = {}
  const quizzes = getQuizzes()
  attempts.forEach((attempt) => {
    const subject = attempt.category || quizzes.find((quiz) => quiz.id === attempt.quizId)?.category || 'General'
    if (!subjectStats[subject]) subjectStats[subject] = { correct: 0, answered: 0 }
    ;(Array.isArray(attempt.review) ? attempt.review : []).forEach((item) => {
      if (item.answer === undefined || item.answer === '') return
      subjectStats[subject].answered += 1
      if (item.correct) subjectStats[subject].correct += 1
    })
  })
  const masteredSubject = Object.values(subjectStats).some((item) => item.answered >= 10 && item.correct / item.answered >= 0.9)
  const subjectProgress = Object.values(subjectStats).reduce((best, item) => {
    const progress = item.answered < 10
      ? Math.min(9, item.answered)
      : Math.min(10, Math.floor((item.correct / item.answered / 0.9) * 10))
    return Math.max(best, progress)
  }, 0)
  const streak = calculateStreak(progress.learningDates)
  return [
    { id: 'first-quiz', title: 'First Quiz', description: 'Complete your first quiz.', icon: 'Target', value: completedAttempts ? 1 : 0, goal: 1, earned: completedAttempts >= 1 },
    { id: 'perfect-score', title: 'Perfect Score', description: 'Get 100% in a quiz.', icon: 'Star', value: attempts.some((item) => item.percentage === 100) ? 1 : 0, goal: 1, earned: attempts.some((item) => item.percentage === 100) },
    { id: 'quiz-explorer', title: 'Quiz Explorer', description: 'Complete 5 different quizzes.', icon: 'Compass', value: completedQuizzes, goal: 5, earned: completedQuizzes >= 5 },
    { id: 'knowledge-seeker', title: 'Knowledge Seeker', description: 'Complete 10 different quizzes.', icon: 'BookOpen', value: completedQuizzes, goal: 10, earned: completedQuizzes >= 10 },
    { id: 'streak-starter', title: 'Streak Starter', description: 'Maintain a 3-day learning streak.', icon: 'Flame', value: streak.longest, goal: 3, earned: streak.longest >= 3 },
    { id: 'weekly-champion', title: 'Weekly Champion', description: 'Maintain a 7-day learning streak.', icon: 'Trophy', value: streak.longest, goal: 7, earned: streak.longest >= 7 },
    { id: 'subject-master', title: 'Subject Master', description: 'Reach 90% accuracy in a subject after 10 answered questions.', icon: 'Award', value: subjectProgress, goal: 10, earned: masteredSubject },
    { id: 'revision-hero', title: 'Revision Hero', description: 'Review 10 different mistakes.', icon: 'BookCheck', value: reviewedCount, goal: 10, earned: reviewedCount >= 10 },
  ]
}

export function getAchievements(userId, attempts = []) {
  const progress = readProgress(userId)
  const definitions = getBadgeDefinitions(attempts, progress)
  let changed = false
  const achievements = { ...progress.achievements }
  definitions.forEach((badge) => {
    if (badge.earned && !achievements[badge.id]) {
      achievements[badge.id] = new Date().toISOString()
      changed = true
    }
  })
  if (changed) writeProgress(userId, { ...progress, achievements })
  return definitions.map((badge) => ({ ...badge, earnedAt: achievements[badge.id] || null }))
}

export function recordQuizCompletion(userId, result, quiz, attempts) {
  const progress = readProgress(userId)
  const mistakes = [...progress.mistakes]
  const reviewedIds = new Set(progress.reviewedIds)
  const questionById = Object.fromEntries(quiz.questions.map((question) => [question.id, question]))
  ;(Array.isArray(result.review) ? result.review : []).forEach((answer) => {
    const existingIndex = mistakes.findIndex((item) => item.quizId === result.quizId && item.questionId === answer.questionId)
    if (answer.correct) {
      if (existingIndex >= 0) {
        const existing = mistakes[existingIndex]
        mistakes[existingIndex] = {
          ...existing,
          resolvedAt: result.submittedAt,
          selectedAnswer: answer.answerText || 'Correct answer',
          reviewed: true,
          reviewedAt: existing.reviewedAt || result.submittedAt,
        }
        reviewedIds.add(existing.id)
      }
      return
    }
    if (answer.answer === '' || answer.answer === undefined) return
    const question = questionById[answer.questionId]
    if (!question) return
    const existing = existingIndex >= 0 ? mistakes[existingIndex] : null
    const item = {
      id: existing?.id || createId(),
      quizId: result.quizId,
      quizTitle: result.quizTitle,
      category: quiz.category || 'General',
      questionId: question.id,
      prompt: question.text,
      type: question.type,
      options: question.options || [],
      selectedAnswer: answer.answerText,
      correctAnswer: answer.correctAnswer,
      explanation: answer.explanation || '',
      reviewed: existing?.reviewed || false,
      reviewedAt: existing?.reviewedAt || null,
      resolvedAt: null,
      createdAt: existing?.createdAt || result.submittedAt,
      updatedAt: result.submittedAt,
    }
    if (existingIndex >= 0) mistakes[existingIndex] = item
    else mistakes.push(item)
  })
  const learningDates = [...new Set([...progress.learningDates, localDateKey(new Date(result.submittedAt))])].sort()
  const updated = { ...progress, mistakes, learningDates, reviewedIds: [...reviewedIds] }
  const achievements = { ...updated.achievements }
  getBadgeDefinitions(attempts, updated).forEach((badge) => {
    if (badge.earned && !achievements[badge.id]) achievements[badge.id] = new Date(result.submittedAt).toISOString()
  })
  updated.achievements = achievements
  writeProgress(userId, updated)
}

export function markMistakeReviewed(userId, mistakeId) {
  const progress = readProgress(userId)
  if (!progress.mistakes.some((item) => item.id === mistakeId)) throw new Error('This notebook question is no longer available.')
  const mistakes = progress.mistakes.map((item) => item.id === mistakeId
    ? { ...item, reviewed: true, reviewedAt: item.reviewedAt || new Date().toISOString() }
    : item)
  const reviewedIds = [...new Set([...progress.reviewedIds, mistakeId])]
  const updated = { ...progress, mistakes, reviewedIds }
  const achievements = { ...updated.achievements }
  getBadgeDefinitions([], updated).forEach((badge) => {
    if (badge.earned && !achievements[badge.id]) achievements[badge.id] = new Date().toISOString()
  })
  updated.achievements = achievements
  writeProgress(userId, updated)
}

export function submitMistakeRetry(userId, mistakeId, answer) {
  const progress = readProgress(userId)
  const item = progress.mistakes.find((mistake) => mistake.id === mistakeId)
  if (!item) throw new Error('This notebook question is no longer available.')
  const option = item.options.find((choice) => choice.id === answer)
  const correct = item.type === 'multiple-choice'
    ? option?.text === item.correctAnswer
    : String(answer).trim().toLowerCase() === String(item.correctAnswer).trim().toLowerCase()
  const now = new Date().toISOString()
  const mistakes = progress.mistakes.map((mistake) => mistake.id === mistakeId
    ? { ...mistake, selectedAnswer: option?.text || answer, reviewed: true, reviewedAt: mistake.reviewedAt || now, resolvedAt: correct ? now : null, updatedAt: now }
    : mistake)
  const updated = { ...progress, mistakes, reviewedIds: [...new Set([...progress.reviewedIds, mistakeId])] }
  const achievements = { ...updated.achievements }
  getBadgeDefinitions([], updated).forEach((badge) => {
    if (badge.earned && !achievements[badge.id]) achievements[badge.id] = now
  })
  updated.achievements = achievements
  writeProgress(userId, updated)
  return correct
}

export function getDailyQuizCount(attempts, date = new Date()) {
  const key = localDateKey(date)
  return attempts.filter((attempt) => attempt.submittedAt && localDateKey(new Date(attempt.submittedAt)) === key).length
}
