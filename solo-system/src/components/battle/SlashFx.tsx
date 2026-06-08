import { motion } from 'framer-motion'

interface Props {
  size: number
  className?: string
}

export function SlashFx({ size, className }: Props) {
  return (
    <motion.div
      className={className}
      style={{ pointerEvents: 'none', width: size, height: size, position: 'absolute' }}
      initial={{ rotate: -40, scale: 0.6, opacity: 0 }}
      animate={{ rotate: 25, scale: 1.1, opacity: [0, 1, 0] }}
      transition={{ duration: 0.35 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }}
      >
        <path
          d="M 20 90 Q 40 20 100 30"
          stroke="url(#slashGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 28 80 Q 48 28 96 42"
          stroke="url(#slashGrad2)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <defs>
          <linearGradient id="slashGrad" x1="20" y1="90" x2="100" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient id="slashGrad2" x1="28" y1="80" x2="96" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  )
}
