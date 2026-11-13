import { useEffect, useRef, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ColumnArt } from '../brand'
import { IconClose } from '../icons'

/** `hero` = card de destaque: gradiente quente, borda de luz dourada e sombra. */
export function Card({ className, hero, ...props }: ComponentProps<'section'> & { hero?: boolean }) {
  return (
    <section
      className={cn(
        'rounded-[22px] border p-4.5',
        hero
          ? 'gold-edge border-[#3a2e26] bg-[linear-gradient(160deg,#2a1e17_0%,#1e1a17_70%)] shadow-[0_12px_30px_rgba(0,0,0,0.35)]'
          : 'border-line bg-surface',
        className,
      )}
      {...props}
    />
  )
}

export function Eyebrow({ className, ...props }: ComponentProps<'span'>) {
  return <span className={cn('eyebrow', className)} {...props} />
}

/** Carregamento: formas dos cards pulsando devagar, no lugar da rodinha. */
export function Spinner({ label = 'Carregando', rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div role="status" className="flex flex-col gap-3 py-2">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="rounded-[22px] bg-surface"
          style={{ height: i === 0 ? 132 : 76, animation: `skeleton 1.6s ease-in-out ${i * 120}ms infinite` }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[22px] border border-line bg-surface/60 px-6 py-9 text-center">
      <ColumnArt />
      <p className="inscription m-0 text-lg font-semibold">{title}</p>
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
