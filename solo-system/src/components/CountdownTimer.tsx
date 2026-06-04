import { useEffect, useState } from 'react'

interface Props {
  deadline: number
  nowMs?: number
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  if (hours >= 1) {
    const hh = String(hours).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  }
  return `${mm}:${ss}`
}

export function CountdownTimer({ deadline, nowMs }: Props) {
  const [now, setNow] = useState<number>(nowMs ?? Date.now())

  useEffect(() => {
    if (nowMs !== undefined) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [nowMs])

  const remaining = deadline - now

  if (remaining <= 0) {
    return (
      <span className="font-mono text-system-danger font-bold tracking-widest">
        EXPIRED
      </span>
    )
  }

  return (
    <span className="font-mono text-system-glow tracking-widest">
      {formatRemaining(remaining)}
    </span>
  )
}
