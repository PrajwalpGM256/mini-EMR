'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ActionButton } from '@/components/ui/action-button'
import { DatePicker } from '@/components/ui/date-picker'
import { TimeSelect } from '@/components/ui/time-select'
import { REPEAT_OPTIONS } from '@/lib/constants'

interface Appointment {
  id: string
  provider: string
  datetime: string
  repeat: string
  endDate: string | null
}

interface AppointmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  patientId: string
  appointment?: Appointment | null
}

interface FormErrors {
  provider?: string
  date?: string
  time?: string
}

export function AppointmentForm({
  open,
  onOpenChange,
  onSuccess,
  patientId,
  appointment
}: AppointmentFormProps) {
  const isEditing = !!appointment

  const [provider, setProvider] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState('09:00')
  const [repeat, setRepeat] = useState('none')
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (open) {
      if (appointment) {
        const aptDate = new Date(appointment.datetime)
        setProvider(appointment.provider)
        setDate(aptDate)
        setTime(format(aptDate, 'HH:mm'))
        setRepeat(appointment.repeat)
        setEndDate(appointment.endDate ? new Date(appointment.endDate) : undefined)
      } else {
        setProvider('')
        setDate(undefined)
        setTime('09:00')
        setRepeat('none')
        setEndDate(undefined)
      }
      setErrors({})
      setTouched({})
      setSubmitError('')
    }
  }, [open, appointment])

  function validateProvider(value: string): string | undefined {
    const trimmed = value.trim()
    if (!trimmed) return 'Provider name is required'
    if (trimmed.length < 2) return 'Provider name must be at least 2 characters'
    return undefined
  }

  function validateDate(value: Date | undefined): string | undefined {
    if (!value) return 'Date is required'
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (value < today) return 'Cannot select a past date'
    return undefined
  }

  function validateTime(timeValue: string, dateValue: Date | undefined): string | undefined {
    if (!timeValue) return 'Time is required'
    if (!dateValue) return undefined
    const [hours, minutes] = timeValue.split(':').map(Number)
    const selectedDateTime = new Date(dateValue)
    selectedDateTime.setHours(hours, minutes, 0, 0)
    if (selectedDateTime < new Date()) return 'Cannot select a past time'
    return undefined
  }

  function isFormValid(): boolean {
    return !validateProvider(provider) && !validateDate(date) && !validateTime(time, date)
  }

  function handleDateChange(newDate: Date | undefined) {
    setDate(newDate)
    setTouched({ ...touched, date: true })
    setErrors({
      ...errors,
      date: validateDate(newDate),
      time: validateTime(time, newDate)
    })
  }

  function handleTimeChange(newTime: string) {
    setTime(newTime)
    setTouched({ ...touched, time: true })
    setErrors({ ...errors, time: validateTime(newTime, date) })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const providerError = validateProvider(provider)
    const dateError = validateDate(date)
    const timeError = validateTime(time, date)

    setErrors({ provider: providerError, date: dateError, time: timeError })
    setTouched({ provider: true, date: true, time: true })

    if (providerError || dateError || timeError) return

    setSubmitting(true)
    setSubmitError('')

    try {
      const [hours, minutes] = time.split(':').map(Number)
      const datetime = new Date(date!)
      datetime.setHours(hours, minutes, 0, 0)

      const url = isEditing
        ? `/api/admin/appointments/${appointment!.id}`
        : '/api/admin/appointments'
      const method = isEditing ? 'PUT' : 'POST'

      const body: Record<string, unknown> = {
        provider: provider.trim(),
        datetime: datetime.toISOString(),
        repeat
      }

      if (!isEditing) body.patientId = patientId
      if (repeat !== 'none' && endDate) body.endDate = endDate.toISOString()

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await res.json()

      if (!res.ok) {
        setSubmitError(json.error || 'Failed to save appointment')
        return
      }

      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const disablePastDates = (d: Date) => d < new Date(new Date().setHours(0, 0, 0, 0))
  const disableEndDates = (d: Date) => {
    if (!date) return true
    
    if (d <= date) return true
    
    if (repeat === 'weekly') {
        const diffTime = d.getTime() - date.getTime()
        const diffDays = diffTime / (1000 * 60 * 60 * 24)
        return diffDays % 7 !== 0
    }
  
    if (repeat === 'monthly') {
        return d.getDate() !== date.getDate()
  }
  
  return false
}
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Appointment' : 'Add Appointment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {submitError && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {submitError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Input
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              onBlur={() => {
                setTouched({ ...touched, provider: true })
                setErrors({ ...errors, provider: validateProvider(provider) })
              }}
              placeholder="Dr. Smith"
              className={errors.provider && touched.provider ? 'border-destructive' : ''}
            />
            {errors.provider && touched.provider && (
              <p className="text-sm text-destructive">{errors.provider}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <DatePicker
              value={date}
              onChange={handleDateChange}
              placeholder="Select date"
              disabled={disablePastDates}
              error={!!errors.date && touched.date}
            />
            {errors.date && touched.date && (
              <p className="text-sm text-destructive">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Time</Label>
            <TimeSelect
              value={time}
              onChange={handleTimeChange}
              error={!!errors.time && touched.time}
            />
            {errors.time && touched.time && (
              <p className="text-sm text-destructive">{errors.time}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Repeat</Label>
            <Select value={repeat} onValueChange={(v) => v && setRepeat(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPEAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {repeat !== 'none' && (
            <div className="space-y-2">
              <Label>End Date (optional)</Label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="No end date"
                disabled={disableEndDates}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <ActionButton type="submit" disabled={submitting || !isFormValid()} variant='filled'>
              {submitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}