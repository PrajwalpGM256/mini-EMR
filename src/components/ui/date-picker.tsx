'use client'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: (date: Date) => boolean
  error?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled,
  error
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  function handleSelect(date: Date | undefined) {
    onChange(date)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'flex h-9 w-full items-center justify-start rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          !value && 'text-muted-foreground',
          error && 'border-destructive'
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? format(value, 'PPP') : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          disabled={disabled}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}