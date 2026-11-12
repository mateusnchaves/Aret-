import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-[14px] border border-line-strong bg-surface px-4 text-[15px] text-text placeholder:text-faint',
        'focus:border-accent focus:outline-none aria-invalid:border-danger',
        className,
      )}
      {...props}
    />
  )
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-12 w-full appearance-none rounded-[14px] border border-line-strong bg-surface px-4 text-[15px] text-text focus:border-accent focus:outline-none',
        className,
      )}
      {...props}
    />
  )
}

/** Rótulo + controle + dica/erro, ligados por id para leitores de tela. */
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string | null
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode
}) {
  const id = useId()
  const describedBy = error || hint ? `${id}-desc` : undefined
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-2">
        {label}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {(error || hint) && (
        <p id={describedBy} className={cn('text-xs', error ? 'text-danger' : 'text-muted')}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}

/** Grupo de opções exclusivas com cara de botões (radio por baixo). */
export function Segmented<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  columns = 2,
}: {
  name: string
  legend: string
  options: { value: T; label: string; hint?: string }[]
  value: T | null
  onChange: (value: T) => void
  columns?: 1 | 2 | 3
}) {
  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend className="mb-1.5 p-0 text-sm font-medium text-text-2">{legend}</legend>
      <div
        className={cn('grid gap-2', columns === 1 && 'grid-cols-1', columns === 2 && 'grid-cols-2', columns === 3 && 'grid-cols-3')}
      >
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              'flex min-h-12 cursor-pointer flex-col justify-center rounded-[14px] border px-4 py-2.5 transition-colors',
              'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent',
              value === o.value ? 'border-accent bg-accent-soft' : 'border-line-strong bg-surface hover:bg-surface-2',
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            <span className={cn('text-[15px] font-medium', value === o.value && 'text-accent-hi')}>{o.label}</span>
            {o.hint && <span className="text-xs text-muted">{o.hint}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function ErrorNote({ error }: { error: unknown }) {
  if (!error) return null
  const message = error instanceof Error ? error.message : String(error)
  return (
    <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
      {message}
    </p>
  )
}
