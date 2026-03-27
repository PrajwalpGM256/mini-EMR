import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function daysFromNow(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

async function main() {
  await prisma.prescription.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.patient.deleteMany()

  console.log('Cleared existing data')

  const hashedPassword = await bcrypt.hash('Password123!', 10)

  const mark = await prisma.patient.create({
    data: {
      name: 'Mark Johnson',
      email: 'mark@some-email-provider.net',
      password: hashedPassword,
      appointments: {
        create: [
          {
            provider: 'Dr Kim West',
            datetime: daysFromNow(2),
            repeat: 'weekly',
          },
          {
            provider: 'Dr Lin James',
            datetime: daysFromNow(5),
            repeat: 'monthly',
          },
        ],
      },
      prescriptions: {
        create: [
          {
            medication: 'Lexapro',
            dosage: '5mg',
            quantity: 2,
            refillOn: daysFromNow(3),
            refillSchedule: 'monthly',
          },
          {
            medication: 'Ozempic',
            dosage: '1mg',
            quantity: 1,
            refillOn: daysFromNow(10),
            refillSchedule: 'monthly',
          },
        ],
      },
    },
  })

  console.log(`Created patient: ${mark.name}`)

  const lisa = await prisma.patient.create({
    data: {
      name: 'Lisa Smith',
      email: 'lisa@some-email-provider.net',
      password: hashedPassword,
      appointments: {
        create: [
          {
            provider: 'Dr Sally Field',
            datetime: daysFromNow(4),
            repeat: 'monthly',
          },
          {
            provider: 'Dr Lin James',
            datetime: daysFromNow(8),
            repeat: 'weekly',
          },
        ],
      },
      prescriptions: {
        create: [
          {
            medication: 'Metformin',
            dosage: '500mg',
            quantity: 2,
            refillOn: daysFromNow(5),
            refillSchedule: 'monthly',
          },
          {
            medication: 'Diovan',
            dosage: '100mg',
            quantity: 1,
            refillOn: daysFromNow(14),
            refillSchedule: 'monthly',
          },
        ],
      },
    },
  })

  console.log(`Created patient: ${lisa.name}`)
  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })