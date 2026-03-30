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

export function validateName(name: string): { valid: boolean; message?: string } {
  const trimmed = name.trim()
  
  if (!trimmed) {
    return { valid: false, message: 'Name is required' }
  }
  
  const parts = trimmed.split(/\s+/)
  if (parts.length < 2) {
    return { valid: false, message: 'Please enter first and last name' }
  }
  
  if (parts.some(part => part.length < 2)) {
    return { valid: false, message: 'Each name must be at least 2 characters' }
  }
  
  return { valid: true }
}

export function validatePassword(
  password: string,
  firstName?: string,
  lastName?: string
): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' }
  }
  
  for (let i = 0; i < password.length - 2; i++) {
    const a = password.charCodeAt(i)
    const b = password.charCodeAt(i + 1)
    const c = password.charCodeAt(i + 2)
    if (b === a + 1 && c === b + 1) {
      return { valid: false, message: 'Password cannot contain 3 or more consecutive characters (e.g., abc, 123)' }
    }
  }
  
  const lowerPassword = password.toLowerCase()
  if (firstName && firstName.length >= 2 && lowerPassword.includes(firstName.toLowerCase())) {
    return { valid: false, message: 'Password cannot contain your first name' }
  }
  if (lastName && lastName.length >= 2 && lowerPassword.includes(lastName.toLowerCase())) {
    return { valid: false, message: 'Password cannot contain your last name' }
  }
  
  return { valid: true }
}

export function validateEmailFormat(email: string): { valid: boolean; message?: string } {
  const trimmed = email.trim()
  
  if (!trimmed) {
    return { valid: false, message: 'Email is required' }
  }
  
  if (!validateEmail(trimmed)) {
    return { valid: false, message: 'Please enter a valid email (e.g., name@example.com)' }
  }
  
  return { valid: true }
}

export function validateStringLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max
}

export function sanitizeString(value: string): string {
  return value.trim()
}