import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateEmail, sanitizeString } from '@/lib/validation'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: { orderBy: { datetime: 'asc' } },
        prescriptions: { orderBy: { refillOn: 'asc' } }
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const { password: _, ...patientData } = patient
    return NextResponse.json({ data: patientData })
  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.patient.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const updateData: { name?: string; email?: string } = {}

    if (body.name !== undefined) {
      const name = sanitizeString(body.name)
      if (!name) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      }
      updateData.name = name
    }

    if (body.email !== undefined) {
      const email = sanitizeString(body.email)
      if (!validateEmail(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }
      const emailTaken = await prisma.patient.findFirst({
        where: { email, NOT: { id } }
      })
      if (emailTaken) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
      updateData.email = email
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      data: { id: patient.id, name: patient.name, email: patient.email }
    })
  } catch (error) {
    console.error('Error updating patient:', error)
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 })
  }
}