import {
  BookOpenCheck,
  Bold,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  FileQuestion,
  Image as ImageIcon,
  Italic,
  Lightbulb,
  Link as LinkIcon,
  List,
  ListChecks,
  Trash2,
  Underline,
  Upload,
} from 'lucide-react'
import { useRef } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Loader } from './Loader'
import type { Question, SelectOption, Test } from '../types/api'
import { getEntityName } from '../utils/entities'

export type TestFormValues = {
  type: string
  name: string
  subject: string
  topic: string
  subTopic: string
  totalTime: string
  difficulty: string
  wrongMarks: string
  unattemptMarks: string
  correctMarks: string
  totalQuestions: string
  totalMarks: string
}

export type QuestionFormValues = {
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correctOption: string
  explanation: string
  difficulty: string
  topic: string
  subTopic: string
  mediaUrl: string
}

type TestFormProps = {
  submitLabel: string
  values: TestFormValues
  subjects: SelectOption[]
  topics: SelectOption[]
  subTopics: SelectOption[]
  onValueChange: (field: keyof TestFormValues, value: string | string[]) => void
  onSubmit: () => void
  isSubmitting?: boolean
  isSubjectsLoading?: boolean
  isTopicsLoading?: boolean
  isSubTopicsLoading?: boolean
}

type PublishModeProps = {
  mode: 'now' | 'schedule'
  liveUntil: string
  endDate: string
  endTime: string
  scheduleDate?: string
  scheduleTime?: string
  onChange: (field: string, value: string) => void
}

type FieldProps = {
  label: string
  placeholder: string
  kind?: 'input' | 'select' | 'date'
  mutedLabel?: boolean
  value?: string | string[]
  options?: SelectOption[]
  inputType?: string
  disabled?: boolean
  multiple?: boolean
  onChange?: (value: string | string[]) => void
}

