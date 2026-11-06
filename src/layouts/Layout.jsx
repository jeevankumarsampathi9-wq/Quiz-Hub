import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Award, Bell, BookOpen, ChartNoAxesCombined, ChevronDown, CircleHelp, Compass, Home,
  LogOut, Menu, Moon, NotebookPen, Settings, Sparkles, Sun, Trophy, UserRound, X,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import { getProfile } from '../utils/storage.js'

const primary = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/library', label: 'Explore quizzes', icon: Compass },
  { to: '/attempts', label: 'My attempts', icon: ChartNoAxesCombined },
  { to: '/mistakes', label: 'Mistake Notebook', icon: NotebookPen },
  { to: '/analytics', label: 'Performance Analytics', icon: ChartNoAxesCombined },
  { to: '/achievements', label: 'Achievements', icon: Award },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: Settings },
]

function NavigationGroup({ items, close }) {
  return items.map(({ to, label, icon: Icon, end }) => (
    <NavLink key={to} to={to} end={end} onClick={close} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
      <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
    </NavLink>
  ))
}

function Sidebar({ mobileOpen, close, onLogout }) {
  return (
    <>
      {mobileOpen && <button className="sidebar-backdrop" onClick={close} aria-label="Close navigation" />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="side-logo-row">
          <Link className="brand" to="/" onClick={close}><span className="brand-mark"><Sparkles size={19} /></span>Quiz<span>Hub</span></Link>
          <button className="icon-btn sidebar-close" onClick={close} aria-label="Close navigation"><X size={19} /></button>
        </div>
        <div className="nav-heading workspace-heading">YOUR LEARNING SPACE</div>
        <nav className="side-nav"><NavigationGroup items={primary} close={close} /></nav>
        <div className="side-spacer" />
        <div className="sidebar-promo">
          <span className="promo-icon"><Sparkles size={18} /></span>
          <strong>Learning looks good on you.</strong>
          <p>Small quizzes. Big progress. Keep your streak alive.</p>
          <Link to="/library" onClick={close}>Find your next quiz <span>→</span></Link>
        </div>
        <Link to="/help" className="nav-link help-link" onClick={close}><CircleHelp size={18} />Help</Link>
        <button className="nav-link logout-link" onClick={() => { close(); onLogout() }}><LogOut size={18} />Logout</button>
        <div className="sidebar-foot">Made for curious minds <span>✦</span></div>
      </aside>
    </>
  )
}

function Header({ theme, setTheme, onMenu, onLogout }) {
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user } = useAuth()
  const profile = getProfile(user)
  return (
    <header className="topbar">
      <button className="icon-btn mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button>
      <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>Learn something new</strong></div>
      <div className="top-actions">
        <button className="icon-btn theme-header" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <div className="popover-wrap">
          <button className="icon-btn notification-btn" aria-label="Notifications" onClick={() => { setNoticeOpen(!noticeOpen); setProfileOpen(false) }}>
            <Bell size={18} /><i className="notification-dot" />
          </button>
          {noticeOpen && <div className="popover notification-pop"><strong>You’re all caught up</strong><p>Your quiz activity and new features will appear here.</p><span className="demo-caption">Demo notification center</span></div>}
        </div>
        <div className="popover-wrap">
          <button className="profile-trigger" onClick={() => { setProfileOpen(!profileOpen); setNoticeOpen(false) }}>
            <span className="avatar">{(profile.name || 'S').charAt(0).toUpperCase()}</span><span className="profile-trigger-name">{profile.name.split(' ')[0]}</span><ChevronDown size={15} />
          </button>
          {profileOpen && <div className="popover profile-pop">
            <div className="profile-pop-head"><span className="avatar">{(profile.name || 'S').charAt(0).toUpperCase()}</span><span><strong>{profile.name}</strong><small>Student · Demo account</small></span></div>
            <Link to="/profile" onClick={() => setProfileOpen(false)}><UserRound size={16} /> Profile & settings</Link>
            <button className="profile-logout" onClick={() => { setProfileOpen(false); onLogout() }}><LogOut size={16} /> Logout</button>
          </div>}
        </div>
      </div>
    </header>
  )
}

export default function Layout({ theme, setTheme, immersive = false }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const hideShell = immersive
  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }
  return (
    <div className={`app-shell ${hideShell ? 'app-immersive' : ''}`}>
      {!hideShell && <Sidebar mobileOpen={mobileOpen} close={() => setMobileOpen(false)} onLogout={handleLogout} />}
      <div className="main-column">
        {!hideShell && <Header theme={theme} setTheme={setTheme} onMenu={() => setMobileOpen(true)} onLogout={handleLogout} />}
        <main className="page-content"><Outlet /></main>
      </div>
      {!hideShell && <div className="mobile-bottom-nav">
        <NavLink to="/dashboard"><Home size={19} /><span>Home</span></NavLink>
        <NavLink to="/library"><BookOpen size={19} /><span>Explore</span></NavLink>
        <NavLink to="/attempts"><ChartNoAxesCombined size={19} /><span>Attempts</span></NavLink>
        <NavLink to="/leaderboard"><Trophy size={19} /><span>Leaders</span></NavLink>
      </div>}
    </div>
  )
}
