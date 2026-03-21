import type { CommitMood } from '@/app/lib/analyzer'

interface Props {
  topPositive: CommitMood[]
  topNegative: CommitMood[]
}

function CommitBubble({
  item,
  type,
}: {
  item: CommitMood
  type: 'positive' | 'negative'
}) {
  const isPositive = type === 'positive'
  const emoji =
    item.score >= 4 ? '🤩' :
    item.score >= 2 ? '😊' :
    item.score <= -4 ? '🤬' :
    item.score <= -2 ? '😤' : '😐'

  return (
    <a
      href={item.commit.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-start gap-3 p-3 rounded-xl border transition-colors hover:bg-accent ${
        isPositive
          ? 'border-emerald-200 dark:border-emerald-900'
          : 'border-red-200 dark:border-red-900'
      }`}
    >
      <span className="text-lg shrink-0 mt-0.5">{emoji}</span>
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-sm text-foreground font-medium truncate leading-snug">
          {item.commit.message}
        </p>
        <p className="text-xs text-muted-foreground">
          {item.commit.repo} ·{' '}
          {item.commit.date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
      <span
        className={`ml-auto text-xs font-semibold shrink-0 mt-0.5 ${
          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
        }`}
      >
        {item.score > 0 ? `+${item.score}` : item.score}
      </span>
    </a>
  )
}

export default function CommitHighlights({ topPositive, topNegative }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Positivos */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <span>😊</span> Los más felices
        </p>
        <div className="flex flex-col gap-2">
          {topPositive.slice(0, 3).map((item) => (
            <CommitBubble key={item.commit.sha} item={item} type="positive" />
          ))}
        </div>
      </div>

      {/* Negativos */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <span>😤</span> Los más dramáticos
        </p>
        <div className="flex flex-col gap-2">
          {topNegative.slice(0, 3).map((item) => (
            <CommitBubble key={item.commit.sha} item={item} type="negative" />
          ))}
        </div>
      </div>
    </div>
  )
}