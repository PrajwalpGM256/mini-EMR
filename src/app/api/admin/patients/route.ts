import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequired, validateEmail, validatePassword, sanitizeString } from '@/lib/validation'
import bcrypt from 'bcryptjs'
import { PatientWithCounts } from '@/types'

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        appointments: {
          where: {
            datetime: { gte: new Date() }
          },
          orderBy: { datetime: 'asc' },
          take: 1
        },
        _count: {
          select: {
            appointments: true,
            prescriptions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })


    const data = (patients as PatientWithCounts[]).map(patient => ({
      id: patient.id,
      name: patient.name,
      email: patient.email,
      appointmentCount: patient._count.appointments,
      prescriptionCount: patient._count.prescriptions,
      nextAppointment: patient.appointments[0]?.datetime || null,
      createdAt: patient.createdAt
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const name = sanitizeString(body.name || '')
    const email = sanitizeString(body.email || '')
    const password = body.password || ''

    const missing = validateRequired({ name, email, password })
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const passwordCheck = validatePassword(password)
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: passwordCheck.message }, { status: 400 })
    }

    const existing = await prisma.patient.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const patient = await prisma.patient.create({
      data: { name, email, password: hashedPassword }
    })

    return NextResponse.json({
      data: { id: patient.id, name: patient.name, email: patient.email }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 })
  }
}