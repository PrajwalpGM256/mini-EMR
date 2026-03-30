'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LoginForm } from '@/components/auth/LoginForm'
import { RetroGrid } from '@/components/ui/retro-grid'

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-6 overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-b from-violet-100 via-amber-50 to-white" />

      <RetroGrid angle={75} />

      <motion.h1
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute left-[10%] top-1/2 text-7xl md:text-8xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent z-0 select-none"
      >
        mini
      </motion.h1>

      <motion.h1
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="absolute right-[10%] top-1/2 text-7xl md:text-8xl font-bold bg-gradient-to-r from-accent/70 to-accent bg-clip-text text-transparent z-0 select-none"
      >
        EMR
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <p className="text-sm text-muted-foreground text-center mb-6 tracking-wide">
          Patient Portal
        </p>

        <LoginForm />

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Healthcare provider?{' '}
          <button
            onClick={() => router.push('/admin')}
            className="text-primary hover:underline"
          >
            Access Admin Portal
          </button>
        </p>
      </motion.div>
    </div>
  )
}