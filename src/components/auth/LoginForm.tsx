'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ActionButton } from '@/components/ui/action-button'

const DEMO_ACCOUNTS = [
  { name: 'Mark Johnson', email: 'mark@some-email-provider.net', password: 'Password123!' },
  { name: 'Lisa Smith', email: 'lisa@some-email-provider.net', password: 'Password123!' },
]

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(loginEmail: string, loginPassword: string) {
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Login failed')
      }

      localStorage.setItem('token', json.token)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await handleLogin(email, password)
  }

  function handleDemoLogin(account: typeof DEMO_ACCOUNTS[0]) {
    setEmail(account.email)
    setPassword(account.password)
    handleLogin(account.email, account.password)
  }

  return (
    <div className="bg-white rounded-xl p-8 border border-border/50 shadow-xl">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Welcome back
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}

        <ActionButton
          type="submit"
          variant="filled"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            'Signing in...'
          ) : (
            <>
              <LogIn className="h-4 w-4 mr-2 inline" />
              Sign In
            </>
          )}
        </ActionButton>
      </form>

      <div className="mt-6 pt-6 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center mb-3">
          Try a demo account
        </p>
        <div className="flex gap-2">
          {DEMO_ACCOUNTS.map((account, index) => (
            <button
              key={account.email}
              onClick={() => handleDemoLogin(account)}
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-border/50 
                hover:border-primary/50 hover:bg-primary/5 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Demo {index + 1}
              <span className="block text-muted-foreground font-normal truncate">
                {account.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Use your patient credentials to access your health records
      </p>
    </div>
  )
}