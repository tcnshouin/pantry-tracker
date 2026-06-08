interface Props {
  baseId: string | null
  size: number
  className?: string
}

function RustedBlade({ size }: { size: number }) {
  const c = '#38bdf8'
  return (
    <svg width={size} height={size} viewBox="0 0 40 80" style={{ filter: 'drop-shadow(0 0 4px #38bdf888)' }}>
      <line x1="20" y1="4" x2="20" y2="58" stroke={c} strokeWidth="3.5" />
      <polygon points="14,10 20,4 26,10 20,56" fill="none" stroke={c} strokeWidth="2.5" />
      <line x1="10" y1="44" x2="30" y2="44" stroke={c} strokeWidth="3" />
      <line x1="18" y1="62" x2="22" y2="62" stroke={c} strokeWidth="2" />
      <rect x="17" y="58" width="6" height="16" rx="2" fill="none" stroke={c} strokeWidth="2.5" />
    </svg>
  )
}

function HuntersDagger({ size }: { size: number }) {
  const c = '#38bdf8'
  return (
    <svg width={size} height={size} viewBox="0 0 40 80" style={{ filter: 'drop-shadow(0 0 4px #38bdf888)' }}>
      <polygon points="20,6 26,26 20,42 14,26" fill="none" stroke={c} strokeWidth="2.5" />
      <line x1="12" y1="38" x2="28" y2="38" stroke={c} strokeWidth="3" />
      <rect x="17" y="42" width="6" height="18" rx="2" fill="none" stroke={c} strokeWidth="2.5" />
      <circle cx="20" cy="62" r="3" fill="none" stroke={c} strokeWidth="2" />
    </svg>
  )
}

function ShadowEdge({ size }: { size: number }) {
  const c = '#38bdf8'
  return (
    <svg width={size} height={size} viewBox="0 0 40 80" style={{ filter: 'drop-shadow(0 0 6px #38bdf8cc)' }}>
      <path d="M22 6 Q30 20 28 40 Q26 54 20 58 Q16 44 18 28 Q18 14 22 6 Z" fill="none" stroke={c} strokeWidth="2.5" />
      <path d="M22 6 Q34 22 32 44 Q30 58 20 58" fill="none" stroke={c} strokeWidth="1.5" opacity="0.5" />
      <line x1="10" y1="50" x2="28" y2="42" stroke={c} strokeWidth="3" />
      <rect x="17" y="58" width="6" height="18" rx="2" fill="none" stroke={c} strokeWidth="2.5" />
      <ellipse cx="20" cy="6" rx="3" ry="3" fill={c} opacity="0.7" />
    </svg>
  )
}

function Unarmed({ size }: { size: number }) {
  const c = '#38bdf8'
  return (
    <svg width={size} height={size} viewBox="0 0 40 80" style={{ filter: 'drop-shadow(0 0 4px #38bdf844)' }} opacity="0.5">
      <path d="M14 38 Q10 30 14 22 Q18 16 20 14 Q22 16 26 22 Q30 30 26 38" fill="none" stroke={c} strokeWidth="2.5" />
      <rect x="12" y="38" width="16" height="18" rx="4" fill="none" stroke={c} strokeWidth="2.5" />
      <line x1="16" y1="38" x2="16" y2="56" stroke={c} strokeWidth="1.5" opacity="0.5" />
      <line x1="20" y1="38" x2="20" y2="56" stroke={c} strokeWidth="1.5" opacity="0.5" />
      <line x1="24" y1="38" x2="24" y2="56" stroke={c} strokeWidth="1.5" opacity="0.5" />
    </svg>
  )
}

export function WeaponSprite({ baseId, size, className }: Props) {
  switch (baseId) {
    case 'rusted-blade':
      return <span className={className}><RustedBlade size={size} /></span>
    case 'hunters-dagger':
      return <span className={className}><HuntersDagger size={size} /></span>
    case 'shadow-edge':
      return <span className={className}><ShadowEdge size={size} /></span>
    default:
      return <span className={className}><Unarmed size={size} /></span>
  }
}
