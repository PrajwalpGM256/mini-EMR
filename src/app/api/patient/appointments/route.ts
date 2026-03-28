import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPatientFromRequest } from '@/lib/auth'
import { addMonths } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const payload = getPatientFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const threeMonthsFromNow = addMonths(now, 3)

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: payload.patientId,
        datetime: { gte: now, lte: threeMonthsFromNow }
      },
      orderBy: { datetime: 'asc' }
    })

    return NextResponse.json({ data: appointments })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}