import Sentiment from 'sentiment'
import type { ProcessedCommit } from './github'

const sentiment = new Sentiment()

// Palabras extra específicas del mundo dev
sentiment.registerLanguage('dev', {
  labels: {
    // Positivas
    fix: 2, fixed: 2, solved: 3, works: 3, done: 2, clean: 2,
    refactor: 1, improve: 2, improved: 2, add: 1, added: 1,
    feature: 2, release: 3, deploy: 2, shipped: 3, merge: 1,
    // Negativas
    bug: -2, broken: -3, revert: -2, hotfix: -2, crash: -3,
    error: -2, fail: -3, failed: -3, issue: -2, hack: -2,
    temp: -1, wip: -1, todo: -1, ugly: -2, mess: -3,
    again: -2, still: -1, finally: 1, somehow: -1,
    wtf: -4, shit: -4, crap: -3, damn: -2, hell: -2,
  },
})

export type MoodCategory = 'euphoric' | 'positive' | 'neutral' | 'frustrated' | 'chaotic'

export interface CommitMood {
  commit: ProcessedCommit
  score: number
  category: MoodCategory
  words: { positive: string[]; negative: string[] }
}

export interface MonthlyMood {
  month: string       // "2024-03"
  label: string       // "Mar 2024"
  average: number
  count: number
  category: MoodCategory
}

export interface DevStats {
  totalCommits: number
  averageScore: number
  mostActiveHour: number
  mostActiveDay: string
  bestRepo: string
  worstRepo: string
  longestMessage: string
  shortestMessage: string
  topPositive: CommitMood[]
  topNegative: CommitMood[]
  monthlyMoods: MonthlyMood[]
  devType: DevType
  streaks: { best: number; worst: number }
}

export interface DevType {
  id: string
  name: string
  emoji: string
  description: string
  /** Signature accent color for this archetype — used for card glows, share images and OG cards. */
  color: string
}

const DEV_TYPES: DevType[] = [
  {
    id: 'midnight',
    name: 'The Midnight Debugger',
    emoji: '🌙',
    description: 'Vive después de las 11pm. El café es su combustible.',
    color: '#818cf8',
  },
  {
    id: 'perfectionist',
    name: 'The Clean Coder',
    emoji: '✨',
    description: 'Commits claros, código limpio. Un ejemplo a seguir.',
    color: '#34d399',
  },
  {
    id: 'firefighter',
    name: 'The Firefighter',
    emoji: '🚒',
    description: 'Siempre apagando incendios. Vive del hotfix.',
    color: '#fb923c',
  },
  {
    id: 'chaos',
    name: 'The Chaos Gremlin',
    emoji: '🌀',
    description: 'Humor impredecible. O todo va bien o todo explota.',
    color: '#e879f9',
  },
  {
    id: 'grumpy',
    name: 'The Grumpy Genius',
    emoji: '😤',
    description: 'Frustrado, pero siempre entrega. El código habla por él.',
    color: '#fbbf24',
  },
  {
    id: 'shipper',
    name: 'The Serial Shipper',
    emoji: '🚀',
    description: 'Deploy tras deploy. Move fast, break things.',
    color: '#38bdf8',
  },
]

function scoreToCategory(score: number): MoodCategory {
  if (score >= 4) return 'euphoric'
  if (score >= 1) return 'positive'
  if (score >= -1) return 'neutral'
  if (score >= -3) return 'frustrated'
  return 'chaotic'
}

function analyzeCommit(commit: ProcessedCommit): CommitMood {
  const result = sentiment.analyze(commit.message, { language: 'dev' })
  const category = scoreToCategory(result.score)

  return {
    commit,
    score: result.score,
    category,
    words: {
      positive: result.positive,
      negative: result.negative,
    },
  }
}

function getMonthlyMoods(analyzedCommits: CommitMood[]): MonthlyMood[] {
  const byMonth: Record<string, CommitMood[]> = {}

  for (const c of analyzedCommits) {
    const d = c.commit.date
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(c)
  }

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12) // Últimos 12 meses
    .map(([key, commits]) => {
      const avg = commits.reduce((s, c) => s + c.score, 0) / commits.length
      const [year, month] = key.split('-')
      const date = new Date(Number(year), Number(month) - 1)
      const label = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })

      return {
        month: key,
        label,
        average: Math.round(avg * 10) / 10,
        count: commits.length,
        category: scoreToCategory(avg),
      }
    })
}

