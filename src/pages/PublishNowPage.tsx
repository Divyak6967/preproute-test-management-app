import { CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DashboardCrumb, PageActions, QuestionShell } from '../components/AppShell'
import { Loader } from '../components/Loader'
import { PublishControls, QuestionsPreviewList, TestSummaryCard } from '../components/TestForms'
import { fetchBulkQuestions } from '../services/questionApi'
import { getTest, updateTest } from '../services/testApi'
import { getActiveTestId } from '../services/storage'
import type { Question, Test } from '../types/api'
import { getErrorMessage } from '../utils/errors'
import { getInlineQuestions, getQuestionIds } from '../utils/entities'
import { toast } from '../utils/toast'

export function PublishNowPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const testId = searchParams.get('testId') ?? getActiveTestId()
  const [test, setTest] = useState<Test | null>(null)
  const [controls, setControls] = useState({
    liveUntil: 'custom',
    endDate: '',
    endTime: '',
  })
  const [, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isTestLoading, setIsTestLoading] = useState(true)
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadTest() {
      if (!testId) {
        const message = 'Select a test before publishing.'
        setError(message)
        toast.error(message)
        setIsTestLoading(false)
        return
      }

      try {
        setIsTestLoading(true)
        setIsQuestionsLoading(true)
        setError('')
        const response = await getTest(testId)

        if (!ignore) {
          setTest(response)
        }

        const inlineQuestions = getInlineQuestions(response.questions)
        const questionIds = getQuestionIds(response.questions)

        if (questionIds.length) {
          const fetchedQuestions = await fetchBulkQuestions(questionIds)

          if (!ignore) {
            setQuestions([...inlineQuestions, ...fetchedQuestions])
          }
        } else if (!ignore) {
          setQuestions(inlineQuestions)
        }
      } catch (loadError) {
        if (!ignore) {
          const message = getErrorMessage(loadError, 'Unable to load test.')
          setError(message)
          toast.error(message)
        }
      } finally {
        if (!ignore) {
          setIsTestLoading(false)
          setIsQuestionsLoading(false)
        }
      }
    }

    loadTest()

    return () => {
      ignore = true
    }
  }, [testId])

  function handleChange(field: string, value: string) {
    setError('')
    setControls((current) => ({ ...current, [field]: value }))
  }

  async function handleConfirm() {
    if (!testId) {
      const message = 'Select a test before publishing.'
      setError(message)
      toast.error(message)
      return
    }

    if (!questions.length) {
      const message = 'Add at least one question before publishing.'
      setError(message)
      toast.error(message)
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      await updateTest(testId, {
        status: 'live',
        live_until: controls.liveUntil,
        end_date: controls.endDate || null,
        end_time: controls.endTime || null,
      })
      toast.success('Test published successfully.')
      navigate('/dashboard')
    } catch (publishError) {
      const message = getErrorMessage(publishError, 'Unable to publish test.')
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <QuestionShell questions={questions} totalQuestions={test?.total_questions ?? questions.length}>
      <DashboardCrumb label="Test creation" />
      <div className="created-status">
        <strong>Test created</strong>
        <span>
          <CheckCircle2 size={14} />
          {questions.length} Questions done
        </span>
      </div>
      {isTestLoading ? <Loader label="Loading test details..." variant="overlay" /> : null}
      <TestSummaryCard test={test} />
      <QuestionsPreviewList questions={questions} isLoading={isQuestionsLoading} />
      <PublishControls
        mode="now"
        liveUntil={controls.liveUntil}
        endDate={controls.endDate}
        endTime={controls.endTime}
        onChange={handleChange}
      />
      <PageActions
        primaryLabel="Confirm"
        secondaryLabel="Edit Questions"
        onPrimary={handleConfirm}
        onSecondary={() => navigate(testId ? `/test/questions?testId=${testId}` : '/dashboard')}
        isSubmitting={isSubmitting}
      />
    </QuestionShell>
  )
}
