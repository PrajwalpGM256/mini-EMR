import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequired, validateDate, validatePositiveNumber, sanitizeString } from '@/lib/validation'
import { MEDICATIONS, DOSAGES, REFILL_SCHEDULES } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const patientId = body.patientId
    const medication = sanitizeString(body.medication || '')
    const dosage = sanitizeString(body.dosage || '')
    const quantity = body.quantity
    const refillOn = body.refillOn
    const refillSchedule = body.refillSchedule || 'monthly'

    const missing = validateRequired({ patientId, medication, dosage, quantity, refillOn })
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    if (!MEDICATIONS.includes(medication)) {
      return NextResponse.json(
        { error: `Invalid medication. Must be: ${MEDICATIONS.join(', ')}` },
        { status: 400 }
      )
    }

    if (!DOSAGES.includes(dosage)) {
      return NextResponse.json(
        { error: `Invalid dosage. Must be: ${DOSAGES.join(', ')}` },
        { status: 400 }
      )
    }

    if (!validatePositiveNumber(quantity)) {
      return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 })
    }

    if (!validateDate(refillOn)) {
      return NextResponse.json({ error: 'Invalid refillOn date format' }, { status: 400 })
    }

    if (!REFILL_SCHEDULES.includes(refillSchedule)) {
      return NextResponse.json(
        { error: `Invalid refill schedule. Must be: ${REFILL_SCHEDULES.join(', ')}` },
        { status: 400 }
      )
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId } })
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId,
        medication,
        dosage,
        quantity,
        refillOn: new Date(refillOn),
        refillSchedule
      }
    })

    return NextResponse.json({ data: prescription }, { status: 201 })
  } catch (error) {
    console.error('Error creating prescription:', error)
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 })
  }
}