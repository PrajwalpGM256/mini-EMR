export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateRequired(fields: Record<string, unknown>): string[] {
  const missing: string[] = []
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') {
      missing.push(key)
    }
  }
  return missing
}

export function validateDate(dateString: string): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

export function validateFutureDate(dateString: string): boolean {
  if (!validateDate(dateString)) return false
  return new Date(dateString) > new Date()
}

export function validatePositiveNumber(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }
  return { valid: true }
}

export function validateStringLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max
}

export function sanitizeString(value: string): string {
  return value.trim()
}