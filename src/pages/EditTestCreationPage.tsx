import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader } from '../components/Loader'
import { TestCreationForm, type TestFormValues } from '../components/TestForms'
import { emptyTestForm } from '../constants/forms'
import {
  getSubjects,
  getTest,
  getTopicsBySubject,
  getSubTopicsByTopics,
  updateTest,
} from '../services/testApi'
import { getActiveTestId, setActiveTestId } from '../services/storage'
import type { SelectOption } from '../types/api'
import { getErrorMessage } from '../utils/errors'
import { resolveOptionId } from '../utils/entities'
import { testToFormValues, toTestPayload, validateTestForm } from '../utils/testForm'
import { toast } from '../utils/toast'

export function EditTestCreationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const testId = searchParams.get('testId') ?? getActiveTestId()
  const [values, setValues] = useState<TestFormValues>(emptyTestForm)
  const [subjects, setSubjects] = useState<SelectOption[]>([])
  const [topics, setTopics] = useState<SelectOption[]>([])
  const [subTopics, setSubTopics] = useState<SelectOption[]>([])
  const [, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(true)
  const [isTopicsLoading, setIsTopicsLoading] = useState(false)
  const [isSubTopicsLoading, setIsSubTopicsLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadInitialData() {
      if (!testId) {
        const message = 'Select a test before editing.'
        setError(message)
        toast.error(message)
        setIsSubjectsLoading(false)
        navigate('/dashboard', { replace: true })
        return
      }

      try {
        setIsSubjectsLoading(true)
        setError('')
        const [subjectResponse, testResponse] = await Promise.all([
          getSubjects(),
          getTest(testId),
        ])
        const nextValues = testToFormValues(testResponse, emptyTestForm)
        nextValues.subject = resolveOptionId(nextValues.subject, subjectResponse)

        if (!ignore) {
          setActiveTestId(testId)
          setSubjects(subjectResponse)
          setValues(nextValues)
        }
      } catch (loadError) {
        if (!ignore) {
          const message = getErrorMessage(loadError, 'Unable to load test.')
          setError(message)
          toast.error(message)
          navigate('/dashboard', { replace: true })
        }
      } finally {
        if (!ignore) {
          setIsSubjectsLoading(false)
        }
      }
    }

    loadInitialData()

    return () => {
      ignore = true
    }
  }, [testId])

  useEffect(() => {
    let ignore = false

    async function loadTopics() {
      if (!values.subject) {
        setTopics([])
        setIsTopicsLoading(false)
        return
      }

      try {
        setIsTopicsLoading(true)
        const response = await getTopicsBySubject(values.subject)

        if (!ignore) {
          setTopics(response)
          setValues((current) => ({
            ...current,
            topic: resolveOptionId(current.topic, response),
          }))
        }
      } catch (topicError) {
        if (!ignore) {
          const message = getErrorMessage(topicError, 'Unable to load topics.')
          setError(message)
          toast.error(message)
        }
      } finally {
        if (!ignore) {
          setIsTopicsLoading(false)
        }
      }
    }

    loadTopics()

    return () => {
      ignore = true
    }
  }, [values.subject])

  useEffect(() => {
    let ignore = false

    async function loadSubTopics() {
      if (!values.topic) {
        setSubTopics([])
        setIsSubTopicsLoading(false)
        return
      }

      try {
        setIsSubTopicsLoading(true)
        const response = await getSubTopicsByTopics(values.topic)

        if (!ignore) {
          setSubTopics(response)
          setValues((current) => ({
            ...current,
            subTopic: resolveOptionId(current.subTopic, response),
          }))
        }
      } catch (subTopicError) {
        if (!ignore) {
          const message = getErrorMessage(subTopicError, 'Unable to load sub-topics.')
          setError(message)
          toast.error(message)
        }
      } finally {
        if (!ignore) {
          setIsSubTopicsLoading(false)
        }
      }
    }

    loadSubTopics()

    return () => {
      ignore = true
    }
  }, [values.topic])

  function handleValueChange(field: keyof TestFormValues, value: string | string[]) {
    setError('')
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === 'subject' ? { topic: '', subTopic: '' } : null),
      ...(field === 'topic' ? { subTopic: '' } : null),
    }))
  }

  async function handleSubmit() {
    if (!testId) {
      const message = 'Select a test before saving.'
      setError(message)
      toast.error(message)
      return
    }

    const validationError = validateTestForm(values)

    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      await updateTest(testId, toTestPayload(values, 'draft'))
      toast.success('Draft updated successfully.')
      navigate(`/test/questions?testId=${testId}`)
    } catch (submitError) {
      const message = getErrorMessage(submitError, 'Unable to update test.')
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="edit-page">
      <section className="edit-dialog" aria-label="Edit test creation">
        <div className="edit-dialog-header">
          <h1>Edit Test creation</h1>
          <Link
            className="close-button"
            to={testId ? `/test/questions?testId=${testId}` : '/test/create'}
            aria-label="Close edit test creation"
          >
            <X size={20} />
          </Link>
        </div>
        {isSubjectsLoading ? <Loader label="Loading test details..." variant="overlay" /> : null}
        <TestCreationForm
          submitLabel="Save"
          values={values}
          subjects={subjects}
          topics={topics}
          subTopics={subTopics}
          onValueChange={handleValueChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isSubjectsLoading={isSubjectsLoading}
          isTopicsLoading={isTopicsLoading}
          isSubTopicsLoading={isSubTopicsLoading}
        />
      </section>
    </main>
  )
}
