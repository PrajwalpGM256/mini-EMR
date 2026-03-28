export interface CreatePatientRequest {
  name: string
  email: string
  password: string
}

export interface UpdatePatientRequest {
  name?: string
  email?: string
}

export interface CreateAppointmentRequest {
  patientId: string
  provider: string
  datetime: string
  repeat: string
  endDate?: string
}

export interface UpdateAppointmentRequest {
  provider?: string
  datetime?: string
  repeat?: string
  endDate?: string | null
}

export interface CreatePrescriptionRequest {
  patientId: string
  medication: string
  dosage: string
  quantity: number
  refillOn: string
  refillSchedule: string
}

export interface UpdatePrescriptionRequest {
  medication?: string
  dosage?: string
  quantity?: number
  refillOn?: string
  refillSchedule?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface PatientSummary {
  id: string
  name: string
  email: string
  appointmentCount: number
  prescriptionCount: number
  nextAppointment: Date | null
  createdAt: Date
}

export type PatientWithCounts = {
  id: string
  name: string
  email: string
  createdAt: Date
  appointments: { datetime: Date }[]
  _count: { appointments: number; prescriptions: number }
}