import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useInView } from './hooks'

/** Sobe e aparece quando entra na tela. */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.12)
  return (
    <div ref={ref} data-in={inView} className={cn('reveal', className)} style={{ '--d': `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  )
}

/** Celular com a captura real do app. */
export function PhoneFrame({ src, alt, className, eager }: { src: string; alt: string; className?: string; eager?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-[40px] bg-[#0c0a09] p-[8px]',
        'shadow-[0_40px_90px_-24px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.09),inset_0_0_0_1px_rgba(255,255,255,0.04)]',
        className,
      )}
    >
      <img src={src} alt={alt} width={469} height={1015} loading={eager ? 'eager' : 'lazy'} className="block h-auto w-full rounded-[32px]" />
    </div>
  )
}

/** Luz ambiente: manchas de louro, ouro e terracota que derivam devagar, sobre uma grade apagada. */
export function Aurora({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)} style={{ opacity: intensity }}>
      <div className="absolute -top-48 left-[-12%] h-[560px] w-[560px] animate-[aurora_18s_ease-in-out_infinite] rounded-full bg-laurel/25 blur-[110px]" />
      <div className="absolute top-10 right-[-10%] h-[480px] w-[480px] animate-[aurora_23s_ease-in-out_-7s_infinite] rounded-full bg-bronze/20 blur-[120px]" />
      <div className="absolute bottom-[-25%] left-[28%] h-[440px] w-[440px] animate-[aurora_27s_ease-in-out_-13s_infinite] rounded-full bg-accent/15 blur-[120px]" />
      <div className="absolute inset-0 [background-image:linear-gradient(rgb(242_237_228/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(242_237_228/0.05)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" />
    </div>
  )
}

/** Título de seção: frase grande e um parágrafo curto. */
export function SectionHead({ title, text, center, className }: { title: ReactNode; text?: ReactNode; center?: boolean; className?: string }) {
  return (
    <Reveal className={cn('flex flex-col gap-4', center && 'items-center text-center', className)}>
      <h2 className="m-0 max-w-[20ch] font-display text-balance text-[34px] leading-[1.06] font-semibold tracking-[-0.015em] md:text-[50px]">{title}</h2>
      {text && <p className="m-0 max-w-[52ch] text-[17px] leading-relaxed text-text-2 md:text-lg">{text}</p>}
    </Reveal>
  )
}
