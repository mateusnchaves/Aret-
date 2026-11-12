import { useEffect, useRef, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { IconClose } from '../icons'

export function Card({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn('rounded-[20px] border border-line bg-surface p-4.5', className)} {...props} />
}

export function Eyebrow({ className, ...props }: ComponentProps<'span'>) {
  return <span className={cn('eyebrow', className)} {...props} />
}

export function Spinner({ label = 'Carregando' }: { label?: string }) {
  return (
    <div role="status" className="flex justify-center py-12">
      <span className="size-6 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-line-strong px-6 py-10 text-center">
      <p className="m-0 font-display text-xl font-semibold">{title}</p>
      {children && <div className="text-sm text-muted">{children}</div>}
      {action}
    </div>
  )
}

/**
 * Bottom sheet com <dialog> nativo: foco preso, Esc fecha e o resto da página fica inerte.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // O autoFocus do React roda antes do showModal; foca aqui o campo marcado.
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      aria-label={title}
      className="m-0 mt-auto w-full max-w-none border-0 bg-transparent p-0 text-text backdrop:bg-black/60 sm:mx-auto sm:mb-8 sm:max-w-md"
    >
      <div className="mx-auto flex max-h-[90dvh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-t-[28px] border border-line bg-surface px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-[28px]">
        <div className="flex items-center justify-between">
          <h2 className="m-0 font-display text-2xl font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="-mr-2 flex size-11 cursor-pointer items-center justify-center rounded-xl text-text-2 hover:bg-surface-2"
          >
            <IconClose />
          </button>
        </div>
        {open && children}
      </div>
    </dialog>
  )
}
