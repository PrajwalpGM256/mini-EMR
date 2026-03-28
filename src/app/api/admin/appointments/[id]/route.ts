import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateDate, sanitizeString } from '@/lib/validation'
import { REPEAT_OPTIONS } from '@/lib/constants'

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.appointment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const updateData: {
      provider?: string
      datetime?: Date
      repeat?: string
      endDate?: Date | null
    } = {}

    if (body.provider !== undefined) {
      const provider = sanitizeString(body.provider)
      if (!provider) {
        return NextResponse.json({ error: 'Provider cannot be empty' }, { status: 400 })
      }
      updateData.provider = provider
    }

    if (body.datetime !== undefined) {
      if (!validateDate(body.datetime)) {
        return NextResponse.json({ error: 'Invalid datetime format' }, { status: 400 })
      }
      updateData.datetime = new Date(body.datetime)
    }

    if (body.repeat !== undefined) {
      if (!REPEAT_OPTIONS.includes(body.repeat)) {
        return NextResponse.json(
          { error: `Invalid repeat option. Must be: ${REPEAT_OPTIONS.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.repeat = body.repeat
    }

    if (body.endDate !== undefined) {
      if (body.endDate === null) {
        updateData.endDate = null
      } else if (!validateDate(body.endDate)) {
        return NextResponse.json({ error: 'Invalid endDate format' }, { status: 400 })
      } else {
        updateData.endDate = new Date(body.endDate)
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ data: appointment })
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const existing = await prisma.appointment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    await prisma.appointment.delete({ where: { id } })

    return NextResponse.json({ data: { deleted: true } })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 })
  }
}