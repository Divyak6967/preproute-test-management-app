import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

export function ForgotPasswordPage() {
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/login')
  }

  return (
    <main className="auth-page">
      <section className="simple-auth-panel" aria-label="Forgot password">
        <form className="login-form compact-form" onSubmit={handleSubmit}>
          <img className="brand-logo" src={logo} alt="Preproute" />
          <h1>Forgot password</h1>
          <p className="helper-text">Enter your User ID to request password assistance.</p>

          <label htmlFor="forgot-user-id">User ID</label>
          <input
            id="forgot-user-id"
            name="userId"
            type="text"
            placeholder="Enter User ID"
          />

          <button className="primary-button" type="submit">
            Continue
          </button>

          <Link className="back-link" to="/login">
            Back to login
          </Link>
        </form>
      </section>
    </main>
  )
}
