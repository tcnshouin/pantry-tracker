import { motion } from 'framer-motion'

interface Props {
  amount: number
  crit: boolean
  miss: boolean
}

export function FloatingDamage({ amount, crit, miss }: Props) {
  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: -40, opacity: 0 }}
      transition={{ duration: 1 }}
      style={{ position: 'absolute', pointerEvents: 'none' }}
      className="font-mono font-bold"
    >
      {miss ? (
        <span className="text-slate-300">MISS</span>
      ) : (
        <>
          <span className={crit ? 'text-amber-300 text-lg' : 'text-system-danger'}>
            {amount}
          </span>
          {crit && <span className="text-amber-300 text-xs ml-1">CRIT</span>}
        </>
      )}
    </motion.div>
  )
}
