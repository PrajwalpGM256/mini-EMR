import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequired, validateEmail, sanitizeString } from '@/lib/validation'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const email = sanitizeString(body.email || '')
    const password = body.password || ''

    const missing = validateRequired({ email, password })
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const patient = await prisma.patient.findUnique({ where: { email } })
    if (!patient) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, patient.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = signToken({ patientId: patient.id, email: patient.email })

    return NextResponse.json({
      data: {
        token,
        patient: {
          id: patient.id,
          name: patient.name,
          email: patient.email
        }
      }
    })
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}