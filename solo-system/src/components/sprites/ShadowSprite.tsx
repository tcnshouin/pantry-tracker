interface Props {
  size: number
  className?: string
}

export function ShadowSprite({ size, className }: Props) {
  return (
    <span className={className}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 8px #a78bfa66)' }}>
        <defs>
          <linearGradient id="shadow-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0c0a1d" />
          </linearGradient>
          <linearGradient id="shadow-hood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="shadow-cloak" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#09090b" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        <path d="M50 4 Q64 2 70 12 Q76 22 74 30 Q78 22 86 20 Q80 30 80 38 Q84 32 90 34 Q84 44 82 54 Q86 52 88 56 Q80 64 76 72 Q74 82 66 90 Q56 96 50 96 Q44 96 34 90 Q26 82 24 72 Q20 64 12 56 Q14 52 18 54 Q16 44 10 34 Q16 32 20 38 Q20 30 14 20 Q22 22 26 30 Q24 22 30 12 Q36 2 50 4 Z" fill="url(#shadow-cloak)" stroke="#4c1d95" strokeWidth="2" />

        <ellipse cx="50" cy="22" rx="16" ry="17" fill="url(#shadow-hood)" stroke="#4c1d95" strokeWidth="2" />
        <path d="M34 18 Q36 8 50 6 Q64 8 66 18 Q64 12 58 10 Q54 8 50 8 Q46 8 42 10 Q36 12 34 18 Z" fill="#312e81" />
        <path d="M34 18 Q32 14 36 12 Q34 16 36 20" fill="#1e1b4b" opacity="0.8" />
        <path d="M66 18 Q68 14 64 12 Q66 16 64 20" fill="#1e1b4b" opacity="0.8" />

        <ellipse cx="41" cy="24" rx="6" ry="4.5" fill="#0c0a1d" />
        <ellipse cx="59" cy="24" rx="6" ry="4.5" fill="#0c0a1d" />
        <ellipse cx="41" cy="24" rx="4" ry="3" fill="#a78bfa" opacity="0.95" />
        <ellipse cx="59" cy="24" rx="4" ry="3" fill="#a78bfa" opacity="0.95" />
        <ellipse cx="41" cy="24" rx="2" ry="1.5" fill="#ede9fe" opacity="0.8" />
        <ellipse cx="59" cy="24" rx="2" ry="1.5" fill="#ede9fe" opacity="0.8" />
        <circle cx="40.5" cy="23.5" r="0.6" fill="#ffffff" />
        <circle cx="58.5" cy="23.5" r="0.6" fill="#ffffff" />

        <path d="M38 36 Q34 46 32 60 Q34 72 42 76 Q50 78 58 76 Q66 72 68 60 Q66 46 62 36 Z" fill="url(#shadow-body)" stroke="#4c1d95" strokeWidth="1.5" />
        <path d="M38 36 Q36 46 36 60 Q36 50 34 40 Q36 38 38 36" fill="#312e81" opacity="0.5" />

        <path d="M38 42 L20 54" stroke="#4c1d95" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M62 42 L80 54" stroke="#4c1d95" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M20 54 L18 68" stroke="#4c1d95" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M80 54 L82 68" stroke="#4c1d95" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M18 62 Q14 60 16 68 Q18 74 22 70" fill="#1e1b4b" stroke="#4c1d95" strokeWidth="1" />
        <path d="M82 62 Q86 60 84 68 Q82 74 78 70" fill="#1e1b4b" stroke="#4c1d95" strokeWidth="1" />

        <path d="M40 76 Q36 86 34 96" stroke="#1e1b4b" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M60 76 Q64 86 66 96" stroke="#1e1b4b" strokeWidth="7" strokeLinecap="round" fill="none" />

        <path d="M26 68 Q22 72 24 78 Q26 82 32 78 Q28 80 28 74" fill="#312e81" opacity="0.4" />
        <path d="M74 68 Q78 72 76 78 Q74 82 68 78 Q72 80 72 74" fill="#312e81" opacity="0.4" />

        <path d="M30 60 Q26 64 28 72 Q30 78 36 74" fill="#4c1d95" opacity="0.2" />
        <path d="M70 60 Q74 64 72 72 Q70 78 64 74" fill="#4c1d95" opacity="0.2" />
      </svg>
    </span>
  )
}
