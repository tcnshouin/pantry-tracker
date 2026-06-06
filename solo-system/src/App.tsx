import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { useSystemStore, systemStore } from './store/useSystemStore'
import { BottomNav } from './components/BottomNav'
import { PenaltyZoneOverlay } from './components/PenaltyZoneOverlay'
import { HomeScreen } from './screens/HomeScreen'
import { StatusScreen } from './screens/StatusScreen'
import { LogScreen } from './screens/LogScreen'
import { GatesScreen } from './screens/GatesScreen'
import { BattleScreen } from './screens/BattleScreen'
import { InventoryScreen } from './screens/InventoryScreen'

export default function App() {
  const ready = useSystemStore(s => s.ready)

  useEffect(() => {
    systemStore.getState().hydrate()
      .then(() => systemStore.getState().checkPenalty())
      .catch(console.error)
    const id = setInterval(() => {
      systemStore.getState().checkPenalty()
    }, 30000)
    return () => clearInterval(id)
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen bg-system-bg flex flex-col items-center justify-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-2 border-system-glow/30 border-t-system-glow animate-spin"
          style={{ boxShadow: '0 0 16px #38bdf8' }}
        />
        <p className="font-mono text-system-glow text-sm tracking-[0.3em] uppercase animate-pulse">
          INITIALIZING SYSTEM…
        </p>
      </div>
    )
  }

  return (
    <HashRouter>
      <PenaltyZoneOverlay />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/status" element={<StatusScreen />} />
        <Route path="/log" element={<LogScreen />} />
        <Route path="/gates" element={<GatesScreen />} />
        <Route path="/battle" element={<BattleScreen />} />
        <Route path="/inventory" element={<InventoryScreen />} />
      </Routes>
      <BottomNav />
    </HashRouter>
  )
}
