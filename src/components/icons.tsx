import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 22, children, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconHome = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </Icon>
)

export const IconDumbbell = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 7v10" />
    <path d="M18 7v10" />
    <path d="M3 9.5v5" />
    <path d="M21 9.5v5" />
    <path d="M6 12h12" />
  </Icon>
)

export const IconPulse = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 12h4l3-7 4 14 3-7h4" />
  </Icon>
)

export const IconFork = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 3v8" />
    <path d="M4 3v5a3 3 0 0 0 6 0V3" />
    <path d="M7 11v10" />
    <path d="M17 21V3c-2.5 1.5-3.5 4-3.5 7.5H17" />
  </Icon>
)

export const IconUser = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </Icon>
)

export const IconCheck = (p: IconProps) => (
  <Icon strokeWidth={2.4} {...p}>
    <path d="M5 12l5 5L20 7" />
  </Icon>
)

export const IconPlus = (p: IconProps) => (
  <Icon strokeWidth={2.2} {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
)

export const IconClose = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </Icon>
)

export const IconBack = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Icon>
)

export const IconChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 5l7 7-7 7" />
  </Icon>
)

export const IconWarning = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3l10 18H2L12 3z" />
    <path d="M12 10v5" />
    <path d="M12 18h.01" />
  </Icon>
)

export const IconArrowUp = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 19V5" />
    <path d="M6 11l6-6 6 6" />
  </Icon>
)

export const IconArrowDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14" />
    <path d="M6 13l6 6 6-6" />
  </Icon>
)

export const IconMinus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14" />
  </Icon>
)

export const IconPencil = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16v4z" />
    <path d="M13.5 6.5l4 4" />
  </Icon>
)

export const IconTrash = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h16" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M6 7l1 13h10l1-13" />
    <path d="M9 7V4h6v3" />
  </Icon>
)

export const IconMoveUp = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 15l6-6 6 6" />
  </Icon>
)

export const IconMoveDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
)

export const IconArchive = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v12h14V8" />
    <path d="M10 12h4" />
  </Icon>
)

export const IconGoogle = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
)

// ───────────── Navegação (Visual 2.0): ícones temáticos ─────────────

/** Templo: o Início. */
export const IconTemple = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 9l9-6 9 6" />
    <path d="M5 9v10M9.5 9v10M14.5 9v10M19 9v10" />
    <path d="M3 21h18" />
  </Icon>
)

/** Tocha olímpica: o Cardio. */
export const IconTorch = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 2c2 2.2 2.6 3.9 1.6 5.6-.5.8-1.6 1.4-1.6 1.4s-1.1-.6-1.6-1.4C9.4 5.9 10 4.2 12 2z" />
    <path d="M8 10h8l-2 4h-4z" />
    <path d="M10.5 14l.5 8h2l.5-8" />
  </Icon>
)

/** Ânfora: a Alimentação. */
export const IconAmphora = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 3h6" />
    <path d="M10 3v3c-3 1.5-4.5 4.5-4 8 .4 3 2.6 5.5 6 7 3.4-1.5 5.6-4 6-7 .5-3.5-1-6.5-4-8V3" />
    <path d="M10 7.5c-2.5-.5-4 .5-4.5 2" />
    <path d="M14 7.5c2.5-.5 4 .5 4.5 2" />
    <path d="M7 13h10" />
  </Icon>
)

/** Busto de perfil: o Perfil. */
export const IconBust = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 21v-3.5c-2-.8-3-2.6-3-4.6C6 9 8.7 4 13 4c3.3 0 5 2.4 5 5 0 1.4-.4 2.2-1.2 3l1.2 2.2-1.6.6.2 1.7c.1 1-.7 1.5-1.6 1.5H14v3" />
    <path d="M6 21h12" />
  </Icon>
)

export const IconStar = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Icon {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.3L12 17.4l-5.6 3 1.1-6.3L3 9.7l6.2-.9z" />
  </Icon>
)

export const IconShare = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3v12" />
    <path d="M7 8l5-5 5 5" />
    <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </Icon>
)
