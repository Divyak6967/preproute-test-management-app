type LoaderProps = {
  label?: string
  variant?: 'inline' | 'block' | 'button' | 'overlay'
}

export function Loader({ label = 'Loading...', variant = 'inline' }: LoaderProps) {
  return (
    <span className={`loader loader-${variant}`} role="status" aria-live="polite">
      <span className="loader-spinner" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
