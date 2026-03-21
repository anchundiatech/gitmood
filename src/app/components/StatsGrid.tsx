import type { DevStats } from '@/app/lib/analyzer'

interface Props {
  stats: DevStats
}

function StatCard({
  emoji,
  label,
  value,
  sub,
}: {
  emoji: string
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
      <span className="text-xl">{emoji}</span>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground leading-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? 'pm' : 'am'
  const h = hour % 12 || 12
  return `${h}:00 ${suffix}`
}

export default function StatsGrid({ stats }: Props) {
  const scoreLabel =
    stats.averageScore >= 2
      ? 'Muy positivo 🌟'
      : stats.averageScore >= 0
      ? 'Estable'
      : stats.averageScore >= -2
      ? 'Algo frustrado'
      : 'Bastante frustrado 😤'

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <StatCard
        emoji="💬"
        label="Commits analizados"
        value={stats.totalCommits.toLocaleString()}
      />
      <StatCard
        emoji="📊"
        label="Humor promedio"
        value={stats.averageScore > 0 ? `+${stats.averageScore}` : `${stats.averageScore}`}
        sub={scoreLabel}
      />
      <StatCard
        emoji="⏰"
        label="Hora pico"
        value={formatHour(stats.mostActiveHour)}
        sub={`Más activo los ${stats.mostActiveDay}`}
      />
      <StatCard
        emoji="🔥"
        label="Racha positiva"
        value={`${stats.streaks.best} commits`}
        sub="seguidos con buen humor"
      />
      <StatCard
        emoji="💀"
        label="Racha negativa"
        value={`${stats.streaks.worst} commits`}
        sub="seguidos de frustración"
      />
      <StatCard
        emoji="🏆"
        label="Mejor repo"
        value={stats.bestRepo}
        sub="el que más disfrutas"
      />
    </div>
  )
}