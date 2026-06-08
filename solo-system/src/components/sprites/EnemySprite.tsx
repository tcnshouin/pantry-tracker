interface Props {
  enemyId: string
  size: number
  className?: string
}

function Goblin({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 6px #4ade8088)' }}>
      <ellipse cx="50" cy="40" rx="22" ry="20" fill="none" stroke="#4ade80" strokeWidth="3" />
      <polygon points="30,30 18,14 36,26" fill="#4ade80" opacity="0.8" />
      <polygon points="70,30 82,14 64,26" fill="#4ade80" opacity="0.8" />
      <circle cx="42" cy="40" r="3" fill="#4ade80" />
      <circle cx="58" cy="40" r="3" fill="#4ade80" />
      <path d="M38 58 Q50 90 62 58" fill="none" stroke="#4ade80" strokeWidth="3" />
      <line x1="40" y1="70" x2="30" y2="90" stroke="#4ade80" strokeWidth="3" />
      <line x1="60" y1="70" x2="70" y2="90" stroke="#4ade80" strokeWidth="3" />
    </svg>
  )
}

function Imp({ size }: { size: number }) {
  const c = '#a855f7'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 6px #a855f788)' }}>
      <ellipse cx="50" cy="38" rx="16" ry="16" fill="none" stroke={c} strokeWidth="3" />
      <polygon points="34,28 20,12 38,30" fill={c} opacity="0.85" />
      <polygon points="66,28 80,12 62,30" fill={c} opacity="0.85" />
      <circle cx="44" cy="37" r="2.5" fill={c} />
      <circle cx="56" cy="37" r="2.5" fill={c} />
      <path d="M44 46 Q50 52 56 46" fill="none" stroke={c} strokeWidth="2.5" />
      <path d="M26 52 Q14 38 22 58 Q30 72 50 68 Q70 72 78 58 Q86 38 74 52" fill="none" stroke={c} strokeWidth="2.5" />
      <line x1="46" y1="68" x2="42" y2="88" stroke={c} strokeWidth="2.5" />
      <line x1="54" y1="68" x2="58" y2="88" stroke={c} strokeWidth="2.5" />
    </svg>
  )
}

function Wolf({ size }: { size: number }) {
  const c = '#94a3b8'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 6px #94a3b888)' }}>
      <ellipse cx="50" cy="58" rx="28" ry="18" fill="none" stroke={c} strokeWidth="3" />
      <ellipse cx="76" cy="45" rx="14" ry="12" fill="none" stroke={c} strokeWidth="3" />
      <polygon points="70,36 68,20 76,34" fill={c} opacity="0.8" />
      <polygon points="82,36 84,20 76,34" fill={c} opacity="0.8" />
      <circle cx="80" cy="46" r="2.5" fill={c} />
      <path d="M72 55 Q76 52 82 53" fill="none" stroke={c} strokeWidth="2" />
      <line x1="30" y1="74" x2="24" y2="92" stroke={c} strokeWidth="3" />
      <line x1="44" y1="76" x2="40" y2="94" stroke={c} strokeWidth="3" />
      <line x1="56" y1="76" x2="60" y2="94" stroke={c} strokeWidth="3" />
      <line x1="70" y1="74" x2="76" y2="92" stroke={c} strokeWidth="3" />
      <path d="M22 58 Q10 52 14 64 Q18 72 26 66" fill="none" stroke={c} strokeWidth="2.5" />
    </svg>
  )
}

function Orc({ size }: { size: number }) {
  const c = '#65a30d'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 6px #65a30d88)' }}>
      <ellipse cx="50" cy="30" rx="20" ry="18" fill="none" stroke={c} strokeWidth="3.5" />
      <circle cx="42" cy="30" r="3" fill={c} />
      <circle cx="58" cy="30" r="3" fill={c} />
      <path d="M44 40 L42 50 M56 40 L58 50" stroke={c} strokeWidth="2.5" fill="none" />
      <rect x="32" y="46" width="36" height="30" rx="4" fill="none" stroke={c} strokeWidth="3.5" />
      <line x1="32" y1="58" x2="14" y2="48" stroke={c} strokeWidth="4" />
      <line x1="68" y1="58" x2="86" y2="48" stroke={c} strokeWidth="4" />
      <line x1="14" y1="48" x2="10" y2="62" stroke={c} strokeWidth="4" />
      <line x1="86" y1="48" x2="90" y2="62" stroke={c} strokeWidth="4" />
      <line x1="40" y1="76" x2="36" y2="96" stroke={c} strokeWidth="4" />
      <line x1="60" y1="76" x2="64" y2="96" stroke={c} strokeWidth="4" />
    </svg>
  )
}

