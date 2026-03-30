'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { ActionButton } from '@/components/ui/action-button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatsGrid } from '@/components/admin/StatsGrid'
import { PatientForm } from '@/components/admin/PatientForm'

interface Patient {
  id: string
  name: string
  email: string
  appointmentCount: number
  prescriptionCount: number
  nextAppointment: string | null
  createdAt: string
}

export default function AdminPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  async function fetchPatients() {
    try {
      const res = await fetch('/api/admin/patients')
      const json = await res.json()
      setPatients(json.data || [])
    } catch (err) {
      console.error('Failed to fetch patients:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalAppointments = patients.reduce((sum, p) => sum + p.appointmentCount, 0)
  const totalPrescriptions = patients.reduce((sum, p) => sum + p.prescriptionCount, 0)

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const newPatientsThisWeek = patients.filter(p => 
    new Date(p.createdAt) > oneWeekAgo
  ).length

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const upcomingToday = patients.filter(p => {
  if (!p.nextAppointment) return false
  const apptDate = new Date(p.nextAppointment)
  return apptDate >= today && apptDate < tomorrow
  }).length

  function formatDate(dateString: string | null) {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

  return (
    <div className="container mx-auto px-6 py-8">
      <PageHeader
        title="Patient Management"
        description="Manage patients, appointments, and prescriptions"
      >
        <ActionButton onClick={() => setDialogOpen(true)} variant='primary'>
          <Plus className="h-4 w-4 mr-2 inline" />
          Add Patient
        </ActionButton>
      </PageHeader>

      <StatsGrid
        patientCount={patients.length}
        appointmentCount={totalAppointments}
        prescriptionCount={totalPrescriptions}
        newPatientsThisWeek={newPatientsThisWeek}
        upcomingToday={upcomingToday}
        expiringSoon={0} // todo: Placeholder for expiring prescriptions logic
      />

      <div className="glass-card rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No patients yet"
            description="Add your first patient to get started"
            action={
              <ActionButton onClick={() => setDialogOpen(true)} variant='primary'>
                <Plus className="h-4 w-4 mr-2 inline" />
                Add Patient
              </ActionButton>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 border-b border-primary/10 hover:bg-primary/5">
                <TableHead className="text-primary font-semibold">Name</TableHead>
                <TableHead className="text-primary font-semibold">Email</TableHead>
                <TableHead className="text-primary font-semibold text-center">Appointments</TableHead>
                <TableHead className="text-primary font-semibold text-center">Prescriptions</TableHead>
                <TableHead className="text-primary font-semibold text-center">Next Appointment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow
                key={patient.id}
                className="table-row-hover cursor-pointer"
                onClick={() => router.push(`/admin/patients/${patient.id}`)}
                >
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell className="text-center">
                    {patient.appointmentCount > 0 ? (
                    patient.appointmentCount
                    ) : (
                    <span className="text-muted-foreground text-sm italic">None</span>
                    )}
                </TableCell>
                <TableCell className="text-center">
                    {patient.prescriptionCount > 0 ? (
                    patient.prescriptionCount
                    ) : (
                    <span className="text-muted-foreground text-sm italic">None</span>
                    )}
                </TableCell>
                <TableCell className="text-center">
                    {formatDate(patient.nextAppointment) || (
                    <span className="text-muted-foreground text-sm italic">No upcoming</span>
                    )}
                </TableCell>
              </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <PatientForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchPatients}
      />
    </div>
  )
}