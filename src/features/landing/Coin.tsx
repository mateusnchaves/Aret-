import { useId, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { IconDownload } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form'
import { cn } from '@/lib/cn'
import { toRoman } from '@/lib/glory'
import { Reveal, SectionHead } from './parts'

const MAX = 16
const YEAR = toRoman(new Date().getFullYear())

/** Letras gregas para as maiúsculas latinas que têm par visual; o resto fica como está. */
function inscriptionOf(name: string) {
  const clean = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z ]/g, '')
    .trim()
    .toUpperCase()
    .slice(0, MAX)
  return clean || 'ΑΡΕΤΗ'
}

/** A tetradracma do Areté com uma inscrição livre embaixo e o ano em romano em cima. */
export function CoinArt({ text, className }: { text: string; className?: string }) {
  const id = useId().replace(/:/g, '')
  const size = text.length > 12 ? 10 : text.length > 8 ? 12 : 14
  const spacing = text.length > 12 ? 2 : text.length > 8 ? 3.5 : 5
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={`Moeda do Areté com a inscrição ${text}`}>
      <defs>
        <radialGradient id={`${id}g`} cx="38%" cy="32%" r="78%">
          <stop offset="0" stopColor="#f6e2a0" />
          <stop offset="0.55" stopColor="#cfa64d" />
          <stop offset="1" stopColor="#7f5f22" />
        </radialGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#6e4f18" />
          <stop offset="0.6" stopColor="#c79d45" />
          <stop offset="1" stopColor="#f6e2a0" />
        </linearGradient>
        <path id={`${id}b`} d="M40 112 A61 61 0 0 0 160 112" fill="none" />
        <path id={`${id}t`} d="M52 80 A52 52 0 0 1 148 80" fill="none" />
      </defs>
      <g transform="translate(100 100) scale(1.2) translate(-100 -100)">
        <circle cx="100" cy="100" r="80" fill={`url(#${id}g)`} />
        <circle cx="100" cy="100" r="80" fill="none" stroke="#c4643a" strokeWidth="5" />
        <circle cx="100" cy="100" r="72" fill="none" stroke="#7f5f22" strokeWidth="1.6" strokeDasharray="1.5 4.5" strokeLinecap="round" />
        <g transform="translate(46 34) scale(0.56)">
          <g fill={`url(#${id}r)`} stroke="#5a3f12" strokeWidth="2.6" strokeLinejoin="round">
            <path d="M120 52 C127 60 131 70 132 82 L146 108 L137 112 L139 118 L133 122 L137 127 C137 133 136 137 133 141 C128 146 122 148 117 150 L118 162 C119 172 121 182 124 196 L66 196 C69 182 72 168 72 156 C64 148 58 132 58 112 C58 76 82 48 120 52 Z" />
            <circle cx="76" cy="62" r="11" />
            <circle cx="91" cy="51" r="11" />
            <circle cx="107" cy="48" r="10" />
            <circle cx="64" cy="78" r="11" />
            <circle cx="60" cy="96" r="10" />
            <circle cx="62" cy="113" r="10" />
            <circle cx="68" cy="129" r="9" />
          </g>
          <path d="M122 90 C125 87.5 129.5 87.5 132 90 C129 92 125 92 122 90 Z" fill="#4a3410" />
          <path d="M84 104 C80 108 80 118 86 122 C90 118 90 108 84 104 Z" fill="none" stroke="#5a3f12" strokeWidth="2.4" />
          <g fill="#5e8a52">
            {[
              [64, 94, -62],
              [68, 80, -48],
              [75, 68, -34],
              [85, 59, -18],
              [97, 54, -2],
              [109, 54, 16],
              [119, 59, 34],
            ].map(([cx, cy, r]) => (
              <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx="4.5" ry="10" transform={`rotate(${r} ${cx} ${cy})`} />
            ))}
          </g>
        </g>
        <text fontFamily="Cinzel, 'Times New Roman', serif" fontSize={size} fontWeight="700" letterSpacing={spacing} fill="#5e4413">
          <textPath href={`#${id}b`} startOffset="50%" textAnchor="middle">
            {text}
          </textPath>
        </text>
        <text fontFamily="Cinzel, 'Times New Roman', serif" fontSize="8" fontWeight="700" letterSpacing="3" fill="#6e4f18" opacity="0.85">
          <textPath href={`#${id}t`} startOffset="50%" textAnchor="middle">
            {YEAR}
          </textPath>
        </text>
      </g>
    </svg>
  )
}

