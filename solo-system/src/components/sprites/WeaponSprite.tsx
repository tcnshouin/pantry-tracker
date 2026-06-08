interface Props {
  baseId: string | null
  size: number
  className?: string
}

function RustedBlade({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 80" style={{ filter: 'drop-shadow(0 0 4px #92400e66)' }}>
      <defs>
        <linearGradient id="rusted-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d4d4d4" />
          <stop offset="50%" stopColor="#f5f5f4" />
          <stop offset="100%" stopColor="#a8a29e" />
        </linearGradient>
        <linearGradient id="rusted-rust" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>
      <polygon points="20,4 15,12 14,50 20,56 26,50 25,12" fill="url(#rusted-steel)" stroke="#78716c" strokeWidth="1.5" />
      <polygon points="20,4 20,56 22,50 22,12" fill="#a8a29e" opacity="0.6" />
      <polygon points="16,16 14,18 14,22 16,20" fill="url(#rusted-rust)" opacity="0.8" />
      <polygon points="22,28 25,30 25,34 22,32" fill="url(#rusted-rust)" opacity="0.7" />
      <polygon points="15,38 14,42 16,44 17,40" fill="url(#rusted-rust)" opacity="0.75" />
      <rect x="8" y="44" width="24" height="5" rx="1" fill="#78716c" stroke="#57534e" strokeWidth="1.5" />
      <rect x="10" y="44" width="12" height="5" fill="#57534e" opacity="0.5" />
      <rect x="17" y="49" width="6" height="22" rx="2" fill="#92400e" stroke="#78350f" strokeWidth="1.5" />
      <rect x="17" y="49" width="3" height="22" rx="1" fill="#b45309" opacity="0.5" />
      <path d="M16 55 L17 58 M16 62 L17 65 M16 68 L17 71" stroke="#78350f" strokeWidth="1" opacity="0.6" />
      <rect x="16" y="70" width="8" height="4" rx="2" fill="#57534e" stroke="#44403c" strokeWidth="1" />
    </svg>
  )
}

function HuntersDagger({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 80" style={{ filter: 'drop-shadow(0 0 4px #38bdf866)' }}>
      <defs>
        <linearGradient id="dagger-blade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="dagger-grip" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <polygon points="20,6 15,18 14,40 20,44 26,40 25,18" fill="url(#dagger-blade)" stroke="#64748b" strokeWidth="1.5" />
      <polygon points="20,6 20,44 22,40 22,18" fill="#94a3b8" opacity="0.6" />
      <path d="M14 26 Q18 22 22 26" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.8" />
      <rect x="9" y="38" width="22" height="5" rx="1.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
      <rect x="9" y="38" width="11" height="5" fill="#0284c7" opacity="0.5" />
      <ellipse cx="20" cy="40.5" rx="3" ry="2" fill="#7dd3fc" opacity="0.6" />
      <rect x="17" y="43" width="6" height="20" rx="2" fill="url(#dagger-grip)" stroke="#1e3a8a" strokeWidth="1.5" />
      <rect x="17" y="43" width="3" height="20" rx="1" fill="#1e3a8a" opacity="0.5" />
      <path d="M16 48 L17 50 M16 54 L17 56 M16 60 L17 62" stroke="#1e40af" strokeWidth="1" opacity="0.7" />
      <ellipse cx="20" cy="65" rx="4" ry="3" fill="#1e40af" stroke="#1e3a8a" strokeWidth="1.5" />
      <ellipse cx="20" cy="65" rx="2" ry="1.5" fill="#3b82f6" opacity="0.7" />
    </svg>
  )
}

function ShadowEdge({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 80" style={{ filter: 'drop-shadow(0 0 6px #38bdf8cc)' }}>
      <defs>
        <linearGradient id="shadow-blade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="shadow-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path d="M22 6 Q30 18 30 38 Q28 52 20 58 Q16 44 18 26 Q18 14 22 6 Z" fill="url(#shadow-blade)" stroke="#0ea5e9" strokeWidth="1.5" />
      <path d="M22 6 Q28 20 26 44 Q24 54 20 58 L22 52 Q28 38 26 20 Z" fill="#0ea5e9" opacity="0.25" />
      <path d="M20 20 Q24 24 22 32" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.7" />
      <path d="M20 34 Q24 36 23 42" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M8 52 Q10 44 20 44 Q28 44 28 50 L8 52" fill="#38bdf8" opacity="0.2" />
      <line x1="8" y1="52" x2="28" y2="44" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="52" x2="28" y2="44" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <rect x="17" y="58" width="6" height="18" rx="2" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
      <rect x="17" y="58" width="3" height="18" rx="1" fill="#1e40af" opacity="0.6" />
      <path d="M18 62 L19 64 M18 68 L19 70" stroke="#38bdf8" strokeWidth="1" opacity="0.8" />
      <ellipse cx="22" cy="6" rx="3.5" ry="3.5" fill="#38bdf8" opacity="0.9" />
      <ellipse cx="22" cy="6" rx="2" ry="2" fill="#f0f9ff" opacity="0.8" />
      <ellipse cx="20" cy="76" rx="4" ry="3" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
      <ellipse cx="20" cy="76" rx="2" ry="1.5" fill="#38bdf8" opacity="0.6" />
    </svg>
  )
}

function Unarmed({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 80" style={{ filter: 'drop-shadow(0 0 4px #38bdf844)' }} opacity="0.5">
      <defs>
        <linearGradient id="fist-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcd9bd" />
          <stop offset="100%" stopColor="#f5b993" />
        </linearGradient>
      </defs>
      <rect x="11" y="36" width="18" height="20" rx="5" fill="url(#fist-skin)" stroke="#d4956a" strokeWidth="1.5" />
      <path d="M14 36 Q14 28 18 26 Q22 24 22 28 Q22 24 26 25 Q30 26 28 32 Q30 28 32 30 Q34 32 32 36" fill="url(#fist-skin)" stroke="#d4956a" strokeWidth="1.5" />
      <line x1="15" y1="36" x2="15" y2="56" stroke="#d4956a" strokeWidth="1" opacity="0.4" />
      <line x1="20" y1="36" x2="20" y2="56" stroke="#d4956a" strokeWidth="1" opacity="0.4" />
      <line x1="25" y1="36" x2="25" y2="56" stroke="#d4956a" strokeWidth="1" opacity="0.4" />
      <path d="M14 46 Q10 44 10 48 Q10 52 14 52" fill="url(#fist-skin)" stroke="#d4956a" strokeWidth="1.5" />
      <path d="M11 40 Q6 38 6 42 Q6 44 10 44" fill="url(#fist-skin)" stroke="#d4956a" strokeWidth="1" opacity="0.8" />
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
