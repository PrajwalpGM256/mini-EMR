'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CalendarClock } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { PatientAppointmentCard } from '@/components/patient/PatientAppointmentCard'

interface Appointment {
  id: string
  provider: string
  datetime: string
  repeat: string
  endDate: string | null
}

export default function AppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAppointments = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    try {
      const res = await fetch('/api/patient/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch appointments')
      }

      setAppointments(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Filter for next 3 months
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const threeMonths = new Date(today)
  threeMonths.setMonth(threeMonths.getMonth() + 3)

  const upcomingAppointments = appointments
    .filter((apt) => {
      const date = new Date(apt.datetime)
      return date >= today && date <= threeMonths
    })
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Appointments</h1>
          <p className="text-muted-foreground mt-1">
            Upcoming schedule for the next 3 months
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="p-4 border-b border-primary/10 bg-primary/5">
          <h2 className="text-base font-semibold flex items-center gap-2 text-primary">
            <CalendarClock className="h-5 w-5" />
            All Upcoming Appointments ({upcomingAppointments.length})
          </h2>
        </div>
        <div className="p-4">
          {error ? (
            <p className="text-destructive text-center py-4">{error}</p>
          ) : upcomingAppointments.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No upcoming appointments"
              description="You don't have any appointments scheduled"
            />
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <PatientAppointmentCard key={apt.id} appointment={apt} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}