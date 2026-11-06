import { useEffect, useState } from 'react'
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { authenticateUser, registerUser, saveAuth } from '../utils/auth.js'

export default function Auth() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const signup = location.pathname === '/signup'
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    setErrors({})
    setMessage(location.state?.signupComplete ? 'Account created. Log in with your new details.' : '')
    setPassword('')
    setConfirmation('')
    setIdentifier('')
    setEmail('')
  }, [location.key])

  const submit = (event) => {
    event.preventDefault()
    const next = {}
    if (signup) {
      if (!name.trim()) next.name = 'Enter your full name.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address.'
      if (password.length < 8) next.password = 'Use at least 8 characters.'
      if (!confirmation) next.confirmation = 'Confirm your password.'
      else if (password !== confirmation) next.confirmation = 'Those passwords don’t match.'
    } else {
      if (!identifier.trim()) next.identifier = 'Enter your email or username.'
      if (!password) next.password = 'Enter your password.'
    }
    setErrors(next)
    setMessage('')
    if (Object.keys(next).length) return

    try {
      if (signup) {
        registerUser({ name, email, password })
        navigate('/', { replace: true, state: { signupComplete: true } })
      } else {
        const auth = authenticateUser(identifier, password)
        saveAuth(auth)
        setUser(auth)
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      setMessage(error.message || 'Something went wrong. Please try again.')
    }
  }

  return <div className="auth-page">
    <section className="auth-card">
      <Link className="brand auth-brand" to="/"><span className="brand-mark"><Sparkles size={18} /></span>Quiz<span>Hub</span></Link>
      <div className="eyebrow">{signup ? 'YOUR NEXT ADVENTURE STARTS HERE' : 'A LITTLE LEARNING GOES A LONG WAY'}</div>
      <h1>{signup ? 'Make yourself at home.' : 'Welcome, curious mind.'}</h1>
      <p>{signup ? 'Create your student demo account and start exploring.' : 'Sign in to pick up where your curiosity left off.'}</p>
      <div className="auth-demo-note"><Sparkles size={16} /><span><strong>Demo authentication</strong> Accounts are saved in this browser only. This is not secure or production authentication.</span></div>
      <form onSubmit={submit} noValidate>
        {signup && <label className="form-field"><span>Full name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" autoComplete="name" aria-invalid={Boolean(errors.name)} />{errors.name && <small className="field-error">{errors.name}</small>}</label>}
        {signup
          ? <label className="form-field"><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" aria-invalid={Boolean(errors.email)} />{errors.email && <small className="field-error">{errors.email}</small>}</label>
          : <label className="form-field"><span>Email or username</span><input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Email or full name" autoComplete="username" aria-invalid={Boolean(errors.identifier)} />{errors.identifier && <small className="field-error">{errors.identifier}</small>}</label>}
        <label className="form-field"><span>Password</span><div className="password-wrap"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={signup ? 'At least 8 characters' : 'Your password'} autoComplete={signup ? 'new-password' : 'current-password'} aria-invalid={Boolean(errors.password)} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password && <small className="field-error">{errors.password}</small>}</label>
        {signup && <label className="form-field"><span>Confirm password</span><input type={showPassword ? 'text' : 'password'} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Enter your password again" autoComplete="new-password" aria-invalid={Boolean(errors.confirmation)} />{errors.confirmation && <small className="field-error">{errors.confirmation}</small>}</label>}
        {message && <div className={`auth-message ${message.startsWith('Your demo account') ? 'auth-success' : 'auth-error'}`} role="status">{message}</div>}
        <button type="submit" className="button button-primary full-button auth-submit">{signup ? 'Create student account' : 'Log in'} <ArrowRight size={16} /></button>
      </form>
      <div className="auth-switch">{signup ? 'Already have an account?' : 'Don’t have an account?'} <Link to={signup ? '/' : '/signup'}>{signup ? 'Login' : 'Sign up'}</Link></div>
    </section>
    <aside className="auth-art"><div className="auth-art-orb">✦</div><div className="eyebrow">A PLACE TO STAY CURIOUS</div><h2>Every question opens a door.</h2><p>Explore a new idea, take a quiz, and see how much you already know.</p><div className="auth-art-quote">“Learning should feel less like a checklist and more like a little adventure.”</div></aside>
  </div>
}
