export type ToastKind = 'success' | 'error' | 'info'

export type ToastMessage = {
  id: number
  kind: ToastKind
  message: string
}

type ToastListener = (toast: ToastMessage) => void

const listeners = new Set<ToastListener>()
let nextToastId = 1

function emit(kind: ToastKind, message: string) {
  const trimmedMessage = message.trim()

  if (!trimmedMessage) {
    return
  }

  const toastMessage = {
    id: nextToastId,
    kind,
    message: trimmedMessage,
  }

  nextToastId += 1
  listeners.forEach((listener) => listener(toastMessage))
}

export const toast = {
  success(message: string) {
    emit('success', message)
  },
  error(message: string) {
    emit('error', message)
  },
  info(message: string) {
    emit('info', message)
  },
  subscribe(listener: ToastListener) {
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  },
}
