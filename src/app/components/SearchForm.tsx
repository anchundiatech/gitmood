'use client'

import { useState } from 'react'

interface Props {
  onSearch: (username: string) => void
  loading: boolean
}

export default function SearchForm({ onSearch, loading }: Props) {
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch(value)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            @
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="username de GitHub"
            disabled={loading}
            autoFocus
            className="w-full pl-7 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-5 py-3 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all"
        >
          {loading ? <LoadingSpinner /> : 'Analizar'}
        </button>
      </div>
    </form>
  )
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}