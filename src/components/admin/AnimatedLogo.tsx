'use client'

import { motion, Variants } from 'framer-motion'

export function AnimatedLogo() {
  const text = 'mini-EMR'
  const letters = text.split('')

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const letterAnimation: Variants = {
    hidden: { 
      opacity: 0, 
      y: 10,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  }

  const subtitleAnimation: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.4,
        delay: 0.5,
        ease: 'easeOut',
      },
    },
  }

  return (
    <div className="flex items-center gap-3 py-4">
      <motion.h1
        className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            variants={letterAnimation}
            className="inline-block"
            style={{ 
              whiteSpace: letter === '-' ? 'pre' : 'normal' 
            }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.h1>

      <motion.span
        className="text-xs text-muted-foreground tracking-wide uppercase border-l border-border pl-3"
        variants={subtitleAnimation}
        initial="hidden"
        animate="visible"
      >
        Admin Portal
      </motion.span>
    </div>
  )
}