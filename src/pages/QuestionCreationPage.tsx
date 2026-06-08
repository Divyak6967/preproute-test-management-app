import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Breadcrumbs, QuestionShell } from '../components/AppShell'
import {
  AddedQuestionsList,
  OptionsEditor,
  QuestionEditor,
  QuestionSettings,
  TestSummaryCard,
  type QuestionFormValues,
} from '../components/TestForms'
import { emptyQuestionForm } from '../constants/forms'
import {
  bulkCreateQuestions,
  fetchBulkQuestions,
} from '../services/questionApi'
import {
  getSubjects,
  getTopicsBySubject,
  getSubTopicsByTopics,
  getTest,
  updateTest,
} from '../services/testApi'
import { getActiveTestId, setActiveTestId } from '../services/storage'
import type { Question, QuestionPayload, SelectOption, Test } from '../types/api'
import { getErrorMessage } from '../utils/errors'
import { toApiDifficulty } from '../utils/testForm'
import {
  getEntityId,
  getEntityName,
  getInlineQuestions,
  getQuestionIds,
  resolveOptionId,
  toSelectOptions,
} from '../utils/entities'
import { toast } from '../utils/toast'
import { Loader } from '../components/Loader'

export function QuestionCreationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const testId = searchParams.get('testId') ?? getActiveTestId()
  const [test, setTest] = useState<Test | null>(null)
  const [values, setValues] = useState<QuestionFormValues>(emptyQuestionForm)
  const [topics, setTopics] = useState<SelectOption[]>([])
  const [subTopics, setSubTopics] = useState<SelectOption[]>([])
  const [questionSubjectId, setQuestionSubjectId] = useState('')
  const [addedQuestions, setAddedQuestions] = useState<Question[]>([])
  const [, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTestLoading, setIsTestLoading] = useState(true)
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false)
  const [isTopicsLoading, setIsTopicsLoading] = useState(false)
  const [isSubTopicsLoading, setIsSubTopicsLoading] = useState(false)
  const [isRemovingQuestion, setIsRemovingQuestion] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadTest() {
      if (!testId) {
        const message = 'Create or select a test before adding questions.'
        setError(message)
        toast.error(message)
        setIsTestLoading(false)
        navigate('/dashboard', { replace: true })
        return
      }

      try {
        setIsTestLoading(true)
        setIsQuestionsLoading(true)
        setError('')
        const response = await getTest(testId)

        if (ignore) {
          return
        }

        setActiveTestId(testId)
        setTest(response)

        const inlineQuestions = getInlineQuestions(response.questions)
        const questionIds = getQuestionIds(response.questions)

        if (questionIds.length) {
          const questions = await fetchBulkQuestions(questionIds)

          if (!ignore) {
            setAddedQuestions([...inlineQuestions, ...questions])
          }
        } else if (!ignore) {
          setAddedQuestions(inlineQuestions)
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

  useEffect(() => {
    let ignore = false

    async function loadTopics() {
      if (!test) {
        setTopics([])
        setIsTopicsLoading(false)
        return
      }

      const fallbackTopics = toSelectOptions(test.topics)

      try {
        setIsTopicsLoading(true)
        const subjectValue = getEntityId(test.subject)

        if (!subjectValue) {
          setTopics(fallbackTopics)
          setQuestionSubjectId('')
          return
        }

        const subjects = await getSubjects()
        const subjectId = resolveOptionId(subjectValue, subjects)

        if (!subjectId) {
          setTopics(fallbackTopics)
          setQuestionSubjectId(subjectValue)
          return
        }

        setQuestionSubjectId(subjectId)
        const response = await getTopicsBySubject(subjectId)

        if (!ignore) {
          setTopics(response.length ? response : fallbackTopics)
        }
      } catch (topicError) {
        if (!ignore) {
          const message = getErrorMessage(topicError, 'Unable to load topics.')
          setTopics(fallbackTopics)
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
  }, [test])

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
        const response = await getSubTopicsByTopics([values.topic])

        if (!ignore) {
          setSubTopics(response)
        }
      } catch (subTopicError) {
        if (!ignore) {
          const message = getErrorMessage(subTopicError, 'Unable to load sub-topics.')
          setSubTopics([])
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

  function handleQuestionChange(field: keyof QuestionFormValues, value: string) {
    setError('')
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === 'topic' ? { subTopic: '' } : null),
    }))
  }

  async function handleAddQuestion() {
    if (!testId) {
      const message = 'Create or select a test before adding questions.'
      setError(message)
      toast.error(message)
      return
    }

    const validationError = validateQuestion(values)

    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      const subject = getQuestionSubject(test, questionSubjectId)

      if (!subject) {
        const message = 'Question subject is required.'
        setError(message)
        toast.error(message)
        return
      }

      const [createdQuestion] = await bulkCreateQuestions([
        {
          type: 'mcq',
          subject,
          question: values.question.trim(),
          option1: values.option1.trim(),
          option2: values.option2.trim(),
          option3: values.option3.trim(),
          option4: values.option4.trim(),
          correct_option: values.correctOption,
          explanation: values.explanation.trim() || undefined,
          difficulty: values.difficulty ? toApiDifficulty(values.difficulty) : undefined,
          topic: getOptionName(values.topic, topics) || undefined,
          topic_id: values.topic || undefined,
          sub_topic: getOptionName(values.subTopic, subTopics) || undefined,
          sub_topic_id: values.subTopic || undefined,
          media_url: values.mediaUrl.trim() || undefined,
          test_id: testId,
        },
      ])
      await persistAddedQuestions([createdQuestion])
      setValues(emptyQuestionForm)
      const message = editingQuestionId ? 'Question updated successfully.' : 'Question added successfully.'
      setEditingQuestionId(null)
      toast.success(message)
    } catch (submitError) {
      const message = getErrorMessage(submitError, 'Unable to add question.')
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCsvUpload(file: File) {
    if (!testId) {
      const message = 'Create or select a test before uploading questions.'
      setError(message)
      toast.error(message)
      return
    }

    const subject = getQuestionSubject(test, questionSubjectId)

    if (!subject) {
      const message = 'Question subject is required.'
      setError(message)
      toast.error(message)
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      const rows = parseCsvRows(await file.text())

      if (!rows.length) {
        const message = 'CSV file does not contain any questions.'
        setError(message)
        toast.error(message)
        return
      }

      const questions = rows.map((row, index) => csvRowToQuestionPayload(row, {
        fallbackDifficulty: values.difficulty,
        fallbackSubTopic: values.subTopic,
        fallbackTopic: values.topic,
        rowNumber: index + 2,
        subject,
        testId,
      }))
      const createdQuestions = await bulkCreateQuestions(questions)

      await persistAddedQuestions(createdQuestions)
      toast.success(`${createdQuestions.length} question${createdQuestions.length === 1 ? '' : 's'} uploaded successfully.`)
    } catch (csvError) {
      const message = getErrorMessage(csvError, 'Unable to upload CSV questions.')
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function persistAddedQuestions(createdQuestions: Question[]) {
    const nextQuestions = editingQuestionId && createdQuestions.length === 1
      ? addedQuestions.map((question) => question.id === editingQuestionId ? createdQuestions[0] : question)
      : [...addedQuestions, ...createdQuestions]

    setAddedQuestions(nextQuestions)
    await updateTest(testId!, {
      questions: nextQuestions.map((question) => question.id),
      total_questions: test?.total_questions ?? nextQuestions.length,
    })
    setTest((current) => current ? {
      ...current,
      questions: nextQuestions.map((question) => question.id),
      total_questions: current.total_questions ?? nextQuestions.length,
    } : current)

    return nextQuestions
  }

  async function handleRemoveQuestion(questionId: string) {
    if (!testId) {
      const message = 'Create or select a test before removing questions.'
      setError(message)
      toast.error(message)
      return
    }

    const nextQuestions = addedQuestions.filter((question) => question.id !== questionId)

    try {
      setIsRemovingQuestion(true)
      setError('')
      await updateTest(testId, {
        questions: nextQuestions.map((question) => question.id),
        total_questions: test?.total_questions ?? nextQuestions.length,
      })
      setAddedQuestions(nextQuestions)
      if (editingQuestionId === questionId) {
        setEditingQuestionId(null)
        setValues(emptyQuestionForm)
      }
      setTest((current) => current ? {
        ...current,
        questions: nextQuestions.map((question) => question.id),
        total_questions: current.total_questions ?? nextQuestions.length,
      } : current)
      toast.success('Question removed from test.')
    } catch (removeError) {
      const message = getErrorMessage(removeError, 'Unable to remove question.')
      setError(message)
      toast.error(message)
    } finally {
      setIsRemovingQuestion(false)
    }
  }

  function handleEditQuestion(question: Question) {
    setEditingQuestionId(question.id)
    setValues({
      question: question.question ?? '',
      option1: question.option1 ?? '',
      option2: question.option2 ?? '',
      option3: question.option3 ?? '',
      option4: question.option4 ?? '',
      correctOption: question.correct_option || 'option1',
      explanation: question.explanation ?? '',
      difficulty: toFormQuestionDifficulty(question.difficulty),
      topic: resolveOptionId(question.topic ?? '', topics),
      subTopic: resolveOptionId(question.sub_topic ?? '', subTopics),
      mediaUrl: question.media_url ?? '',
    })
    toast.info('Question loaded for editing.')
  }

  function handleContinue() {
    if (!testId) {
      const message = 'Create or select a test before publishing.'
      setError(message)
      toast.error(message)
      return
    }

    if (!addedQuestions.length && !test?.questions?.length) {
      const message = 'Add at least one question before continuing.'
      setError(message)
      toast.error(message)
      return
    }

    navigate(`/test/publish?testId=${testId}`)
  }

  async function handleImageUpload(file: File) {
    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        setValues((current) => ({ ...current, mediaUrl: result }))
      }
    }

    reader.readAsDataURL(file)
  }

  return (
    <QuestionShell questions={addedQuestions} totalQuestions={test?.total_questions ?? addedQuestions.length}>
      <div className="question-page-top">
        <Breadcrumbs current="Chapter Wise" />
        <Link className="blue-button publish-top-button" to={testId ? `/test/publish?testId=${testId}` : '/test/publish'}>
          Publish
        </Link>
      </div>
      {(isTestLoading || isQuestionsLoading) ? (
        <Loader
          label={isTestLoading ? 'Loading test details...' : 'Loading added questions...'}
          variant="overlay"
        />
      ) : null}
      <TestSummaryCard test={test} />
      <QuestionEditor
        value={values.question}
        questionNumber={addedQuestions.length + 1}
        totalQuestions={test?.total_questions}
        onChange={(value) => handleQuestionChange('question', value)}
        onCsvUpload={handleCsvUpload}
        onImageUpload={handleImageUpload}
        imageUrl={values.mediaUrl}
        onImageRemove={() => setValues((current) => ({ ...current, mediaUrl: '' }))}
        onClear={() => {
          setEditingQuestionId(null)
          setValues(emptyQuestionForm)
        }}
      />
      <OptionsEditor values={values} onChange={handleQuestionChange} />
      <QuestionSettings
        values={values}
        topics={topics}
        subTopics={subTopics}
        isTopicsLoading={isTopicsLoading}
        isSubTopicsLoading={isSubTopicsLoading}
        onChange={handleQuestionChange}
      />
      <AddedQuestionsList
        questions={addedQuestions}
        onEdit={handleEditQuestion}
        onRemove={handleRemoveQuestion}
        isRemoving={isRemovingQuestion}
      />
      <div className="question-bottom-actions">
        <Link className="danger-button" to="/test/create">
          Exit Test Creation
        </Link>
        <button className="ghost-button add-question-button" type="button" onClick={handleAddQuestion} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : editingQuestionId ? 'Update Question' : 'Add Question'}
        </button>
        <button className="blue-button" type="button" onClick={handleContinue}>
          Next
        </button>
      </div>
    </QuestionShell>
  )
}

function validateQuestion(values: QuestionFormValues) {
  if (!values.question.trim()) {
    return 'Question text is required.'
  }

  if (!values.option1.trim() || !values.option2.trim() || !values.option3.trim() || !values.option4.trim()) {
    return 'All four options are required.'
  }

  return ''
}

type CsvRow = Record<string, string>

function getQuestionSubject(test: Test | null, resolvedSubjectId: string) {
  return resolvedSubjectId || getEntityId(test?.subject) || getEntityName(test?.subject)
}

function getOptionName(value: string, options: SelectOption[]) {
  if (!value) {
    return ''
  }

  return options.find((option) => option.id === value)?.name ?? value
}

function parseCsvRows(text: string): CsvRow[] {
  const matrix = parseCsvMatrix(text)

  if (matrix.length < 2) {
    return []
  }

  const headers = matrix[0].map(normalizeCsvHeader)

  return matrix.slice(1).reduce<CsvRow[]>((rows, row) => {
    if (!row.some((cell) => cell.trim())) {
      return rows
    }

    const normalizedRow = headers.reduce<CsvRow>((current, header, index) => {
      if (header) {
        current[header] = row[index]?.trim() ?? ''
      }

      return current
    }, {})

    rows.push(normalizedRow)
    return rows
  }, [])
}

function parseCsvMatrix(text: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let isQuoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const nextChar = text[index + 1]

    if (char === '"' && isQuoted && nextChar === '"') {
      cell += '"'
      index += 1
      continue
    }

    if (char === '"') {
      isQuoted = !isQuoted
      continue
    }

    if (char === ',' && !isQuoted) {
      row.push(cell)
      cell = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !isQuoted) {
      if (char === '\r' && nextChar === '\n') {
        index += 1
      }

      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += char
  }

  row.push(cell)
  rows.push(row)

  return rows
}

function csvRowToQuestionPayload(
  row: CsvRow,
  options: {
    fallbackDifficulty: string
    fallbackSubTopic: string
    fallbackTopic: string
    rowNumber: number
    subject: string
    testId: string
  },
): QuestionPayload {
  const question = getCsvValue(row, 'question', 'question_text')
  const option1 = getCsvValue(row, 'option1', 'option_1', 'option_a')
  const option2 = getCsvValue(row, 'option2', 'option_2', 'option_b')
  const option3 = getCsvValue(row, 'option3', 'option_3', 'option_c')
  const option4 = getCsvValue(row, 'option4', 'option_4', 'option_d')

  if (!question || !option1 || !option2 || !option3 || !option4) {
    throw new Error(`CSV row ${options.rowNumber} must include question and option1-option4.`)
  }

  const difficulty = toApiDifficulty(getCsvValue(row, 'difficulty') || options.fallbackDifficulty)
  const topic = getCsvValue(row, 'topic') || options.fallbackTopic
  const subTopic = getCsvValue(row, 'sub_topic', 'subtopic') || options.fallbackSubTopic

  return {
    type: getCsvValue(row, 'type') || 'mcq',
    subject: getCsvValue(row, 'subject') || options.subject,
    question,
    option1,
    option2,
    option3,
    option4,
    correct_option: normalizeCorrectOption(getCsvValue(row, 'correct_option', 'correct_answer', 'answer')),
    explanation: getCsvValue(row, 'explanation', 'solution') || undefined,
    difficulty,
    topic: topic || undefined,
    sub_topic: subTopic || undefined,
    media_url: getCsvValue(row, 'media_url', 'image_url', 'image') || undefined,
    test_id: options.testId,
  }
}

function getCsvValue(row: CsvRow, ...keys: string[]) {
  for (const key of keys) {
    const value = row[normalizeCsvHeader(key)]

    if (value) {
      return value
    }
  }

  return ''
}

function normalizeCsvHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_')
}

function normalizeCorrectOption(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[\s_-]+/g, '')

  if (normalized === '2' || normalized === 'b' || normalized === 'option2' || normalized === 'optionb') {
    return 'option2'
  }

  if (normalized === '3' || normalized === 'c' || normalized === 'option3' || normalized === 'optionc') {
    return 'option3'
  }

  if (normalized === '4' || normalized === 'd' || normalized === 'option4' || normalized === 'optiond') {
    return 'option4'
  }

  return 'option1'
}

function toFormQuestionDifficulty(value?: string) {
  if (value === 'hard') {
    return 'difficult'
  }

  return value || 'easy'
}