function GatekeeperBoss({ size }: { size: number }) {
  const c = '#ef4444'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 8px #ef444488)' }}>
      <polygon points="50,2 58,18 76,18 62,30 68,48 50,38 32,48 38,30 24,18 42,18" fill="none" stroke={c} strokeWidth="2.5" opacity="0.9" />
      <ellipse cx="50" cy="30" rx="14" ry="14" fill="none" stroke={c} strokeWidth="3" />
      <circle cx="44" cy="29" r="2.5" fill={c} />
      <circle cx="56" cy="29" r="2.5" fill={c} />
      <rect x="38" y="44" width="24" height="28" rx="2" fill="none" stroke={c} strokeWidth="3" />
      <line x1="38" y1="54" x2="22" y2="44" stroke={c} strokeWidth="3.5" />
      <line x1="62" y1="54" x2="78" y2="44" stroke={c} strokeWidth="3.5" />
      <line x1="22" y1="44" x2="18" y2="60" stroke={c} strokeWidth="3.5" />
      <line x1="78" y1="44" x2="82" y2="60" stroke={c} strokeWidth="3.5" />
      <line x1="44" y1="72" x2="40" y2="96" stroke={c} strokeWidth="3.5" />
      <line x1="56" y1="72" x2="60" y2="96" stroke={c} strokeWidth="3.5" />
    </svg>
  )
}

function StoneGolem({ size }: { size: number }) {
  const c = '#ef4444'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 8px #ef444488)' }}>
      <rect x="30" y="6" width="40" height="32" rx="4" fill="none" stroke={c} strokeWidth="4" />
      <circle cx="42" cy="22" r="4" fill={c} opacity="0.9" />
      <circle cx="58" cy="22" r="4" fill={c} opacity="0.9" />
      <line x1="42" y1="30" x2="58" y2="30" stroke={c} strokeWidth="3" />
      <rect x="22" y="38" width="56" height="36" rx="3" fill="none" stroke={c} strokeWidth="4" />
      <line x1="22" y1="52" x2="4" y2="46" stroke={c} strokeWidth="5" />
      <line x1="78" y1="52" x2="96" y2="46" stroke={c} strokeWidth="5" />
      <line x1="4" y1="46" x2="2" y2="64" stroke={c} strokeWidth="5" />
      <line x1="96" y1="46" x2="98" y2="64" stroke={c} strokeWidth="5" />
      <rect x="34" y="74" width="12" height="24" rx="2" fill="none" stroke={c} strokeWidth="4" />
      <rect x="54" y="74" width="12" height="24" rx="2" fill="none" stroke={c} strokeWidth="4" />
    </svg>
  )
}

function Wraith({ size }: { size: number }) {
  const c = '#ef4444'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 6px #ef444488)' }}>
      <path d="M50 10 Q72 10 72 35 Q72 60 80 80 Q70 72 60 78 Q50 84 40 78 Q30 72 20 80 Q28 60 28 35 Q28 10 50 10 Z" fill="none" stroke={c} strokeWidth="3" />
      <circle cx="42" cy="36" r="3.5" fill={c} />
      <circle cx="58" cy="36" r="3.5" fill={c} />
      <path d="M42 50 Q50 56 58 50" fill="none" stroke={c} strokeWidth="2.5" />
    </svg>
  )
}

export function EnemySprite({ enemyId, size, className }: Props) {
  switch (enemyId) {
    case 'goblin':
      return <span className={className}><Goblin size={size} /></span>
    case 'imp':
      return <span className={className}><Imp size={size} /></span>
    case 'wolf':
      return <span className={className}><Wolf size={size} /></span>
    case 'orc':
      return <span className={className}><Orc size={size} /></span>
    case 'gate_e_boss':
      return <span className={className}><GatekeeperBoss size={size} /></span>
    case 'gate_d_boss':
      return <span className={className}><StoneGolem size={size} /></span>
    default:
      return <span className={className}><Wraith size={size} /></span>
  }
}
