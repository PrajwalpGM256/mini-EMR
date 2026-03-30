'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Calendar, Pill, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/appointments', label: 'Appointments', icon: Calendar },
  { href: '/prescriptions', label: 'Prescriptions', icon: Pill },
]

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [patientName, setPatientName] = useState<string | null>(null)
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking')

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      setAuthState('unauthenticated')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setPatientName(payload.name || payload.email?.split('@')[0] || 'Patient')
      setAuthState('authenticated')
    } catch {
      localStorage.removeItem('token')
      setAuthState('unauthenticated')
    }
  }, [])

  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.replace('/')
    }
  }, [authState, router])

  function handleLogout() {
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              mini-EMR
            </h1>
            <span className="text-xs text-muted-foreground border-l border-border pl-3">
              Patient Portal
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    'group relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                  
                  {isActive && (
                    <>
                      <span className="absolute left-0 top-1 bottom-0 w-[2px] bg-primary rounded-full" />
                      <span className="absolute left-0 right-1 bottom-0 h-[2px] bg-primary rounded-full" />
                    </>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline">
              {patientName}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}