function calcDevType(
  commits: CommitMood[],
  mostActiveHour: number,
  averageScore: number
): DevType {
  const negativeRatio = commits.filter((c) => c.score < -1).length / commits.length
  const hotfixCount = commits.filter((c) =>
    /hotfix|revert|fix.*bug|urgent/i.test(c.commit.message)
  ).length
  const shipCount = commits.filter((c) =>
    /release|deploy|ship|v\d+\.\d+/i.test(c.commit.message)
  ).length

  // Orden de precedencia
  if (mostActiveHour >= 23 || mostActiveHour <= 3) return DEV_TYPES[0]  // Midnight
  if (averageScore >= 2) return DEV_TYPES[1]                              // Clean Coder
  if (hotfixCount / commits.length > 0.15) return DEV_TYPES[2]           // Firefighter
  if (negativeRatio > 0.4) return DEV_TYPES[4]                           // Grumpy
  if (shipCount / commits.length > 0.1) return DEV_TYPES[5]              // Shipper

  // Calcular varianza para detectar caos
  const avg = averageScore
  const variance =
    commits.reduce((s, c) => s + Math.pow(c.score - avg, 2), 0) / commits.length
  if (variance > 8) return DEV_TYPES[3]                                   // Chaos Gremlin

  return DEV_TYPES[5] // Default: Shipper
}

function calcStreaks(commits: CommitMood[]): { best: number; worst: number } {
  let best = 0, worst = 0
  let currentGood = 0, currentBad = 0

  for (const c of commits) {
    if (c.score > 0) {
      currentGood++
      currentBad = 0
      best = Math.max(best, currentGood)
    } else if (c.score < 0) {
      currentBad++
      currentGood = 0
      worst = Math.max(worst, currentBad)
    } else {
      currentGood = 0
      currentBad = 0
    }
  }

  return { best, worst }
}

export function analyzeCommits(commits: ProcessedCommit[]): DevStats {
  if (!commits.length) {
    throw new Error('No se encontraron commits públicos para este usuario.')
  }

  const analyzed = commits.map(analyzeCommit)

  // Hora más activa
  const hourCounts: Record<number, number> = {}
  for (const c of commits) {
    const h = c.date.getHours()
    hourCounts[h] = (hourCounts[h] || 0) + 1
  }
  const mostActiveHour = Number(
    Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0][0]
  )

  // Día más activo
  const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const dayCounts: Record<number, number> = {}
  for (const c of commits) {
    const d = c.date.getDay()
    dayCounts[d] = (dayCounts[d] || 0) + 1
  }
  const mostActiveDay =
    DAYS[Number(Object.entries(dayCounts).sort(([, a], [, b]) => b - a)[0][0])]

  // Mejor y peor repo por promedio de score
  const repoScores: Record<string, number[]> = {}
  for (const c of analyzed) {
    if (!repoScores[c.commit.repo]) repoScores[c.commit.repo] = []
    repoScores[c.commit.repo].push(c.score)
  }
  const repoAverages = Object.entries(repoScores).map(([repo, scores]) => ({
    repo,
    avg: scores.reduce((a, b) => a + b, 0) / scores.length,
  }))
  repoAverages.sort((a, b) => b.avg - a.avg)
  const bestRepo = repoAverages[0]?.repo ?? '-'
  const worstRepo = repoAverages[repoAverages.length - 1]?.repo ?? '-'

  const averageScore =
    Math.round((analyzed.reduce((s, c) => s + c.score, 0) / analyzed.length) * 10) / 10

  const topPositive = [...analyzed].sort((a, b) => b.score - a.score).slice(0, 5)
  const topNegative = [...analyzed].sort((a, b) => a.score - b.score).slice(0, 5)

  const messages = commits.map((c) => c.message)
  const longestMessage = messages.reduce((a, b) => (b.length > a.length ? b : a), '')
  const shortestMessage = messages.reduce(
    (a, b) => (b.length < a.length ? b : a),
    messages[0] ?? ''
  )

  return {
    totalCommits: commits.length,
    averageScore,
    mostActiveHour,
    mostActiveDay,
    bestRepo,
    worstRepo,
    longestMessage,
    shortestMessage,
    topPositive,
    topNegative,
    monthlyMoods: getMonthlyMoods(analyzed),
    devType: calcDevType(analyzed, mostActiveHour, averageScore),
    streaks: calcStreaks(analyzed),
  }
}