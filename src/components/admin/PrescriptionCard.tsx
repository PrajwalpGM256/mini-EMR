'use client'

import { motion } from 'framer-motion'
import { format, addMonths, isBefore } from 'date-fns'
import { Pencil, Trash2, Pill, RefreshCw, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Prescription {
  id: string
  medication: string
  dosage: string
  quantity: number
  refillOn: string
  refillSchedule: string
}

interface PrescriptionCardProps {
  prescription: Prescription
  onEdit: () => void
  onDelete: () => void
}

export function PrescriptionCard({ prescription, onEdit, onDelete }: PrescriptionCardProps) {
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
  const isCompleted = isOneTime && isBefore(originalRefillDate, now)

  function getDaysUntilRefill(): number | null {
    if (!nextRefillDate) return null
    const diffTime = nextRefillDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const daysUntilRefill = getDaysUntilRefill()
  const isUrgent = daysUntilRefill !== null && daysUntilRefill <= 7 && daysUntilRefill > 0
  const isDueSoon = daysUntilRefill !== null && daysUntilRefill <= 3 && daysUntilRefill > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border transition-colors ${
        isCompleted
          ? 'bg-muted/50 border-muted opacity-60'
          : isDueSoon
          ? 'bg-destructive/5 border-destructive/20'
          : isUrgent
          ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
          : 'bg-card hover:bg-muted/50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Pill className={`h-4 w-4 ${isCompleted ? 'text-muted-foreground' : 'text-primary'}`} />
            <p className={`font-medium ${isCompleted ? 'text-muted-foreground' : ''}`}>
              {prescription.medication}
            </p>
            {isCompleted && (
              <Badge variant="outline" className="text-muted-foreground">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
            {isDueSoon && !isCompleted && (
              <Badge variant="destructive">Refill due soon</Badge>
            )}
            {isUrgent && !isDueSoon && !isCompleted && (
              <Badge className="bg-amber-500 text-white">Refill this week</Badge>
            )}
          </div>

          <p className={`text-sm ${isCompleted ? 'text-muted-foreground' : ''}`}>
            {prescription.dosage} · Qty: {prescription.quantity}
          </p>

          <div className="flex items-center gap-2 text-sm">
            <RefreshCw className={`h-3 w-3 ${isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
            {isOneTime ? (
              <span className="text-muted-foreground">
                One-time prescription {isCompleted ? '(completed)' : ''}
              </span>
            ) : nextRefillDate ? (
              <span className={isCompleted ? 'text-muted-foreground' : ''}>
                Next refill: {format(nextRefillDate, 'MMM d, yyyy')}
                {daysUntilRefill !== null && daysUntilRefill > 0 && (
                  <span className="text-muted-foreground ml-1">
                    ({daysUntilRefill} day{daysUntilRefill !== 1 ? 's' : ''})
                  </span>
                )}
              </span>
            ) : null}
          </div>

          <Badge variant="outline" className={isCompleted ? 'opacity-50' : ''}>
            {prescription.refillSchedule === 'none' 
              ? 'One-time' 
              : `Refills ${prescription.refillSchedule}`}
          </Badge>
        </div>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}