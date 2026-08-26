import { ImageResponse } from 'next/og'
import { getAllCommits } from '@/app/lib/github'
import { analyzeCommits } from '@/app/lib/analyzer'

export const runtime = 'nodejs'

const WIDTH = 1200
const HEIGHT = 630

function fallbackImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#ffffff',
          fontSize: 48,
          fontWeight: 700,
        }}
      >
        GitMood
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  )
}

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  let stats
  try {
    const commits = await getAllCommits(username)
    stats = analyzeCommits(commits)
  } catch {
    return fallbackImage()
  }

  const scoreStr = stats.averageScore > 0 ? `+${stats.averageScore}` : `${stats.averageScore}`
  const color = stats.devType.color

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0a0a0a',
          padding: '56px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Top accent bar in the dev-type's signature color */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, display: 'flex', background: color }} />

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#ffffff', fontSize: 28, fontWeight: 700 }}>GitMood</span>
          <span style={{ color: '#71717a', fontSize: 22 }}>github.com/{username}</span>
        </div>

        {/* Dev type block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 160,
              height: 160,
              borderRadius: 40,
              background: `${color}22`,
              fontSize: 100,
            }}
          >
            {stats.devType.emoji}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ color, fontSize: 22, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2 }}>
              Tu tipo de dev
            </span>
            <span style={{ color: '#ffffff', fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>
              {stats.devType.name}
            </span>
            <span style={{ color: '#a1a1aa', fontSize: 26 }}>{stats.devType.description}</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'Commits', value: String(stats.totalCommits) },
            { label: 'Humor', value: scoreStr },
            { label: 'Hora pico', value: `${stats.mostActiveHour}:00h` },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: '#141414',
                borderRadius: 16,
                padding: '18px 28px',
                flex: 1,
              }}
            >
              <span style={{ color: '#52525b', fontSize: 18 }}>{stat.label}</span>
              <span style={{ color: '#ffffff', fontSize: 32, fontWeight: 700 }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  )
}
