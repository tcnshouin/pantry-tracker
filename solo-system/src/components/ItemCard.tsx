import type { Item, Rarity, BonusKind } from '../domain/items/types'
import { FRACTIONAL_BONUSES } from '../domain/items/types'

interface Props {
  item: Item
  selected?: boolean
  onClick?: () => void
}

const rarityColor: Record<Rarity, string> = {
  common: 'text-slate-400 border-slate-500',
  uncommon: 'text-green-400 border-green-600',
  rare: 'text-cyan-400 border-cyan-600',
  epic: 'text-purple-400 border-purple-600',
  legendary: 'text-amber-400 border-amber-500',
}

const rarityBg: Record<Rarity, string> = {
  common: 'bg-slate-500/10',
  uncommon: 'bg-green-500/10',
  rare: 'bg-cyan-500/10',
  epic: 'bg-purple-500/10',
  legendary: 'bg-amber-500/10',
}

const bonusLabel: Record<BonusKind, string> = {
  attack: 'ATK',
  maxHP: 'HP',
  defense: 'DEF',
  critChance: 'CRIT',
  skillPowerMult: 'SKILL',
  expMult: 'EXP',
  statXpMult: 'STAT-XP',
}

function formatBonus(kind: BonusKind, value: number): string {
  const label = bonusLabel[kind]
  if (FRACTIONAL_BONUSES.includes(kind)) {
    return `${label} +${Math.round(value * 100)}%`
  }
  return `${label} +${value}`
}

export function ItemCard({ item, selected = false, onClick }: Props) {
  const colorClass = rarityColor[item.rarity]
  const bgClass = rarityBg[item.rarity]

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className={`font-mono text-sm font-bold leading-snug ${colorClass.split(' ')[0]}`}>
          {item.name}
          {item.enhanceLevel > 0 && (
            <span className="ml-1 text-xs text-slate-300">+{item.enhanceLevel}</span>
          )}
        </span>
        <span className="font-mono text-[9px] tracking-widest uppercase text-slate-500 shrink-0">
          {item.slot}
        </span>
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {item.bonuses.map((b, i) => (
          <span
            key={i}
            className="font-mono text-[10px] tracking-wider text-slate-300 bg-slate-700/50 rounded px-1.5 py-0.5"
          >
            {formatBonus(b.kind, b.value)}
          </span>
        ))}
      </div>
    </>
  )

  const base = `rounded border px-3 py-2 transition-all w-full text-left ${colorClass.split(' ')[1]} ${bgClass}`
  const selectedCls = selected ? 'ring-1 ring-system-glow bg-system-glow/5' : ''

  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} ${selectedCls} hover:brightness-110 active:scale-[0.98] cursor-pointer`}>
        {inner}
      </button>
    )
  }

  return (
    <div className={`${base} ${selectedCls}`}>
      {inner}
    </div>
  )
}
