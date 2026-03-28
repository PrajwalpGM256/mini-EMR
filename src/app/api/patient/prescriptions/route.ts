import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPatientFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const payload = getPatientFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: payload.patientId },
      orderBy: { refillOn: 'asc' }
    })

    return NextResponse.json({ data: prescriptions })
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 })
  }
}