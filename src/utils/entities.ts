import type { Question, SelectOption } from '../types/api'

export function getEntityId(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') {
    return value.id
  }

  return ''
}

export function getEntityName(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object' && 'name' in value && typeof value.name === 'string') {
    return value.name
  }

  return ''
}

export function getEntityIds(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item) => getEntityId(item)).filter(Boolean)
}

export function toSelectOptions(value: unknown): SelectOption[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.reduce<SelectOption[]>((options, item) => {
    const id = getEntityId(item)
    const name = getEntityName(item) || id

    if (!id || options.some((option) => option.id === id)) {
      return options
    }

    options.push({ id, name })
    return options
  }, [])
}

export function resolveOptionId(value: string, options: SelectOption[]) {
  if (!value) {
    return ''
  }

  const byId = options.find((option) => option.id === value)

  if (byId) {
    return byId.id
  }

  return options.find((option) => option.name.toLowerCase() === value.toLowerCase())?.id ?? value
}

export function resolveOptionIds(values: string | string[], options: SelectOption[]) {
  const list = Array.isArray(values) ? values : [values]

  return list
    .map((value) => resolveOptionId(value, options))
    .filter((value, index, list) => Boolean(value) && list.indexOf(value) === index)
}

export function getQuestionIds(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

export function getInlineQuestions(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is Question => {
    return Boolean(item && typeof item === 'object' && 'id' in item && 'question' in item)
  })
}
