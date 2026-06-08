import {
  Bell,
  Check,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CircleAlert,
  CircleUser,
  ClipboardList,
  Copy,
  Edit3,
  IndianRupee,
  Landmark,
  MessageCircle,
  PencilLine,
  Settings,
  Trophy,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useAuth } from '../hooks/useAuth'
import type { Question } from '../types/api'

type AppShellProps = {
  children: ReactNode
}

type QuestionShellProps = {
  children: ReactNode
  questions?: Question[]
  totalQuestions?: number
}

const railIcons = [
  TrendingUp,
  Edit3,
  CircleAlert,
  Copy,
  Users,
  Landmark,
  CircleUser,
  ClipboardList,
  IndianRupee,
  Trophy,
  MessageCircle,
  Bell,
  Settings,
]

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-layout">
      <MainSidebar />
      <section className="app-workspace">
        <TopBar />
        <main className="app-content">{children}</main>
      </section>
    </div>
  )
}

export function QuestionShell({ children, questions = [], totalQuestions }: QuestionShellProps) {
  return (
    <div className="app-layout app-layout-question">
      <QuestionSidebar questions={questions} totalQuestions={totalQuestions} />
      <section className="app-workspace">
        <TopBar />
        <main className="app-content app-content-question">{children}</main>
      </section>
    </div>
  )
}

function MainSidebar() {
  return (
    <aside className="main-sidebar">
      <div className="sidebar-logo-wrap">
        <img className="sidebar-logo" src={logo} alt="Preproute" />
      </div>
      <nav className="main-nav" aria-label="Main">
        <NavLink to="/dashboard" className="nav-item">
          <TrendingUp size={18} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/test/create" className="nav-item">
          <PencilLine size={18} />
          <span>Test Creation</span>
        </NavLink>
        <NavLink to="/test/tracking" className="nav-item">
          <ClipboardList size={18} />
          <span>Test Tracking</span>
        </NavLink>
      </nav>
    </aside>
  )
}

function QuestionSidebar({
  questions,
  totalQuestions,
}: {
  questions: Question[]
  totalQuestions?: number
}) {
  const questionTotal = totalQuestions ?? questions.length

  return (
    <aside className="question-sidebar">
      <div className="sidebar-logo-wrap question-logo-wrap">
        <img className="sidebar-logo" src={logo} alt="Preproute" />
      </div>
      <div className="question-sidebar-body">
        <nav className="icon-rail" aria-label="Tools">
          {railIcons.map((Icon, index) => (
            <button className="rail-button" type="button" key={`${Icon.name}-${index}`}>
              <Icon size={17} />
            </button>
          ))}
        </nav>
        <div className="question-panel">
          <div className="question-panel-heading">
            <span>Question creation</span>
            <ChevronsLeft size={18} />
          </div>
          <p className="question-total">Total Questions . {questionTotal}</p>
          <div className="question-list">
            {questions.length ? questions.map((question, index) => (
              <button
                className="question-list-item"
                type="button"
                key={question.id}
              >
                <span className="question-check">
                  <Check size={9} />
                </span>
                <span>{getQuestionLabel(question, index)}</span>
                <span className="question-arrow">
                  <ChevronsRight size={14} />
                </span>
              </button>
            )) : <p className="question-sidebar-empty">No questions added</p>}
          </div>
        </div>
      </div>
    </aside>
  )
}

function TopBar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const displayName =
    (typeof user?.name === 'string' && user.name) ||
    (typeof user?.userId === 'string' && user.userId) ||
    (typeof user?.email === 'string' && user.email) ||
    'Admin'
  const role = typeof user?.role === 'string' && user.role ? user.role : 'Admin'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      <button className="notification-button" type="button" aria-label="Notifications">
        <Bell size={21} />
        <span />
      </button>
      <div className="profile-menu">
        <button
          className="profile-button"
          type="button"
          onClick={() => setIsProfileOpen((value) => !value)}
        >
          <span className="profile-avatar">{displayName.slice(0, 2).toUpperCase()}</span>
          <span className="profile-copy">
            <strong>{displayName}</strong>
            <small>{role}</small>
          </span>
          <ChevronDown size={18} />
        </button>
        {isProfileOpen ? (
          <div className="profile-dropdown">
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}

function getQuestionLabel(_question: Question, index: number) {
  return `Question ${index + 1}`
}

export function Breadcrumbs({ current }: { current: string }) {
  return (
    <div className="breadcrumbs" aria-label="Breadcrumb">
      <span>Test Creation</span>
      <span>/</span>
      <span>Create Test</span>
      <span>/</span>
      <span>{current}</span>
    </div>
  )
}

export function DashboardCrumb({ label }: { label: string }) {
  return <div className="page-title-line">{label}</div>
}

export function PageActions({
  primaryLabel,
  secondaryLabel = 'Cancel',
  onPrimary,
  onSecondary,
  isSubmitting = false,
}: {
  primaryLabel: string
  secondaryLabel?: string
  onPrimary?: () => void
  onSecondary?: () => void
  isSubmitting?: boolean
}) {
  return (
    <div className="page-actions">
      <button className="ghost-button" type="button" onClick={onSecondary}>
        {secondaryLabel}
      </button>
      <button className="blue-button" type="button" onClick={onPrimary} disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : primaryLabel}
      </button>
    </div>
  )
}
