'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SearchForm from './components/SearchForm'
import SiteFooter from './components/SiteFooter'

const EXAMPLES = ['torvalds', 'gaearon', 'sindresorhus', 'midudev']

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleSearch(username: string) {
    if (!username.trim()) return
    setLoading(true)
    router.push(`/${username.trim().toLowerCase()}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="w-full max-w-lg flex flex-col items-center gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-6xl">😤</span>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Git Mood
          </h1>
          <p className="text-muted-foreground text-lg">
            Descubre el estado emocional de tus commits de GitHub
          </p>
        </div>

        {/* Form */}
        <SearchForm onSearch={handleSearch} loading={loading} />

        {/* Examples */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">O prueba con alguien famoso</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLES.map((user) => (
              <button
                key={user}
                onClick={() => handleSearch(user)}
                className="text-sm px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              >
                @{user}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <p className="text-xs text-muted-foreground/60">
            Solo analiza repositorios y commits públicos
          </p>
          <SiteFooter />
        </div>
      </div>
    </main>
  )
}