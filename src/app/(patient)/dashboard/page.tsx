'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CalendarClock, Tablets } from 'lucide-react'
import { PatientStatsGrid } from '@/components/patient/PatientStatsGrid'
import { EmptyState } from '@/components/ui/empty-state'
import { PatientAppointmentCard } from '@/components/patient/PatientAppointmentCard'
import { PatientPrescriptionCard } from '@/components/patient/PatientPrescriptionCard'

interface Appointment {
  id: string
  provider: string
  datetime: string
  repeat: string
  endDate: string | null
}

interface Prescription {
  id: string
  medication: string
  dosage: string
  quantity: number
  refillOn: string
  refillSchedule: string
}

interface DashboardData {
  patient: {
    id: string
    name: string
    email: string
  }
  upcomingAppointments: Appointment[]
  upcomingRefills: Prescription[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch('/api/patient/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch dashboard')
      }

      setData(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="glass-card rounded-xl p-8 text-center text-destructive">
          {error || 'Failed to load dashboard'}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {data.patient.name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here is your health summary for the next 7 days
        </p>
      </motion.div>

      <PatientStatsGrid
        upcomingAppointments={data.upcomingAppointments.length}
        upcomingRefills={data.upcomingRefills.length}
        totalPrescriptions={data.upcomingRefills.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-primary/5">
            <h2 className="text-base font-semibold flex items-center gap-2 text-primary">
              <CalendarClock className="h-5 w-5" />
              Appointments This Week
            </h2>
          </div>
          <div className="p-4">
            {data.upcomingAppointments.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No appointments this week"
                description="You're all clear for the next 7 days"
              />
            ) : (
              <div className="space-y-3">
                {data.upcomingAppointments.slice(0, 3).map((apt) => (
                  <PatientAppointmentCard key={apt.id} appointment={apt} />
                ))}
                {data.upcomingAppointments.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{data.upcomingAppointments.length - 3} more
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-amber-500/10 bg-amber-500/5">
            <h2 className="text-base font-semibold flex items-center gap-2 text-amber-600">
              <Tablets className="h-5 w-5" />
              Refills This Week
            </h2>
          </div>
          <div className="p-4">
            {data.upcomingRefills.length === 0 ? (
              <EmptyState
                icon={Tablets}
                title="No refills this week"
                description="All medications are current"
              />
            ) : (
              <div className="space-y-3">
                {data.upcomingRefills.slice(0, 3).map((rx) => (
                  <PatientPrescriptionCard key={rx.id} prescription={rx} />
                ))}
                {data.upcomingRefills.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{data.upcomingRefills.length - 3} more
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}