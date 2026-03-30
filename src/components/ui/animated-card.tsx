'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  index?: number
}

export function AnimatedCard({ children, className, index = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={cn('hover:shadow-md transition-all duration-200', className)}>
        {children}
      </Card>
    </motion.div>
  )
}