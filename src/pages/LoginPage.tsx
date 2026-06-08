import type { FormEvent } from 'react'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import loginImage from '../assets/login.png'
import logo from '../assets/logo.png'
import { Loader } from '../components/Loader'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../utils/errors'
import { toast } from '../utils/toast'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!userId.trim() || !password.trim()) {
      const message = 'Please enter User ID and password.'
      setError(message)
      toast.error(message)
      return
    }

    try {
      setIsSubmitting(true)
      await login({ userId: userId.trim(), password: password.trim() })
      toast.success('Login successful.')
      navigate('/dashboard', { replace: true })
    } catch (loginError) {
      const message = getErrorMessage(loginError, 'Login failed. Please try again.')
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="Login">
        <div className="auth-illustration" aria-hidden="true">
          <img src={loginImage} alt="" />
        </div>

        <div className="auth-panel">
          <form className="login-form" onSubmit={handleSubmit}>
            <img className="brand-logo" src={logo} alt="Preproute" />
            <h1>Login</h1>

            <label htmlFor="user-id">User ID</label>
            <input
              id="user-id"
              name="userId"
              type="text"
              placeholder="Enter User ID"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              autoComplete="username"
            />

            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Link className="forgot-link" to="/forgot-password">
              Forgot password?
            </Link>

            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader label="Logging in..." variant="button" /> : 'Login'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
