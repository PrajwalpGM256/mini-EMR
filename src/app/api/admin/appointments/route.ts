import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequired, validateDate, sanitizeString } from '@/lib/validation'
import { REPEAT_OPTIONS } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const patientId = body.patientId
    const provider = sanitizeString(body.provider || '')
    const datetime = body.datetime
    const repeat = body.repeat || 'none'
    const endDate = body.endDate || null

    const missing = validateRequired({ patientId, provider, datetime })
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    if (!validateDate(datetime)) {
      return NextResponse.json({ error: 'Invalid datetime format' }, { status: 400 })
    }

    if (!REPEAT_OPTIONS.includes(repeat)) {
      return NextResponse.json(
        { error: `Invalid repeat option. Must be: ${REPEAT_OPTIONS.join(', ')}` },
        { status: 400 }
      )
    }

    if (endDate && !validateDate(endDate)) {
      return NextResponse.json({ error: 'Invalid endDate format' }, { status: 400 })
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId } })
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        provider,
        datetime: new Date(datetime),
        repeat,
        endDate: endDate ? new Date(endDate) : null
      }
    })

    return NextResponse.json({ data: appointment }, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}