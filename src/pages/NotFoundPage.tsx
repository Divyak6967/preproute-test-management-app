import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="simple-page">
      <section className="simple-panel">
        <h1>Page not found</h1>
        <p>The page you opened does not exist.</p>
        <Link className="blue-button simple-panel-button" to="/login">
          Go to login
        </Link>
      </section>
    </main>
  )
}
