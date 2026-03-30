'use client'

import { CalendarClock, Tablets, UserRound } from 'lucide-react'
import { GlassStatCard } from '@/components/admin/GlassStatCard'

interface PatientStatsGridProps {
  upcomingAppointments: number
  upcomingRefills: number
  totalPrescriptions: number
}

export function PatientStatsGrid({
  upcomingAppointments,
  upcomingRefills,
  totalPrescriptions,
}: PatientStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <GlassStatCard
        title="Upcoming Appointments"
        value={upcomingAppointments}
        subtitle={upcomingAppointments > 0 ? 'In the next 7 days' : 'None scheduled'}
        icon={CalendarClock}
        accentColor="blue"
        index={0}
      />
      <GlassStatCard
        title="Upcoming Refills"
        value={upcomingRefills}
        subtitle={upcomingRefills > 0 ? 'In the next 7 days' : 'All current'}
        icon={Tablets}
        accentColor="amber"
        index={1}
      />
      <GlassStatCard
        title="Total Prescriptions"
        value={totalPrescriptions}
        subtitle="Active medications"
        icon={UserRound}
        accentColor="violet"
        index={2}
      />
    </div>
  )
}