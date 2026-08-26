import type { Metadata } from 'next'
import { getAllCommits } from '@/app/lib/github'
import { analyzeCommits } from '@/app/lib/analyzer'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params

  try {
    const commits = await getAllCommits(username)
    const stats = analyzeCommits(commits)
    const scoreStr = stats.averageScore > 0 ? `+${stats.averageScore}` : `${stats.averageScore}`

    const title = `${stats.devType.emoji} Soy ${stats.devType.name} — GitMood`
    const description = `${stats.devType.description} Humor promedio: ${scoreStr} en ${stats.totalCommits} commits. Descubre tu propio GitMood.`
    const ogImage = `/api/og/${username}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: ogImage, width: 1200, height: 630 }],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
    }
  } catch {
    // Unknown user / rate-limited — fall back to generic metadata rather than fail the page.
    return {
      title: `@${username} — GitMood`,
      description: 'Descubre el estado emocional de tus commits de GitHub.',
    }
  }
}

export default function UsernameLayout({ children }: { children: React.ReactNode }) {
  return children
}
