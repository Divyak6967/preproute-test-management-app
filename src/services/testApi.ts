import type { SelectOption, SubTopic, Test, TestPayload, Topic } from '../types/api'
import { jsonBody, request } from './api'

export function getSubjects() {
  return request<SelectOption[]>('/subjects')
}

export function getTopicsBySubject(subjectId: string) {
  return request<Topic[]>(`/topics/subject/${subjectId}`)
}

export function getSubTopicsByTopic(topicId: string) {
  return request<SubTopic[]>(`/sub-topics/topic/${topicId}`)
}

export function getSubTopicsByTopics(topicIds: string | string[]) {
  const ids = Array.isArray(topicIds) ? topicIds : [topicIds]

  if (!ids.length || !ids[0]) {
    return Promise.resolve([])
  }

  return request<SubTopic[]>('/sub-topics/multi-topics', {
    method: 'POST',
    body: jsonBody({ topicIds: ids }),
  })
}

export function getTests() {
  return request<Test[]>('/tests')
}

export function getTest(testId: string) {
  return request<Test>(`/tests/${testId}`)
}

export function createTest(payload: TestPayload) {
  return request<Test>('/tests', {
    method: 'POST',
    body: jsonBody(payload),
  })
}

export function updateTest(testId: string, payload: Partial<TestPayload> & Record<string, unknown>) {
  return request<Test>(`/tests/${testId}`, {
    method: 'PUT',
    body: jsonBody(payload),
  })
}

export function deleteTest(testId: string) {
  return request<null>(`/tests/${testId}`, {
    method: 'DELETE',
  })
}
