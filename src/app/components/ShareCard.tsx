'use client'

import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import type { DevStats } from '@/app/lib/analyzer'

interface Props {
  username: string
  stats: DevStats
}

async function renderCardToBlob(el: HTMLElement): Promise<Blob | null> {
  const canvas = await html2canvas(el, {
    backgroundColor: '#0a0a0a',
    scale: 2,
    useCORS: true,
  })
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

export default function ShareCard({ username, stats }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<'download' | 'share' | null>(null)
  const [copied, setCopied] = useState(false)

  const score = stats.averageScore
  const scoreStr = score > 0 ? `+${score}` : `${score}`
  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/${username}` : ''
  const shareText = `Soy ${stats.devType.emoji} ${stats.devType.name} según mis commits de GitHub (humor: ${scoreStr}). ¿Tú qué tipo de dev eres?`

  async function handleDownload() {
    if (!cardRef.current || busy) return
    setBusy('download')
    try {
      const blob = await renderCardToBlob(cardRef.current)
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `gitmood-${username}.png`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(null)
    }
  }

  async function handleShare() {
    if (!cardRef.current || busy) return
    setBusy('share')
    try {
      const blob = await renderCardToBlob(cardRef.current)
      if (!blob) return
      const file = new File([blob], `gitmood-${username}.png`, { type: 'image/png' })
      const canShareFile = typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })

      if (canShareFile) {
        try {
          await navigator.share({ files: [file], text: shareText, title: 'GitMood' })
        } catch {
          // User cancelled the share sheet — not an error.
        }
      } else {
        await handleDownload()
      }
    } finally {
      setBusy(null)
    }
  }

  function handleShareTwitter() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function handleCopyLink() {
    if (!profileUrl) return
    await navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const s = {
    card: {
      background: '#0a0a0a',
      border: '1px solid #222222',
      borderTop: `3px solid ${stats.devType.color}`,
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
      fontFamily: 'system-ui, sans-serif',
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    brandText: { color: '#ffffff', fontWeight: 600, fontSize: '14px' },
    mutedText: { color: '#52525b', fontSize: '12px' },
    devRow: { display: 'flex', alignItems: 'center', gap: '12px' },
    emoji: {
      fontSize: '40px',
      lineHeight: 1,
      width: '64px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '16px',
      background: `${stats.devType.color}1a`,
      flexShrink: 0,
    },
    devName: { color: '#ffffff', fontWeight: 600, fontSize: '18px', lineHeight: 1.2, margin: 0 },
    devDesc: { color: '#a1a1aa', fontSize: '13px', margin: '4px 0 0' },
    statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' },
    statBox: { background: '#141414', borderRadius: '12px', padding: '12px' },
    statLabel: { color: '#52525b', fontSize: '11px', marginBottom: '4px' },
    statValue: { color: '#ffffff', fontWeight: 600, fontSize: '15px' },
    commitBox: { background: '#141414', borderRadius: '12px', padding: '12px' },
    commitLabel: { color: '#52525b', fontSize: '11px', marginBottom: '6px' },
    commitText: { color: '#d4d4d8', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
    footer: { color: '#3f3f46', fontSize: '11px', textAlign: 'center' as const },
  }

  return (
    <div className="flex flex-col gap-4">
      <div ref={cardRef} style={s.card}>
        <div style={s.headerRow}>
          <span style={s.brandText}>GitMood</span>
          <span style={s.mutedText}>github.com/{username}</span>
        </div>

        <div style={s.devRow}>
          <span style={s.emoji}>{stats.devType.emoji}</span>
          <div>
            <p style={s.devName}>{stats.devType.name}</p>
            <p style={s.devDesc}>{stats.devType.description}</p>
          </div>
        </div>

        <div style={s.statsGrid}>
          <div style={s.statBox}>
            <p style={s.statLabel}>Commits</p>
            <p style={s.statValue}>{stats.totalCommits}</p>
          </div>
          <div style={s.statBox}>
            <p style={s.statLabel}>Humor</p>
            <p style={s.statValue}>{scoreStr}</p>
          </div>
          <div style={s.statBox}>
            <p style={s.statLabel}>Hora pico</p>
            <p style={s.statValue}>{stats.mostActiveHour}:00h</p>
          </div>
        </div>

        {stats.topPositive[0] && (
          <div style={s.commitBox}>
            <p style={s.commitLabel}>Commit más feliz</p>
            <p style={s.commitText}>&ldquo;{stats.topPositive[0].commit.message}&rdquo;</p>
          </div>
        )}

        <p style={s.footer}>gitmood-eta.vercel.app</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={busy !== null}
          className="px-4 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
        >
          {busy === 'download' ? 'Generando…' : '📥 Descargar imagen'}
        </button>

        {canNativeShare && (
          <button
            onClick={handleShare}
            disabled={busy !== null}
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent disabled:opacity-50 transition-all"
          >
            {busy === 'share' ? 'Generando…' : '📱 Compartir'}
          </button>
        )}

        <button
          onClick={handleShareTwitter}
          className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-all"
        >
          𝕏 Compartir en X
        </button>

        <button
          onClick={handleCopyLink}
          className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-all"
        >
          {copied ? '✓ Copiado' : '🔗 Copiar link'}
        </button>
      </div>
    </div>
  )
}
