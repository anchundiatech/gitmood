'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { MonthlyMood } from '@/app/lib/analyzer'

interface Props {
  data: MonthlyMood[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  const mood =
    val >= 2 ? '🤩 Eufórico' :
    val >= 0.5 ? '😊 Positivo' :
    val >= -0.5 ? '😐 Neutral' :
    val >= -2 ? '😤 Frustrado' : '🤬 Caótico'

  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        {val > 0 ? `+${val}` : val} — {mood}
      </p>
      <p className="text-xs text-muted-foreground">{payload[0].payload.count} commits</p>
    </div>
  )
}

export default function MoodTimeline({ data }: Props) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground text-sm">
        No hay suficientes datos para mostrar el timeline
      </div>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    name: d.label,
  }))

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            domain={[-4, 4]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="average"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#moodGradient)"
            dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}