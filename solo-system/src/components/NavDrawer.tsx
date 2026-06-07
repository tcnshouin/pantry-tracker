import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, BarChart3, Swords, Backpack, Ghost, History } from 'lucide-react'

const links = [
  { to: '/', label: 'HOME', Icon: Home },
  { to: '/status', label: 'STATUS', Icon: BarChart3 },
  { to: '/gates', label: 'GATES', Icon: Swords },
  { to: '/inventory', label: 'ITEMS', Icon: Backpack },
  { to: '/shadows', label: 'SHADOWS', Icon: Ghost },
  { to: '/log', label: 'LOG', Icon: History },
]

export function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.nav
            className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-system-panel border-r border-system-glow/30 shadow-glow p-4"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            <div className="mt-2 mb-6 font-mono text-sm uppercase tracking-[0.3em] text-system-glow">The System</div>
            <div className="flex flex-col gap-1">
              {links.map(({ to, label, Icon }) => (
                <NavLink
                  key={to} to={to} end={to === '/'} onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded px-3 py-3 ${isActive ? 'text-system-glow bg-system-glow/10' : 'text-slate-400 hover:text-slate-200'}`
                  }
                >
                  <Icon size={20} />
                  <span className="font-mono text-xs uppercase tracking-widest">{label}</span>
                </NavLink>
              ))}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}
