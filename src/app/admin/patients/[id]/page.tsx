'use client'

import { useEffect, useState, useCallback} from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarClock, Tablets, Plus, UserRound } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { ActionButton } from '@/components/ui/action-button'
import { PatientForm } from '@/components/admin/PatientForm'
import { AppointmentForm } from '@/components/admin/AppointmentForm'
import { PrescriptionForm } from '@/components/admin/PrescriptionForm'
import { AppointmentCard } from '@/components/admin/AppointmentCard'
import { PrescriptionCard } from '@/components/admin/PrescriptionCard'
import { GlassStatCard } from '@/components/admin/GlassStatCard'

interface Patient {
  id: string
  name: string
  email: string
  createdAt: string
  appointments: Appointment[]
  prescriptions: Prescription[]
}

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

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editPatientOpen, setEditPatientOpen] = useState(false)
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null)

  const fetchPatient = useCallback(async () => {
    try {
        const res = await fetch(`/api/admin/patients/${patientId}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setPatient(json.data)
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch patient')
    } finally {
        setLoading(false)
    }
    }, [patientId])

  useEffect(() => {
    fetchPatient()
  }, [fetchPatient])

  async function handleDeleteAppointment(id: string) {
    if (!confirm('Delete this appointment?')) return
    try {
      await fetch(`/api/admin/appointments/${id}`, { method: 'DELETE' })
      fetchPatient()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDeletePrescription(id: string) {
    if (!confirm('Delete this prescription?')) return
    try {
      await fetch(`/api/admin/prescriptions/${id}`, { method: 'DELETE' })
      fetchPatient()
    } catch (err) {
      console.error(err)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const upcomingAppointments = patient?.appointments.filter(
    apt => new Date(apt.datetime) >= today
  ).length || 0

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  
  const refillingSoon = patient?.prescriptions.filter(rx => {
    const refillDate = new Date(rx.refillOn)
    return refillDate >= today && refillDate <= nextWeek
  }).length || 0

  const daysSinceJoined = patient 
    ? Math.floor((Date.now() - new Date(patient.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="glass-card rounded-xl p-8 text-center text-destructive">
          {error || 'Patient not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6"
      >
        <div className="flex items-center gap-6">
          <ActionButton variant="secondary" onClick={() => router.push('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-1 inline" />
            Back
          </ActionButton>
          
          <div>
            <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
            <p className="text-sm text-muted-foreground">{patient.email}</p>
          </div>
        </div>

        <ActionButton variant="primary" onClick={() => setEditPatientOpen(true)}>
          Edit Patient
        </ActionButton>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <GlassStatCard
          title="Total Appointments"
          value={patient.appointments.length}
          subtitle={upcomingAppointments > 0 ? `${upcomingAppointments} upcoming` : 'None upcoming'}
          icon={CalendarClock}
          accentColor="blue"
          index={0}
        />
        <GlassStatCard
          title="Active Prescriptions"
          value={patient.prescriptions.length}
          subtitle={refillingSoon > 0 ? `${refillingSoon} refilling soon` : 'All current'}
          icon={Tablets}
          accentColor="amber"
          index={1}
        />
        <GlassStatCard
          title="Days as Patient"
          value={daysSinceJoined}
          subtitle={`Since ${new Date(patient.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          icon={UserRound}
          accentColor="violet"
          index={2}
        />
      </div>

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
              Appointments
            </h2>
            <ActionButton
              variant="primary"
              onClick={() => {
                setEditingAppointment(null)
                setAppointmentDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1 inline" />
              Add
            </ActionButton>
          </div>
          <div className="p-4">
            {patient.appointments.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No appointments"
                description="Schedule the first appointment"
              />
            ) : (
              <div className="space-y-3">
                {patient.appointments
                  .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
                  .map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      onEdit={() => {
                        setEditingAppointment(apt)
                        setAppointmentDialogOpen(true)
                      }}
                      onDelete={() => handleDeleteAppointment(apt.id)}
                    />
                  ))}
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
              Prescriptions
            </h2>
            <ActionButton
              variant="tertiary"
              onClick={() => {
                setEditingPrescription(null)
                setPrescriptionDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1 inline" />
              Add
            </ActionButton>
          </div>
          <div className="p-4">
            {patient.prescriptions.length === 0 ? (
              <EmptyState
                icon={Tablets}
                title="No prescriptions"
                description="Add the first prescription"
              />
            ) : (
              <div className="space-y-3">
                {patient.prescriptions
                  .sort((a, b) => {
                    const aCompleted = a.refillSchedule === 'none' && new Date(a.refillOn) < new Date()
                    const bCompleted = b.refillSchedule === 'none' && new Date(b.refillOn) < new Date()
                    
                    if (aCompleted && !bCompleted) return 1
                    if (!aCompleted && bCompleted) return -1
                    
                    return new Date(a.refillOn).getTime() - new Date(b.refillOn).getTime()
                  })
                  .map((rx) => (
                    <PrescriptionCard
                      key={rx.id}
                      prescription={rx}
                      onEdit={() => {
                        setEditingPrescription(rx)
                        setPrescriptionDialogOpen(true)
                      }}
                      onDelete={() => handleDeletePrescription(rx.id)}
                    />
                  ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <PatientForm
        open={editPatientOpen}
        onOpenChange={setEditPatientOpen}
        onSuccess={fetchPatient}
        patientId={patientId}
        initialData={{ name: patient.name, email: patient.email }}
      />

      <AppointmentForm
        open={appointmentDialogOpen}
        onOpenChange={setAppointmentDialogOpen}
        onSuccess={fetchPatient}
        patientId={patientId}
        appointment={editingAppointment}
      />

      <PrescriptionForm
        open={prescriptionDialogOpen}
        onOpenChange={setPrescriptionDialogOpen}
        onSuccess={fetchPatient}
        patientId={patientId}
        prescription={editingPrescription}
      />
    </div>
  )
}