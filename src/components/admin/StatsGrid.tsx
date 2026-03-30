'use client'

import { Stethoscope, CalendarClock, Tablets } from 'lucide-react'
import { GlassStatCard } from '@/components/admin/GlassStatCard'

interface StatsGridProps {
  patientCount: number
  appointmentCount: number
  prescriptionCount: number
  // Optional secondary stats
  newPatientsThisWeek?: number
  upcomingToday?: number
  expiringSoon?: number
}

export function StatsGrid({ 
  patientCount, 
  appointmentCount, 
  prescriptionCount,
  newPatientsThisWeek = 0,
  upcomingToday = 0,
  expiringSoon = 0,
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <GlassStatCard
        title="Total Patients"
        value={patientCount}
        subtitle={newPatientsThisWeek > 0 ? `+${newPatientsThisWeek} this week` : 'No new patients'}
        icon={Stethoscope}
        accentColor="violet"
        index={0}
      />
      <GlassStatCard
        title="Total Appointments"
        value={appointmentCount}
        subtitle={upcomingToday > 0 ? `${upcomingToday} upcoming today` : 'None scheduled today'}
        icon={CalendarClock}
        accentColor="blue"
        index={1}
      />
      <GlassStatCard
        title="Active Prescriptions"
        value={prescriptionCount}
        subtitle={expiringSoon > 0 ? `${expiringSoon} expiring soon` : 'All current'}
        icon={Tablets}
        accentColor="amber"
        index={2}
      />
    </div>
  )
}