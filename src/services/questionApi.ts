import type { Question, QuestionPayload } from '../types/api'
import { jsonBody, request } from './api'

export function bulkCreateQuestions(questions: QuestionPayload[]) {
  return request<Question[]>('/questions/bulk', {
    method: 'POST',
    body: jsonBody({ questions }),
  })
}

export function fetchBulkQuestions(questionIds: string[]) {
  return request<Question[]>('/questions/fetchBulk', {
    method: 'POST',
    body: jsonBody({ question_ids: questionIds }),
  })
}
