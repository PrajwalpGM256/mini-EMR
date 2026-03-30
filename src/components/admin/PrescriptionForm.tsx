'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ActionButton } from '@/components/ui/action-button'
import { DatePicker } from '@/components/ui/date-picker'
import { MEDICATIONS, DOSAGES, REFILL_SCHEDULES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface Prescription {
  id: string
  medication: string
  dosage: string
  quantity: number
  refillOn: string
  refillSchedule: string
}

interface PrescriptionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  patientId: string
  prescription?: Prescription | null
}

interface FormErrors {
  medication?: string
  dosage?: string
  quantity?: string
  refillOn?: string
}

export function PrescriptionForm({
  open,
  onOpenChange,
  onSuccess,
  patientId,
  prescription
}: PrescriptionFormProps) {
  const isEditing = !!prescription

  const [medication, setMedication] = useState('')
  const [dosage, setDosage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [refillOn, setRefillOn] = useState<Date | undefined>(undefined)
  const [refillSchedule, setRefillSchedule] = useState('monthly')

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (open) {
      if (prescription) {
        setMedication(prescription.medication)
        setDosage(prescription.dosage)
        setQuantity(prescription.quantity)
        setRefillOn(prescription.refillOn ? new Date(prescription.refillOn) : undefined)
        setRefillSchedule(prescription.refillSchedule)
      } else {
        setMedication('')
        setDosage('')
        setQuantity(1)
        setRefillOn(undefined)
        setRefillSchedule('monthly')
      }
      setErrors({})
      setTouched({})
      setSubmitError('')
    }
  }, [open, prescription])

  function validateMedication(value: string): string | undefined {
    if (!value) return 'Please select a medication'
    if (!MEDICATIONS.includes(value)) return 'Invalid medication selected'
    return undefined
  }

  function validateDosage(value: string): string | undefined {
    if (!value) return 'Please select a dosage'
    if (!DOSAGES.includes(value)) return 'Invalid dosage selected'
    return undefined
  }

  function validateQuantity(value: number): string | undefined {
    if (!value || value < 1) return 'Quantity must be at least 1'
    if (value > 999) return 'Quantity cannot exceed 999'
    if (!Number.isInteger(value)) return 'Quantity must be a whole number'
    return undefined
  }

  function validateRefillOn(value: Date | undefined, schedule: string): string | undefined {
    if (schedule === 'none') return undefined
    if (!value) return 'Please select a refill date'
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(value)
    selectedDate.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) return 'Refill date cannot be in the past'
    return undefined
  }

  function handleMedicationChange(value: string | null) {
    if (value) {
      setMedication(value)
      setTouched({ ...touched, medication: true })
      setErrors({ ...errors, medication: validateMedication(value) })
    }
  }

  function handleDosageChange(value: string | null) {
    if (value) {
      setDosage(value)
      setTouched({ ...touched, dosage: true })
      setErrors({ ...errors, dosage: validateDosage(value) })
    }
  }

  function handleQuantityChange(value: string) {
    const num = parseInt(value) || 0
    setQuantity(num)
    if (touched.quantity) {
      setErrors({ ...errors, quantity: validateQuantity(num) })
    }
  }

  function handleQuantityBlur() {
    setTouched({ ...touched, quantity: true })
    setErrors({ ...errors, quantity: validateQuantity(quantity) })
  }

  function handleRefillOnChange(date: Date | undefined) {
    setRefillOn(date)
    setTouched({ ...touched, refillOn: true })
    setErrors({ ...errors, refillOn: validateRefillOn(date, refillSchedule) })
  }

  function handleRefillScheduleChange(value: string | null) {
    if (value) {
      setRefillSchedule(value)
      if (value === 'none') {
        setRefillOn(undefined)
        setErrors({ ...errors, refillOn: undefined })
      } else {
        setErrors({ ...errors, refillOn: validateRefillOn(refillOn, value) })
      }
    }
  }

  function isFormValid(): boolean {
    return (
      !validateMedication(medication) &&
      !validateDosage(dosage) &&
      !validateQuantity(quantity) &&
      !validateRefillOn(refillOn, refillSchedule)
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const medicationError = validateMedication(medication)
    const dosageError = validateDosage(dosage)
    const quantityError = validateQuantity(quantity)
    const refillOnError = validateRefillOn(refillOn, refillSchedule)

    setErrors({
      medication: medicationError,
      dosage: dosageError,
      quantity: quantityError,
      refillOn: refillOnError
    })
    setTouched({
      medication: true,
      dosage: true,
      quantity: true,
      refillOn: true
    })

    if (medicationError || dosageError || quantityError || refillOnError) return

    setSubmitting(true)
    setSubmitError('')

    try {
      const url = isEditing
        ? `/api/admin/prescriptions/${prescription!.id}`
        : '/api/admin/prescriptions'
      const method = isEditing ? 'PUT' : 'POST'

      const body: Record<string, unknown> = {
        medication,
        dosage,
        quantity,
        refillSchedule
      }

      if (refillSchedule !== 'none' && refillOn) {
        body.refillOn = refillOn.toISOString()
      }

      if (!isEditing) body.patientId = patientId

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await res.json()

      if (!res.ok) {
        setSubmitError(json.error || 'Failed to save prescription')
        return
      }

      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const disablePastDates = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Prescription' : 'Add Prescription'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {submitError && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {submitError}
            </div>
          )}

          {/* Medication */}
          <div className="space-y-2">
            <Label>Medication</Label>
            <Select value={medication} onValueChange={handleMedicationChange}>
              <SelectTrigger
                className={cn(
                  errors.medication && touched.medication && 'border-destructive'
                )}
              >
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent>
                {MEDICATIONS.map((med) => (
                  <SelectItem key={med} value={med}>
                    {med}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.medication && touched.medication && (
              <p className="text-sm text-destructive">{errors.medication}</p>
            )}
          </div>

          {/* Dosage */}
          <div className="space-y-2">
            <Label>Dosage</Label>
            <Select value={dosage} onValueChange={handleDosageChange}>
              <SelectTrigger
                className={cn(
                  errors.dosage && touched.dosage && 'border-destructive'
                )}
              >
                <SelectValue placeholder="Select dosage" />
              </SelectTrigger>
              <SelectContent>
                {DOSAGES.map((dose) => (
                  <SelectItem key={dose} value={dose}>
                    {dose}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dosage && touched.dosage && (
              <p className="text-sm text-destructive">{errors.dosage}</p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="999"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              onBlur={handleQuantityBlur}
              placeholder="Enter quantity (1-999)"
              className={cn(
                errors.quantity && touched.quantity && 'border-destructive'
              )}
            />
            {errors.quantity && touched.quantity && (
              <p className="text-sm text-destructive">{errors.quantity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Refill Schedule</Label>
            <Select value={refillSchedule} onValueChange={handleRefillScheduleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFILL_SCHEDULES.map((schedule) => (
                  <SelectItem key={schedule} value={schedule}>
                    {schedule === 'none' 
                      ? 'One-time (no refills)' 
                      : schedule.charAt(0).toUpperCase() + schedule.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select One-time for prescriptions that do not need refills
            </p>
          </div>

          {refillSchedule !== 'none' && (
            <div className="space-y-2">
              <Label>Refill Date</Label>
              <DatePicker
                value={refillOn}
                onChange={handleRefillOnChange}
                placeholder="Select refill date"
                disabled={disablePastDates}
                error={!!errors.refillOn && touched.refillOn}
              />
              {errors.refillOn && touched.refillOn && (
                <p className="text-sm text-destructive">{errors.refillOn}</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <ActionButton type="submit" disabled={submitting || !isFormValid()} variant="filled">
              {submitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}