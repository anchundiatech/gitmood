export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  html_url: string
}

export interface GitHubRepo {
  name: string
  full_name: string
  private: boolean
  fork: boolean
}

export interface ProcessedCommit {
  sha: string
  message: string
  date: Date
  repo: string
  url: string
}

const GITHUB_API = 'https://api.github.com'

async function fetchWithHeaders(url: string) {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  // Optional: raises the unauthenticated 60 req/hr limit to 5000 req/hr.
  // Only read server-side (generateMetadata / OG route) — undefined in the browser bundle.
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const res = await fetch(url, {
    headers,
    next: { revalidate: 3600 },
  })

  if (res.status === 404) throw new Error('Usuario no encontrado')
  if (res.status === 403) throw new Error('Rate limit alcanzado. Espera unos minutos e intenta de nuevo.')
  if (!res.ok) throw new Error(`Error de GitHub: ${res.status}`)

  return res.json()
}

export async function getUserRepos(username: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = await fetchWithHeaders(
    `${GITHUB_API}/users/${username}/repos?per_page=100&sort=pushed&type=owner`
  )
  // Solo repos propios, no forks
  return repos.filter((r) => !r.fork && !r.private)
}

export async function getRepoCommits(
  username: string,
  repo: string,
  maxPages = 2
): Promise<ProcessedCommit[]> {
  const commits: ProcessedCommit[] = []

  for (let page = 1; page <= maxPages; page++) {
    try {
      const data: GitHubCommit[] = await fetchWithHeaders(
        `${GITHUB_API}/repos/${username}/${repo}/commits?author=${username}&per_page=50&page=${page}`
      )

      if (!data.length) break

      for (const c of data) {
        commits.push({
          sha: c.sha,
          message: c.commit.message.split('\n')[0].trim(), // Solo primera línea
          date: new Date(c.commit.author.date),
          repo,
          url: c.html_url,
        })
      }

      if (data.length < 50) break
    } catch {
      break
    }
  }

  return commits
}

export async function getAllCommits(username: string): Promise<ProcessedCommit[]> {
  // Verificar que el usuario existe
  await fetchWithHeaders(`${GITHUB_API}/users/${username}`)

  const repos = await getUserRepos(username)

  // Tomar los 8 repos más recientes para no agotar el rate limit
  const topRepos = repos.slice(0, 8)

  const allCommits: ProcessedCommit[] = []

  for (const repo of topRepos) {
    const commits = await getRepoCommits(username, repo.name)
    allCommits.push(...commits)
  }

  // Ordenar por fecha descendente
  allCommits.sort((a, b) => b.date.getTime() - a.date.getTime())

  return allCommits
}