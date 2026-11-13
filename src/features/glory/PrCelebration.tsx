import { useEffect, useRef } from 'react'
import { Medal } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { formatKg } from '@/lib/format'
import { toRoman } from '@/lib/glory'

const LEAVES = 9

export interface PrInfo {
  exerciseName: string
  loadKg: number
  mark: number
  previousKg: number
}

/**
 * O momento de glória: tela inteira escura, a coroa de louros se forma folha por folha
 * em volta da medalha, e o celular vibra.
 */
export function PrCelebration({ info, onClose }: { info: PrInfo | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (info && !dialog.open) {
      dialog.showModal()
      try {
        navigator.vibrate?.([30, 60, 30, 60, 90])
      } catch {
        // sem suporte a vibração
      }
    }
    if (!info && dialog.open) dialog.close()
  }, [info])

  const size = 220
  const c = size / 2
  const ry = 15
  const baseY = size - ry * 1.2

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label="Novo recorde"
      className="pr-dialog m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-0 text-text backdrop:bg-black/80"
    >
      {info && (
        <div className="flex h-full flex-col items-center justify-center gap-6 bg-[radial-gradient(60%_45%_at_50%_42%,rgba(216,180,90,0.22),transparent_70%)] px-8 text-center">
          <p className="inscription m-0 animate-[rise_500ms_ease-out_both] text-xs tracking-[0.4em] text-bronze">ἀρετή</p>

          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="absolute inset-0">
              {[-1, 1].map((side) =>
                Array.from({ length: LEAVES }, (_, i) => {
                  const angle = side * (12 * (i + 0.6))
                  // A rotação fica no <g>: o transform da animação CSS sobrescreveria o atributo da folha.
                  return (
                    <g key={`${side}-${i}`} transform={`rotate(${angle} ${c} ${c}) rotate(${side * 32} ${c} ${baseY})`}>
                      <ellipse
                        cx={c}
                        cy={baseY}
                        rx={7}
                        ry={ry}
                        fill="var(--color-bronze)"
                        opacity={0.6 + (i / LEAVES) * 0.4}
                        style={{
                          animation: `laurel-in 320ms ease-out ${180 + i * 70}ms both`,
                          transformBox: 'fill-box',
                          transformOrigin: 'center',
                        }}
                      />
                    </g>
                  )
                }),
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-[laurel-in_520ms_cubic-bezier(0.2,0.9,0.3,1.2)_both]">
                <Medal size={120}>
                  <span className="font-display text-[34px] leading-none font-semibold tabular">{formatKg(info.loadKg)}</span>
                  <span className="text-xs font-bold tracking-[0.15em]">KG</span>
                </Medal>
              </div>
            </div>
          </div>

          <div className="flex animate-[rise_500ms_ease-out_700ms_both] flex-col gap-2">
            <h2 className="inscription m-0 text-[28px] font-bold tracking-[0.12em] text-bronze">NOVO RECORDE</h2>
            <p className="m-0 text-lg font-medium">{info.exerciseName}</p>
            <p className="m-0 text-sm text-muted">
              Marco {toRoman(info.mark)} · +{formatKg(Math.round((info.loadKg - info.previousKg) * 100) / 100)} kg sobre o anterior
            </p>
          </div>

          <Button className="w-full max-w-xs animate-[rise_500ms_ease-out_900ms_both]" size="lg" onClick={onClose} autoFocus>
            Glória
          </Button>
        </div>
      )}
    </dialog>
  )
}
