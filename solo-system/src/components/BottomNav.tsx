import { NavLink } from 'react-router-dom'
import { Home, BarChart3, History, Swords, Backpack } from 'lucide-react'

const links = [
  { to: '/', label: 'HOME', Icon: Home },
  { to: '/status', label: 'STATUS', Icon: BarChart3 },
  { to: '/gates', label: 'GATES', Icon: Swords },
  { to: '/inventory', label: 'ITEMS', Icon: Backpack },
  { to: '/log', label: 'LOG', Icon: History },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-system-panel/95 border-t border-system-glow/20 backdrop-blur-md">
      <div className="flex">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center min-h-[60px] gap-1 transition-all ${
                isActive
                  ? 'text-system-glow'
                  : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  className={isActive ? 'drop-shadow-[0_0_6px_#38bdf8]' : ''}
                />
                <span
                  className={`font-mono text-[10px] tracking-widest uppercase font-semibold ${
                    isActive ? 'text-system-glow' : ''
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-system-glow rounded-full shadow-glow" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}
