'use client'

import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface TimeSelectProps {
  value: string
  onChange: (time: string) => void
  interval?: number
  error?: boolean
}

export function TimeSelect({
  value,
  onChange,
  interval = 15,
  error
}: TimeSelectProps) {
  const timeOptions: string[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += interval) {
      const hour = h.toString().padStart(2, '0')
      const minute = m.toString().padStart(2, '0')
      timeOptions.push(`${hour}:${minute}`)
    }
  }

  function handleChange(newValue: string | null) {
    if (newValue) {
      onChange(newValue)
    }
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className={cn(error && 'border-destructive')}>
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent>
        {timeOptions.map((t) => (
          <SelectItem key={t} value={t}>
            {format(new Date(`2000-01-01T${t}`), 'h:mm a')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}