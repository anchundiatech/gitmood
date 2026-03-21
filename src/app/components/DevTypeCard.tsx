import type { DevType } from '@/app/lib/analyzer'

interface Props {
  devType: DevType
  averageScore: number
}

function ScoreBar({ score }: { score: number }) {
  // Score va de -5 a +5 aprox, normalizar a 0-100
  const pct = Math.round(((score + 5) / 10) * 100)
  const clamped = Math.min(100, Math.max(0, pct))

  const color =
    score >= 2
      ? 'bg-emerald-500'
      : score >= 0
      ? 'bg-blue-400'
      : score >= -2
      ? 'bg-amber-400'
      : 'bg-red-500'

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs text-muted-foreground w-16 shrink-0">
        {score > 0 ? `+${score}` : score} mood
      </span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}

export default function DevTypeCard({ devType, averageScore }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <span className="text-5xl">{devType.emoji}</span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Tu tipo de dev
          </p>
          <h2 className="text-xl font-semibold text-foreground">{devType.name}</h2>
          <p className="text-sm text-muted-foreground">{devType.description}</p>
        </div>
      </div>
      <ScoreBar score={averageScore} />
    </div>
  )
}