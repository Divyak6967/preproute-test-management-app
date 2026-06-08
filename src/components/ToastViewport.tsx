import { useEffect, useState } from 'react'
import { toast, type ToastMessage } from '../utils/toast'

const TOAST_TIMEOUT_MS = 3600

export function ToastViewport() {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  useEffect(() => {
    return toast.subscribe((message) => {
      setMessages((current) => [...current, message])

      window.setTimeout(() => {
        setMessages((current) => current.filter((item) => item.id !== message.id))
      }, TOAST_TIMEOUT_MS)
    })
  }, [])

  if (!messages.length) {
    return null
  }

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {messages.map((message) => (
        <div className={`toast-message is-${message.kind}`} key={message.id}>
          {message.message}
        </div>
      ))}
    </div>
  )
}
