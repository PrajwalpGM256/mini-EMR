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
import { ActionButton } from '@/components/ui/action-button'
import { validateName, validateEmailFormat, validatePassword } from '@/lib/validation'
import { Eye, EyeOff } from 'lucide-react'

interface PatientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialData?: { name: string; email: string }
  patientId?: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
}

export function PatientForm({
  open,
  onOpenChange,
  onSuccess,
  initialData,
  patientId
}: PatientFormProps) {
  const isEditing = !!patientId
  const [formData, setFormData] = useState<{ name: string; email: string; password?: string }>(
    initialData ? { ...initialData, password: '' } : { name: '', email: '', password: '' }
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (open) {
      setFormData(initialData ? { ...initialData, password: '' } : { name: '', email: '', password: '' })
      setErrors({})
      setTouched({})
      setSubmitError('')
    }
  }, [open, initialData])

  function validateField(field: string, value: string) {
    const newErrors = { ...errors }
    const nameParts = formData.name.trim().split(/\s+/)
    const firstName = nameParts[0] || ''
    const lastName = nameParts[nameParts.length - 1] || ''

    switch (field) {
      case 'name':
        const nameResult = validateName(value)
        newErrors.name = nameResult.valid ? undefined : nameResult.message
        break
      case 'email':
        const emailResult = validateEmailFormat(value)
        newErrors.email = emailResult.valid ? undefined : emailResult.message
        break
      case 'password':
        if (!isEditing) {
          const passwordResult = validatePassword(value, firstName, lastName)
          newErrors.password = passwordResult.valid ? undefined : passwordResult.message
        }
        break
    }

    setErrors(newErrors)
  }

  function handleChange(field: string, value: string) {
    setFormData({ ...formData, [field]: value })
    if (touched[field]) {
      validateField(field, value)
    }
  }

  function handleBlur(field: string) {
    setTouched({ ...touched, [field]: true })
    validateField(field, formData[field as keyof typeof formData] || '')
  }

  function isFormValid(): boolean {
    const nameResult = validateName(formData.name)
    const emailResult = validateEmailFormat(formData.email)
    
    if (!nameResult.valid || !emailResult.valid) return false
    
    if (!isEditing) {
      const nameParts = formData.name.trim().split(/\s+/)
      const firstName = nameParts[0] || ''
      const lastName = nameParts[nameParts.length - 1] || ''
      const passwordResult = validatePassword(formData.password || '', firstName, lastName)
      if (!passwordResult.valid) return false
    }
    
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const nameResult = validateName(formData.name)
    const emailResult = validateEmailFormat(formData.email)
    const nameParts = formData.name.trim().split(/\s+/)
    const firstName = nameParts[0] || ''
    const lastName = nameParts[nameParts.length - 1] || ''
    const passwordResult = !isEditing ? validatePassword(formData.password || '', firstName, lastName) : { valid: true }

    setErrors({
      name: nameResult.valid ? undefined : nameResult.message,
      email: emailResult.valid ? undefined : emailResult.message,
      password: passwordResult.valid ? undefined : passwordResult.message
    })

    if (!nameResult.valid || !emailResult.valid || !passwordResult.valid) {
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const url = isEditing ? `/api/admin/patients/${patientId}` : '/api/admin/patients'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          ...(!isEditing && { password: formData.password })
        })
      })
      const json = await res.json()

      if (!res.ok) {
        setSubmitError(json.error || 'Failed to save patient')
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {submitError && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {submitError}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="John Doe"
              className={errors.name && touched.name ? 'border-destructive' : ''}
            />
            {errors.name && touched.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="name@example.com"
              className={errors.email && touched.email ? 'border-destructive' : ''}
            />
            {errors.email && touched.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          
          {!isEditing && (
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password || ''}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="Min 8 chars, uppercase, lowercase, special char"
                    className={errors.password && touched.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                </div>
                {errors.password && touched.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                Must contain uppercase, lowercase, special character. Cannot contain your name or consecutive characters.
                </p>
            </div>
            )}
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <ActionButton type="submit" disabled={submitting || !isFormValid()} variant="filled">
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Patient'}
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}