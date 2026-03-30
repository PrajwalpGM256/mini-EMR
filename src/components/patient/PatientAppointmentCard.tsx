'use client'

import { motion } from 'framer-motion'
import { format, addWeeks, addMonths, isBefore, isAfter } from 'date-fns'
import { Calendar, Repeat, Clock } from 'lucide-react'

interface Appointment {
  id: string
  provider: string
  datetime: string
  repeat: string
  endDate: string | null
}

interface PatientAppointmentCardProps {
  appointment: Appointment
}

export function PatientAppointmentCard({ appointment }: PatientAppointmentCardProps) {
  const startDate = new Date(appointment.datetime)
  const endDate = appointment.endDate ? new Date(appointment.endDate) : null
  const now = new Date()

  function isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

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

  const upcomingAppointments = getUpcomingAppointments()
  const nextAppointment = upcomingAppointments[0] || null
  const totalRemaining = upcomingAppointments.length
  const finalAppointment = upcomingAppointments[upcomingAppointments.length - 1] || null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-sm transition-all"
    >
      {/* Header: Provider + Badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {appointment.provider}
          </h3>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {appointment.repeat === 'none' ? 'One-time visit' : `${appointment.repeat} visits`}
          </span>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          appointment.repeat === 'none' 
            ? 'bg-muted text-muted-foreground' 
            : 'bg-primary/10 text-primary'
        }`}>
          {appointment.repeat === 'none' ? 'Single' : appointment.repeat}
        </div>
      </div>

      {/* Next Appointment */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Next Appointment</p>
          <p className="text-sm font-semibold text-foreground">
            {nextAppointment 
              ? format(nextAppointment, 'EEEE, MMM d, yyyy')
              : 'No upcoming'}
          </p>
          {nextAppointment && (
            <p className="text-xs text-muted-foreground">
              at {format(nextAppointment, 'h:mm a')}
            </p>
          )}
        </div>
      </div>

      {/* Footer: Remaining + End Date */}
      {appointment.repeat !== 'none' && (
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Repeat className="h-3.5 w-3.5" />
            <span>{totalRemaining} remaining</span>
          </div>
          {finalAppointment && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Ends {format(finalAppointment, 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}