const SPARKS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2
  const d = 120 + (i % 3) * 30
  return { sx: `${Math.cos(a) * d}px`, sy: `${Math.sin(a) * d}px`, delay: (i % 4) * 25 }
})

/** "Cunhe sua moeda": o nome da pessoa vira a inscrição da tetradracma. */
export function MintSection() {
  const [name, setName] = useState('')
  const [minted, setMinted] = useState('ΑΡΕΤΗ')
  const [strikes, setStrikes] = useState(0)
  const coinRef = useRef<HTMLDivElement>(null)

  function mint(e: FormEvent) {
    e.preventDefault()
    setMinted(inscriptionOf(name))
    setStrikes((n) => n + 1)
    try {
      navigator.vibrate?.([12, 40, 24])
    } catch {
      // sem vibração
    }
  }

  async function download() {
    const svg = coinRef.current?.querySelector('svg')
    if (!svg) return
    const xml = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1024
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#141210'
    ctx.fillRect(0, 0, 1024, 1024)
    ctx.drawImage(img, 32, 32, 960, 960)
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `arete-${minted.toLowerCase().replace(/\s+/g, '-')}.png`
    a.click()
  }

  return (
    <section id="moeda" className="relative scroll-mt-24 overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-24 md:grid-cols-2 md:px-8 md:py-32">
        <div className="flex flex-col gap-8">
          <SectionHead
            title={
              <>
                Cunhe a sua <span className="text-gold">moeda</span>
              </>
            }
            text="Os atenienses cunhavam a coruja de Atena nas tetradracmas. A sua leva o seu nome. Escreva e bata o martelo."
          />
          <Reveal delay={120}>
            <form onSubmit={mint} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="mint-name" className="sr-only">
                Nome para a moeda
              </label>
              <Input
                id="mint-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                maxLength={MAX}
                autoComplete="given-name"
                className="sm:flex-1"
              />
              <Button type="submit" size="md" className="px-6">
                Cunhar
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
              <Button variant="ghost" size="sm" onClick={download} disabled={strikes === 0}>
                <IconDownload size={17} />
                Baixar a moeda
              </Button>
              <span>Até {MAX} letras. Acentos e números ficam de fora, como numa moeda antiga.</span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={80} className="relative mx-auto flex aspect-square w-full max-w-[380px] items-center justify-center">
          <div aria-hidden="true" className="absolute inset-[6%] rounded-full bg-bronze/25 blur-3xl" />
          {strikes > 0 && (
            <div key={`fx-${strikes}`} aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="absolute size-[70%] animate-[flash_600ms_ease-out_both] rounded-full bg-[radial-gradient(circle,rgb(255_243_196/0.9),transparent_65%)]" />
              {SPARKS.map((s, i) => (
                <span
                  key={i}
                  className="absolute size-2 animate-[spark_700ms_cubic-bezier(0.1,0.7,0.3,1)_both] rounded-full bg-bronze-hi shadow-[0_0_10px_rgba(242,216,140,0.9)]"
                  style={{ '--sx': s.sx, '--sy': s.sy, animationDelay: `${s.delay}ms` } as CSSProperties}
                />
              ))}
            </div>
          )}
          <div
            ref={coinRef}
            key={`coin-${strikes}`}
            className={cn('gold-sheen relative w-[88%] rounded-full', strikes > 0 && 'animate-[strike_650ms_cubic-bezier(0.2,0.9,0.3,1)_both]')}
          >
            <CoinArt text={minted} className="block h-auto w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
          </div>
          <p className="sr-only" aria-live="polite">
            {strikes > 0 ? `Moeda cunhada com a inscrição ${minted}.` : ''}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
