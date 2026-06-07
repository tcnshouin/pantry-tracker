import type { Shadow } from '../domain/shadows/types'

interface Props {
  shadow: Shadow
  deployed: boolean
  onClick?: () => void
  disabled?: boolean
}

export function ShadowCard({ shadow, deployed, onClick, disabled }: Props) {
  const borderCls = deployed
    ? 'border-system-glow shadow-glow'
    : 'border-slate-700'

  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-bold text-system-glow leading-snug">
          {shadow.name}
        </span>
        {deployed && (
          <span className="font-mono text-[10px] tracking-widest uppercase text-system-glow bg-system-glow/15 border border-system-glow/40 rounded px-1.5 py-0.5">
            DEPLOYED
          </span>
        )}
      </div>
      <div className="mt-1">
        <span className="font-mono text-xs tracking-wider text-slate-400">
          PWR {shadow.power}
        </span>
      </div>
    </>
  )

  const base = `rounded border px-3 py-2 w-full text-left transition-all bg-system-panel ${borderCls}`

  if (onClick) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${base} hover:brightness-110 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {inner}
      </button>
    )
  }

  return <div className={base}>{inner}</div>
}
