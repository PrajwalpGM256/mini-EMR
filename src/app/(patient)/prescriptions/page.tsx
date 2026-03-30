'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Tablets } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { PatientPrescriptionCard } from '@/components/patient/PatientPrescriptionCard'

interface Prescription {
  id: string
  medication: string
  dosage: string
  quantity: number
  refillOn: string
  refillSchedule: string
}

export default function PrescriptionsPage() {
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPrescriptions = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    try {
      const res = await fetch('/api/patient/prescriptions', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch prescriptions')
      }

      setPrescriptions(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchPrescriptions()
  }, [fetchPrescriptions])

  // Sort: active first, then by refill date
  const sortedPrescriptions = [...prescriptions].sort((a, b) => {
    const aCompleted = a.refillSchedule === 'none' && new Date(a.refillOn) < new Date()
    const bCompleted = b.refillSchedule === 'none' && new Date(b.refillOn) < new Date()
    
    if (aCompleted && !bCompleted) return 1
    if (!aCompleted && bCompleted) return -1
    
    return new Date(a.refillOn).getTime() - new Date(b.refillOn).getTime()
  })

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Prescriptions</h1>
          <p className="text-muted-foreground mt-1">
            All your medications and refill schedules
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="p-4 border-b border-amber-500/10 bg-amber-500/5">
          <h2 className="text-base font-semibold flex items-center gap-2 text-amber-600">
            <Tablets className="h-5 w-5" />
            All Prescriptions ({prescriptions.length})
          </h2>
        </div>
        <div className="p-4">
          {error ? (
            <p className="text-destructive text-center py-4">{error}</p>
          ) : sortedPrescriptions.length === 0 ? (
            <EmptyState
              icon={Tablets}
              title="No prescriptions"
              description="You don't have any prescriptions"
            />
          ) : (
            <div className="space-y-3">
              {sortedPrescriptions.map((rx) => (
                <PatientPrescriptionCard key={rx.id} prescription={rx} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}