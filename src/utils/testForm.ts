import type { TestFormValues } from '../components/TestForms'
import type { Test, TestPayload } from '../types/api'

const formTypeToApiTypeMap: Record<string, string> = {
  chapter_wise: 'chapterwise',
  pyq: 'pyq',
  mock_test: 'mock',
}

const apiTypeToFormTypeMap: Record<string, string> = {
  chapterwise: 'chapter_wise',
  practice: 'chapter_wise',
  pyq: 'pyq',
  mock: 'mock_test',
  mock_test: 'mock_test',
}

export function validateTestForm(values: TestFormValues) {
  if (!values.name.trim()) {
    return 'Test name is required.'
  }

  if (!values.subject) {
    return 'Please select a subject.'
  }

  if (!values.topic.length) {
    return 'Please select a topic.'
  }

  if (!values.subTopic.length) {
    return 'Please select a sub-topic.'
  }

  if (!toNumber(values.totalTime)) {
    return 'Duration must be greater than 0.'
  }

  if (!toNumber(values.totalQuestions)) {
    return 'Number of questions must be greater than 0.'
  }

  if (!toNumber(values.totalMarks)) {
    return 'Total marks must be greater than 0.'
  }

  return ''
}

export function toTestPayload(values: TestFormValues, status: TestPayload['status'] = null): TestPayload {
  return {
    name: values.name.trim(),
    type: toApiTestType(values.type),
    subject: values.subject,
    topics: values.topic ? [values.topic] : [],
    sub_topics: values.subTopic ? [values.subTopic] : [],
    correct_marks: toNumber(values.correctMarks),
    wrong_marks: toNumber(values.wrongMarks),
    unattempt_marks: toNumber(values.unattemptMarks),
    difficulty: values.difficulty ? toApiDifficulty(values.difficulty) : undefined,
    total_time: toNumber(values.totalTime),
    total_marks: toNumber(values.totalMarks),
    total_questions: toNumber(values.totalQuestions),
    status,
  }
}

const formDifficultyToApiMap: Record<string, string> = {
  easy: 'easy',
  medium: 'medium',
  difficult: 'hard',
}

export function toApiDifficulty(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) {
    return undefined
  }

  return formDifficultyToApiMap[value] ?? value
}

export function testToFormValues(test: Test, fallback: TestFormValues): TestFormValues {
  const topicIds = getIds(test.topics)
  const subTopicIds = getIds(test.sub_topics)

  return {
    ...fallback,
    type: toFormTestType(test.type, fallback.type),
    name: test.name ?? '',
    subject: getId(test.subject) || fallback.subject,
    topic: topicIds[0] || fallback.topic,
    subTopic: subTopicIds[0] || fallback.subTopic,
    totalTime: String(test.total_time ?? ''),
    difficulty: test.difficulty ?? fallback.difficulty,
    wrongMarks: String(test.wrong_marks ?? fallback.wrongMarks),
    unattemptMarks: String(test.unattempt_marks ?? fallback.unattemptMarks),
    correctMarks: String(test.correct_marks ?? fallback.correctMarks),
    totalQuestions: String(test.total_questions ?? ''),
    totalMarks: String(test.total_marks ?? ''),
  }
}

export function toApiTestType(value: string) {
  return formTypeToApiTypeMap[value] ?? value
}

export function toFormTestType(value: unknown, fallback = 'chapter_wise') {
  if (typeof value !== 'string' || !value) {
    return fallback
  }

  return apiTypeToFormTypeMap[value] ?? value
}

export function toNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function getIds(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item) => getId(item)).filter(Boolean)
}

function getId(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') {
    return value.id
  }

  return ''
}
