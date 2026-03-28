import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateDate, validatePositiveNumber, sanitizeString } from '@/lib/validation'
import { MEDICATIONS, DOSAGES, REFILL_SCHEDULES } from '@/lib/constants'

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.prescription.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    const updateData: {
      medication?: string
      dosage?: string
      quantity?: number
      refillOn?: Date
      refillSchedule?: string
    } = {}

    if (body.medication !== undefined) {
      const medication = sanitizeString(body.medication)
      if (!MEDICATIONS.includes(medication)) {
        return NextResponse.json(
          { error: `Invalid medication. Must be: ${MEDICATIONS.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.medication = medication
    }

    if (body.dosage !== undefined) {
      const dosage = sanitizeString(body.dosage)
      if (!DOSAGES.includes(dosage)) {
        return NextResponse.json(
          { error: `Invalid dosage. Must be: ${DOSAGES.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.dosage = dosage
    }

    if (body.quantity !== undefined) {
      if (!validatePositiveNumber(body.quantity)) {
        return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 })
      }
      updateData.quantity = body.quantity
    }

    if (body.refillOn !== undefined) {
      if (!validateDate(body.refillOn)) {
        return NextResponse.json({ error: 'Invalid refillOn date format' }, { status: 400 })
      }
      updateData.refillOn = new Date(body.refillOn)
    }

    if (body.refillSchedule !== undefined) {
      if (!REFILL_SCHEDULES.includes(body.refillSchedule)) {
        return NextResponse.json(
          { error: `Invalid refill schedule. Must be: ${REFILL_SCHEDULES.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.refillSchedule = body.refillSchedule
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const prescription = await prisma.prescription.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ data: prescription })
  } catch (error) {
    console.error('Error updating prescription:', error)
    return NextResponse.json({ error: 'Failed to update prescription' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const existing = await prisma.prescription.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    await prisma.prescription.delete({ where: { id } })

    return NextResponse.json({ data: { deleted: true } })
  } catch (error) {
    console.error('Error deleting prescription:', error)
    return NextResponse.json({ error: 'Failed to delete prescription' }, { status: 500 })
  }
}