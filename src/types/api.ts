export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type LoginPayload = {
  userId: string
  password: string
}

export type User = {
  id?: string
  name?: string
  userId?: string
  role?: string
  email?: string
  [key: string]: unknown
}

export type LoginResponse = {
  token: string
  user: User
}

export type SelectOption = {
  id: string
  name: string
}

export type Subject = SelectOption

export type Topic = SelectOption & {
  subject_id?: string
}

export type SubTopic = SelectOption & {
  topic_id?: string
}

export type TestStatus = 'draft' | 'live' | 'scheduled' | string | null

export type Test = {
  id: string
  name: string
  type?: string
  subject?: string | Subject
  topics?: Array<string | Topic>
  sub_topics?: Array<string | SubTopic>
  questions?: Array<string | Question>
  correct_marks?: number
  wrong_marks?: number
  unattempt_marks?: number
  difficulty?: string
  total_time?: number
  total_marks?: number
  total_questions?: number
  status?: TestStatus
  created_at?: string
  [key: string]: unknown
}

export type TestPayload = {
  name: string
  type: string
  subject: string
  topics: string[]
  sub_topics: string[]
  correct_marks: number
  wrong_marks: number
  unattempt_marks: number
  difficulty?: string
  total_time: number
  total_marks: number
  total_questions: number
  status: TestStatus
}

export type QuestionPayload = {
  type: string
  subject?: string
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct_option: string
  explanation?: string
  difficulty?: string
  topic?: string
  topic_id?: string
  sub_topic?: string
  sub_topic_id?: string
  media_url?: string
  test_id: string
}

export type Question = QuestionPayload & {
  id: string
}
