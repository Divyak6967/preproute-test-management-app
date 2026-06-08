import { Edit3, Eye, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell, DashboardCrumb } from '../components/AppShell'
import { Loader } from '../components/Loader'
import { deleteTest, getTests } from '../services/testApi'
import type { Test } from '../types/api'
import { getErrorMessage } from '../utils/errors'
import { getEntityName } from '../utils/entities'
import { toast } from '../utils/toast'

export function DashboardPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deletingTestId, setDeletingTestId] = useState('')
  
  useEffect(() => {
    let ignore = false

    async function loadInitialTests() {
      try {
        setIsLoading(true)
        setError('')
        const response = await getTests()

        if (!ignore) {
          setTests(response)
        }
      } catch (dashboardError) {
        if (!ignore) {
          const message = getErrorMessage(dashboardError, 'Unable to load tests.')
          setError(message)
          toast.error(message)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadInitialTests()

    return () => {
      ignore = true
    }
  }, [])

  async function handleDelete(testId: string) {
    if (!window.confirm('Delete this test and its questions?')) {
      return
    }

    try {
      setDeletingTestId(testId)
      setError('')
      await deleteTest(testId)
      setTests((current) => current.filter((test) => test.id !== testId))
      toast.success('Test deleted successfully.')
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, 'Unable to delete test.')
      setError(message)
      toast.error(message)
    } finally {
      setDeletingTestId('')
    }
  }

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return tests
    }

    return tests.filter((test) => {
      const subject = getEntityName(test.subject)
      return `${test.name} ${subject} ${test.status ?? ''}`.toLowerCase().includes(query)
    })
  }, [search, tests])

  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filteredTests.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedTests = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredTests.slice(startIndex, startIndex + pageSize)
  }, [filteredTests, safeCurrentPage])

  const draftCount = tests.filter((test) => test.status === 'draft' || !test.status).length
  const publishedCount = tests.filter((test) => test.status === 'live').length

  return (
    <AppShell>
      <DashboardCrumb label="Dashboard" />
      <section className="dashboard-grid">
        <article>
          <span>Total Tests</span>
          <strong>{tests.length}</strong>
        </article>
        <article>
          <span>Draft Tests</span>
          <strong>{draftCount}</strong>
        </article>
        <article>
          <span>Published</span>
          <strong>{publishedCount}</strong>
        </article>
      </section>
      <section className="dashboard-table-card">
        <div>
          <h1>Test List</h1>
          <Link className="blue-button dashboard-create-link" to="/test/create">
            Create Test
          </Link>
        </div>
        <input
          className="dashboard-search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setCurrentPage(1)
          }}
          placeholder="Search tests"
        />
        {isLoading ? <Loader variant="overlay" label="Loading tests..." /> : null}
        {!isLoading && !filteredTests.length ? <p className="empty-state">No tests found.</p> : null}
      <div className="test-table">
  <div className="test-row table-header">
    <span className="name-cell">Name</span>
    <span>Subject</span>
    <span>Status</span>
    <span>Created Date</span>
    <span>Actions</span>
  </div>

  {paginatedTests.map((test) => (
    <div className="test-row" key={test.id}>
      <span
        className="name-cell truncate-text"
        title={test.name}
      >
        {test.name}
      </span>

      <span
        className="truncate-text"
        title={getEntityName(test.subject)}
      >
        {getEntityName(test.subject) || "Subject"}
      </span>

      <span>{formatStatus(test.status)}</span>

      <span>{formatDate(test.created_at)}</span>

      <div className="table-actions">
        <Link to={`/test/questions?testId=${test.id}`}>
          <Eye size={16} />
          View
        </Link>

        <Link to={`/test/edit?testId=${test.id}`}>
          <Edit3 size={16} />
          Edit
        </Link>

        <button
  type="button"
  disabled={deletingTestId === test.id}
  onClick={() => handleDelete(test.id)}
>
  <Trash2 size={16} />
  {deletingTestId === test.id ? 'Deleting...' : 'Delete'}
</button>
      </div>
    </div>
  ))}
</div>
        {filteredTests.length > pageSize ? (
          <div className="pagination">
            <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safeCurrentPage === 1}>
              Previous
            </button>
            <span>
              Page {safeCurrentPage} of {totalPages}
            </span>
            <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={safeCurrentPage === totalPages}>
              Next
            </button>
          </div>
        ) : null}
      </section>
    </AppShell>
  )
}

function formatStatus(status: Test['status']) {
  if (!status) {
    return 'Draft'
  }

  return String(status).charAt(0).toUpperCase() + String(status).slice(1)
}

function formatDate(value?: string) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}
