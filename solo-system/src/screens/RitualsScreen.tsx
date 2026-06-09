import { useState } from 'react'
import { useSystemStore } from '../store/useSystemStore'
import { SystemWindow } from '../components/SystemWindow'
import { balanceConfig } from '../domain/balanceConfig'
import { STAT_TYPES, type StatType, type RitualDifficulty } from '../domain/types'

const DIFFICULTIES: { value: RitualDifficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]
const DURATION_PRESETS = [
  { label: '2h', minutes: 120 },
  { label: '8h', minutes: 480 },
  { label: 'All day', minutes: balanceConfig.rituals.defaultDurationMinutes },
]

function formatDuration(minutes: number): string {
  const h = Math.round(minutes / 60)
  return `${h}h`
}

const defaultForm = {
  title: '',
  description: '',
  stat: 'STR' as StatType,
  difficulty: 'easy' as RitualDifficulty,
  durationMinutes: 120,
}

export function RitualsScreen() {
  const save = useSystemStore(s => s.save)
  const addRitual = useSystemStore(s => s.addRitual)
  const updateRitual = useSystemStore(s => s.updateRitual)
  const deleteRitual = useSystemStore(s => s.deleteRitual)

  const [form, setForm] = useState(defaultForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const atCap = save.rituals.length >= balanceConfig.rituals.maxRituals

  function resetForm() {
    setForm(defaultForm)
    setEditingId(null)
  }

  function handleEdit(ritual: (typeof save.rituals)[number]) {
    setEditingId(ritual.id)
    setForm({
      title: ritual.title,
      description: ritual.description,
      stat: ritual.stat,
      difficulty: ritual.difficulty,
      durationMinutes: ritual.durationMinutes,
    })
  }

  function handleSubmit() {
    if (!form.title.trim()) return
    if (editingId) {
      updateRitual(editingId, {
        title: form.title.trim(),
        description: form.description.trim(),
        stat: form.stat,
        difficulty: form.difficulty,
        durationMinutes: form.durationMinutes,
      })
    } else {
      addRitual({
        title: form.title.trim(),
        description: form.description.trim(),
        stat: form.stat,
        difficulty: form.difficulty,
        durationMinutes: form.durationMinutes,
      })
    }
    resetForm()
  }

  const difficultyLabel = (d: RitualDifficulty) => {
    if (d === 'easy') return 'Easy'
    if (d === 'medium') return 'Med'
    return 'Hard'
  }

  const difficultyColor = (d: RitualDifficulty) => {
    if (d === 'easy') return 'text-emerald-400'
    if (d === 'medium') return 'text-yellow-400'
    return 'text-system-danger'
  }

  return (
    <div className="min-h-screen bg-system-bg px-4 pt-6 pb-8 flex flex-col gap-4">
      <p className="font-mono text-[10px] tracking-[0.25em] text-system-glow/60 uppercase">
        ▣ RITUALS
      </p>

      <SystemWindow title="RITUALS">
        <p className="font-mono text-xs text-slate-400 tracking-wide">
          Daily habits you must do every day.
        </p>
      </SystemWindow>

      {save.rituals.length === 0 ? (
        <SystemWindow>
          <p className="font-mono text-xs text-slate-500 text-center py-4 tracking-wider">
            No rituals yet. Add a daily habit you must do every day.
          </p>
        </SystemWindow>
      ) : (
        <div className="flex flex-col gap-3">
          {save.rituals.map(ritual => (
            <SystemWindow key={ritual.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-sm text-white uppercase tracking-wide truncate">
                    {ritual.title}
                  </p>
                  {ritual.description ? (
                    <p className="font-mono text-xs text-slate-400 mt-1 leading-snug">
                      {ritual.description}
                    </p>
                  ) : null}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-system-glow/40 bg-system-glow/10 text-system-glow tracking-widest">
                      {ritual.stat}
                    </span>
                    <span className={`font-mono text-[10px] font-bold uppercase tracking-widest ${difficultyColor(ritual.difficulty)}`}>
                      {difficultyLabel(ritual.difficulty)}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 tracking-widest">
                      {formatDuration(ritual.durationMinutes)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(ritual)}
                    className="min-h-[44px] px-3 py-2 rounded font-mono text-xs font-bold tracking-widest uppercase border border-system-glow/40 text-system-glow bg-system-glow/10 hover:bg-system-glow/20 transition-colors"
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => deleteRitual(ritual.id)}
                    className="min-h-[44px] px-3 py-2 rounded font-mono text-xs font-bold tracking-widest uppercase border border-system-danger/40 text-system-danger bg-system-danger/10 hover:bg-system-danger/20 transition-colors"
                  >
                    DEL
                  </button>
                </div>
              </div>
            </SystemWindow>
          ))}
        </div>
      )}

      <SystemWindow title={editingId ? 'EDIT RITUAL' : 'ADD RITUAL'}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Morning Run"
              className="min-h-[44px] w-full bg-system-bg border border-system-glow/30 rounded px-3 py-2 font-mono text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-system-glow/70 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional"
              className="min-h-[44px] w-full bg-system-bg border border-system-glow/30 rounded px-3 py-2 font-mono text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-system-glow/70 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
              Stat
            </label>
            <div className="flex gap-2 flex-wrap">
              {STAT_TYPES.map(s => (
                <button
                  key={s}
                  onClick={() => setForm(f => ({ ...f, stat: s }))}
                  className={`min-h-[44px] px-4 py-2 rounded font-mono text-xs font-bold tracking-widest uppercase border transition-colors ${
                    form.stat === s
                      ? 'border-system-glow bg-system-glow/20 text-system-glow'
                      : 'border-slate-600/40 bg-transparent text-slate-400 hover:border-system-glow/40 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
              Difficulty
            </label>
            <div className="flex gap-2 flex-wrap">
              {DIFFICULTIES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setForm(f => ({ ...f, difficulty: value }))}
                  className={`min-h-[44px] px-4 py-2 rounded font-mono text-xs font-bold tracking-widest uppercase border transition-colors ${
                    form.difficulty === value
                      ? value === 'easy'
                        ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400'
                        : value === 'medium'
                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                        : 'border-system-danger bg-system-danger/20 text-system-danger'
                      : 'border-slate-600/40 bg-transparent text-slate-400 hover:border-slate-400/40 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
              Duration
            </label>
            <div className="flex gap-2 flex-wrap">
              {DURATION_PRESETS.map(({ label, minutes }) => (
                <button
                  key={label}
                  onClick={() => setForm(f => ({ ...f, durationMinutes: minutes }))}
                  className={`min-h-[44px] px-4 py-2 rounded font-mono text-xs font-bold tracking-widest uppercase border transition-colors ${
                    form.durationMinutes === minutes
                      ? 'border-system-glow bg-system-glow/20 text-system-glow'
                      : 'border-slate-600/40 bg-transparent text-slate-400 hover:border-system-glow/40 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            {editingId ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={!form.title.trim()}
                  className="flex-1 min-h-[44px] px-4 py-2 rounded font-mono text-sm font-bold tracking-widest uppercase border border-system-glow/60 bg-system-glow/15 text-system-glow hover:bg-system-glow/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  SAVE
                </button>
                <button
                  onClick={resetForm}
                  className="min-h-[44px] px-4 py-2 rounded font-mono text-sm font-bold tracking-widest uppercase border border-slate-600/40 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            ) : (
              <>
                {atCap && (
                  <p className="font-mono text-[10px] tracking-widest text-system-danger uppercase text-center">
                    Max rituals reached
                  </p>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!form.title.trim() || atCap}
                  className="min-h-[44px] px-4 py-2 rounded font-mono text-sm font-bold tracking-widest uppercase border border-system-glow/60 bg-system-glow/15 text-system-glow hover:bg-system-glow/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + ADD RITUAL
                </button>
              </>
            )}
          </div>
        </div>
      </SystemWindow>
    </div>
  )
}
