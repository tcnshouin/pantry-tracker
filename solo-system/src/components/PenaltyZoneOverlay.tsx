import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSystemStore } from '../store/useSystemStore'

export function PenaltyZoneOverlay() {
  const penalty = useSystemStore(s => s.save.penalty)
  const [dismissed, setDismissed] = useState(false)

  if (!penalty.active || dismissed) return null

  const debuffPct = Math.round((1 - penalty.debuffMultiplier) * 100)

  return (
    <AnimatePresence>
      <motion.div
        key="penalty-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-system-danger/15 backdrop-blur-sm"
      >
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-system-danger/5 pointer-events-none"
        />

        <div className="relative z-10 mx-4 max-w-sm w-full bg-[#0a0507] border-2 border-system-danger/70 rounded-lg p-6 space-y-4 shadow-[0_0_40px_rgba(239,68,68,0.4)]">
          <div className="text-center space-y-2">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-4xl"
            >
              ⚠
            </motion.div>
            <h2 className="font-mono font-black text-system-danger text-xl tracking-widest uppercase">
              PENALTY ZONE
            </h2>
            <p className="font-mono text-xs text-system-danger/80 tracking-widest uppercase">
              YOU HAVE ENTERED THE PENALTY ZONE
            </p>
          </div>

          <div className="border border-system-danger/30 rounded bg-system-danger/5 p-3 space-y-1 text-center">
            <p className="font-mono text-sm text-slate-300">
              EXP gains reduced by{' '}
              <span className="text-system-danger font-bold text-base">{debuffPct}%</span>
            </p>
            <p className="font-mono text-xs text-slate-500">
              Debuff multiplier: ×{penalty.debuffMultiplier}
            </p>
          </div>

          <p className="text-sm text-slate-400 text-center leading-snug">
            Complete the{' '}
            <span className="text-system-danger font-bold">Penalty Quest</span> on the Home
            screen to escape the Penalty Zone.
          </p>

          <button
            onClick={() => setDismissed(true)}
            className="w-full min-h-[48px] font-mono font-bold text-sm tracking-widest uppercase rounded border border-system-danger/50 bg-system-danger/10 text-system-danger hover:bg-system-danger/20 transition-all active:scale-95"
          >
            RETURN
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
