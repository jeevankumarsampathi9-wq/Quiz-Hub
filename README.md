# QuizHub

QuizHub is a responsive, frontend-only student quiz platform for discovering quizzes, taking timed quizzes, and reviewing personal progress. It is an original college-project demo with sample topics, question-by-question results, a dashboard, and a clearly labeled sample leaderboard.

> **Demo authentication and storage:** Signup accounts, the current login session, profiles, and quiz attempts are saved in the current browser's `localStorage`. Demo passwords are stored locally for this frontend demonstration. This is not secure authentication or production-grade storage. The leaderboard uses sample users and does not award real-money rewards. No backend, paid API, or API key is required.

## Features

- Browse exactly 10 academic quizzes covering programming, AI and machine learning, web development, and computer science.
- Review a focused lesson for each topic, then take its 15-question timed quiz.
- Search quiz and lesson content, then filter by topic group and difficulty.
- Student-only navigation: Home, Explore quizzes, My attempts, Mistake Notebook, Performance Analytics, Achievements, Leaderboard, Profile, Help, and Logout.
- Demo signup/login, protected student routes, and persistent login between page refreshes.
- Take a timed quiz one question at a time, navigate between questions, and see unanswered questions before submitting. Attempts resume after a page refresh; time continues to elapse. Quiz entry follows the lesson page.
- Score attempts with correct, incorrect, and unanswered counts, question reviews, explanations, and elapsed time. Attempts belong to the currently logged-in demo student.
- See a dashboard with performance, a dedicated personal attempt history, and a demo leaderboard.
- Review saved mistakes with explanations, mark questions reviewed, and retry questions until they are mastered.
- Track quiz-completion streaks, a local-date completion calendar, longest streak, and a two-quiz daily goal.
- View accuracy, correct/incorrect totals, subject performance, score trends, and average quiz time from actual student attempts.
- Unlock badges for quiz milestones, perfect scores, streaks, subject mastery, and question revision.
- Student progress records use a per-account `localStorage` key and persist independently of the current login session.
- Editable demo profile, light/dark theme, and a reset-data option for the current student.
- Creator routes (`/builder`, `/builder/:id`, `/my-quizzes`) are blocked for student accounts.
- Responsive layouts, accessible labels, keyboard-operable controls, and local browser persistence.

## Technologies

- HTML5, CSS3, JavaScript (ES modules), React 18
- Vite 6 for local development and production builds
- React Router 7 for client-side routes
- Lucide React for icons
- Browser `localStorage` and `sessionStorage` for demo persistence

## Folder structure

```text
quizhub/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── assets/
    ├── auth/
    │   └── AuthContext.jsx
    ├── components/
    │   ├── RouteGuards.jsx
    │   └── UI.jsx
    ├── data/
    │   └── sampleQuizzes.js
    ├── hooks/
    │   └── useStoredState.js
    ├── layouts/
    │   └── Layout.jsx
    ├── pages/
    │   ├── Attempts.jsx
    │   ├── Auth.jsx
    │   ├── Dashboard.jsx
    │   ├── Help.jsx
    │   ├── Leaderboard.jsx
    │   ├── Learn.jsx
    │   ├── Library.jsx
    │   ├── MistakeNotebook.jsx
    │   ├── PerformanceAnalytics.jsx
    │   ├── Achievements.jsx
    │   ├── Profile.jsx
    │   ├── Results.jsx
    │   └── TakeQuiz.jsx
    ├── styles/
    │   └── global.css
    └── utils/
        ├── auth.js
        ├── quiz.js
        ├── storage.js
        └── studentProgress.js
```

## Requirements

- Node.js 20.19+ or 22.12+ (Node.js 24 LTS also works)
- npm
- A current browser

## Run in VS Code

Open the project folder in VS Code, open **Terminal → New Terminal**, and run:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). Keep the terminal running while you use the development server.

To make and preview a production build:

```powershell
npm run build
npm run preview
```

## Routes

| Route | Page |
|---|---|
| `/` | Student login |
| `/signup` | Student demo signup |
| `/dashboard` | Student home, activity, performance, and quick actions |
| `/library` | 10 academic quizzes, search, and category/difficulty filters |
| `/learn/:id` | Lesson content shown before the corresponding quiz |
| `/quiz/:id` | Timed quiz participation (entered through the lesson page) |
| `/quiz/:id/results` | Legacy attempt-result URL |
| `/results`, `/results/:attemptId` | Latest or selected personal result |
| `/attempts` | Current student's attempt history |
| `/mistakes` | Saved mistakes, review filters, and per-question retries |
| `/analytics` | Attempt-based personal performance analytics |
| `/achievements` | Earned badges and progress toward locked badges |
| `/leaderboard` | Clearly labeled demo rankings and the student's scores |
| `/login` | Alias for student login |
| `/register` | Redirects to `/signup` |
| `/profile` | Current student's demo profile, theme, preferences, and reset |
| `/help` | Help, usage guidance, and demo limitations |
| `/builder`, `/builder/:id`, `/my-quizzes` | Blocked for student accounts; redirects to the dashboard |

All student learning routes require an active demo login. Logging out removes the current session; browser Back cannot reopen protected content without signing in again.

## Troubleshooting

- **`npm` or `node` is not recognized:** Install a supported Node.js release, restart VS Code, and open a fresh terminal.
- **Port 5173 is occupied:** Vite will offer another available local port in the terminal output.
- **Packages fail to install:** Check your network connection and Node/npm versions, then retry `npm install`.
- **A saved attempt is missing:** Attempts are isolated by the logged-in student and browser origin. Sign in with the account that took the quiz; clearing browser site data removes demo accounts and attempt history.
- **Reset demo data:** Open **Profile → Reset my demo data** to clear the current student's quiz attempts, profile preferences, and learning progress.
- **Production use:** Replace local storage and demo authentication with a real backend, database, and secure authentication before using real accounts or sensitive data.
