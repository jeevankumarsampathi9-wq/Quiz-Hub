export const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

export function createQuestion() {
  return {
    id: createId(),
    type: 'multiple-choice',
    text: '',
    options: [{ id: createId(), text: '' }, { id: createId(), text: '' }],
    correctOptionId: '',
    correctAnswer: '',
    marks: 1,
    explanation: '',
  }
}

export function validateQuiz(quiz) {
  const errors = []
  if (!quiz.title.trim()) errors.push('Add a quiz title.')
  if (!quiz.questions.length) errors.push('Add at least one question.')
  quiz.questions.forEach((question, index) => {
    const number = index + 1
    if (!question.text.trim()) errors.push(`Question ${number} needs question text.`)
    if (question.type === 'multiple-choice') {
      const options = question.options.filter((option) => option.text.trim())
      if (options.length < 2) errors.push(`Question ${number} needs at least two answer options.`)
      if (!options.some((option) => option.id === question.correctOptionId)) errors.push(`Choose a correct answer for question ${number}.`)
    }
    if (question.type === 'short-answer' && !question.correctAnswer.trim()) errors.push(`Add an accepted answer for question ${number}.`)
    if (question.type === 'true-false' && !['true', 'false'].includes(question.correctAnswer)) errors.push(`Choose a correct answer for question ${number}.`)
  })
  return errors
}

export function scoreAttempt(quiz, answers, startedAt, submittedAt = Date.now()) {
  let score = 0
  let maxScore = 0
  let correctCount = 0
  let incorrectCount = 0
  let unansweredCount = 0
  const review = quiz.questions.map((question) => {
    const answer = answers[question.id]
    const marks = Math.max(1, Number(question.marks) || 1)
    maxScore += marks
    let correct = false
    let correctAnswer = ''
    if (question.type === 'multiple-choice') {
      correctAnswer = question.options.find((option) => option.id === question.correctOptionId)?.text ?? ''
      correct = Boolean(answer) && answer === question.correctOptionId
    } else {
      correctAnswer = question.correctAnswer
      correct = Boolean(answer?.trim()) && answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
    }
    const unanswered = answer === undefined || (typeof answer === 'string' && answer.trim() === '')
    if (unanswered) unansweredCount += 1
    else if (correct) {
      correctCount += 1
      score += marks
    } else incorrectCount += 1
    const answerText = question.type === 'multiple-choice'
      ? question.options.find((option) => option.id === answer)?.text ?? ''
      : answer ?? ''
    return { questionId: question.id, prompt: question.text, answer: answer ?? '', answerText, correctAnswer, correct, explanation: question.explanation ?? '', marks }
  })
  return {
    id: createId(),
    quizId: quiz.id,
    quizTitle: quiz.title,
    score,
    maxScore,
    percentage: maxScore ? Math.round((score / maxScore) * 100) : 0,
    correctCount,
    incorrectCount,
    unansweredCount,
    startedAt,
    submittedAt,
    durationSeconds: Math.max(0, Math.round((submittedAt - startedAt) / 1000)),
    review,
  }
}

export function shuffle(items) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}
