import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  title?: string
  children: ReactNode
  className?: string
}

export function SystemWindow({ title, children, className = '' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`bg-system-panel/80 border border-system-glow/40 shadow-glow rounded-lg backdrop-blur-sm overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-4 py-2 border-b border-system-glow/20 bg-system-glow/5">
          <span className="text-system-glow text-xs font-mono uppercase tracking-widest font-semibold">
            ▣ {title}
          </span>
        </div>
      )}
      <div className="p-4">{children}</div>
    </motion.div>
  )
}
