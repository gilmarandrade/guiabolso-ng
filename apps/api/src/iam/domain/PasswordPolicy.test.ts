import { describe, it, expect } from 'vitest'
import { PasswordPolicy } from './PasswordPolicy'

describe('PasswordPolicy Domain Service', () => {
  const policy = new PasswordPolicy()

  it('should return false for passwords shorter than 8 characters', () => {
    expect(policy.satisfies('A1!a')).toBe(false)
  })

  it('should return false if missing a letter', () => {
    expect(policy.satisfies('12345678!')).toBe(false)
  })

  it('should return false if missing a number', () => {
    expect(policy.satisfies('Password!')).toBe(false)
  })

  it('should return false if missing a special character', () => {
    expect(policy.satisfies('Password1')).toBe(false)
  })

  it('should return true for valid password', () => {
    expect(policy.satisfies('Passw0rd!')).toBe(true)
  })

  it('should return correct description', () => {
    expect(policy.getDescription()).toBe(
      'Password must be at least 8 characters and contain letters, numbers and special characters'
    )
  })
})