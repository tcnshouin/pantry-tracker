import { WeaponSprite } from './WeaponSprite'

interface Props {
  size: number
  weaponBaseId?: string | null
  className?: string
}

export function HunterSprite({ size, weaponBaseId, className }: Props) {
  const weaponSize = Math.round(size * 0.5)
  return (
    <span className={className} style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 6px #38bdf866)' }}>
        <defs>
          <linearGradient id="hunter-hair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#0c0a09" />
          </linearGradient>
          <linearGradient id="hunter-jacket" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="hunter-jacket-shade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="hunter-skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fcd9bd" />
            <stop offset="100%" stopColor="#f5b993" />
          </linearGradient>
          <linearGradient id="hunter-pants" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#0c0a09" />
          </linearGradient>
        </defs>

        <path d="M36 16 Q34 8 40 6 Q44 2 50 4 Q58 2 62 6 Q68 8 66 16 Q64 18 60 14 Q58 10 50 10 Q42 10 40 14 Z" fill="url(#hunter-hair)" />
        <path d="M36 16 Q32 12 34 20 Q34 14 36 16" fill="#0c0a09" />
        <path d="M64 16 Q68 12 66 20 Q66 14 64 16" fill="#0c0a09" />
        <path d="M38 12 Q36 8 40 6 Q34 10 38 12" fill="#1c1917" />
        <path d="M62 12 Q64 8 60 6 Q66 10 62 12" fill="#1c1917" />

        <ellipse cx="50" cy="20" rx="14" ry="14" fill="url(#hunter-skin)" stroke="#d4956a" strokeWidth="1.5" />
        <ellipse cx="54" cy="23" rx="5" ry="6" fill="#f5b993" opacity="0.4" />

        <path d="M38 14 Q36 18 36 22 Q38 16 40 16 Q44 10 50 10 Q56 10 60 14 Q62 16 64 22 Q64 18 62 14" fill="url(#hunter-hair)" />

        <ellipse cx="44" cy="19" rx="4" ry="3.5" fill="#fef3c7" stroke="#d4956a" strokeWidth="0.5" />
        <ellipse cx="56" cy="19" rx="4" ry="3.5" fill="#fef3c7" stroke="#d4956a" strokeWidth="0.5" />
        <ellipse cx="44" cy="19" rx="2.5" ry="2" fill="#1c1917" />
        <ellipse cx="56" cy="19" rx="2.5" ry="2" fill="#1c1917" />
        <circle cx="44.8" cy="18.4" r="0.7" fill="#ffffff" />
        <circle cx="56.8" cy="18.4" r="0.7" fill="#ffffff" />
        <path d="M41 15 Q44 13 47 15" fill="none" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M53 15 Q56 13 59 15" fill="none" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M45 26 Q50 29 55 26" fill="none" stroke="#d4956a" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M38 22 Q36 20 36 24" fill="none" stroke="#d4956a" strokeWidth="1" />
        <path d="M62 22 Q64 20 64 24" fill="none" stroke="#d4956a" strokeWidth="1" />

        <path d="M36 32 Q32 42 32 58 Q34 70 42 74 Q50 78 58 74 Q66 70 68 58 Q68 42 64 32 Z" fill="url(#hunter-jacket)" stroke="#1e40af" strokeWidth="2" />
        <path d="M50 32 L50 74" stroke="#1e40af" strokeWidth="1.5" opacity="0.6" />
        <path d="M36 32 Q40 36 50 34 Q60 36 64 32" fill="url(#hunter-jacket)" stroke="#1e40af" strokeWidth="1.5" />
        <path d="M36 32 Q38 44 36 58 Q34 52 32 42 Q34 36 36 32" fill="url(#hunter-jacket-shade)" opacity="0.7" />
        <path d="M64 32 Q62 44 64 58 Q66 52 68 42 Q66 36 64 32" fill="#1e3a8a" opacity="0.6" />
        <path d="M46 32 Q44 36 44 44 Q46 50 50 52 Q54 50 56 44 Q56 36 54 32" fill="#1d4ed8" stroke="#1e40af" strokeWidth="1" />
        <rect x="36" y="32" width="14" height="8" rx="2" fill="#1e3a8a" opacity="0.5" />
        <path d="M36 34 Q32 36 30 32 Q28 30 32 28 Q36 28 36 32" fill="#1e3a8a" stroke="#1e40af" strokeWidth="1" />

        <path d="M36 38 L18 50" stroke="#1e40af" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M64 38 L82 50" stroke="#1e40af" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M18 50 L16 64" stroke="#1e40af" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M82 50 L84 64" stroke="#1e40af" strokeWidth="3.5" strokeLinecap="round" />
        <ellipse cx="16" cy="58" rx="5" ry="7" fill="url(#hunter-skin)" stroke="#d4956a" strokeWidth="1.5" />
        <ellipse cx="84" cy="58" rx="5" ry="7" fill="url(#hunter-skin)" stroke="#d4956a" strokeWidth="1.5" />

        <path d="M38 74 Q34 84 32 96" stroke="url(#hunter-pants)" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M62 74 Q66 84 68 96" stroke="url(#hunter-pants)" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M30 94 Q32 98 40 96" fill="#292524" stroke="#0c0a09" strokeWidth="1.5" />
        <path d="M66 94 Q68 98 76 96" fill="#292524" stroke="#0c0a09" strokeWidth="1.5" />
      </svg>
      <span style={{ position: 'absolute', top: Math.round(size * 0.44), left: Math.round(size * 0.72), display: 'block' }}>
        <WeaponSprite baseId={weaponBaseId ?? null} size={weaponSize} />
      </span>
    </span>
  )
}
