'use client'

import { useRef, useState } from 'react'
import type { DevStats } from '@/app/lib/analyzer'

interface Props {
  username: string
  stats: DevStats
}

export default function ShareCard({ username, stats }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#0a0a0a',
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `gitmood-${username}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  const score = stats.averageScore
  const scoreStr = score > 0 ? `+${score}` : `${score}`

  return (
    <div className="flex flex-col gap-4">
      {/* Card preview */}
      <div
        ref={cardRef}
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: '#0a0a0a', border: '1px solid #222' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">GitMood</span>
          </div>
          <span className="text-zinc-500 text-xs">github.com/{username}</span>
        </div>

        {/* Dev type */}
        <div className="flex items-center gap-3">
          <span className="text-4xl">{stats.devType.emoji}</span>
          <div>
            <p className="text-white font-semibold text-lg leading-tight">
              {stats.devType.name}
            </p>
            <p className="text-zinc-400 text-sm">{stats.devType.description}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl p-3" style={{ background: '#141414' }}>
            <p className="text-zinc-500 text-xs mb-1">Commits</p>
            <p className="text-white font-semibold">{stats.totalCommits}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: '#141414' }}>
            <p className="text-zinc-500 text-xs mb-1">Humor</p>
            <p className="text-white font-semibold">{scoreStr}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: '#141414' }}>
            <p className="text-zinc-500 text-xs mb-1">Hora pico</p>
            <p className="text-white font-semibold">
              {stats.mostActiveHour}:00h
            </p>
          </div>
        </div>

        {/* Best commit */}
        {stats.topPositive[0] && (
          <div className="rounded-xl p-3" style={{ background: '#141414' }}>
            <p className="text-zinc-500 text-xs mb-1">Commit más feliz</p>
            <p className="text-zinc-200 text-sm truncate">
              &quot;{stats.topPositive[0].commit.message}&quot;
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-zinc-600 text-xs text-center">gitmood.cubepath.app</p>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent active:scale-95 disabled:opacity-50 transition-all"
      >
        {downloading ? 'Generando imagen...' : '⬇ Descargar tarjeta'}
      </button>
    </div>
  )
}