interface Props {
  enemyId: string
  size: number
  className?: string
}

function Goblin({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 4px #4ade8066)' }}>
      <defs>
        <linearGradient id="goblin-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ee7a0" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="goblin-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#0f5c2c" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="44" rx="23" ry="21" fill="url(#goblin-skin)" stroke="#166534" strokeWidth="2" />
      <ellipse cx="44" cy="48" rx="7" ry="9" fill="url(#goblin-shade)" opacity="0.45" />
      <polygon points="30,34 19,15 37,30" fill="#4ade80" stroke="#166534" strokeWidth="1.5" />
      <polygon points="70,34 81,15 63,30" fill="#4ade80" stroke="#166534" strokeWidth="1.5" />
      <ellipse cx="40" cy="42" rx="5" ry="5" fill="#fff" stroke="#166534" strokeWidth="1" />
      <ellipse cx="60" cy="42" rx="5" ry="5" fill="#fff" stroke="#166534" strokeWidth="1" />
      <circle cx="41" cy="43" r="2.5" fill="#1a1a1a" />
      <circle cx="61" cy="43" r="2.5" fill="#1a1a1a" />
      <circle cx="42" cy="42" r="0.8" fill="#ffffff" />
      <circle cx="62" cy="42" r="0.8" fill="#ffffff" />
      <path d="M43 54 Q50 58 57 54" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 56 L43 58 M56 56 L57 58" stroke="#166534" strokeWidth="1.5" />
      <ellipse cx="50" cy="60" rx="8" ry="3" fill="#92400e" stroke="#78350f" strokeWidth="1" />
      <path d="M40 65 Q34 72 32 84 Q38 78 44 80 L50 82 L56 80 Q62 78 68 84 Q66 72 60 65 Z" fill="#92400e" stroke="#78350f" strokeWidth="1.5" />
      <path d="M36 70 L30 82" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      <path d="M64 70 L70 82" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="48" x2="80" y2="36" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="74" y="28" width="4" height="12" rx="1" fill="#6b7280" stroke="#374151" strokeWidth="1" />
      <polygon points="76,28 74,24 78,24" fill="#d1d5db" stroke="#374151" strokeWidth="1" />
    </svg>
  )
}

function Imp({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 4px #a855f766)' }}>
      <defs>
        <linearGradient id="imp-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>
        <linearGradient id="imp-wing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6b21a8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#3b0764" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path d="M16 52 Q8 38 18 46 Q22 32 14 26 Q28 28 30 42 Q38 30 50 34 Q62 30 70 42 Q72 28 86 26 Q78 32 82 46 Q92 38 84 52 Q80 64 72 68 Q64 72 50 72 Q36 72 28 68 Q20 64 16 52 Z" fill="url(#imp-wing)" stroke="#4c1d95" strokeWidth="1.5" />
      <ellipse cx="50" cy="38" rx="17" ry="17" fill="url(#imp-body)" stroke="#4c1d95" strokeWidth="2" />
      <ellipse cx="44" cy="42" rx="6" ry="7" fill="#6b21a8" opacity="0.4" />
      <polygon points="40,24 36,12 44,22" fill="#c084fc" stroke="#4c1d95" strokeWidth="1.5" />
      <polygon points="60,24 64,12 56,22" fill="#c084fc" stroke="#4c1d95" strokeWidth="1.5" />
      <ellipse cx="43" cy="36" rx="4.5" ry="5" fill="#fde68a" stroke="#92400e" strokeWidth="1" />
      <ellipse cx="57" cy="36" rx="4.5" ry="5" fill="#fde68a" stroke="#92400e" strokeWidth="1" />
      <ellipse cx="43" cy="37" rx="2.5" ry="3" fill="#1a0a2e" />
      <ellipse cx="57" cy="37" rx="2.5" ry="3" fill="#1a0a2e" />
      <circle cx="43" cy="36" r="0.8" fill="#fffbeb" />
      <circle cx="57" cy="36" r="0.8" fill="#fffbeb" />
      <path d="M44 48 Q50 52 56 48" fill="none" stroke="#4c1d95" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 72 L40 86 Q44 90 46 86 L48 80" stroke="#6b21a8" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M56 72 L60 86 Q56 90 54 86 L52 80" stroke="#6b21a8" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M62 68 Q70 72 68 82 Q64 90 62 96" stroke="#7e22ce" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function Wolf({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 4px #94a3b866)' }}>
      <defs>
        <linearGradient id="wolf-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="wolf-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      <ellipse cx="48" cy="60" rx="30" ry="19" fill="url(#wolf-body)" stroke="#334155" strokeWidth="2" />
      <ellipse cx="60" cy="62" rx="12" ry="8" fill="url(#wolf-dark)" opacity="0.5" />
      <path d="M26 58 Q18 52 20 60 Q22 68 28 64" fill="url(#wolf-body)" stroke="#334155" strokeWidth="1.5" />
      <ellipse cx="75" cy="46" rx="15" ry="13" fill="url(#wolf-body)" stroke="#334155" strokeWidth="2" />
      <ellipse cx="78" cy="50" rx="6" ry="5" fill="url(#wolf-dark)" opacity="0.4" />
      <polygon points="70,37 68,20 76,35" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
      <polygon points="82,37 84,20 76,35" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
      <ellipse cx="80" cy="45" rx="3.5" ry="3" fill="#fde68a" stroke="#92400e" strokeWidth="1" />
      <ellipse cx="80" cy="46" rx="2" ry="2" fill="#1a1a1a" />
      <path d="M70 54 Q75 50 82 52" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M82 56 L87 52 M84 56 L90 54" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M86 58 Q88 54 90 54" stroke="#e2e8f0" strokeWidth="1" fill="none" />
      <line x1="28" y1="76" x2="22" y2="94" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      <line x1="42" y1="78" x2="38" y2="96" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      <line x1="58" y1="78" x2="62" y2="96" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      <line x1="70" y1="76" x2="76" y2="94" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      <path d="M18 58 Q8 52 10 62 Q12 70 20 66 Q24 64 20 58" fill="url(#wolf-dark)" stroke="#334155" strokeWidth="1.5" />
    </svg>
  )
}

