import { Menu } from 'lucide-react'

export function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-system-panel/95 border-b border-system-glow/20 backdrop-blur-md">
      <button onClick={onMenu} aria-label="Open menu" className="-ml-2 p-2 text-system-glow">
        <Menu size={22} />
      </button>
      <span className="font-mono text-sm uppercase tracking-[0.3em] text-system-glow">The System</span>
    </header>
  )
}
