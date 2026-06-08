import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell, Breadcrumbs } from '../components/AppShell'
import { Loader } from '../components/Loader'
import { TestCreationForm, type TestFormValues } from '../components/TestForms'
import { emptyTestForm } from '../constants/forms'
import { createTest, getSubjects, getTopicsBySubject, getSubTopicsByTopics } from '../services/testApi'
import { setActiveTestId } from '../services/storage'
import type { SelectOption } from '../types/api'
import { getErrorMessage } from '../utils/errors'
import { toTestPayload, validateTestForm } from '../utils/testForm'
import { toast } from '../utils/toast'

export function CreateTestPage() {
  const navigate = useNavigate()
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

    async function loadSubjects() {
      try {
        setIsSubjectsLoading(true)
        const response = await getSubjects()

        if (!ignore) {
          setSubjects(response)
        }
      } catch (subjectError) {
        if (!ignore) {
          const message = getErrorMessage(subjectError, 'Unable to load subjects.')
          setError(message)
          toast.error(message)
        }
      } finally {
        if (!ignore) {
          setIsSubjectsLoading(false)
        }
      }
    }

    loadSubjects()

    return () => {
      ignore = true
    }
  }, [])

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
    const validationError = validateTestForm(values)

    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      const test = await createTest(toTestPayload(values, 'draft'))
      setActiveTestId(test.id)
      toast.success('Draft saved successfully.')
      navigate(`/test/questions?testId=${test.id}`)
    } catch (submitError) {
      const message = getErrorMessage(submitError, 'Unable to create test.')
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell>
      <Breadcrumbs current="Chapter Wise" />
      {isSubjectsLoading ? <Loader label="Loading subjects..." variant="overlay" /> : null}
      <TestCreationForm
        submitLabel="Next"
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
    </AppShell>
  )
}
