import { useState } from 'react'
import { useSystemStore } from '../store/useSystemStore'
import { SystemWindow } from '../components/SystemWindow'
import { ItemCard } from '../components/ItemCard'
import { enhanceCost } from '../domain/items/enhance'
import type { ItemSlot } from '../domain/items/types'

const SLOTS: ItemSlot[] = ['weapon', 'armor', 'accessory']

export function InventoryScreen() {
  const save = useSystemStore(s => s.save)
  const equipItem = useSystemStore(s => s.equipItem)
  const unequipItem = useSystemStore(s => s.unequipItem)
  const enhanceItem = useSystemStore(s => s.enhanceItem)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedItem = save.inventory.find(i => i.id === selectedId) ?? null

  function handleSelect(id: string) {
    setSelectedId(prev => (prev === id ? null : id))
  }

  function handleEquip() {
    if (!selectedId) return
    equipItem(selectedId)
    setSelectedId(null)
  }

  return (
    <div className="min-h-screen bg-system-bg px-4 pt-6 pb-24 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-[0.25em] text-system-glow/60 uppercase">
          ▣ INVENTORY
        </p>
        <span className="font-mono text-sm font-bold text-amber-400 tracking-widest">
          {save.player.currency} G
        </span>
      </div>

      <SystemWindow title="EQUIPMENT">
        <div className="space-y-2">
          {SLOTS.map(slot => {
            const equipped = save.equipment[slot]
            return (
              <div key={slot} className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-widest uppercase text-slate-500 w-20 shrink-0">
                  {slot}
                </span>
                {equipped ? (
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1">
                      <ItemCard item={equipped} />
                    </div>
                    <button
                      onClick={() => unequipItem(slot)}
                      className="font-mono text-[10px] tracking-widest uppercase text-system-danger border border-system-danger/40 rounded px-2 py-1.5 hover:bg-system-danger/10 hover:border-system-danger active:scale-95 transition-all shrink-0"
                    >
                      UNEQUIP
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 border border-dashed border-slate-700 rounded px-3 py-2">
                    <span className="font-mono text-[10px] tracking-widest text-slate-600 uppercase">
                      EMPTY
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </SystemWindow>

      {selectedItem && (
        <SystemWindow title="SELECTED ITEM">
          <div className="space-y-3">
            <ItemCard item={selectedItem} />
            <div className="flex gap-2">
              <button
                onClick={handleEquip}
                className="flex-1 min-h-[48px] font-mono text-xs tracking-widest uppercase font-bold rounded border border-system-glow text-system-glow hover:bg-system-glow/10 active:scale-95 transition-all"
              >
                EQUIP
              </button>
              <button
                onClick={() => enhanceItem(selectedItem.id)}
                disabled={save.player.currency < enhanceCost(selectedItem)}
                className={`flex-1 min-h-[48px] font-mono text-xs tracking-widest uppercase font-bold rounded border transition-all ${
                  save.player.currency >= enhanceCost(selectedItem)
                    ? 'border-amber-500 text-amber-400 hover:bg-amber-500/10 active:scale-95'
                    : 'border-slate-700 text-slate-600 cursor-not-allowed'
                }`}
              >
                ENHANCE ({enhanceCost(selectedItem)} G)
              </button>
            </div>
          </div>
        </SystemWindow>
      )}

      <SystemWindow title="ITEMS">
        {save.inventory.length === 0 ? (
          <p className="font-mono text-xs text-slate-500 text-center py-4 tracking-wider">
            No items yet. Clear Gates to find loot.
          </p>
        ) : (
          <div className="space-y-2">
            {save.inventory.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                selected={item.id === selectedId}
                onClick={() => handleSelect(item.id)}
              />
            ))}
          </div>
        )}
      </SystemWindow>
    </div>
  )
}
