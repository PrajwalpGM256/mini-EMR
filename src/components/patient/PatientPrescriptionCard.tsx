'use client'

import { motion } from 'framer-motion'
import { format, addMonths, isBefore } from 'date-fns'
import { Pill, RefreshCw, AlertCircle } from 'lucide-react'

interface Prescription {
  id: string
  medication: string
  dosage: string
  quantity: number
  refillOn: string
  refillSchedule: string
}

interface PatientPrescriptionCardProps {
  prescription: Prescription
}

export function PatientPrescriptionCard({ prescription }: PatientPrescriptionCardProps) {
  const now = new Date()
  const originalRefillDate = new Date(prescription.refillOn)

  function getNextRefillDate(): Date | null {
    if (prescription.refillSchedule === 'none') {
      return null
    }

    let refillDate = new Date(originalRefillDate)

    while (isBefore(refillDate, now)) {
      if (prescription.refillSchedule === 'monthly') {
        refillDate = addMonths(refillDate, 1)
      } else {
        break
      }
    }

    return refillDate
  }

  const nextRefillDate = getNextRefillDate()
  const isOneTime = prescription.refillSchedule === 'none'

  function getDaysUntilRefill(): number | null {
    if (!nextRefillDate) return null
    const diffTime = nextRefillDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const daysUntilRefill = getDaysUntilRefill()
  const isDueSoon = daysUntilRefill !== null && daysUntilRefill <= 3 && daysUntilRefill > 0
  const isUrgent = daysUntilRefill !== null && daysUntilRefill <= 7 && daysUntilRefill > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-xl border transition-all ${
        isDueSoon
          ? 'border-destructive/40 bg-destructive/5 hover:border-destructive/60'
          : isUrgent
          ? 'border-amber-300 bg-amber-50 hover:border-amber-400'
          : 'border-border/60 bg-card hover:border-primary/30 hover:shadow-sm'
      }`}
    >
      {/* Header: Medication + Urgent Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isDueSoon 
              ? 'bg-destructive/10' 
              : isUrgent 
              ? 'bg-amber-100' 
              : 'bg-primary/10'
          }`}>
            <Pill className={`h-4 w-4 ${
              isDueSoon 
                ? 'text-destructive' 
                : isUrgent 
                ? 'text-amber-600' 
                : 'text-primary'
            }`} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {prescription.medication}
            </h3>
            <p className="text-sm text-muted-foreground">
              {prescription.dosage}
            </p>
          </div>
        </div>
        
        {isDueSoon && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
            <AlertCircle className="h-3 w-3" />
            Due soon
          </div>
        )}
        {isUrgent && !isDueSoon && (
          <div className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
            This week
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/50 mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Quantity</p>
          <p className="text-sm font-medium text-foreground">{prescription.quantity} units</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Schedule</p>
          <p className="text-sm font-medium text-foreground capitalize">
            {prescription.refillSchedule === 'none' ? 'One-time' : prescription.refillSchedule}
          </p>
        </div>
      </div>

      {/* Next Refill */}
      {!isOneTime && nextRefillDate && (
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Next refill</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {format(nextRefillDate, 'MMM d, yyyy')}
            </p>
            {daysUntilRefill !== null && daysUntilRefill > 0 && (
              <p className={`text-xs ${
                isDueSoon 
                  ? 'text-destructive' 
                  : isUrgent 
                  ? 'text-amber-600' 
                  : 'text-muted-foreground'
              }`}>
                in {daysUntilRefill} day{daysUntilRefill !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {isOneTime && (
        <div className="flex items-center gap-2 pt-3 border-t border-border/50 text-sm text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>One-time prescription (no refills)</span>
        </div>
      )}
    </motion.div>
  )
}