export function TestTypeTabs({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const tabs = [
    { label: 'Chapter Wise', value: 'chapter_wise' },
    { label: 'PYQ', value: 'pyq' },
    { label: 'Mock Test', value: 'mock_test' },
  ]

  return (
    <div className="type-tabs" role="tablist" aria-label="Test type">
      {tabs.map((tab) => (
        <button
          className={`type-tab ${value === tab.value ? 'is-active' : ''}`}
          type="button"
          onClick={() => onChange(tab.value)}
          key={tab.value}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function TestCreationForm({
  submitLabel,
  values,
  subjects,
  topics,
  subTopics,
  onValueChange,
  onSubmit,
  isSubmitting = false,
  isSubjectsLoading = false,
  isTopicsLoading = false,
  isSubTopicsLoading = false,
}: TestFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="test-form" onSubmit={handleSubmit}>
      <TestTypeTabs value={values.type} onChange={(value) => onValueChange('type', value)} />
      <div className="form-grid">
        <FormField
          label="Subject"
          kind="select"
          placeholder={isSubjectsLoading ? 'Loading subjects...' : 'Choose from Drop-down'}
          value={values.subject}
          options={subjects}
          disabled={isSubjectsLoading}
          onChange={(value) => onValueChange('subject', value)}
        />
        <FormField
          label="Name of Test"
          placeholder="Enter name of Test"
          value={values.name}
          onChange={(value) => onValueChange('name', value)}
        />
        <FormField
          label="Topic"
          kind="select"
          placeholder={isTopicsLoading ? 'Loading topics...' : 'Choose from Drop-down'}
          value={values.topic}
          options={topics}
          disabled={!values.subject || isTopicsLoading}
          onChange={(value) => onValueChange('topic', value)}
        />
        <FormField
          label="Sub Topic"
          kind="select"
          placeholder={isSubTopicsLoading ? 'Loading sub-topics...' : 'Choose from Drop-down'}
          value={values.subTopic}
          options={subTopics}
          disabled={!values.topic.length || isSubTopicsLoading}
          onChange={(value) => onValueChange('subTopic', value)}
        />
        <FormField
          label="Duration (Minutes)"
          placeholder="Enter the time"
          inputType="number"
          value={values.totalTime}
          onChange={(value) => onValueChange('totalTime', value)}
        />
        <DifficultyField
          value={values.difficulty}
          onChange={(value) => onValueChange('difficulty', value)}
        />
      </div>

      <h2 className="section-label">Marking Scheme:</h2>
      <div className="marking-grid">
        <StepperField
          label="Wrong Answer"
          value={values.wrongMarks}
          onChange={(value) => onValueChange('wrongMarks', value)}
        />
        <StepperField
          label="Unattempted"
          value={values.unattemptMarks}
          onChange={(value) => onValueChange('unattemptMarks', value)}
        />
        <StepperField
          label="Correct Answer"
          value={values.correctMarks}
          onChange={(value) => onValueChange('correctMarks', value)}
        />
        <FormField
          label="No of Questions"
          placeholder="Ex:50"
          inputType="number"
          value={values.totalQuestions}
          onChange={(value) => onValueChange('totalQuestions', value)}
        />
        <FormField
          label="Total Marks"
          placeholder="Ex:250 Marks"
          inputType="number"
          value={values.totalMarks}
          onChange={(value) => onValueChange('totalMarks', value)}
          mutedLabel
        />
      </div>

      <div className="form-actions">
        <button className="ghost-button" type="button">
          Cancel
        </button>
        <button className="blue-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader label="Saving..." variant="button" /> : submitLabel}
        </button>
      </div>
    </form>
  )
}

export function FormField({
  label,
  placeholder,
  kind = 'input',
  mutedLabel = false,
  value = '',
  options = [],
  inputType = 'text',
  disabled = false,
  multiple = false,
  onChange,
}: FieldProps) {
  if (multiple) {
    const selectedValues = Array.isArray(value) ? value : []

    // If it's a select kind, render a native multi-select dropdown
    if (kind === 'select') {
      return (
        <label className={`field ${mutedLabel ? 'is-muted-label' : ''}`}>
          {label ? <span>{label}</span> : null}
          <span className={`field-control ${disabled ? 'is-disabled' : ''}`}>
            {options.length ? (
              <select
                multiple
                value={selectedValues}
                disabled={disabled}
                onChange={(event) => {
                  const next = Array.from(event.target.selectedOptions).map((opt) => opt.value)
                  onChange?.(next)
                }}
              >
                {options.map((option) => (
                  <option value={option.id} key={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="multi-select-placeholder">{placeholder}</span>
            )}
          </span>
        </label>
      )
    }

    // Fallback: previous checkbox multi-select UI
    return (
      <label className={`field ${mutedLabel ? 'is-muted-label' : ''}`}>
        {label ? <span>{label}</span> : null}
        <span className={`field-control multi-select-control ${disabled ? 'is-disabled' : ''}`}>
          {options.length ? (
            options.map((option) => (
              <span className="multi-select-option" key={option.id}>
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.id)}
                  disabled={disabled}
                  onChange={() => {
                    const nextValues = selectedValues.includes(option.id)
                      ? selectedValues.filter((selected) => selected !== option.id)
                      : [...selectedValues, option.id]

                    onChange?.(nextValues)
                  }}
                />
                <span>{option.name}</span>
              </span>
            ))
          ) : (
            <span className="multi-select-placeholder">{placeholder}</span>
          )}
        </span>
      </label>
    )
  }

  const fieldValue = Array.isArray(value) ? value[0] ?? '' : value

  return (
    <label className={`field ${mutedLabel ? 'is-muted-label' : ''}`}>
      {label ? <span>{label}</span> : null}
      <span className="field-control">
        {kind === 'select' ? (
          <select value={fieldValue} disabled={disabled} onChange={(event) => onChange?.(event.target.value)}>
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option value={option.id} key={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={kind === 'date' ? 'date' : inputType}
            placeholder={placeholder}
            value={fieldValue}
            disabled={disabled}
            onChange={(event) => onChange?.(event.target.value)}
          />
        )}
        {kind === 'select' ? <ChevronDown size={22} /> : null}
        {kind === 'date' ? <Calendar size={20} /> : null}
      </span>
    </label>
  )
}

function DifficultyField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <fieldset className="difficulty-field">
      <legend>Test Difficulty Level</legend>
      <div className="radio-row">
        <RadioLabel label="Easy" value="easy" checked={value === 'easy'} onChange={onChange} />
        <RadioLabel label="Medium" value="medium" checked={value === 'medium'} onChange={onChange} />
        <RadioLabel
          label="Difficult"
          value="difficult"
          checked={value === 'difficult'}
          onChange={onChange}
        />
      </div>
    </fieldset>
  )
}

export function RadioLabel({
  label,
  value,
  checked = false,
  onChange,
}: {
  label: string
  value?: string
  checked?: boolean
  onChange?: (value: string) => void
}) {
  return (
    <label className="radio-label">
      <input
        type="radio"
        value={value ?? label}
        checked={checked}
        onChange={(event) => onChange?.(event.target.value)}
      />
      <span>{label}</span>
    </label>
  )
}

function StepperField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="field stepper-field">
      <span>{label}</span>
      <span className="stepper-control">
        <input type="number" value={value} onChange={(event) => onChange(event.target.value)} />
        <span className="stepper-icons">
          <ChevronUp size={17} />
          <ChevronDown size={17} />
        </span>
      </span>
    </label>
  )
}

export function TestSummaryCard({ test, showEdit = true }: { test?: Test | null; showEdit?: boolean }) {
  const subject = getEntityName(test?.subject) || '-'
  const topicList = getEntityList(test?.topics)
  const subTopicList = getEntityList(test?.sub_topics)
  const totalTime = test?.total_time ?? 0
  const totalQuestions = test?.total_questions ?? 0
  const totalMarks = test?.total_marks ?? 0

  return (
    <section className="summary-card">
      <div className="summary-left">
        <span className="summary-pill dark">{getTypeLabel(test?.type)}</span>
        <div className="summary-title-row">
          <span className="chapter-icon">
            <BookOpenCheck size={18} />
          </span>
          <strong>{test?.name || 'Test details unavailable'}</strong>
          <span className="summary-pill green">
            <Lightbulb size={14} />
            {test?.difficulty ? toTitleCase(test.difficulty) : '-'}
          </span>
        </div>
        <dl className="summary-meta">
          <div>
            <dt>Subject</dt>
            <dd>: {subject}</dd>
          </div>
          <div>
            <dt>Topic</dt>
            <dd>
              :
              {topicList.length ? topicList.map((topic) => (
                <span className="topic-chip" key={topic}>
                  {topic}
                </span>
              )) : <span className="topic-chip">-</span>}
            </dd>
          </div>
          <div>
            <dt>Sub Topic</dt>
            <dd>
              :
              {subTopicList.length ? subTopicList.map((subTopic) => (
                <span className="topic-chip" key={subTopic}>
                  {subTopic}
                </span>
              )) : <span className="topic-chip">-</span>}
            </dd>
          </div>
        </dl>
      </div>
      {showEdit ? (
        <Link className="edit-link" to={`/test/edit?testId=${test?.id ?? ''}`} aria-label="Edit test">
          <Edit3 size={22} />
        </Link>
      ) : null}
      <div className="summary-stats">
        <span>
          <Clock size={15} />
          {totalTime} Min
        </span>
        <span>
          <FileQuestion size={15} />
          {totalQuestions} Q's
        </span>
        <span>
          <ListChecks size={15} />
          {totalMarks} Marks
        </span>
      </div>
    </section>
  )
}

export function QuestionEditor({
  value,
  onChange,
  questionNumber = 1,
  totalQuestions,
  onCsvUpload,
  onImageUpload,
  imageUrl,
  onImageRemove,
  onClear,
}: {
  value: string
  onChange: (value: string) => void
  questionNumber?: number
  totalQuestions?: number
  onCsvUpload?: (file: File) => void
  onImageUpload?: (file: File) => void
  imageUrl?: string
  onImageRemove?: () => void
  onClear?: () => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const csvInputRef = useRef<HTMLInputElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const toolbarItems = [
    { action: 'italic', label: 'Italic', icon: <Italic size={15} /> },
    { action: 'bold', label: 'Bold', icon: <Bold size={15} /> },
    { action: 'underline', label: 'Underline', icon: <Underline size={15} /> },
    { action: 'link', label: 'Link', icon: <LinkIcon size={15} /> },
    { action: 'list', label: 'List', icon: <List size={15} /> },
    { action: 'image', label: 'Image', icon: <ImageIcon size={15} /> },
    { action: 'formula', label: 'Formula', icon: <span>fx</span> },
  ]

  function handleFormat(action: string) {
    if (action === 'image' && onImageUpload) {
      imageInputRef.current?.click()
      return
    }

    const textarea = textareaRef.current
    const start = textarea?.selectionStart ?? value.length
    const end = textarea?.selectionEnd ?? value.length
    const selected = value.slice(start, end)
    const formatted = formatSelection(action, selected)
    const nextValue = `${value.slice(0, start)}${formatted.text}${value.slice(end)}`

    onChange(nextValue)
    requestAnimationFrame(() => {
      textarea?.focus()
      textarea?.setSelectionRange(start + formatted.selectionStart, start + formatted.selectionEnd)
    })
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (file) {
      onImageUpload?.(file)
    }

    event.currentTarget.value = ''
  }

  function handleCsvChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (file) {
      onCsvUpload?.(file)
    }

    event.currentTarget.value = ''
  }

  return (
    <section className="question-editor">
      <div className="question-heading-row">
        <h2>
          Question <span>{totalQuestions ? `${questionNumber}/${totalQuestions}` : questionNumber}</span>
        </h2>
        <div className="editor-actions">
          <button type="button">+ MCQ</button>
          <button type="button" onClick={() => csvInputRef.current?.click()}>
            <Upload size={15} />
            CSV
          </button>
          <button type="button" onClick={() => imageInputRef.current?.click()}>
            <ImageIcon size={15} />
            Image
          </button>
          <input
            ref={csvInputRef}
            className="csv-input"
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvChange}
          />
          <input
            ref={imageInputRef}
            className="csv-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>
      {imageUrl ? (
        <div className="question-image-preview">
          <img src={imageUrl} alt="Question attachment" />
          {onImageRemove ? (
         <button
  type="button"
  className="remove-image-button"
  onClick={onImageRemove}
>
  🗑 Remove Image
</button>
          ) : null}
        </div>
      ) : null}
      <button className="delete-edits" type="button" onClick={onClear} disabled={!onClear}>
        <Trash2 size={17} />
        Delete All Edits
      </button>
      <div className="editor-box">
        <div className="editor-toolbar">
          {toolbarItems.map((item) => (
            <button
              type="button"
              key={item.action}
              title={item.label}
              aria-label={item.label}
              onClick={() => handleFormat(item.action)}
            >
              {item.icon}
            </button>
          ))}
        </div>
        <div className="editor-canvas">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Type here"
          />
          <Trash2 size={21} />
        </div>
      </div>
    </section>
  )
}

export function OptionsEditor({
  values,
  onChange,
}: {
  values: QuestionFormValues
  onChange: (field: keyof QuestionFormValues, value: string) => void
}) {
  const options = [
    { field: 'option1', value: 'option1' },
    { field: 'option2', value: 'option2' },
    { field: 'option3', value: 'option3' },
    { field: 'option4', value: 'option4' },
  ] as const

  return (
    <section className="options-section">
      <h2>Type the options below</h2>
      {options.map((option) => (
        <label className="option-row" key={option.value}>
          <input
            type="radio"
            checked={values.correctOption === option.value}
            onChange={() => onChange('correctOption', option.value)}
          />
          <input
            className="option-input"
            value={values[option.field]}
            onChange={(event) => onChange(option.field, event.target.value)}
            placeholder="Type Option here"
          />
          <Trash2 size={21} />
        </label>
      ))}
      <h2>Add Solution</h2>
      <div className="solution-box">
        <textarea
          value={values.explanation}
          onChange={(event) => onChange('explanation', event.target.value)}
          placeholder="Type here"
        />
        <Trash2 size={21} />
      </div>
    </section>
  )
}

export function QuestionSettings({
  values,
  topics,
  subTopics,
  isTopicsLoading = false,
  isSubTopicsLoading = false,
  onChange,
}: {
  values: QuestionFormValues
  topics: SelectOption[]
  subTopics: SelectOption[]
  isTopicsLoading?: boolean
  isSubTopicsLoading?: boolean
  onChange: (field: keyof QuestionFormValues, value: string) => void
}) {
  return (
    <section className="question-settings">
      <div className="pager-row">
        <button type="button">{'<'}</button>
        <button type="button">{'>'}</button>
      </div>
      <h2>Question settings</h2>
      <FormField
        label="Level of Difficulty"
        kind="select"
        placeholder="Select from Drop-down"
        value={values.difficulty}
        options={[
          { id: 'easy', name: 'Easy' },
          { id: 'medium', name: 'Medium' },
          { id: 'difficult', name: 'Difficult' },
        ]}
        onChange={(value) => onChange('difficulty', toFieldString(value))}
      />
      <FormField
        label="Topic"
        kind="select"
        placeholder={isTopicsLoading ? 'Loading topics...' : 'Select from Drop-down'}
        value={values.topic}
        options={topics}
        disabled={isTopicsLoading}
        onChange={(value) => onChange('topic', toFieldString(value))}
      />
      <FormField
        label="Sub-topic"
        kind="select"
        placeholder={isSubTopicsLoading ? 'Loading sub-topics...' : 'Select from Drop-down'}
        value={values.subTopic}
        options={subTopics}
        disabled={!values.topic || isSubTopicsLoading}
        onChange={(value) => onChange('subTopic', toFieldString(value))}
      />
    </section>
  )
}

export function AddedQuestionsList({
  questions,
  onEdit,
  onRemove,
  isRemoving = false,
}: {
  questions: Question[]
  onEdit?: (question: Question) => void
  onRemove?: (questionId: string) => void
  isRemoving?: boolean
}) {
  if (!questions.length) {
    return null
  }

  return (
    <section className="added-questions">
      <h2>Added Questions</h2>
      {questions.map((question, index) => (
        <article className="added-question-row" key={question.id}>
          <span>{index + 1}. {question.question}</span>
          <span className="added-question-meta">
            <small>{question.correct_option}</small>
            {onEdit ? (
              <button
                type="button"
                aria-label={`Edit question ${index + 1}`}
                onClick={() => onEdit(question)}
              >
                <Edit3 size={16} />
              </button>
            ) : null}
            {onRemove ? (
              <button
                type="button"
                aria-label={`Remove question ${index + 1}`}
                onClick={() => onRemove(question.id)}
                disabled={isRemoving}
              >
                <Trash2 size={16} />
              </button>
            ) : null}
          </span>
        </article>
      ))}
    </section>
  )
}

export function QuestionsPreviewList({
  questions,
  isLoading = false,
}: {
  questions: Question[]
  isLoading?: boolean
}) {
  if (isLoading) {
    return <Loader label="Loading questions..." variant="block" />
  }

  if (!questions.length) {
    return <p className="empty-state">No questions found for this test.</p>
  }

  return (
    <section className="added-questions preview-questions">
      <h2>Questions</h2>
      {questions.map((question, index) => (
        <article className="preview-question" key={question.id}>
          <h3>{index + 1}. {question.question}</h3>
          {question.media_url ? <img className="preview-media" src={question.media_url} alt="" /> : null}
          <ol className="preview-options">
            <li>{question.option1}</li>
            <li>{question.option2}</li>
            <li>{question.option3}</li>
            <li>{question.option4}</li>
          </ol>
          <p className="preview-answer">Correct answer: {question.correct_option}</p>
          {question.explanation ? <p className="preview-explanation">{question.explanation}</p> : null}
        </article>
      ))}
    </section>
  )
}

export function PublishControls({
  mode,
  liveUntil,
  endDate,
  endTime,
  scheduleDate = '',
  scheduleTime = '',
  onChange,
}: PublishModeProps) {
  return (
    <section className="publish-controls">
      <div className="publish-tabs">
        <Link className={mode === 'now' ? 'is-active' : ''} to="/test/publish">
          Publish Now
        </Link>
        <Link className={mode === 'schedule' ? 'is-active' : ''} to="/test/schedule">
          Schedule Publish
        </Link>
      </div>

      {mode === 'schedule' ? (
        <>
          <h2>Select Date and Time</h2>
          <div className="publish-grid">
            <FormField
              label=""
              kind="date"
              placeholder="Select Date"
              value={scheduleDate}
              onChange={(value) => onChange('scheduleDate', toFieldString(value))}
            />
            <FormField
              label=""
              kind="select"
              placeholder="Select Time"
              value={scheduleTime}
              options={timeOptions}
              onChange={(value) => onChange('scheduleTime', toFieldString(value))}
            />
          </div>
        </>
      ) : null}

      <h2>Live Until</h2>
      <p>Choose how long this test should remain available on the platform.</p>
      <div className="duration-grid">
        <RadioLabel
          label="Always Available"
          value="always"
          checked={liveUntil === 'always'}
          onChange={(value) => onChange('liveUntil', value)}
        />
        <RadioLabel
          label="3 Weeks"
          value="3_weeks"
          checked={liveUntil === '3_weeks'}
          onChange={(value) => onChange('liveUntil', value)}
        />
        <RadioLabel
          label="1 Week"
          value="1_week"
          checked={liveUntil === '1_week'}
          onChange={(value) => onChange('liveUntil', value)}
        />
        <RadioLabel
          label="1 Month"
          value="1_month"
          checked={liveUntil === '1_month'}
          onChange={(value) => onChange('liveUntil', value)}
        />
        <RadioLabel
          label="2 Weeks"
          value="2_weeks"
          checked={liveUntil === '2_weeks'}
          onChange={(value) => onChange('liveUntil', value)}
        />
        <RadioLabel
          label="Custom Duration"
          value="custom"
          checked={liveUntil === 'custom'}
          onChange={(value) => onChange('liveUntil', value)}
        />
      </div>
      <div className="publish-grid">
        <FormField
          label=""
          kind="date"
          placeholder="Select End Date"
          value={endDate}
          onChange={(value) => onChange('endDate', toFieldString(value))}
        />
        <FormField
          label=""
          kind="select"
          placeholder="Select End Time"
          value={endTime}
          options={timeOptions}
          onChange={(value) => onChange('endTime', toFieldString(value))}
        />
      </div>
    </section>
  )
}

const timeOptions = [
  { id: '09:00', name: '09:00 AM' },
  { id: '12:00', name: '12:00 PM' },
  { id: '15:00', name: '03:00 PM' },
  { id: '18:00', name: '06:00 PM' },
]

function toFieldString(value: string | string[]) {
  return Array.isArray(value) ? value[0] ?? '' : value
}

function getEntityList(value: unknown) {
  if (!Array.isArray(value) || !value.length) {
    return []
  }

  return value.map((item) => getEntityName(item)).filter(Boolean)
}

function toTitleCase(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getTypeLabel(value?: string) {
  if (!value) {
    return 'Test'
  }

  if (value === 'practice' || value === 'chapter_wise' || value === 'chapterwise') {
    return 'Chapter Wise'
  }

  if (value === 'mock_test' || value === 'mock') {
    return 'Mock Test'
  }

  if (value === 'pyq') {
    return 'PYQ'
  }

  return toTitleCase(value)
}

type FormatResult = {
  text: string
  selectionEnd: number
  selectionStart: number
}

function formatSelection(action: string, selectedText: string): FormatResult {
  const selected = selectedText || getFormatPlaceholder(action)

  if (action === 'bold') {
    return wrapText(selected, '**', '**')
  }

  if (action === 'italic') {
    return wrapText(selected, '*', '*')
  }

  if (action === 'underline') {
    return wrapText(selected, '<u>', '</u>')
  }

  if (action === 'link') {
    return {
      text: `[${selected}](https://example.com)`,
      selectionStart: 1,
      selectionEnd: selected.length + 1,
    }
  }

  if (action === 'list') {
    return {
      text: selected
        .split('\n')
        .map((line) => `- ${line || 'List item'}`)
        .join('\n'),
      selectionStart: 2,
      selectionEnd: selected.length + 2,
    }
  }

  if (action === 'image') {
    return {
      text: `![${selected}](https://example.com/image.png)`,
      selectionStart: 2,
      selectionEnd: selected.length + 2,
    }
  }

  if (action === 'formula') {
    return wrapText(selected, '$', '$')
  }

  return {
    text: selected,
    selectionStart: 0,
    selectionEnd: selected.length,
  }
}

function wrapText(selected: string, prefix: string, suffix: string) {
  return {
    text: `${prefix}${selected}${suffix}`,
    selectionStart: prefix.length,
    selectionEnd: prefix.length + selected.length,
  }
}

function getFormatPlaceholder(action: string) {
  const placeholders: Record<string, string> = {
    bold: 'bold text',
    formula: 'x = 1',
    image: 'image alt',
    italic: 'italic text',
    link: 'link text',
    list: 'List item',
    underline: 'underlined text',
  }

  return placeholders[action] ?? 'text'
}
