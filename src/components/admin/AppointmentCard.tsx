'use client'

import { motion } from 'framer-motion'
import { format, addWeeks, addMonths, isBefore, isAfter } from 'date-fns'
import { Pencil, Trash2, Calendar, Clock, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Appointment {
  id: string
  provider: string
  datetime: string
  repeat: string
  endDate: string | null
}

interface AppointmentCardProps {
  appointment: Appointment
  onEdit: () => void
  onDelete: () => void
}

export function AppointmentCard({ appointment, onEdit, onDelete }: AppointmentCardProps) {
  const startDate = new Date(appointment.datetime)
  const endDate = appointment.endDate ? new Date(appointment.endDate) : null
  const now = new Date()

  function getUpcomingAppointments(): Date[] {
    const appointments: Date[] = []
    let currentDate = new Date(startDate)

    if (appointment.repeat === 'none') {
      if (isAfter(currentDate, now) || isSameDay(currentDate, now)) {
        appointments.push(currentDate)
      }
      return appointments
    }

    const maxDate = endDate || addMonths(now, 3)

    while (isBefore(currentDate, maxDate) || isSameDay(currentDate, maxDate)) {
      if (isAfter(currentDate, now) || isSameDay(currentDate, now)) {
        appointments.push(new Date(currentDate))
      }

      if (appointment.repeat === 'weekly') {
        currentDate = addWeeks(currentDate, 1)
      } else if (appointment.repeat === 'monthly') {
        currentDate = addMonths(currentDate, 1)
      } else {
        break
      }
    }

    return appointments
  }

  function isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const upcomingAppointments = getUpcomingAppointments()
  const nextAppointment = upcomingAppointments[0] || null
  const totalRemaining = upcomingAppointments.length
  const finalAppointment = upcomingAppointments[upcomingAppointments.length - 1] || null

  const isPast = !nextAppointment && appointment.repeat === 'none' && isBefore(startDate, now)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border transition-colors ${
        isPast 
          ? 'bg-muted/50 border-muted' 
          : 'bg-card hover:bg-muted/50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          {/* Provider */}
          <div className="flex items-center gap-2">
            <p className="font-medium">{appointment.provider}</p>
            <Badge variant={appointment.repeat === 'none' ? 'outline' : 'secondary'}>
              {appointment.repeat === 'none' ? 'One-time' : appointment.repeat}
            </Badge>
            {isPast && (
              <Badge variant="outline" className="text-muted-foreground">
                Completed
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Next:</span>
            <span className={isPast ? 'text-muted-foreground' : 'font-medium'}>
              {nextAppointment 
                ? format(nextAppointment, 'MMM d, yyyy \'at\' h:mm a')
                : 'No upcoming appointments'}
            </span>
          </div>

          {appointment.repeat !== 'none' && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Repeat className="h-3 w-3" />
                <span>{totalRemaining} remaining</span>
              </div>
              {finalAppointment && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Ends: {format(finalAppointment, 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}