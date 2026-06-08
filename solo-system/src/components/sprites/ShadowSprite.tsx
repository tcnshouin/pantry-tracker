interface Props {
  size: number
  className?: string
}

export function ShadowSprite({ size, className }: Props) {
  const c = '#a78bfa'
  return (
    <span className={className}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 8px #a78bfa66)' }}>
        <path d="M50 4 Q72 4 72 28 Q72 20 82 18 Q76 28 78 36 Q82 30 88 30 Q82 42 80 52 Q84 50 86 54 Q78 60 74 68 Q72 80 64 88 Q56 94 50 94 Q44 94 36 88 Q28 80 26 68 Q22 60 14 54 Q16 50 20 52 Q18 42 12 30 Q18 30 22 36 Q24 28 18 18 Q28 20 28 28 Q28 4 50 4 Z" fill="none" stroke={c} strokeWidth="2.5" />
        <ellipse cx="42" cy="40" rx="4" ry="4" fill={c} opacity="0.9" />
        <ellipse cx="58" cy="40" rx="4" ry="4" fill={c} opacity="0.9" />
        <path d="M40 54 Q50 50 60 54" fill="none" stroke={c} strokeWidth="2" opacity="0.6" />
      </svg>
    </span>
  )
}
