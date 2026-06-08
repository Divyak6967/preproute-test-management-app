import type { QuestionFormValues, TestFormValues } from '../components/TestForms'

export const emptyTestForm: TestFormValues = {
  type: 'chapter_wise',
  name: '',
  subject: '',
  topic: '',
  subTopic: '',
  totalTime: '',
  difficulty: 'easy',
  wrongMarks: '0',
  unattemptMarks: '0',
  correctMarks: '0',
  totalQuestions: '',
  totalMarks: '',
}

export const emptyQuestionForm: QuestionFormValues = {
  question: '',
  option1: '',
  option2: '',
  option3: '',
  option4: '',
  correctOption: 'option1',
  explanation: '',
  difficulty: 'easy',
  topic: '',
  subTopic: '',
  mediaUrl: '',
}
