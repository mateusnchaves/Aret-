import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-semibold transition-colors select-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-[linear-gradient(180deg,#e5895d_0%,var(--color-accent-deep)_100%)] text-on-accent font-bold shadow-[0_6px_18px_rgba(217,119,74,0.25),inset_0_1px_0_rgba(255,255,255,0.3)] hover:brightness-110',
        laurel:
          'bg-[linear-gradient(180deg,var(--color-laurel-hi)_0%,var(--color-laurel)_100%)] text-on-laurel font-bold shadow-[0_6px_18px_rgba(140,192,132,0.22),inset_0_1px_0_rgba(255,255,255,0.3)] hover:brightness-110',
        outline: 'border border-line-strong bg-transparent text-text hover:bg-surface-2',
        accentOutline: 'border border-accent bg-transparent text-accent-hi hover:bg-accent-soft',
        ghost: 'bg-transparent text-text hover:bg-surface-2',
        link: 'bg-transparent px-0 text-accent-hi hover:text-accent',
        danger: 'border border-danger/60 bg-transparent text-danger hover:bg-danger/10',
      },
      size: {
        md: 'h-12 rounded-[14px] px-5 text-[15px]',
        lg: 'h-13 rounded-2xl px-6 text-base',
        sm: 'h-11 rounded-xl px-4 text-sm',
        icon: 'size-11 rounded-xl',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild, type = 'button', ...props }: ButtonProps) {
  if (asChild) return <Slot className={cn(buttonVariants({ variant, size }), className)} {...props} />
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
