'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ActionButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'tertiary' | 'filled'
}

const variants = {
  primary: {
    text: 'text-primary',
    border: 'bg-primary',
    filled: false,
  },
  secondary: {
    text: 'text-blue-600',
    border: 'bg-blue-600',
    filled: false,
  },
  tertiary: {
    text: 'text-amber-600',
    border: 'bg-amber-600',
    filled: false,
  },
  filled: {
    text: 'text-white',
    border: '',
    filled: true,
  },
}

export function ActionButton({
  children,
  onClick,
  className,
  type = 'button',
  disabled = false,
  variant = 'primary',
}: ActionButtonProps) {
  const styles = variants[variant]

  if (styles.filled) {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'px-6 py-2.5 rounded-lg font-medium text-white',
          'bg-gradient-to-r from-primary to-accent',
          'hover:opacity-90 transition-all duration-200',
          'hover:scale-[1.02] active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group relative px-4 py-2 text-sm font-semibold cursor-pointer',
        'transition-all duration-200 hover:opacity-80',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        styles.text,
        className
      )}
    >
      <span
        className={cn(
          'absolute left-0 top-1 bottom-0 w-[3px] rounded-full',
          'origin-bottom scale-y-0 transition-transform duration-200',
          'group-hover:scale-y-100',
          styles.border
        )}
      />

      <span
        className={cn(
          'absolute left-0 right-1 bottom-0 h-[3px] rounded-full',
          'origin-left scale-x-0 transition-transform duration-200',
          'group-hover:scale-x-100',
          styles.border
        )}
      />

      {children}
    </button>
  )
}