function Orc({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 4px #65a30d66)' }}>
      <defs>
        <linearGradient id="orc-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#4d7c0f" />
        </linearGradient>
        <linearGradient id="orc-torso" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#3f6212" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="28" rx="22" ry="20" fill="url(#orc-skin)" stroke="#365314" strokeWidth="2.5" />
      <ellipse cx="56" cy="32" rx="9" ry="10" fill="#4d7c0f" opacity="0.4" />
      <path d="M28 22 Q28 14 34 18" fill="none" stroke="#365314" strokeWidth="3" strokeLinecap="round" />
      <path d="M72 22 Q72 14 66 18" fill="none" stroke="#365314" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="42" cy="26" rx="5.5" ry="5" fill="#fde68a" stroke="#92400e" strokeWidth="1" />
      <ellipse cx="58" cy="26" rx="5.5" ry="5" fill="#fde68a" stroke="#92400e" strokeWidth="1" />
      <circle cx="43" cy="27" r="3" fill="#1a1a1a" />
      <circle cx="59" cy="27" r="3" fill="#1a1a1a" />
      <circle cx="43.8" cy="26.2" r="0.9" fill="#ffffff" />
      <circle cx="59.8" cy="26.2" r="0.9" fill="#ffffff" />
      <path d="M38 20 Q50 16 62 20" fill="none" stroke="#365314" strokeWidth="3" />
      <path d="M44 40 L41 46 M45 44 L43 48" fill="none" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
      <path d="M56 40 L59 46 M55 44 L57 48" fill="none" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
      <rect x="30" y="46" width="40" height="32" rx="5" fill="url(#orc-torso)" stroke="#365314" strokeWidth="2.5" />
      <rect x="30" y="46" width="20" height="16" rx="2" fill="#4d7c0f" opacity="0.4" />
      <path d="M30 52 L16 46" stroke="#365314" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M70 52 L84 46" stroke="#365314" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M16 46 L12 62" stroke="#365314" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M84 46 L88 62" stroke="#365314" strokeWidth="4.5" strokeLinecap="round" />
      <rect x="14" y="38" width="14" height="10" rx="3" fill="#6b7280" stroke="#374151" strokeWidth="2" />
      <path d="M24 38 L20 30 L18 38" fill="#9ca3af" stroke="#374151" strokeWidth="1.5" />
      <line x1="42" y1="78" x2="38" y2="96" stroke="#4d7c0f" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="58" y1="78" x2="62" y2="96" stroke="#4d7c0f" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="88" y1="62" x2="86" y2="78" stroke="#365314" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

function GatekeeperBoss({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 4px #ef444466)' }}>
      <defs>
        <linearGradient id="gate-armor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id="gate-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="22" rx="16" ry="18" fill="url(#gate-armor)" stroke="#7f1d1d" strokeWidth="2.5" />
      <path d="M36 14 Q38 6 50 4 Q62 6 64 14" fill="url(#gate-armor)" stroke="#7f1d1d" strokeWidth="2" />
      <path d="M40 6 L38 2 Q44 4 50 2 Q56 4 62 2 L60 6" fill="#fca5a5" stroke="#7f1d1d" strokeWidth="1.5" />
      <path d="M50 2 L50 10" stroke="#fca5a5" strokeWidth="2" />
      <rect x="36" y="14" width="28" height="6" rx="1" fill="url(#gate-dark)" opacity="0.7" />
      <ellipse cx="43" cy="22" rx="4" ry="3" fill="#fde68a" opacity="0.9" />
      <ellipse cx="57" cy="22" rx="4" ry="3" fill="#fde68a" opacity="0.9" />
      <path d="M42 28 Q50 32 58 28" fill="none" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" />
      <rect x="34" y="38" width="32" height="34" rx="3" fill="url(#gate-armor)" stroke="#7f1d1d" strokeWidth="2.5" />
      <rect x="34" y="38" width="16" height="18" rx="2" fill="url(#gate-dark)" opacity="0.45" />
      <path d="M44 38 L44 72 M50 36 L50 72" stroke="#991b1b" strokeWidth="1" opacity="0.6" />
      <path d="M34 44 L20 38" stroke="#7f1d1d" strokeWidth="4" strokeLinecap="round" />
      <path d="M66 44 L80 38" stroke="#7f1d1d" strokeWidth="4" strokeLinecap="round" />
      <path d="M20 38 L16 54" stroke="#7f1d1d" strokeWidth="4" strokeLinecap="round" />
      <path d="M80 38 L84 54" stroke="#7f1d1d" strokeWidth="4" strokeLinecap="round" />
      <path d="M18 48 Q12 44 14 38 Q16 32 22 36" fill="url(#gate-armor)" stroke="#7f1d1d" strokeWidth="2" />
      <line x1="42" y1="72" x2="38" y2="96" stroke="#991b1b" strokeWidth="4" strokeLinecap="round" />
      <line x1="58" y1="72" x2="62" y2="96" stroke="#991b1b" strokeWidth="4" strokeLinecap="round" />
      <line x1="16" y1="54" x2="14" y2="68" stroke="#7f1d1d" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="84" y1="54" x2="82" y2="36" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
      <rect x="82" y="8" width="5" height="36" rx="1" fill="#d1d5db" stroke="#6b7280" strokeWidth="1.5" />
      <polygon points="84.5,8 81,2 88,2" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1.5" />
      <rect x="78" y="28" width="13" height="4" rx="1" fill="#9ca3af" stroke="#6b7280" strokeWidth="1" />
      <rect x="82" y="44" width="5" height="8" rx="1" fill="#78350f" stroke="#6b7280" strokeWidth="1" />
    </svg>
  )
}

function StoneGolem({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 4px #a8a29e66)' }}>
      <defs>
        <linearGradient id="golem-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d6d3d1" />
          <stop offset="100%" stopColor="#57534e" />
        </linearGradient>
        <linearGradient id="golem-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#78716c" />
          <stop offset="100%" stopColor="#292524" />
        </linearGradient>
        <linearGradient id="golem-core" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect x="28" y="4" width="44" height="34" rx="6" fill="url(#golem-stone)" stroke="#44403c" strokeWidth="3" />
      <rect x="28" y="20" width="22" height="18" rx="3" fill="url(#golem-dark)" opacity="0.4" />
      <path d="M34 10 Q36 6 40 8" fill="none" stroke="#44403c" strokeWidth="1.5" />
      <path d="M52 8 Q56 4 62 8" fill="none" stroke="#44403c" strokeWidth="1.5" />
      <path d="M42 22 Q46 18 50 20" fill="none" stroke="#44403c" strokeWidth="1.5" />
      <ellipse cx="40" cy="20" rx="6" ry="5" fill="#1a1a1a" />
      <ellipse cx="60" cy="20" rx="6" ry="5" fill="#1a1a1a" />
      <ellipse cx="40" cy="20" rx="4" ry="3" fill="#f59e0b" opacity="0.9" />
      <ellipse cx="60" cy="20" rx="4" ry="3" fill="#f59e0b" opacity="0.9" />
      <path d="M42 30 L44 36 M50 30 L50 36 M58 30 L56 36" fill="none" stroke="#78716c" strokeWidth="1.5" />
      <rect x="20" y="38" width="60" height="36" rx="5" fill="url(#golem-stone)" stroke="#44403c" strokeWidth="3.5" />
      <rect x="20" y="52" width="30" height="22" rx="3" fill="url(#golem-dark)" opacity="0.35" />
      <ellipse cx="50" cy="58" rx="9" ry="9" fill="#292524" stroke="#44403c" strokeWidth="2" />
      <ellipse cx="50" cy="58" rx="6" ry="6" fill="url(#golem-core)" />
      <ellipse cx="50" cy="58" rx="3" ry="3" fill="#fffbeb" opacity="0.8" />
      <path d="M28 44 Q24 40 26 44" fill="none" stroke="#44403c" strokeWidth="1.5" />
      <path d="M60 50 Q66 44 64 52" fill="none" stroke="#44403c" strokeWidth="1.5" />
      <path d="M34 64 Q28 58 32 64" fill="none" stroke="#78716c" strokeWidth="1" />
      <path d="M20 50 L4 42" stroke="#44403c" strokeWidth="6" strokeLinecap="round" />
      <path d="M80 50 L96 42" stroke="#44403c" strokeWidth="6" strokeLinecap="round" />
      <rect x="0" y="36" width="12" height="14" rx="3" fill="url(#golem-stone)" stroke="#44403c" strokeWidth="2.5" />
      <rect x="88" y="36" width="12" height="14" rx="3" fill="url(#golem-stone)" stroke="#44403c" strokeWidth="2.5" />
      <path d="M4 50 L2 66" stroke="#44403c" strokeWidth="5" strokeLinecap="round" />
      <path d="M96 50 L98 66" stroke="#44403c" strokeWidth="5" strokeLinecap="round" />
      <rect x="30" y="74" width="16" height="24" rx="4" fill="url(#golem-stone)" stroke="#44403c" strokeWidth="3" />
      <rect x="54" y="74" width="16" height="24" rx="4" fill="url(#golem-stone)" stroke="#44403c" strokeWidth="3" />
      <path d="M34 80 Q36 76 38 80" fill="none" stroke="#78716c" strokeWidth="1.5" />
      <path d="M58 82 Q60 78 62 82" fill="none" stroke="#78716c" strokeWidth="1.5" />
    </svg>
  )
}

function Wraith({ size }: { size: number }) {
  const c = '#ef4444'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 4px #ef444466)' }}>
      <defs>
        <linearGradient id="wraith-robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <path d="M50 8 Q72 8 74 34 Q74 60 82 82 Q72 74 62 80 Q50 86 38 80 Q28 74 18 82 Q26 60 26 34 Q28 8 50 8 Z" fill="url(#wraith-robe)" stroke="#7f1d1d" strokeWidth="2.5" />
      <path d="M32 60 Q28 68 22 80 Q26 74 32 76 Q38 78 44 76" fill="#7f1d1d" opacity="0.5" />
      <ellipse cx="50" cy="28" rx="14" ry="14" fill="#1a0000" stroke="#7f1d1d" strokeWidth="2" />
      <ellipse cx="43" cy="28" rx="4.5" ry="4" fill="#ef4444" opacity="0.95" />
      <ellipse cx="57" cy="28" rx="4.5" ry="4" fill="#ef4444" opacity="0.95" />
      <ellipse cx="43" cy="28" rx="2.5" ry="2.5" fill="#ffffff" opacity="0.6" />
      <ellipse cx="57" cy="28" rx="2.5" ry="2.5" fill="#ffffff" opacity="0.6" />
      <path d="M44 38 Q50 42 56 38" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M28 52 Q20 48 22 58 Q24 66 30 62" fill="#7f1d1d" opacity="0.6" stroke="#7f1d1d" strokeWidth="1" />
      <path d="M72 52 Q80 48 78 58 Q76 66 70 62" fill="#7f1d1d" opacity="0.6" stroke="#7f1d1d" strokeWidth="1" />
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
