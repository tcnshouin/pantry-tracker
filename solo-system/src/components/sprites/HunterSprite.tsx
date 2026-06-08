import { WeaponSprite } from './WeaponSprite'

interface Props {
  size: number
  weaponBaseId?: string | null
  className?: string
}

export function HunterSprite({ size, weaponBaseId, className }: Props) {
  const c = '#38bdf8'
  const weaponSize = Math.round(size * 0.5)
  return (
    <span className={className} style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 6px #38bdf888)' }}>
        <ellipse cx="50" cy="18" rx="14" ry="14" fill="none" stroke={c} strokeWidth="3" />
        <circle cx="44" cy="17" r="2" fill={c} />
        <circle cx="56" cy="17" r="2" fill={c} />
        <path d="M44 24 Q50 28 56 24" fill="none" stroke={c} strokeWidth="2" />
        <path d="M38 32 Q34 42 32 60 Q36 72 44 76 Q50 78 56 76 Q64 72 68 60 Q66 42 62 32 Z" fill="none" stroke={c} strokeWidth="3" />
        <line x1="38" y1="38" x2="20" y2="52" stroke={c} strokeWidth="3" />
        <line x1="62" y1="38" x2="80" y2="52" stroke={c} strokeWidth="3" />
        <line x1="20" y1="52" x2="16" y2="66" stroke={c} strokeWidth="3" />
        <line x1="80" y1="52" x2="84" y2="66" stroke={c} strokeWidth="3" />
        <line x1="44" y1="76" x2="40" y2="96" stroke={c} strokeWidth="3" />
        <line x1="56" y1="76" x2="60" y2="96" stroke={c} strokeWidth="3" />
      </svg>
      <span style={{ position: 'absolute', top: Math.round(size * 0.44), left: Math.round(size * 0.72), display: 'block' }}>
        <WeaponSprite baseId={weaponBaseId ?? null} size={weaponSize} />
      </span>
    </span>
  )
}
