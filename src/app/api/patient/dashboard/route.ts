import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPatientFromRequest } from '@/lib/auth'
import { addDays } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const payload = getPatientFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const sevenDaysFromNow = addDays(now, 7)

    const patient = await prisma.patient.findUnique({
      where: { id: payload.patientId },
      include: {
        appointments: {
          where: {
            datetime: { gte: now, lte: sevenDaysFromNow }
          },
          orderBy: { datetime: 'asc' }
        },
        prescriptions: {
          where: {
            refillOn: { gte: now, lte: sevenDaysFromNow }
          },
          orderBy: { refillOn: 'asc' }
        }
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        patient: {
          id: patient.id,
          name: patient.name,
          email: patient.email
        },
        upcomingAppointments: patient.appointments,
        upcomingRefills: patient.prescriptions
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}