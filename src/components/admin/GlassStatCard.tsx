'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface GlassStatCardProps {
  title: string
  value: number
  subtitle?: string
  icon: LucideIcon
  accentColor?: 'violet' | 'blue' | 'amber'
  index?: number
}

const accentStyles = {
  violet: {
    iconBg: 'from-violet-500/20 to-violet-600/20',
    iconColor: 'text-violet-600',
    border: 'rgba(139, 92, 246, 0.6)',
    subtitleColor: 'text-violet-600',
  },
  blue: {
    iconBg: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-600',
    border: 'rgba(59, 130, 246, 0.6)',
    subtitleColor: 'text-blue-600',
  },
  amber: {
    iconBg: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-600',
    border: 'rgba(245, 158, 11, 0.6)',
    subtitleColor: 'text-amber-600',
  },
}

export function GlassStatCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  accentColor = 'violet',
  index = 0 
}: GlassStatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const accent = accentStyles[accentColor]

  // Count-up animation
  useEffect(() => {
    if (value === 0) return
    
    const duration = 1000
    const steps = 20
    const increment = value / steps
    const stepTime = duration / steps
    
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-xl p-6 cursor-default transition-shadow duration-300 hover:shadow-lg relative"
      style={{
        boxShadow: `inset 3px 0 0 0 ${accent.border}, inset 0 -3px 0 0 ${accent.border}`,
      }}
    >
      {/* Gap effect - small cutouts at corner */}
      <div 
        className="absolute bottom-0 left-0 w-[3px] h-[4px] bg-background"
        style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
      />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-4xl font-bold mt-2 text-foreground">
            {displayValue}
          </p>
          {subtitle && (
            <p className={`text-xs font-medium mt-2 ${accent.subtitleColor}`}>
              {subtitle}
            </p>
          )}
        </div>
        
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, -4, 0] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: 'easeInOut',
            delay: index * 0.2 
          }}
          className={`floating-icon h-14 w-14 rounded-full bg-gradient-to-br ${accent.iconBg} flex items-center justify-center`}
        >
          <Icon className={`h-7 w-7 ${accent.iconColor}`} />
        </motion.div>
      </div>
    </motion.div>
  )
}