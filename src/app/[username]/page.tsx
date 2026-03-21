'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAllCommits } from '@/app/lib/github'
import { analyzeCommits, type DevStats } from '@/app/lib/analyzer'
import MoodTimeline from '@/app/components/MoodTimeline'
import CommitHighlights from '@/app/components/CommitHighlights'
import DevTypeCard from '@/app/components/DevTypeCard'
import StatsGrid from '@/app/components/StatsGrid'
import ShareCard from '@/app/components/ShareCard'

type Status = 'loading' | 'done' | 'error'

const LOADING_MESSAGES = [
  'Buscando tus repos...',
  'Leyendo tus commits...',
  'Analizando tu humor...',
  'Calculando tu nivel de frustración...',
  'Preparando el diagnóstico...',
]

export default function DashboardPage() {
  const { username } = useParams<{ username: string }>()
  const router = useRouter()

  const [status, setStatus] = useState<Status>('loading')
  const [stats, setStats] = useState<DevStats | null>(null)
  const [error, setError] = useState('')
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const commits = await getAllCommits(username)
        const result = analyzeCommits(commits)
        setStats(result)
        setStatus('done')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setStatus('error')
      }
    }
    load()
  }, [username])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <span className="text-5xl animate-bounce">🔍</span>
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-medium text-foreground">
            Analizando @{username}
          </p>
          <p className="text-sm text-muted-foreground transition-all">
            {LOADING_MESSAGES[msgIndex]}
          </p>
        </div>
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-foreground rounded-full animate-loading-bar" />
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-5xl">😵</span>
        <p className="text-lg font-medium text-foreground">Algo salió mal</p>
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-all"
        >
          Volver al inicio
        </button>
      </div>
    )
  }

  if (!stats) return null

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Análisis de</p>
            <h1 className="text-2xl font-semibold text-foreground">@{username}</h1>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver
          </button>
        </div>

        {/* Dev type — lo más impactante primero */}
        <DevTypeCard devType={stats.devType} averageScore={stats.averageScore} />

        {/* Stats grid */}
        <StatsGrid stats={stats} />

        {/* Mood timeline */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-medium text-foreground">Estado emocional por mes</h2>
          <MoodTimeline data={stats.monthlyMoods} />
        </section>

        {/* Commit highlights */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-medium text-foreground">Tus commits más icónicos</h2>
          <CommitHighlights
            topPositive={stats.topPositive}
            topNegative={stats.topNegative}
          />
        </section>

        {/* Share card */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-medium text-foreground">Comparte tu Git Mood</h2>
          <ShareCard username={username} stats={stats} />
        </section>

      </div>
    </main>
  )
}